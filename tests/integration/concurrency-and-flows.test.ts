import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/client";
import { acquireHold, releaseHold } from "@/lib/services/inventory";
import { queueEmail } from "@/lib/services/email/outbox";
import { createSupportTicket, getTicketForCustomer, getTicketForAdmin, adminReplyTicket } from "@/lib/services/support";
import { settlePaymentAuthoritative } from "@/lib/services/payments/settlement";
import { geniusPay } from "@/lib/services/payments/geniuspay";
import { recordGatewayFailure, recordGatewaySuccess, getGatewayCircuitState } from "@/lib/services/payments/gateway-health";
import { TicketCategory, AnimalStatus, ReservationStatus, PaymentStatus, OrderStatus } from "@prisma/client";

describe("Integration Tests — Concurrency, Webhooks & Flow Isolation", () => {
  let testAnimalId: string;

  beforeAll(async () => {
    const breed = await prisma.breed.findFirst();
    if (!breed) throw new Error("No breed found in database. Run db:seed first.");

    const animal = await prisma.animal.upsert({
      where: { slug: "integration-test-animal-001" },
      update: {
        status: AnimalStatus.AVAILABLE,
        published: true,
      },
      create: {
        slug: "integration-test-animal-001",
        name: "Test Hound",
        species: "DOG",
        breedId: breed.id,
        gender: "MALE",
        dateOfBirth: new Date("2026-01-01"),
        size: "MEDIUM",
        coat: "Brown",
        color: "Brown",
        country: "France",
        city: "Paris",
        priceCents: 120000,
        currency: "EUR",
        status: AnimalStatus.AVAILABLE,
        published: true,
        descriptionEn: "Test",
        descriptionFr: "Test",
        temperamentEn: "[]",
        temperamentFr: "[]",
        socializationEn: "Test",
        socializationFr: "Test",
        isDemo: false,
        isPaymentTest: false,
      },
    });

    testAnimalId = animal.id;

    // Clean up any existing reservations/order items for test animal
    await prisma.reservation.deleteMany({ where: { animalId: testAnimalId } });
    await prisma.orderItem.deleteMany({ where: { animalId: testAnimalId } });
  });

  afterAll(async () => {
    // Clean up cascade
    await prisma.reservation.deleteMany({ where: { animalId: testAnimalId } });
    await prisma.orderItem.deleteMany({ where: { animalId: testAnimalId } });
    await prisma.animal.deleteMany({ where: { slug: "integration-test-animal-001" } });
  });

  it("Guarantees strict concurrency: Promise.all of concurrent acquireHold attempts on 1 animal yields EXACTLY 1 success", async () => {
    await prisma.animal.update({
      where: { id: testAnimalId },
      data: { status: AnimalStatus.AVAILABLE },
    });

    const attempts = 10;
    const promises = Array.from({ length: attempts }).map((_, idx) =>
      acquireHold({
        animalId: testAnimalId,
        customer: {
          name: `Concurrent Adopter ${idx}`,
          email: `adopter_${idx}_${Date.now()}@test.example.com`,
          phone: `+336000000${idx.toString().padStart(2, "0")}`,
          country: "France",
        },
      })
    );

    const results = await Promise.allSettled(promises);

    const successful = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    expect(successful).toHaveLength(1);
    expect(failed).toHaveLength(attempts - 1);

    const animal = await prisma.animal.findUnique({ where: { id: testAnimalId } });
    expect(animal?.status).toBe(AnimalStatus.HELD);

    const activeHolds = await prisma.reservation.findMany({
      where: { animalId: testAnimalId, status: ReservationStatus.ACTIVE },
    });
    expect(activeHolds).toHaveLength(1);
    expect(activeHolds[0].activeAnimalId).toBe(testAnimalId);

    // Release hold to clean up
    await releaseHold(activeHolds[0].id);
  }, 25000);

  it("Enforces email outbox idempotency (duplicate keys never duplicate records)", async () => {
    const key = `test-idempotency-key-${Date.now()}`;

    const id1 = await queueEmail({
      idempotencyKey: key,
      template: "order_pending",
      locale: "fr",
      toEmail: "buyer@example.com",
      payload: { customerName: "Test", orderRef: "PW-TEST", total: "1500 €", checkoutUrl: "https://example.com" },
    });

    const id2 = await queueEmail({
      idempotencyKey: key,
      template: "order_pending",
      locale: "fr",
      toEmail: "buyer@example.com",
      payload: { customerName: "Test", orderRef: "PW-TEST", total: "1500 €", checkoutUrl: "https://example.com" },
    });

    expect(id1).toBe(id2);

    const count = await prisma.emailNotification.count({
      where: { idempotencyKey: key },
    });
    expect(count).toBe(1);
  }, 10000);

  it("Enforces strict support ticket internal note isolation", async () => {
    const res = await createSupportTicket({
      name: "Arthur Test",
      email: "arthur@example.com",
      category: TicketCategory.GENERAL,
      subject: "Inquiry on transport",
      message: "Customer initial message",
      locale: "en",
    });

    expect(res.ticketRef).toMatch(/^TK-/);
    expect(res.accessToken).toBeDefined();

    const admin = await prisma.adminUser.findFirst();
    if (!admin) throw new Error("Admin user not found");

    const ticketAdminView = await prisma.supportTicket.findUnique({
      where: { reference: res.ticketRef },
    });
    if (!ticketAdminView) throw new Error("Ticket not found");

    await adminReplyTicket(ticketAdminView.id, admin.id, "Staff confidential note: verification pending.", true);
    await adminReplyTicket(ticketAdminView.id, admin.id, "Public staff response: we are on it.", false);

    const customerView = await getTicketForCustomer(res.accessToken);
    expect(customerView).not.toBeNull();
    const bodies = customerView!.messages.map((m) => m.body);

    expect(bodies).toContain("Customer initial message");
    expect(bodies).toContain("Public staff response: we are on it.");
    expect(bodies).not.toContain("Staff confidential note: verification pending.");

    const adminFullView = await getTicketForAdmin(ticketAdminView.id);
    const adminBodies = adminFullView!.messages.map((m) => m.body);
    expect(adminBodies).toContain("Staff confidential note: verification pending.");
  }, 10000);

  it("Guarantees strict payment settlement idempotency: 5 successive passes produce exactly 1 PAID order, 0 disputes, 0 refunds", async () => {
    // 1. Acquire hold to get real order
    const hold = await acquireHold({
      animalId: testAnimalId,
      customer: {
        name: "Idempotent Adopter",
        email: "idempotent@example.com",
        phone: "+33611223344",
        country: "France",
      },
      deliveryCountry: "France",
      deliveryMethod: "standard",
    });

    // 2. Insert Payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: hold.orderId,
        provider: "GENIUSPAY",
        providerReference: `TEST-IDEM-${Date.now()}`,
        amountCents: hold.pricing.totalCents,
        currency: "EUR",
        status: PaymentStatus.PENDING,
      },
    });

    const mockProviderStatus: any = {
      id: "prov_001",
      reference: payment.providerReference!,
      status: "completed",
      amount: hold.pricing.totalCents / 100,
      currency: "EUR",
    };

    // 3. Call settlement 5 times consecutively (simulating webhook retries + user refreshing return page)
    for (let i = 0; i < 5; i++) {
      const res = await settlePaymentAuthoritative(payment.providerReference!, mockProviderStatus);
      expect(res.paymentStatus).toBe(PaymentStatus.SUCCESSFUL);
      expect(res.orderStatus).toBe(OrderStatus.PAID);
      expect(res.exceptionCreated).toBeFalsy();
    }

    // 4. Verify post-conditions
    const updatedOrder = await prisma.order.findUnique({
      where: { id: hold.orderId },
    });
    expect(updatedOrder?.status).toBe(OrderStatus.PAID);

    const updatedAnimal = await prisma.animal.findUnique({
      where: { id: testAnimalId },
    });
    expect(updatedAnimal?.status).toBe(AnimalStatus.SOLD);

    const disputes = await prisma.reconciliationException.count({
      where: { orderId: hold.orderId },
    });
    expect(disputes).toBe(0);

    const refunds = await prisma.refund.count({
      where: { paymentId: payment.id },
    });
    expect(refunds).toBe(0);
  }, 15000);

  it("Guarantees Gateway Health circuit breaker opens after 3 consecutive failures", async () => {
    const testGw = `test_gw_${Date.now()}`;
    expect(await getGatewayCircuitState(testGw)).toBe("CLOSED");

    await recordGatewayFailure(testGw, "HTTP 503 Provider Down");
    expect(await getGatewayCircuitState(testGw)).toBe("CLOSED");

    await recordGatewayFailure(testGw, "HTTP 503 Provider Down");
    expect(await getGatewayCircuitState(testGw)).toBe("CLOSED");

    await recordGatewayFailure(testGw, "HTTP 503 Provider Down");
    expect(await getGatewayCircuitState(testGw)).toBe("OPEN");

    // Success resets
    await recordGatewaySuccess(testGw);
    expect(await getGatewayCircuitState(testGw)).toBe("CLOSED");
  });
});

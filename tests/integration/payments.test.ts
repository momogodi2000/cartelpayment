/**
 * Payment integrity integration tests (SQLite per-file database + local fake GeniusPay
 * HTTP server). Covers routing/fallback, duplicate-charge protection, settlement
 * ownership/idempotency, webhook semantics, expiry reconciliation and the €1 test dog.
 */
import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { AnimalStatus, OrderStatus, PaymentStatus, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { resetEnvCacheForTests } from "@/lib/env";
import { initializeCardPayment, CardPaymentUnavailableError } from "@/lib/services/payments/payment-initialization";
import { getEligibleCardGateways } from "@/lib/services/payments/gateway-registry";
import { recordProbeResult, markGatewayOutage } from "@/lib/services/payments/gateway-health";
import { settlePaymentAuthoritative } from "@/lib/services/payments/settlement";
import { expireReservations } from "@/lib/services/payments/reconciliation";
import { releaseHold, AnimalUnavailableError } from "@/lib/services/inventory";
import { POST as webhookPOST } from "@/app/api/payments/geniuspay/webhook/route";
import { FakeGeniusPay } from "../fixtures/fake-geniuspay";
import { createAnimal, holdAnimal, createPendingPayment, providerStatus, fixtureCustomer } from "../fixtures/factory";

const fake = new FakeGeniusPay();

beforeAll(async () => {
  process.env.GENIUSPAY_BASE_URL = await fake.start();
  process.env.GENIUSPAY_TIMEOUT_MS = "2000";
  resetEnvCacheForTests();
});

afterAll(async () => {
  await fake.stop();
  await prisma.$disconnect();
});

beforeEach(async () => {
  fake.requests = [];
  fake.createBehavior = {};
  fake.searchFails = false;
  await prisma.gatewayHealth.deleteMany();
  await prisma.siteSetting.deleteMany({ where: { key: "payments.gateways" } });
});

async function verify(...ids: string[]) {
  for (const id of ids) await recordProbeResult(id, { accepted: true, summary: { test: true } });
}

/** GeniusPay default card routing is disabled in production (it charges XOF); tests enable it as a second route. */
async function enableDefaultRoute(opts: { stripe?: boolean } = {}) {
  await verify("geniuspay_default_card");
  const value = JSON.stringify({ geniuspay_default_card: { enabled: true }, stripe: { enabled: opts.stripe ?? true } });
  await prisma.siteSetting.upsert({ where: { key: "payments.gateways" }, create: { key: "payments.gateways", value }, update: { value } });
}

async function newHeldOrder(priceCents = 120000) {
  const animal = await createAnimal({ priceCents });
  const hold = await holdAnimal(animal.id);
  const order = await prisma.order.findUniqueOrThrow({ where: { id: hold.orderId }, include: { customer: true } });
  return { animal, hold, order };
}

function initInput(order: { id: string; reference: string; totalCents: number; customer: { name: string; email: string; phone: string } }) {
  return {
    orderId: order.id,
    orderRef: order.reference,
    amountCents: order.totalCents,
    currency: "EUR",
    customer: { name: order.customer.name, email: order.customer.email, phone: order.customer.phone, country: "FR" },
    successUrl: "https://pawelium.test/en/checkout/return",
    errorUrl: "https://pawelium.test/en/checkout/cancel",
  };
}

describe("Gateway registry", () => {
  it("routes EUR card payments only to Stripe by default; XOF gateways and mobile money are never eligible", async () => {
    await verify("paystack", "paiementpro", "wave", "pawapay", "pal", "cinetpay");
    const ids = (await getEligibleCardGateways("EUR", 120000)).map((g) => g.id);
    expect(ids).toEqual(["stripe"]);
  });

  it("adds the default route only when explicitly enabled and verified", async () => {
    await enableDefaultRoute();
    const ids = (await getEligibleCardGateways("EUR", 120000)).map((g) => g.id);
    expect(ids).toEqual(["stripe", "geniuspay_default_card"]);
  });

  it("rejects non-EUR checkout outright", async () => {
    const { order } = await newHeldOrder();
    await expect(initializeCardPayment({ ...initInput(order), currency: "XOF" })).rejects.toMatchObject({ reason: "CURRENCY_NOT_SUPPORTED" });
    expect(fake.createRequests()).toHaveLength(0);
  });
});

describe("Card routing & safe fallback", () => {
  it("uses Stripe first when it is verified and healthy", async () => {
    fake.createBehavior = { stripe: { kind: "success", gateway: "stripe" } };
    const { order } = await newHeldOrder();
    const res = await initializeCardPayment(initInput(order));
    expect(res.gatewayId).toBe("stripe");
    expect(res.checkoutUrl).toContain("checkout.stripe.com");
    expect(fake.createRequests()).toHaveLength(1);
    const body = fake.createRequests()[0].body;
    expect(body).toMatchObject({ currency: "EUR", payment_method: "stripe" });
    expect(body.gateway).toBeUndefined(); // the `gateway` field only accepts mobile-money values
  });

  it("falls back to the next verified EUR card route when Stripe fails safely (503, no session)", async () => {
    await enableDefaultRoute();
    fake.createBehavior = {
      stripe: { kind: "http", status: 503, body: { success: false } },
      default: { kind: "success", gateway: "paystack" },
    };
    const { order } = await newHeldOrder();
    const res = await initializeCardPayment(initInput(order));
    expect(res.gatewayId).toBe("geniuspay_default_card");
    const attempts = await prisma.paymentAttempt.findMany({ where: { paymentId: res.paymentId }, orderBy: { attemptNo: "asc" } });
    expect(attempts.map((a) => [a.gatewayId, a.status, a.errorClass])).toEqual([
      ["stripe", "FAILED_INIT", "SAFE"],
      ["geniuspay_default_card", "SUCCEEDED", null],
    ]);
  });

  it("skips a gateway whose circuit is OPEN (provider-reported Stripe outage)", async () => {
    await enableDefaultRoute();
    await markGatewayOutage("stripe", "GeniusPay ticket TKT-AF45C8DA");
    fake.createBehavior = { default: { kind: "success", gateway: "paystack" } };
    const { order } = await newHeldOrder();
    const res = await initializeCardPayment(initInput(order));
    expect(res.gatewayId).toBe("geniuspay_default_card");
    expect(fake.createRequests().map((r) => r.body.payment_method)).toEqual(["card"]);
  });

  it("rejects a session routed to mobile money and never shows it to the customer", async () => {
    await enableDefaultRoute({ stripe: false });
    fake.createBehavior = { default: { kind: "success", gateway: "wave", host: "geniuspay.ci" } };
    const { order } = await newHeldOrder();
    const err = await initializeCardPayment(initInput(order)).catch((e) => e);
    expect(err).toBeInstanceOf(CardPaymentUnavailableError);
    expect(err.reason).toBe("ALL_GATEWAYS_FAILED");
    const payment = await prisma.payment.findFirstOrThrow({ where: { orderId: order.id } });
    expect(payment.checkoutUrl).toBeNull();
    const attempt = await prisma.paymentAttempt.findFirstOrThrow({ where: { paymentId: payment.id } });
    expect(attempt.status).toBe("SUPERSEDED");
    expect(attempt.errorClass).toBe("REJECTED_ROUTE");
  });

  it("rejects a session that GeniusPay created in XOF — never charges a converted currency", async () => {
    await enableDefaultRoute({ stripe: false });
    fake.createBehavior = { default: { kind: "success", gateway: "paystack", currency: "XOF" } };
    const { order } = await newHeldOrder();
    await expect(initializeCardPayment(initInput(order))).rejects.toMatchObject({ reason: "ALL_GATEWAYS_FAILED" });
    const attempt = await prisma.paymentAttempt.findFirstOrThrow({ where: { payment: { orderId: order.id } } });
    expect(attempt.status).toBe("SUPERSEDED");
    expect(attempt.errorClass).toBe("REJECTED_ROUTE");
  });

  it("returns a clean error and creates no session when no card gateway is eligible", async () => {
    await prisma.siteSetting.create({ data: { key: "payments.gateways", value: JSON.stringify({ stripe: { enabled: false } }) } });
    const { order } = await newHeldOrder();
    await expect(initializeCardPayment(initInput(order))).rejects.toMatchObject({ reason: "NO_ELIGIBLE_GATEWAY" });
    expect(fake.createRequests()).toHaveLength(0);
  });

  it("AMBIGUOUS timeout: reuses the session that was actually created — no duplicate", async () => {
    await enableDefaultRoute();
    fake.createBehavior = {
      stripe: { kind: "hangAfterCreate", gateway: "stripe" },
      default: { kind: "success", gateway: "paystack" },
    };
    const { order } = await newHeldOrder();
    const res = await initializeCardPayment(initInput(order));
    expect(fake.createRequests()).toHaveLength(1); // paystack never called
    expect(res.providerReference).toMatch(/^MTX-HIDDEN/);
    expect(res.gatewayId).toBe("stripe");
  });

  it("AMBIGUOUS timeout with no session at the provider: falls back after reconciliation", async () => {
    await enableDefaultRoute();
    fake.createBehavior = { stripe: { kind: "hang" }, default: { kind: "success", gateway: "paystack" } };
    const { order } = await newHeldOrder();
    const res = await initializeCardPayment(initInput(order));
    expect(res.gatewayId).toBe("geniuspay_default_card");
    expect(fake.createRequests()).toHaveLength(2);
  });

  it("AMBIGUOUS and provider unreachable: stops, opens an exception, never tries another gateway", async () => {
    await enableDefaultRoute();
    fake.createBehavior = { stripe: { kind: "hang" }, default: { kind: "success", gateway: "paystack" } };
    fake.searchFails = true;
    const { order } = await newHeldOrder();
    await expect(initializeCardPayment(initInput(order))).rejects.toMatchObject({ reason: "RECONCILIATION_REQUIRED" });
    expect(fake.createRequests()).toHaveLength(1);
    const exc = await prisma.reconciliationException.findFirst({ where: { orderId: order.id } });
    expect(exc?.kind).toBe("PROVIDER_UNREACHABLE");
  });

  it("resumes the open session instead of creating a second one for the same order", async () => {
    fake.createBehavior = { stripe: { kind: "success", gateway: "stripe" } };
    const { order } = await newHeldOrder();
    const first = await initializeCardPayment(initInput(order));
    const second = await initializeCardPayment(initInput(order));
    expect(second.resumed).toBe(true);
    expect(second.checkoutUrl).toBe(first.checkoutUrl);
    expect(fake.createRequests()).toHaveLength(1);
  });
});

describe("Settlement integrity", () => {
  it("is idempotent: 5 settlements -> one PAID order, animal SOLD, no exception", async () => {
    const { animal, order } = await newHeldOrder();
    const p = await createPendingPayment(order.id, order.totalCents);
    for (let i = 0; i < 5; i++) {
      await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "completed", order.totalCents));
    }
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.PAID);
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.SOLD);
    expect(await prisma.reconciliationException.count({ where: { orderId: order.id } })).toBe(0);
    expect(await prisma.refund.count({ where: { paymentId: p.id } })).toBe(0);
  });

  it("a late payment of order A never sells the animal now held by order B", async () => {
    const { animal, hold: holdA, order: orderA } = await newHeldOrder();
    const pA = await createPendingPayment(orderA.id, orderA.totalCents);
    await releaseHold(holdA.reservationId, "test expiry");
    const holdB = await holdAnimal(animal.id);

    const res = await settlePaymentAuthoritative(pA.providerReference!, providerStatus(pA.providerReference!, "completed", orderA.totalCents));
    expect(res.orderStatus).toBe(OrderStatus.DISPUTED);
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.HELD);
    const resB = await prisma.reservation.findUniqueOrThrow({ where: { id: holdB.reservationId } });
    expect(resB.status).toBe(ReservationStatus.ACTIVE);
    expect(await prisma.refund.count({ where: { paymentId: pA.id } })).toBe(1);

    // Replays never duplicate the exception or the refund.
    await settlePaymentAuthoritative(pA.providerReference!, providerStatus(pA.providerReference!, "completed", orderA.totalCents));
    expect(await prisma.reconciliationException.count({ where: { paymentId: pA.id } })).toBe(1);
    expect(await prisma.refund.count({ where: { paymentId: pA.id } })).toBe(1);
  });

  it("a late payment re-acquires the animal if nobody else took it", async () => {
    const { animal, hold, order } = await newHeldOrder();
    const p = await createPendingPayment(order.id, order.totalCents);
    await releaseHold(hold.reservationId, "test expiry");
    const res = await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "completed", order.totalCents));
    expect(res.orderStatus).toBe(OrderStatus.PAID);
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.SOLD);
  });

  it("currency or amount mismatch never marks the order paid", async () => {
    const { animal, order } = await newHeldOrder();
    const p = await createPendingPayment(order.id, order.totalCents);
    await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "completed", order.totalCents, "XOF"));
    await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "completed", order.totalCents, "XOF"));
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: p.id } })).status).toBe(PaymentStatus.REQUIRES_RECONCILIATION);
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.HELD);
    expect(await prisma.reconciliationException.count({ where: { paymentId: p.id, kind: "CURRENCY_MISMATCH" } })).toBe(1);

    const other = await newHeldOrder();
    const p2 = await createPendingPayment(other.order.id, other.order.totalCents);
    await settlePaymentAuthoritative(p2.providerReference!, { ...providerStatus(p2.providerReference!, "completed", other.order.totalCents - 1) });
    expect((await prisma.order.findUniqueOrThrow({ where: { id: other.order.id } })).status).toBe(OrderStatus.DISPUTED);
  });

  it("a second successful capture for an already paid order is a duplicate capture", async () => {
    const { order } = await newHeldOrder();
    const p1 = await createPendingPayment(order.id, order.totalCents);
    await settlePaymentAuthoritative(p1.providerReference!, providerStatus(p1.providerReference!, "completed", order.totalCents));
    await prisma.payment.update({ where: { id: p1.id }, data: { status: PaymentStatus.SUCCESSFUL } });
    const p2 = await createPendingPayment(order.id, order.totalCents);
    await settlePaymentAuthoritative(p2.providerReference!, providerStatus(p2.providerReference!, "completed", order.totalCents));
    expect(await prisma.reconciliationException.count({ where: { paymentId: p2.id, kind: "DUPLICATE_CAPTURE" } })).toBe(1);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.PAID);
  });

  it("applies a provider refund to an already paid order", async () => {
    const { order } = await newHeldOrder();
    const p = await createPendingPayment(order.id, order.totalCents);
    await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "completed", order.totalCents));
    await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "refunded", order.totalCents));
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.REFUNDED);
  });

  it("a terminal failure keeps the hold (retry window) instead of releasing it", async () => {
    const { animal, hold, order } = await newHeldOrder();
    const p = await createPendingPayment(order.id, order.totalCents);
    await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "failed", order.totalCents));
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: p.id } })).status).toBe(PaymentStatus.FAILED);
    expect((await prisma.reservation.findUniqueOrThrow({ where: { id: hold.reservationId } })).status).toBe(ReservationStatus.ACTIVE);
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.HELD);
  });
});

describe("Webhook route", () => {
  const secret = () => process.env.GENIUSPAY_WEBHOOK_SECRET!;

  function signedRequest(body: object, opts: { tsOffset?: number; badSig?: boolean; env?: string } = {}) {
    const raw = JSON.stringify(body);
    const ts = String(Math.floor(Date.now() / 1000) + (opts.tsOffset ?? 0));
    const sig = crypto.createHmac("sha256", secret()).update(`${ts}.${raw}`).digest("hex");
    return new NextRequest("http://localhost/api/payments/geniuspay/webhook", {
      method: "POST",
      body: raw,
      headers: {
        "content-type": "application/json",
        "x-webhook-signature": opts.badSig ? sig.replace(/.$/, sig.endsWith("0") ? "1" : "0") : sig,
        "x-webhook-timestamp": ts,
        "x-webhook-environment": opts.env ?? "sandbox",
      },
    });
  }

  async function paidScenario() {
    const { order } = await newHeldOrder();
    fake.createBehavior = { stripe: { kind: "success", gateway: "stripe" } };
    const init = await initializeCardPayment(initInput(order));
    fake.payments.get(init.providerReference)!.status = "completed";
    return { order, init };
  }

  it("verifies, settles from the authoritative status and is idempotent per event", async () => {
    const { order, init } = await paidScenario();
    const body = { id: `evt-${crypto.randomUUID()}`, event: "payment.success", data: { reference: init.providerReference, status: "completed" } };
    expect((await webhookPOST(signedRequest(body))).status).toBe(200);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.PAID);
    const again = await webhookPOST(signedRequest(body));
    expect(await again.json()).toMatchObject({ status: "already_processed" });
    expect(await prisma.paymentEvent.count({ where: { providerEventId: body.id } })).toBe(1);
  });

  it("rejects bad signatures, stale timestamps, wrong environment and missing event ids", async () => {
    const body = { id: "evt-x", event: "payment.success", data: { reference: "MTX-NONE" } };
    expect((await webhookPOST(signedRequest(body, { badSig: true }))).status).toBe(401);
    expect((await webhookPOST(signedRequest(body, { tsOffset: -400 }))).status).toBe(401);
    expect((await webhookPOST(signedRequest(body, { env: "live" }))).status).toBe(401);
    expect((await webhookPOST(signedRequest({ event: "payment.success", data: { reference: "MTX-NONE" } }))).status).toBe(400);
  });

  it("returns 500 when settlement fails and re-processes the same event on retry", async () => {
    const { order, init } = await paidScenario();
    fake.payments.delete(init.providerReference); // provider lookup fails
    const body = { id: `evt-${crypto.randomUUID()}`, event: "payment.success", data: { reference: init.providerReference } };
    expect((await webhookPOST(signedRequest(body))).status).toBe(500);
    const ev = await prisma.paymentEvent.findUniqueOrThrow({ where: { providerEventId: body.id } });
    expect(ev.processedAt).toBeNull();

    fake.payments.set(init.providerReference, { createdAt: new Date().toISOString(), status: "completed", amount: order.totalCents / 100, currency: "EUR", metadata: {}, phone: "", checkoutUrl: "", gateway: "paystack" });
    expect((await webhookPOST(signedRequest(body))).status).toBe(200);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.PAID);
  });
});

describe("Reservation expiry", () => {
  async function expiredHoldWithStatus(status: string | null) {
    const { animal, hold, order } = await newHeldOrder();
    fake.createBehavior = { stripe: { kind: "success", gateway: "stripe" } };
    const init = await initializeCardPayment(initInput(order));
    if (status === null) fake.payments.delete(init.providerReference);
    else fake.payments.get(init.providerReference)!.status = status;
    await prisma.reservation.update({ where: { id: hold.reservationId }, data: { expiresAt: new Date(Date.now() - 3 * 3600e3) } });
    return { animal, hold, order, init };
  }

  it("releases the inventory of an abandoned (pending) checkout but keeps the payment open", async () => {
    const { animal, init } = await expiredHoldWithStatus("pending");
    await expireReservations();
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.AVAILABLE);
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: init.paymentId } })).status).toBe(PaymentStatus.PENDING);
  });

  it("never releases while the payment is processing", async () => {
    const { animal } = await expiredHoldWithStatus("processing");
    await expireReservations();
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.HELD);
  });

  it("never releases when the provider status cannot be retrieved (escalates instead)", async () => {
    const { animal, order } = await expiredHoldWithStatus(null);
    const report = await expireReservations();
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.HELD);
    expect(report.escalated).toBe(1);
    expect(await prisma.reconciliationException.count({ where: { orderId: order.id, kind: "PROVIDER_UNREACHABLE" } })).toBe(1);
  });

  it("settles instead of releasing when the provider reports the payment completed", async () => {
    const { animal, order } = await expiredHoldWithStatus("completed");
    await expireReservations();
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.PAID);
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.SOLD);
  });
});

describe("Internal €1 test dog", () => {
  it("cannot be reserved through public checkout", async () => {
    const dog = await createAnimal({ priceCents: 100, isPaymentTest: true, published: false });
    await expect(holdAnimal(dog.id)).rejects.toBeInstanceOf(AnimalUnavailableError);
  });

  it("admin flow charges exactly €1.00 EUR (no transport, fees or extra VAT) and flags the order as a test", async () => {
    const dog = await createAnimal({ priceCents: 100, isPaymentTest: true, published: false });
    const hold = await holdAnimal(dog.id, { allowPaymentTest: true });
    expect(hold.isTest).toBe(true);
    expect(hold.pricing.totalCents).toBe(100);
    const order = await prisma.order.findUniqueOrThrow({ where: { id: hold.orderId } });
    expect(order.isTest).toBe(true);
    expect(order.totalCents).toBe(100);

    fake.createBehavior = { stripe: { kind: "success", gateway: "stripe" } };
    const c = fixtureCustomer();
    const res = await initializeCardPayment({ ...initInput({ ...order, customer: c }), isTest: true });
    expect(fake.createRequests()[0].body.amount).toBe(1);
    expect(fake.createRequests()[0].body.currency).toBe("EUR");
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: res.paymentId } })).isTest).toBe(true);
  });
});

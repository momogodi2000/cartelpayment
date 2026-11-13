/**
 * EUR -> XOF checkout through GeniusPay / Paystack (SQLite per-file database + local fake
 * GeniusPay HTTP server). Marketplace/order stay EUR; the card session is created in whole-franc
 * XOF from a server-side quote that is persisted and never taken from the client.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { AnimalStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { resetEnvCacheForTests } from "@/lib/env";
import { initializeCardPayment, CardPaymentUnavailableError } from "@/lib/services/payments/payment-initialization";
import { recordProbeResult } from "@/lib/services/payments/gateway-health";
import { settlePaymentAuthoritative } from "@/lib/services/payments/settlement";
import { resetFxCache, convertEurCentsToXof } from "@/lib/services/payments/fx";
import { FakeGeniusPay } from "../fixtures/fake-geniuspay";
import { createAnimal, holdAnimal, createPendingPayment, providerStatus } from "../fixtures/factory";

const fake = new FakeGeniusPay();

beforeAll(async () => {
  process.env.GENIUSPAY_BASE_URL = await fake.start();
  process.env.GENIUSPAY_TIMEOUT_MS = "2000";
  process.env.FX_RATE_API_URL = fake.fxUrl;
  process.env.FX_RATE_TTL_SECONDS = "0"; // every initialization asks the (fake) rate source
  process.env.FX_MARKUP_BPS = "0";
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
  fake.fxRate = 655.957;
  fake.fxFails = false;
  resetFxCache();
  await prisma.gatewayHealth.deleteMany();
  await prisma.siteSetting.deleteMany({ where: { key: "payments.gateways" } });
});

async function verify(...ids: string[]) {
  for (const id of ids) await recordProbeResult(id, { accepted: true, summary: { test: true } });
}

async function enableStripe() {
  const value = JSON.stringify({ stripe: { enabled: true } });
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

const xofFor = (order: { totalCents: number }, rate: string | number = 655.957) => convertEurCentsToXof(order.totalCents, rate).xofAmount;

describe("EUR -> XOF checkout through Paystack", () => {
  it("charges a server-side whole-franc XOF quote via payment_method=paystack and persists the conversion", async () => {
    fake.createBehavior = { paystack: { kind: "success", gateway: "paystack" } };
    const { order } = await newHeldOrder(103745); // 1,037.45 EUR listing price
    const xof = xofFor(order);
    const res = await initializeCardPayment({ ...initInput(order), expectedXofAmount: xof });

    expect(res.gatewayId).toBe("paystack");
    expect(res.checkoutUrl).toContain("checkout.paystack.com"); // the provider URL, untouched
    expect(res.chargedCurrency).toBe("XOF");
    expect(res.chargedAmount).toBe(xof);
    const body = fake.createRequests()[0].body;
    expect(body).toMatchObject({ amount: xof, currency: "XOF", payment_method: "paystack" });
    expect(Number.isInteger(body.amount)).toBe(true);
    expect(body.gateway).toBeUndefined();

    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: res.paymentId } });
    expect(payment).toMatchObject({ amountCents: xof, currency: "XOF", originalAmountCents: order.totalCents, originalCurrency: "EUR", fxRate: "655.957" });
    expect(payment.fxSource).toBeTruthy();
    expect(payment.fxQuotedAt).toBeInstanceOf(Date);
    // The marketplace order is never touched.
    expect(await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).toMatchObject({ totalCents: order.totalCents, currency: "EUR" });
    const attempt = await prisma.paymentAttempt.findFirstOrThrow({ where: { paymentId: payment.id } });
    expect(attempt).toMatchObject({ gatewayId: "paystack", gatewayRequested: "paystack", gatewayActual: "paystack" });
  });

  it("never charges XOF without the customer authorization of the amount", async () => {
    fake.createBehavior = { paystack: { kind: "success", gateway: "paystack" } };
    const { order } = await newHeldOrder();
    await expect(initializeCardPayment(initInput(order))).rejects.toMatchObject({ reason: "NO_ELIGIBLE_GATEWAY" });
    expect(fake.createRequests()).toHaveLength(0);
  });

  it("refuses to proceed when the authorized amount differs from the server quote (QUOTE_CHANGED)", async () => {
    fake.createBehavior = { paystack: { kind: "success", gateway: "paystack" } };
    const { order } = await newHeldOrder();
    const xof = xofFor(order);
    const err = await initializeCardPayment({ ...initInput(order), expectedXofAmount: xof + 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(CardPaymentUnavailableError);
    expect(err.reason).toBe("QUOTE_CHANGED");
    expect(err.quote).toMatchObject({ xofAmount: xof, eurCents: order.totalCents });
    expect(fake.createRequests()).toHaveLength(0);
  });

  it("blocks initialization when the exchange rate is unavailable — no stale or invented rate", async () => {
    const { order } = await newHeldOrder();
    fake.fxFails = true;
    await expect(initializeCardPayment({ ...initInput(order), expectedXofAmount: 786000 })).rejects.toMatchObject({ reason: "FX_UNAVAILABLE" });
    expect(fake.createRequests()).toHaveLength(0);

    fake.fxFails = false;
    fake.fxRate = null; // the source answers but does not publish XOF
    resetFxCache();
    await expect(initializeCardPayment({ ...initInput(order), expectedXofAmount: 786000 })).rejects.toMatchObject({ reason: "FX_UNAVAILABLE" });
    expect(fake.createRequests()).toHaveLength(0);
  });

  it("rejects an implausible exchange rate", async () => {
    const { order } = await newHeldOrder();
    fake.fxRate = 3; // broken feed
    await expect(initializeCardPayment({ ...initInput(order), expectedXofAmount: 1 })).rejects.toMatchObject({ reason: "FX_UNAVAILABLE" });
    expect(fake.createRequests()).toHaveLength(0);
  });

  it("rejects a session whose echoed currency differs from the XOF request", async () => {
    const { order } = await newHeldOrder();
    fake.createBehavior = { paystack: { kind: "success", gateway: "paystack", currency: "EUR" } };
    await expect(initializeCardPayment({ ...initInput(order), expectedXofAmount: xofFor(order) })).rejects.toMatchObject({ reason: "ALL_GATEWAYS_FAILED" });
    const attempt = await prisma.paymentAttempt.findFirstOrThrow({ where: { payment: { orderId: order.id } } });
    expect(attempt).toMatchObject({ status: "SUPERSEDED", errorClass: "REJECTED_ROUTE" });
  });

  it("a retry keeps the original quote even if the market rate moved, and every payment attempt is preserved", async () => {
    fake.createBehavior = { paystack: { kind: "success", gateway: "paystack" } };
    const { order } = await newHeldOrder();
    const xof = xofFor(order);
    const first = await initializeCardPayment({ ...initInput(order), expectedXofAmount: xof });
    await prisma.payment.update({ where: { id: first.paymentId }, data: { status: PaymentStatus.CANCELLED } });

    fake.fxRate = 700; // the market moved before the customer retried
    const second = await initializeCardPayment({ ...initInput(order), expectedXofAmount: xof });
    expect(second.resumed).toBe(false);
    expect(second.paymentId).not.toBe(first.paymentId);
    expect(second.chargedAmount).toBe(xof);
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: second.paymentId } })).fxRate).toBe("655.957");
    expect(await prisma.payment.count({ where: { orderId: order.id } })).toBe(2);
  });

  it("falls back from Stripe (EUR) to Paystack (XOF) only after a safe failure, re-pricing the payment for the gateway used", async () => {
    await enableStripe();
    fake.createBehavior = {
      stripe: { kind: "http", status: 503, body: { success: false } },
      paystack: { kind: "success", gateway: "paystack" },
    };
    const { order } = await newHeldOrder();
    const xof = xofFor(order);
    const res = await initializeCardPayment({ ...initInput(order), expectedXofAmount: xof });
    expect(res.gatewayId).toBe("paystack");
    expect(fake.createRequests().map((r) => [r.body.payment_method, r.body.currency])).toEqual([
      ["stripe", "EUR"],
      ["paystack", "XOF"],
    ]);
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: res.paymentId } });
    expect(payment).toMatchObject({ currency: "XOF", amountCents: xof, originalAmountCents: order.totalCents });
  });

  it("an ambiguous Paystack initialization is reconciled first and never retried through another gateway", async () => {
    await verify("paiementpro");
    fake.createBehavior = { paystack: { kind: "hang" }, paiementpro: { kind: "success", gateway: "paiementpro" } };
    fake.searchFails = true;
    const { order } = await newHeldOrder();
    await expect(initializeCardPayment({ ...initInput(order), expectedXofAmount: xofFor(order) })).rejects.toMatchObject({ reason: "RECONCILIATION_REQUIRED" });
    expect(fake.createRequests().map((r) => r.body.payment_method)).toEqual(["paystack"]);
  });

  it("does not silently move to another processor after a safe Paystack failure (PaiementPro stays disabled)", async () => {
    await verify("paiementpro");
    fake.createBehavior = { paystack: { kind: "http", status: 503, body: { success: false } }, paiementpro: { kind: "success", gateway: "paiementpro" } };
    const { order } = await newHeldOrder();
    await expect(initializeCardPayment({ ...initInput(order), expectedXofAmount: xofFor(order) })).rejects.toMatchObject({ reason: "ALL_GATEWAYS_FAILED" });
    expect(fake.createRequests().map((r) => r.body.payment_method)).toEqual(["paystack"]);
  });
});

describe("XOF settlement", () => {
  it("settles a confirmed XOF payment exactly once", async () => {
    const { animal, order } = await newHeldOrder();
    const p = await createPendingPayment(order.id, 786000, undefined, "XOF");
    for (let i = 0; i < 3; i++) {
      await settlePaymentAuthoritative(p.providerReference!, providerStatus(p.providerReference!, "completed", 786000, "XOF"));
    }
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.PAID);
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: animal.id } })).status).toBe(AnimalStatus.SOLD);
  });

  it("wrong XOF amount or wrong currency never marks the order paid", async () => {
    const a = await newHeldOrder();
    const pa = await createPendingPayment(a.order.id, 786000, undefined, "XOF");
    await settlePaymentAuthoritative(pa.providerReference!, providerStatus(pa.providerReference!, "completed", 785999, "XOF"));
    expect((await prisma.order.findUniqueOrThrow({ where: { id: a.order.id } })).status).toBe(OrderStatus.DISPUTED);

    const c = await newHeldOrder();
    const pc = await createPendingPayment(c.order.id, 786000, undefined, "XOF");
    await settlePaymentAuthoritative(pc.providerReference!, { ...providerStatus(pc.providerReference!, "completed", 786000, "XOF"), currency: "EUR" });
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: pc.id } })).status).toBe(PaymentStatus.REQUIRES_RECONCILIATION);
  });

  it("a fractional XOF amount from the provider is a mismatch, never a paid order", async () => {
    const { order } = await newHeldOrder();
    const p = await createPendingPayment(order.id, 786000, undefined, "XOF");
    await settlePaymentAuthoritative(p.providerReference!, { ...providerStatus(p.providerReference!, "completed", 786000, "XOF"), amount: 786000.4 });
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe(OrderStatus.DISPUTED);
  });
});

/**
 * Real GeniusPay contract tests. They run ONLY when sandbox credentials are explicitly
 * provided (GENIUSPAY_SANDBOX_API_KEY / GENIUSPAY_SANDBOX_API_SECRET, optionally
 * GENIUSPAY_SANDBOX_BASE_URL). Live keys are never used here (tests/setup.ts and env.ts
 * forbid them). Without credentials the suite is reported as SKIPPED, not as passed.
 */
import { describe, it, expect } from "vitest";
import { GeniusPayProvider, GeniusPayError } from "@/lib/services/payments/geniuspay";

const hasSandbox = Boolean(process.env.GENIUSPAY_SANDBOX_API_KEY && process.env.GENIUSPAY_SANDBOX_API_SECRET);

describe.skipIf(!hasSandbox)("GeniusPay sandbox contract (requires GENIUSPAY_SANDBOX_* credentials)", () => {
  const provider = new GeniusPayProvider();

  it("creates an EUR card session through default routing and reads it back", async () => {
    const ref = `PW-SBX-${Date.now()}`;
    const session = await provider.createPayment({
      orderId: ref,
      orderRef: ref,
      paymentId: ref,
      attemptRef: `${ref}-A1`,
      amountCents: 100,
      currency: "EUR",
      selection: null,
      customer: { name: "Sandbox Contract", email: "sandbox.contract@example.com", phone: "+33600000000", country: "FR" },
      successUrl: "https://pawelium.fyi/en/checkout/return",
      errorUrl: "https://pawelium.fyi/en/checkout/cancel",
      description: "Pawelium sandbox contract test",
    });
    expect(session.reference).toBeTruthy();
    expect(session.checkoutUrl).toMatch(/^https:\/\//);

    const status = await provider.getPaymentStatus(session.reference);
    expect(status.reference).toBe(session.reference);
    expect(["pending", "processing"]).toContain(status.status.toLowerCase());
  });

  it("returns 404 TRANSACTION_NOT_FOUND for an unknown reference", async () => {
    const err = await provider.getPaymentStatus("MTX-DOESNOTEXIST").catch((e) => e);
    expect(err).toBeInstanceOf(GeniusPayError);
    expect(err.httpStatus).toBe(404);
  });
});

import { describe, it, expect } from "vitest";
import { GeniusPayProvider } from "@/lib/services/payments/geniuspay";
import { getEnv } from "@/lib/env";

describe("GeniusPay Sandbox Contract Verification", () => {
  const env = getEnv();
  const apiKey = env.GENIUSPAY_API_KEY;
  const isRealSandboxKey = apiKey.startsWith("pk_sandbox_") && !apiKey.includes("placeholder") && !apiKey.includes("vitest_mock");

  it("checks whether real GeniusPay sandbox credentials are configured", () => {
    if (!isRealSandboxKey) {
      console.log("ℹ️ Skipping live sandbox network calls: Placeholder/mock sandbox keys configured.");
      expect(true).toBe(true);
      return;
    }
  });

  it.runIf(isRealSandboxKey)("creates EUR card payment session in sandbox", async () => {
    const provider = new GeniusPayProvider();
    const result = await provider.createPayment({
      orderId: "contract-test-order-001",
      orderRef: "PW-TESTSANDBOX",
      amountCents: 150000, // 1500.00 EUR
      currency: "EUR",
      customer: {
        name: "Test Adopter",
        email: "test.adopter@example.com",
        phone: "+33600000000",
        country: "France",
      },
      successUrl: "https://pawelium.fyi/en/checkout/return",
      errorUrl: "https://pawelium.fyi/en/checkout/cancel",
    });

    expect(result.id).toBeDefined();
    expect(result.reference).toBeDefined();
    expect(result.checkoutUrl).toBeDefined();
    console.log(`[GeniusPay Sandbox Verified] Reference: ${result.reference}, Checkout URL: ${result.checkoutUrl}`);

    // GET status
    const statusData = await provider.getPaymentStatus(result.reference);
    expect(statusData.reference).toBe(result.reference);
    expect(statusData.currency.toUpperCase()).toBe("EUR");
    console.log(`[GeniusPay Sandbox Status] Status: ${statusData.status}, Amount: ${statusData.amount}`);
  });

  it.runIf(isRealSandboxKey)("handles invalid reference properly", async () => {
    const provider = new GeniusPayProvider();
    await expect(provider.getPaymentStatus("NON_EXISTENT_MTX_REF_99999")).rejects.toThrow();
  });
});

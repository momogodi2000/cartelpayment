import { describe, it, expect } from "vitest";
import { formatMoney, toMinorUnits, toMajorUnits, formatForGeniusPay, parseFromGeniusPay } from "@/lib/domain/money";
import { calculatePricing } from "@/lib/domain/pricing";
import { canTransitionOrder, assertValidOrderTransition } from "@/lib/domain/order-state";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { generateBase32Secret, generateTOTP, verifyTOTP, generateRecoveryCodes } from "@/lib/security/totp";
import { generateToken, hashToken, timingSafeCompare } from "@/lib/security/tokens";
import { encrypt, decrypt } from "@/lib/security/encryption";
import { escapeHtml } from "@/lib/security/html-escape";
import { geniusPay } from "@/lib/services/payments/geniuspay";
import { isAcceptableCardSession } from "@/lib/services/payments/gateway-registry";
import { classifyInitError } from "@/lib/services/payments/payment-fallback";
import { GeniusPayError } from "@/lib/services/payments/geniuspay";
import { mapProviderStatus } from "@/lib/services/payments/settlement";
import { derivePaymentStateLabel } from "@/lib/services/payments/payment-state-label";
import crypto from "node:crypto";

describe("Unit Tests — Core Domain & Security Suite", () => {
  describe("Money & Currency Conversion", () => {
    it("converts major amounts to cents accurately", () => {
      expect(toMinorUnits(1250)).toBe(125000);
      expect(toMinorUnits("1250.50")).toBe(125050);
      expect(toMajorUnits(125000)).toBe(1250);
    });

    it("formats localized money without floating point drift", () => {
      const formatted = formatMoney(125000, "EUR", "fr");
      expect(formatted).toContain("1");
      expect(formatted).toContain("250");
      expect(formatted).toContain("€");
    });

    it("converts amounts for GeniusPay boundary according to configured unit", () => {
      // Default unit is major (e.g. 1500.00)
      const formatted = formatForGeniusPay(150000);
      expect(formatted).toBe(1500);
      expect(parseFromGeniusPay(1500)).toBe(150000);
    });
  });

  describe("Pricing Engine", () => {
    it("calculates server-authoritative totals for France", () => {
      const quote = calculatePricing(100000, { deliveryCountry: "France" });
      expect(quote.animalPriceCents).toBe(100000);
      expect(quote.transportCents).toBe(15000); // 150 EUR
      expect(quote.feesCents).toBe(4900); // 49 EUR
      expect(quote.taxCents).toBe(Math.round((15000 + 4900) * 0.2));
      expect(quote.totalCents).toBe(
        quote.animalPriceCents + quote.transportCents + quote.taxCents + quote.feesCents
      );
    });

    it("applies cross-border European delivery surcharge for non-France destinations", () => {
      const quoteFrance = calculatePricing(100000, { deliveryCountry: "France" });
      const quoteBelgium = calculatePricing(100000, { deliveryCountry: "Belgium" });
      expect(quoteBelgium.transportCents).toBe(25000); // 250 EUR
      expect(quoteBelgium.totalCents).toBeGreaterThan(quoteFrance.totalCents);
    });
  });

  describe("Order State Machine", () => {
    it("allows valid transitions", () => {
      expect(canTransitionOrder("PENDING_PAYMENT", "PAID")).toBe(true);
      expect(canTransitionOrder("PAID", "DOCUMENTATION_REVIEW")).toBe(true);
      expect(canTransitionOrder("DOCUMENTATION_REVIEW", "PREPARING")).toBe(true);
      expect(canTransitionOrder("PREPARING", "TRANSPORT_SCHEDULED")).toBe(true);
      expect(canTransitionOrder("TRANSPORT_SCHEDULED", "IN_TRANSIT")).toBe(true);
      expect(canTransitionOrder("IN_TRANSIT", "DELIVERED")).toBe(true);
      expect(canTransitionOrder("DELIVERED", "COMPLETED")).toBe(true);
    });

    it("rejects illegal transitions", () => {
      expect(canTransitionOrder("PENDING_PAYMENT", "COMPLETED")).toBe(false);
      expect(canTransitionOrder("COMPLETED", "PAID")).toBe(false);
      expect(canTransitionOrder("PAID", "CANCELLED")).toBe(false); // Cancel only allowed pre-PAID
      expect(() => assertValidOrderTransition("PENDING_PAYMENT", "DELIVERED")).toThrow();
    });
  });

  describe("Password Hashing & Verification (scrypt)", () => {
    it("hashes and verifies passwords securely using Node crypto.scrypt", async () => {
      const password = "VerySecurePassword2026!";
      const hash = await hashPassword(password);
      expect(hash).toContain(":");

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword("WrongPassword123!", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("TOTP MFA (RFC 6238)", () => {
    it("generates and verifies 6-digit TOTP codes within time window", () => {
      const secret = generateBase32Secret();
      const code = generateTOTP(secret);
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);

      const isValid = verifyTOTP(code, secret);
      expect(isValid).toBe(true);

      const isInvalid = verifyTOTP("000000", secret);
      expect(isInvalid).toBe(false);
    });

    it("generates secure recovery codes", () => {
      const codes = generateRecoveryCodes(8);
      expect(codes).toHaveLength(8);
      expect(codes[0]).toMatch(/^[0-9A-F]{5}-[0-9A-F]{5}$/);
    });
  });

  describe("Tokens & Timing-Safe Comparison", () => {
    it("generates opaque cryptographically random tokens and SHA-256 hashes", () => {
      const token = generateToken(32);
      expect(token).toHaveLength(64); // hex
      const hash = hashToken(token);
      expect(hash).toHaveLength(64);

      expect(timingSafeCompare(token, token)).toBe(true);
      expect(timingSafeCompare(token, "tampered-token")).toBe(false);
    });
  });

  describe("AES-256-GCM Encryption", () => {
    it("encrypts and decrypts sensitive data symmetrically", () => {
      const secret = "JBSWY3DPEHPK3PXP";
      const encrypted = encrypt(secret);
      expect(encrypted).not.toBe(secret);
      expect(encrypted.split(":")).toHaveLength(3); // iv:authTag:ciphertext

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(secret);
    });
  });

  describe("HTML Escaping", () => {
    it("escapes malicious characters to prevent HTML/XSS injection", () => {
      const malicious = '<script>alert("XSS")</script> & \'test\'';
      const safe = escapeHtml(malicious);
      expect(safe).not.toContain("<script>");
      expect(safe).toContain("&lt;script&gt;");
      expect(safe).toContain("&amp;");
      expect(safe).toContain("&quot;");
    });
  });

  describe("GeniusPay HMAC-SHA256 Webhook Verification", () => {
    it("validates authentic webhook payloads and rejects tampered or expired ones", () => {
      const rawBody = JSON.stringify({ id: "evt_123", event: "payment.success", data: { reference: "MTX-TEST-001" } });
      const nowSec = Math.floor(Date.now() / 1000).toString();
      const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET || "whsec_test";

      // Valid signature
      const validSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(`${nowSec}.${rawBody}`)
        .digest("hex");

      const isValid = geniusPay.verifyWebhookSignature(rawBody, validSig, nowSec);
      expect(isValid).toBe(true);

      // Tampered payload -> MUST FAIL
      const isTamperedValid = geniusPay.verifyWebhookSignature(rawBody + "tamper", validSig, nowSec);
      expect(isTamperedValid).toBe(false);

      // Replay attack (> 300s delta) -> MUST FAIL
      const expiredTimestamp = (parseInt(nowSec, 10) - 360).toString();
      const isExpiredValid = geniusPay.verifyWebhookSignature(rawBody, validSig, expiredTimestamp);
      expect(isExpiredValid).toBe(false);

      // Missing signature -> MUST FAIL
      expect(geniusPay.verifyWebhookSignature(rawBody, null, nowSec)).toBe(false);
      expect(geniusPay.verifyWebhookSignature(rawBody, "", nowSec)).toBe(false);
    });

    it("ensures webhook event processing rejects null or empty event payloads", () => {
      expect(geniusPay.verifyWebhookSignature("", "some-sig", "12345")).toBe(false);
    });
  });

  describe("Card routing safeguards", () => {
    it("accepts only sessions routed to card processors", () => {
      expect(isAcceptableCardSession("paystack", "https://checkout.paystack.com/x")).toBe(true);
      expect(isAcceptableCardSession("stripe", "https://checkout.stripe.com/c/x")).toBe(true);
      expect(isAcceptableCardSession("wave", "https://checkout.paystack.com/x")).toBe(false);
      expect(isAcceptableCardSession("pawapay", "https://geniuspay.ci/checkout/x")).toBe(false);
      expect(isAcceptableCardSession(null, "https://geniuspay.ci/checkout/x")).toBe(false); // generic picker could offer mobile money
      expect(isAcceptableCardSession(null, "https://checkout.stripe.com/c/x")).toBe(true);
    });

    it("classifies initialization failures so fallback never risks a duplicate charge", () => {
      expect(classifyInitError(new GeniusPayError("refused", "not_sent"))).toBe("SAFE");
      expect(classifyInitError(new GeniusPayError("422", "http_error", 422))).toBe("SAFE");
      expect(classifyInitError(new GeniusPayError("503", "http_error", 503))).toBe("SAFE");
      expect(classifyInitError(new GeniusPayError("500", "http_error", 500))).toBe("AMBIGUOUS");
      expect(classifyInitError(new GeniusPayError("503 with ref", "http_error", 503, null, "MTX-1"))).toBe("AMBIGUOUS");
      expect(classifyInitError(new GeniusPayError("timeout", "no_response"))).toBe("AMBIGUOUS");
      expect(classifyInitError(new GeniusPayError("bad body", "invalid_response", 200))).toBe("AMBIGUOUS");
      expect(classifyInitError(new Error("unknown local failure"))).toBe("AMBIGUOUS");
    });

    it("maps provider statuses without ever inventing success", () => {
      expect(mapProviderStatus("completed")).toBe("SUCCESSFUL");
      expect(mapProviderStatus("failed")).toBe("FAILED");
      expect(mapProviderStatus("declined")).toBe("DECLINED");
      expect(mapProviderStatus("cancelled")).toBe("CANCELLED");
      expect(mapProviderStatus("expired")).toBe("EXPIRED");
      expect(mapProviderStatus("refunded")).toBe("REFUNDED");
      expect(mapProviderStatus("something-new")).toBe("PENDING");
      expect(mapProviderStatus(undefined)).toBe("PENDING");
    });

    it("labels payments so init failures, declines, abandonment and pending webhooks are distinguishable", () => {
      const base = { providerReference: null as string | null, createdAt: new Date(Date.now() - 60_000) };
      const o = { processedWebhookCount: 0, holdMinutes: 30 };
      expect(derivePaymentStateLabel({ ...base, status: "FAILED" }, o)).toBe("initFailed");
      expect(derivePaymentStateLabel({ ...base, providerReference: "MTX", status: "FAILED" }, o)).toBe("declined");
      expect(derivePaymentStateLabel({ ...base, providerReference: "MTX", status: "PENDING", createdAt: new Date(Date.now() - 3600e3) }, o)).toBe("abandoned");
      expect(derivePaymentStateLabel({ ...base, providerReference: "MTX", status: "SUCCESSFUL" }, o)).toBe("paidAwaitingWebhook");
      expect(derivePaymentStateLabel({ ...base, providerReference: "MTX", status: "SUCCESSFUL" }, { ...o, processedWebhookCount: 1 })).toBe("paid");
    });

    it("formats EUR amounts with 2 decimals in both languages", () => {
      expect(formatMoney(100, "EUR", "en")).toBe("€1.00");
      expect(formatMoney(100, "EUR", "fr")).toMatch(/1,00\s*€/);
    });
  });
});

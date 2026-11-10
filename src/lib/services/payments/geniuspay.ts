import crypto from "node:crypto";
import { getEnv } from "../../env";
import { formatForGeniusPay } from "../../domain/money";

export interface CreateGeniusPayPaymentInput {
  orderId: string;
  orderRef: string;
  amountCents: number;
  currency?: string;
  gateway?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    country: string;
  };
  successUrl: string;
  errorUrl: string;
  description?: string;
}

export interface GeniusPayPaymentResponse {
  id: string;
  reference: string;
  status: string;
  checkoutUrl: string;
  expiresAt?: string;
}

export interface GeniusPayStatusResponse {
  id: string;
  reference: string;
  status: "pending" | "processing" | "completed" | "failed" | "expired" | "cancelled" | "refunded";
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export class GeniusPayProvider {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private webhookSecret: string;
  private environment: string;

  constructor() {
    const env = getEnv();
    this.baseUrl = env.GENIUSPAY_BASE_URL.replace(/\/+$/, "");
    this.apiKey = env.GENIUSPAY_API_KEY;
    this.apiSecret = env.GENIUSPAY_API_SECRET;
    this.webhookSecret = env.GENIUSPAY_WEBHOOK_SECRET;
    this.environment = env.GENIUSPAY_ENVIRONMENT;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Pawelium-European-Concierge/2.0 (Live Pet Registry)",
      "X-API-Key": this.apiKey,
      "X-API-Secret": this.apiSecret,
    };
  }

  /**
   * Normalizes customer country code to ISO 2-letter uppercase format.
   */
  private normalizeCountryCode(country: string): string {
    const cleaned = (country || "").trim().toUpperCase();
    if (cleaned === "FRANCE") return "FR";
    if (cleaned === "GERMANY" || cleaned === "DEUTSCHLAND") return "DE";
    if (cleaned === "ITALY" || cleaned === "ITALIA") return "IT";
    if (cleaned === "SPAIN" || cleaned === "ESPANA") return "ES";
    if (cleaned === "BELGIUM" || cleaned === "BELGIQUE") return "BE";
    if (cleaned === "SWITZERLAND" || cleaned === "SUISSE") return "CH";
    return cleaned.slice(0, 2) || "FR";
  }

  /**
   * Creates a payment session with GeniusPay hosted checkout.
   */
  async createPayment(input: CreateGeniusPayPaymentInput): Promise<GeniusPayPaymentResponse> {
    const amount = formatForGeniusPay(input.amountCents);
    const currency = input.currency || "EUR";
    const paymentMethod = "card";
    const country = this.normalizeCountryCode(input.customer.country);

    const payload: Record<string, any> = {
      amount,
      currency,
      payment_method: paymentMethod,
      description: input.description || `Pawelium adoption reservation #${input.orderRef}`,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        country,
      },
      success_url: input.successUrl,
      error_url: input.errorUrl,
      metadata: {
        orderId: input.orderId,
        orderRef: input.orderRef,
        amountCents: input.amountCents,
      },
    };

    if (input.gateway) {
      payload.gateway = input.gateway;
    }

    // 10s fetch timeout via AbortSignal.timeout
    const res = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const data: any = await res.json().catch(() => null);

    if (!res.ok || !data) {
      console.error("[GeniusPay] Payment creation failed:", res.status, data);
      throw new Error(`Payment gateway error: ${data?.message || res.statusText || res.status}`);
    }

    const paymentData = data.data || data;
    const checkoutUrl = paymentData.checkout_url || paymentData.payment_url || paymentData.url;

    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from payment session.");
    }

    return {
      id: String(paymentData.id || paymentData.reference),
      reference: paymentData.reference,
      status: paymentData.status || "pending",
      checkoutUrl,
      expiresAt: paymentData.expires_at,
    };
  }

  /**
   * Authoritatively fetches current payment status from GeniusPay API.
   */
  async getPaymentStatus(reference: string): Promise<GeniusPayStatusResponse> {
    const res = await fetch(`${this.baseUrl}/payments/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch payment status: HTTP ${res.status}`);
    }

    const json: any = await res.json().catch(() => null);
    const p = json?.data || json;

    if (!p || !p.reference) {
      throw new Error("Invalid response format from payment provider.");
    }

    return {
      id: String(p.id || p.reference),
      reference: p.reference,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      metadata: p.metadata,
    };
  }

  /**
   * Verifies cryptographic HMAC-SHA256 signature and timestamp of an incoming webhook.
   */
  verifyWebhookSignature(
    rawBody: string,
    signature: string | null,
    timestamp: string | null,
    incomingEnv?: string | null
  ): boolean {
    if (!signature || !timestamp) {
      return false;
    }

    // Bi-directional environment mapping (live <-> production, sandbox <-> sandbox)
    const norm = (e: string) => (e.toLowerCase() === "live" ? "production" : e.toLowerCase());

    if (incomingEnv && norm(incomingEnv) !== norm(this.environment)) {
      console.warn(
        `[GeniusPay Webhook] Environment mismatch: received ${incomingEnv}, expected ${this.environment}`
      );
      return false;
    }

    // Timestamp replay check: within 300 seconds (5 minutes)
    const nowSec = Math.floor(Date.now() / 1000);
    const tsSec = parseInt(timestamp, 10);
    if (isNaN(tsSec) || Math.abs(nowSec - tsSec) > 300) {
      console.warn(`[GeniusPay Webhook] Timestamp delta too large: delta=${Math.abs(nowSec - tsSec)}s`);
      return false;
    }

    const payloadToSign = `${timestamp}.${rawBody}`;
    const expectedHash = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payloadToSign)
      .digest("hex");

    try {
      const bufExpected = Buffer.from(expectedHash, "hex");
      const bufActual = Buffer.from(signature, "hex");

      if (
        bufExpected.length === bufActual.length &&
        crypto.timingSafeEqual(bufExpected, bufActual)
      ) {
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }
}

export const geniusPay = new GeniusPayProvider();

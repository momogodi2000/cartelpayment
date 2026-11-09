import crypto from "node:crypto";
import { getEnv } from "../../env";
import { formatForGeniusPay, parseFromGeniusPay } from "../../domain/money";

export interface CreateGeniusPayPaymentInput {
  orderId: string;
  orderRef: string;
  amountCents: number;
  currency?: string;
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
      "X-API-Key": this.apiKey,
      "X-API-Secret": this.apiSecret,
    };
  }

  /**
   * Creates a payment session with GeniusPay hosted checkout.
   */
  async createPayment(input: CreateGeniusPayPaymentInput): Promise<GeniusPayPaymentResponse> {
    const amount = formatForGeniusPay(input.amountCents);
    const currency = input.currency || "EUR";
    const paymentMethod = getEnv().GENIUSPAY_PAYMENT_METHOD || "card";

    const payload = {
      amount,
      currency,
      payment_method: paymentMethod,
      description: input.description || `Pawelium adoption reservation #${input.orderRef}`,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        country: input.customer.country,
      },
      success_url: input.successUrl,
      error_url: input.errorUrl,
      metadata: {
        orderId: input.orderId,
        orderRef: input.orderRef,
        amountCents: input.amountCents,
      },
    };

    const res = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      console.error("[GeniusPay] Payment creation failed:", res.status, data);
      throw new Error(`GeniusPay API error: ${data?.message || res.statusText || res.status}`);
    }

    const paymentData = data.data || data;
    const checkoutUrl = paymentData.checkout_url || paymentData.payment_url || paymentData.url;

    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from GeniusPay payment session.");
    }

    return {
      id: paymentData.id || paymentData.reference,
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
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      throw new Error(`GeniusPay GET status error: ${data?.message || res.status}`);
    }

    const p = data.data || data;
    return {
      id: p.id,
      reference: p.reference,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      metadata: p.metadata,
    };
  }

  /**
   * Verifies the cryptographic HMAC-SHA256 signature and timestamp of an incoming webhook.
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

    // Check environment if header present
    if (incomingEnv && incomingEnv !== this.environment) {
      console.warn(`[GeniusPay Webhook] Environment mismatch: received ${incomingEnv}, expected ${this.environment}`);
      return false;
    }

    // Timestamp replay check: within 300 seconds (5 minutes)
    const nowSec = Math.floor(Date.now() / 1000);
    const tsSec = parseInt(timestamp, 10);
    if (isNaN(tsSec) || Math.abs(nowSec - tsSec) > 300) {
      console.warn(`[GeniusPay Webhook] Timestamp delta too large: delta=${Math.abs(nowSec - tsSec)}s`);
      return false;
    }

    const computeHmac = (body: string): string => {
      const payloadToSign = `${timestamp}.${body}`;
      return crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payloadToSign)
        .digest("hex");
    };

    // Primary check: signature over raw body
    const primaryHash = computeHmac(rawBody);
    try {
      const bufExpected = Buffer.from(primaryHash, "hex");
      const bufActual = Buffer.from(signature, "hex");
      if (bufExpected.length === bufActual.length && crypto.timingSafeEqual(bufExpected, bufActual)) {
        return true;
      }
    } catch {
      // Continue to secondary check
    }

    // Secondary check: canonical re-serialized JSON (in case PHP/upstream used json_encode)
    try {
      const parsed = JSON.parse(rawBody);
      const canonicalBody = JSON.stringify(parsed);
      const secondaryHash = computeHmac(canonicalBody);
      const bufExpected2 = Buffer.from(secondaryHash, "hex");
      const bufActual = Buffer.from(signature, "hex");
      if (bufExpected2.length === bufActual.length && crypto.timingSafeEqual(bufExpected2, bufActual)) {
        return true;
      }
    } catch {
      // Not valid JSON
    }

    return false;
  }
}

export const geniusPay = new GeniusPayProvider();

/**
 * src/lib/services/payments/geniuspay.ts
 *
 * GeniusPay Merchant API client (internal payment orchestration layer).
 * Only documented endpoints are used (https://geniuspay.ci/docs/api):
 *   POST /payments              — initialize a payment (hosted checkout)
 *   GET  /payments/{reference}  — authoritative status
 *   GET  /payments?search=…     — documented search (reference, customer name or phone)
 * Webhooks: X-Webhook-Signature = hex HMAC-SHA256(timestamp + "." + rawBody, whsec).
 */

import crypto from "node:crypto";
import { getEnv } from "../../env";
import { formatAmountForGeniusPay } from "../../domain/money";

/** How a specific gateway is requested from GeniusPay. `null` = GeniusPay default routing. */
export type GatewaySelectionParam = { field: "gateway" | "payment_method"; value: string } | null;

export interface CreateGeniusPayPaymentInput {
  orderId: string;
  orderRef: string;
  paymentId: string;
  attemptRef: string;
  amountCents: number;
  currency: string;
  selection: GatewaySelectionParam;
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
  /** Gateway echoed by GeniusPay (`data.gateway`), lower-cased, when present. */
  gateway: string | null;
  currency: string | null;
  amount: number | null;
}

export interface GeniusPayStatusResponse {
  id: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  gateway?: string | null;
  paymentUrl?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, any>;
}

export interface GeniusPaySearchItem {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string | null;
}

/** Phase in which a provider call failed — drives the safe/ambiguous classification. */
export type ProviderFailurePhase =
  | "not_sent" // DNS / connection refused: the request never reached the provider
  | "no_response" // timeout / reset after the request was sent: outcome unknown
  | "http_error" // provider answered with a non-2xx status
  | "invalid_response"; // provider answered 2xx but the body is unusable

export class GeniusPayError extends Error {
  constructor(
    message: string,
    public readonly phase: ProviderFailurePhase,
    public readonly httpStatus: number | null = null,
    public readonly errorCode: string | null = null,
    /** Provider reference present in an error/invalid body (proves a session may exist). */
    public readonly reference: string | null = null
  ) {
    super(message);
    this.name = "GeniusPayError";
  }
}

function classifyFetchFailure(err: any): ProviderFailurePhase {
  const name = err?.name || "";
  const code = err?.cause?.code || err?.code || "";
  if (name === "TimeoutError" || name === "AbortError") return "no_response";
  if (["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ERR_INVALID_URL", "CERT_HAS_EXPIRED"].includes(code)) {
    return "not_sent";
  }
  // ECONNRESET / UND_ERR_SOCKET / unknown: the request may have been processed.
  return "no_response";
}

export class GeniusPayProvider {
  private get config() {
    const env = getEnv();
    return {
      baseUrl: env.GENIUSPAY_BASE_URL.replace(/\/+$/, ""),
      apiKey: env.GENIUSPAY_API_KEY,
      apiSecret: env.GENIUSPAY_API_SECRET,
      webhookSecret: env.GENIUSPAY_WEBHOOK_SECRET,
      environment: env.GENIUSPAY_ENVIRONMENT,
      timeoutMs: env.GENIUSPAY_TIMEOUT_MS,
    };
  }

  private headers(): Record<string, string> {
    const c = this.config;
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Pawelium-Commerce/2.0",
      "X-API-Key": c.apiKey,
      "X-API-Secret": c.apiSecret,
    };
  }

  private async request(path: string, init: RequestInit): Promise<{ status: number; ok: boolean; body: any }> {
    const c = this.config;
    let res: Response;
    try {
      res = await fetch(`${c.baseUrl}${path}`, {
        ...init,
        headers: this.headers(),
        signal: AbortSignal.timeout(c.timeoutMs),
      });
    } catch (err: any) {
      throw new GeniusPayError(
        `Provider request failed: ${err?.name || "Error"}`,
        classifyFetchFailure(err)
      );
    }
    const body = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, body };
  }

  /** ISO-3166 alpha-2 country normalisation for the provider payload. */
  static normalizeCountry(country: string): string {
    const cleaned = (country || "").trim().toUpperCase();
    const map: Record<string, string> = {
      FRANCE: "FR",
      GERMANY: "DE",
      DEUTSCHLAND: "DE",
      ITALY: "IT",
      ITALIA: "IT",
      SPAIN: "ES",
      ESPANA: "ES",
      "ESPAÑA": "ES",
      BELGIUM: "BE",
      BELGIQUE: "BE",
      SWITZERLAND: "CH",
      SUISSE: "CH",
      LUXEMBOURG: "LU",
      NETHERLANDS: "NL",
      AUSTRIA: "AT",
      PORTUGAL: "PT",
    };
    if (map[cleaned]) return map[cleaned];
    return /^[A-Z]{2}$/.test(cleaned) ? cleaned : "FR";
  }

  /**
   * POST /payments. Throws GeniusPayError (with phase/httpStatus) on any failure so the
   * router can decide between safe fallback and reconciliation.
   */
  async createPayment(input: CreateGeniusPayPaymentInput): Promise<GeniusPayPaymentResponse> {
    const payload: Record<string, any> = {
      // XOF is sent as a whole-franc integer (Paystack rejects fractional XOF).
      amount: formatAmountForGeniusPay(input.amountCents, input.currency),
      currency: input.currency.toUpperCase(),
      payment_method: getEnv().GENIUSPAY_PAYMENT_METHOD,
      description: input.description || `Pawelium order ${input.orderRef}`,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        country: GeniusPayProvider.normalizeCountry(input.customer.country),
      },
      success_url: input.successUrl,
      error_url: input.errorUrl,
      metadata: {
        order_id: input.orderId,
        order_ref: input.orderRef,
        payment_id: input.paymentId,
        attempt_ref: input.attemptRef,
        amount_cents: input.amountCents,
      },
    };

    if (input.selection) {
      payload[input.selection.field] = input.selection.value;
    }

    const { status, ok, body } = await this.request("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = body?.data ?? null;
    const reference: string | null = data?.reference ?? body?.reference ?? null;

    if (!ok) {
      throw new GeniusPayError(
        body?.error?.message || body?.message || `HTTP ${status}`,
        "http_error",
        status,
        body?.error?.code ?? null,
        reference
      );
    }

    const checkoutUrl: string | undefined = data?.checkout_url || data?.payment_url;
    if (!data || !reference || !checkoutUrl) {
      throw new GeniusPayError(
        "Provider returned an incomplete payment session.",
        "invalid_response",
        status,
        null,
        reference
      );
    }

    return {
      id: String(data.id ?? reference),
      reference,
      status: String(data.status || "pending"),
      checkoutUrl,
      expiresAt: data.expires_at,
      gateway: data.gateway ? String(data.gateway).toLowerCase() : null,
      currency: data.currency ? String(data.currency).toUpperCase() : null,
      amount: typeof data.amount === "number" ? data.amount : data.amount ? Number(data.amount) : null,
    };
  }

  /** GET /payments/{reference} — the authoritative status source. */
  async getPaymentStatus(reference: string): Promise<GeniusPayStatusResponse> {
    const { status, ok, body } = await this.request(`/payments/${encodeURIComponent(reference)}`, {
      method: "GET",
    });

    if (!ok) {
      throw new GeniusPayError(
        body?.error?.message || `Failed to fetch payment status: HTTP ${status}`,
        "http_error",
        status,
        body?.error?.code ?? null,
        null
      );
    }

    const p = body?.data ?? body;
    if (!p || !p.reference || !p.status) {
      throw new GeniusPayError("Invalid status response from provider.", "invalid_response", status);
    }

    return {
      id: String(p.id ?? p.reference),
      reference: String(p.reference),
      status: String(p.status),
      amount: typeof p.amount === "number" ? p.amount : Number(p.amount),
      currency: p.currency ? String(p.currency) : "",
      gateway: p.gateway || p.payment_provider || null,
      paymentUrl: p.checkout_url || p.payment_url || null,
      expiresAt: p.expires_at || null,
      metadata: p.metadata || {},
    };
  }

  /** GET /payments?search=… (documented: reference, customer name or phone). */
  async searchPayments(search: string, fromDate?: string): Promise<GeniusPaySearchItem[]> {
    const qs = new URLSearchParams({ search, per_page: "20" });
    if (fromDate) qs.set("from", fromDate);
    const { status, ok, body } = await this.request(`/payments?${qs.toString()}`, { method: "GET" });
    if (!ok || !Array.isArray(body?.data)) {
      throw new GeniusPayError(`Payment search failed: HTTP ${status}`, ok ? "invalid_response" : "http_error", status);
    }
    return body.data.map((p: any) => ({
      reference: String(p.reference),
      amount: Number(p.amount),
      currency: String(p.currency || ""),
      status: String(p.status || ""),
      createdAt: p.created_at || null,
    }));
  }

  /**
   * Verifies the HMAC-SHA256 signature over the RAW request body and the replay window.
   * Only the documented format is accepted: hex(HMAC-SHA256(timestamp + "." + rawBody)).
   */
  verifyWebhookSignature(
    rawBody: string,
    signature: string | null,
    timestamp: string | null,
    incomingEnv?: string | null,
    nowMs: number = Date.now()
  ): boolean {
    const c = this.config;
    if (!signature || !timestamp || !c.webhookSecret) return false;

    if (incomingEnv) {
      const norm = (e: string) => (e.toLowerCase() === "live" ? "production" : e.toLowerCase());
      if (norm(incomingEnv) !== norm(c.environment)) return false;
    }

    const tsSec = Number.parseInt(timestamp, 10);
    if (!Number.isFinite(tsSec) || Math.abs(Math.floor(nowMs / 1000) - tsSec) > 300) {
      return false;
    }

    const expected = crypto.createHmac("sha256", c.webhookSecret).update(`${timestamp}.${rawBody}`).digest();
    let provided: Buffer;
    try {
      provided = Buffer.from(signature.trim(), "hex");
    } catch {
      return false;
    }
    return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  }
}

export const geniusPay = new GeniusPayProvider();

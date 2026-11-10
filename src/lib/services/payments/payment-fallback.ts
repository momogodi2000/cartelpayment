/**
 * src/lib/services/payments/payment-fallback.ts
 *
 * Classifies a failed session initialization so the router never risks a duplicate charge.
 *
 *  SAFE       — the provider certainly did NOT create a payable session for the customer
 *               (request never sent, explicit rejection without a reference, gateway outage
 *               status without a reference). The next eligible gateway may be tried.
 *  AMBIGUOUS  — a session MAY exist (timeout after send, 5xx carrying/possibly carrying a
 *               reference, unusable 2xx). The original attempt must be reconciled first.
 *  DECLINE    — customer-level refusal (never produced by hosted-checkout initialization,
 *               kept for completeness). No automatic fallback.
 */

import { GeniusPayError } from "./geniuspay";

export type InitErrorClass = "SAFE" | "AMBIGUOUS" | "DECLINE";

const DECLINE_PATTERN = /(declined|insufficient|do_not_honor|expired_card|incorrect_cvc|3ds_failed)/i;

export function classifyInitError(err: unknown): InitErrorClass {
  if (!(err instanceof GeniusPayError)) {
    // Unknown local error before/around the call: we cannot prove no session exists.
    return "AMBIGUOUS";
  }

  if (DECLINE_PATTERN.test(err.message || "") || DECLINE_PATTERN.test(err.errorCode || "")) {
    return "DECLINE";
  }

  switch (err.phase) {
    case "not_sent":
      return "SAFE";
    case "no_response":
    case "invalid_response":
      return "AMBIGUOUS";
    case "http_error": {
      if (err.reference) return "AMBIGUOUS"; // a transaction reference came back: a session may exist
      const s = err.httpStatus ?? 0;
      if (s >= 400 && s < 500) return "SAFE"; // explicit rejection (422 validation, 400 init failed, 401/403/404)
      if (s === 502 || s === 503 || s === 504) return "SAFE"; // gateway / provider outage
      return "AMBIGUOUS"; // other 5xx: provider may have processed the request
    }
  }
}

/** Only SAFE failures of the gateway itself should count against its circuit breaker. */
export function countsAgainstGatewayHealth(err: unknown): boolean {
  if (!(err instanceof GeniusPayError)) return false;
  if (err.phase === "not_sent") return false; // our network, not the gateway
  if (err.phase === "http_error") {
    const s = err.httpStatus ?? 0;
    // 401/403 are merchant-credential problems, not gateway outages.
    return s === 422 || s === 400 || s >= 500;
  }
  return err.phase === "no_response";
}

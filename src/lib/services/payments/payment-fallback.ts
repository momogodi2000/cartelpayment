/**
 * src/lib/services/payments/payment-fallback.ts
 *
 * Error classification & safe fallback policy for card initialization.
 */

export type InitErrorClass = "SAFE" | "AMBIGUOUS" | "DECLINE" | "VALIDATION";

export interface ClassifyErrorParams {
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
  requestSent?: boolean;
}

export function classifyInitError(params: ClassifyErrorParams): InitErrorClass {
  const { httpStatus, errorCode, errorMessage, requestSent } = params;
  const msg = (errorMessage || "").toLowerCase();
  const code = (errorCode || "").toLowerCase();

  // Ambiguous: network timeout or dropped socket after request was dispatched
  if (msg.includes("timeout") || msg.includes("econnreset") || msg.includes("aborted")) {
    return requestSent ? "AMBIGUOUS" : "SAFE";
  }

  // Safe infrastructure outages: 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
  if (httpStatus === 502 || httpStatus === 503 || httpStatus === 504) {
    return "SAFE";
  }

  // Gateway not supported / validation failure
  if (httpStatus === 422 || code === "validation.in" || msg.includes("validation.in")) {
    return "VALIDATION";
  }

  // Customer decline or invalid card details
  if (
    msg.includes("declined") ||
    msg.includes("insufficient") ||
    msg.includes("expired_card") ||
    msg.includes("incorrect_cvc")
  ) {
    return "DECLINE";
  }

  // Default to safe if not sent, ambiguous if 500 received after dispatch
  if (httpStatus && httpStatus >= 500) {
    return "AMBIGUOUS";
  }

  return "SAFE";
}

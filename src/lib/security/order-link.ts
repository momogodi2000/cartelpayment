import crypto from "node:crypto";
import { getEnv } from "../env";
import { timingSafeCompare } from "./tokens";

/**
 * Short HMAC signature binding a payment return/cancel link to one order reference.
 * Lets the customer see their payment status and retry, without exposing any order
 * details to someone who merely guesses an order reference.
 */
export function signOrderRef(orderRef: string): string {
  return crypto
    .createHmac("sha256", getEnv().ENCRYPTION_KEY)
    .update(`order-link:v1:${orderRef}`)
    .digest("base64url")
    .slice(0, 32);
}

export function verifyOrderRefSignature(orderRef: string, signature: string | null | undefined): boolean {
  if (!orderRef || !signature) return false;
  return timingSafeCompare(signOrderRef(orderRef), signature);
}

/**
 * src/lib/services/payments/payment-router.ts
 *
 * Card routing engine for Pawelium 2.0.
 * Selects the highest-priority operational gateway with an active circuit breaker.
 * Mobile money gateways are strictly and permanently excluded.
 */

import { getEligibleCardGateways, GatewayConfig } from "./gateway-registry";
import { isGatewayAvailable } from "./gateway-health";

export interface RoutePaymentParams {
  method: string;
  currency: string;
  country?: string;
  amountCents: number;
}

export async function selectCardGateways(
  params: RoutePaymentParams
): Promise<GatewayConfig[]> {
  // Strict rule: Card payments ONLY
  if (params.method !== "card") {
    throw new Error(`Unsupported payment method: ${params.method}. Only card payments are permitted.`);
  }

  const eligible = getEligibleCardGateways(params.currency);
  const operational: GatewayConfig[] = [];

  for (const gateway of eligible) {
    const available = await isGatewayAvailable(gateway.id);
    if (available) {
      operational.push(gateway);
    }
  }

  return operational;
}

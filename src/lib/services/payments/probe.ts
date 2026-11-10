/**
 * src/lib/services/payments/probe.ts
 *
 * Gateway identifier/capability verification against the real GeniusPay API.
 * A probe creates ONE unpaid EUR card session for the smallest amount and never shows its
 * URL to anyone; unpaid sessions expire at the provider after 24 h. No card is charged.
 * Probes are only run on explicit SUPER_ADMIN request (admin button or CLI with --confirm).
 */

import { getBaseRegistry, isAcceptableCardSession, DEFAULT_ROUTE_ID } from "./gateway-registry";
import { geniusPay, GeniusPayError } from "./geniuspay";
import { recordProbeResult } from "./gateway-health";
import { generateToken } from "../../security/tokens";

export interface ProbeOutcome {
  gatewayId: string;
  accepted: boolean;
  httpStatus: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  echoedGateway: string | null;
  checkoutHost: string | null;
  currency: string | null;
  reference: string | null;
}

export async function probeGateway(
  gatewayId: string,
  customer: { name: string; email: string; phone: string },
  siteUrl: string
): Promise<ProbeOutcome> {
  const gateway = getBaseRegistry().find((g) => g.id === gatewayId && g.method === "card");
  if (!gateway) throw new Error(`Unknown card gateway: ${gatewayId}`);

  const ref = `PROBE-${generateToken(4).toUpperCase()}`;
  const outcome: ProbeOutcome = {
    gatewayId,
    accepted: false,
    httpStatus: null,
    errorCode: null,
    errorMessage: null,
    echoedGateway: null,
    checkoutHost: null,
    currency: null,
    reference: null,
  };

  try {
    const session = await geniusPay.createPayment({
      orderId: ref,
      orderRef: ref,
      paymentId: ref,
      attemptRef: ref,
      amountCents: 100,
      currency: "EUR",
      selection: gateway.selection,
      customer: { ...customer, country: "FR" },
      successUrl: `${siteUrl}/en`,
      errorUrl: `${siteUrl}/en`,
      description: "Pawelium gateway verification — do not pay",
    });
    outcome.httpStatus = 201;
    outcome.reference = session.reference;
    outcome.echoedGateway = session.gateway;
    outcome.currency = session.currency;
    try {
      outcome.checkoutHost = new URL(session.checkoutUrl).hostname;
    } catch {
      outcome.checkoutHost = null;
    }
    const echoMatches =
      gateway.id === DEFAULT_ROUTE_ID ? true : !session.gateway || session.gateway === gateway.id;
    outcome.accepted =
      echoMatches && isAcceptableCardSession(session.gateway, session.checkoutUrl) && (!session.currency || session.currency === "EUR");
  } catch (err) {
    if (err instanceof GeniusPayError) {
      outcome.httpStatus = err.httpStatus;
      outcome.errorCode = err.errorCode;
      outcome.errorMessage = err.message.slice(0, 300);
      outcome.reference = err.reference;
    } else {
      outcome.errorMessage = (err as Error).message.slice(0, 300);
    }
  }

  await recordProbeResult(gatewayId, {
    accepted: outcome.accepted,
    summary: {
      httpStatus: outcome.httpStatus,
      errorCode: outcome.errorCode,
      errorMessage: outcome.errorMessage,
      echoedGateway: outcome.echoedGateway,
      checkoutHost: outcome.checkoutHost,
      currency: outcome.currency,
      reference: outcome.reference,
    },
  });
  return outcome;
}

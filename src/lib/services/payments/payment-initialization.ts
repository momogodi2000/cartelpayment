/**
 * src/lib/services/payments/payment-initialization.ts
 *
 * Card-payment initialization through the GeniusPay orchestration layer.
 *
 * Guarantees:
 *  - Payment + PaymentAttempt rows exist BEFORE every provider call.
 *  - Gateways are tried in configured priority order, only when enabled, verified,
 *    currency/amount-eligible and allowed by their circuit breaker.
 *  - Fallback to the next gateway happens ONLY after a SAFE failure (no payable session).
 *  - AMBIGUOUS failures are reconciled against the provider first; an existing payable
 *    session is reused, never duplicated. If reconciliation cannot conclude, we stop.
 *  - A session is only handed to the customer if GeniusPay routed it to a card processor
 *    and the currency is EUR (never mobile money, never an implicit conversion).
 *  - Exactly one checkout URL is ever returned per Payment.
 */

import { prisma } from "../../db/client";
import { PaymentStatus, PaymentAttemptStatus, PaymentProviderType, ExceptionKind } from "@prisma/client";
import { getEnv } from "../../env";
import { generateToken } from "../../security/tokens";
import { formatForGeniusPay } from "../../domain/money";
import { geniusPay, GeniusPayError, GeniusPayPaymentResponse } from "./geniuspay";
import { getEligibleCardGateways, isAcceptableCardSession, ResolvedGateway } from "./gateway-registry";
import { acquireGatewaySlot, recordGatewayFailure, recordGatewaySuccess } from "./gateway-health";
import { classifyInitError, countsAgainstGatewayHealth } from "./payment-fallback";

export const SUPPORTED_CHECKOUT_CURRENCY = "EUR";

export type CardPaymentUnavailableReason =
  | "CURRENCY_NOT_SUPPORTED"
  | "NO_ELIGIBLE_GATEWAY"
  | "ALL_GATEWAYS_FAILED"
  | "RECONCILIATION_REQUIRED"
  | "DECLINED";

export class CardPaymentUnavailableError extends Error {
  constructor(public readonly reason: CardPaymentUnavailableReason, public readonly paymentId?: string) {
    super(`CARD_PAYMENT_UNAVAILABLE:${reason}`);
    this.name = "CardPaymentUnavailableError";
  }
}

export interface InitializeCardPaymentInput {
  orderId: string;
  orderRef: string;
  amountCents: number;
  currency: string;
  isTest?: boolean;
  customer: { name: string; email: string; phone: string; country: string };
  successUrl: string;
  errorUrl: string;
}

export interface CardPaymentInitResult {
  paymentId: string;
  checkoutUrl: string;
  providerReference: string;
  attemptId: string;
  gatewayId: string;
  gatewayActual: string | null;
  resumed: boolean;
}

const OPEN_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.CREATED,
  PaymentStatus.INITIALIZING,
  PaymentStatus.PENDING,
  PaymentStatus.PROCESSING,
  PaymentStatus.REQUIRES_ACTION,
];

/** Returns an existing, still-open payment session for the order (to resume instead of duplicating). */
export async function findOpenPayment(orderId: string) {
  return prisma.payment.findFirst({
    where: { orderId, status: { in: OPEN_PAYMENT_STATUSES } },
    orderBy: { createdAt: "desc" },
  });
}

type AmbiguousOutcome =
  | { kind: "payable"; session: GeniusPayPaymentResponse }
  | { kind: "orphan"; reference: string }
  | { kind: "not_found" }
  | { kind: "unknown"; detail: string };

/**
 * Resolves an AMBIGUOUS initialization by asking the provider whether a session exists.
 * Uses GET /payments/{reference} when a reference came back, otherwise the documented
 * search (customer phone) filtered by amount and our attempt_ref metadata.
 */
async function resolveAmbiguousAttempt(params: {
  reference: string | null;
  attemptRef: string;
  phone: string;
  amountCents: number;
  since: Date;
}): Promise<AmbiguousOutcome> {
  try {
    let candidates: string[] = [];
    if (params.reference) {
      candidates = [params.reference];
    } else {
      const from = new Date(params.since.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10);
      const expectedAmount = formatForGeniusPay(params.amountCents);
      const items = await geniusPay.searchPayments(params.phone, from);
      candidates = items
        .filter((i) => Math.abs(i.amount - expectedAmount) < 1e-9)
        .slice(0, 5)
        .map((i) => i.reference);
    }

    for (const ref of candidates) {
      const status = await geniusPay.getPaymentStatus(ref);
      const matches = params.reference ? true : status.metadata?.attempt_ref === params.attemptRef;
      if (!matches) continue;
      const s = status.status.toLowerCase();
      if ((s === "pending" || s === "processing") && status.paymentUrl) {
        return {
          kind: "payable",
          session: {
            id: status.id,
            reference: status.reference,
            status: status.status,
            checkoutUrl: status.paymentUrl,
            expiresAt: status.expiresAt ?? undefined,
            gateway: status.gateway ? String(status.gateway).toLowerCase() : null,
            currency: status.currency ? status.currency.toUpperCase() : null,
            amount: status.amount,
          },
        };
      }
      // Exists but the customer never received its URL: it cannot be paid by them.
      return { kind: "orphan", reference: status.reference };
    }
    return { kind: "not_found" };
  } catch (err: any) {
    return { kind: "unknown", detail: err?.message || "reconciliation failed" };
  }
}

function sessionCurrencyOk(session: GeniusPayPaymentResponse): boolean {
  return !session.currency || session.currency === SUPPORTED_CHECKOUT_CURRENCY;
}

export async function initializeCardPayment(input: InitializeCardPaymentInput): Promise<CardPaymentInitResult> {
  if (input.currency.toUpperCase() !== SUPPORTED_CHECKOUT_CURRENCY) {
    throw new CardPaymentUnavailableError("CURRENCY_NOT_SUPPORTED");
  }

  // Never create a second payable session for the same order.
  const open = await findOpenPayment(input.orderId);
  if (open?.checkoutUrl && open.providerReference && open.status !== PaymentStatus.INITIALIZING) {
    const lastAttempt = await prisma.paymentAttempt.findFirst({
      where: { paymentId: open.id, status: PaymentAttemptStatus.SUCCEEDED },
      orderBy: { attemptNo: "desc" },
    });
    return {
      paymentId: open.id,
      checkoutUrl: open.checkoutUrl,
      providerReference: open.providerReference,
      attemptId: lastAttempt?.id || "",
      gatewayId: lastAttempt?.gatewayId || "unknown",
      gatewayActual: lastAttempt?.gatewayActual || null,
      resumed: true,
    };
  }

  const env = getEnv();
  const payment = await prisma.payment.create({
    data: {
      orderId: input.orderId,
      provider: PaymentProviderType.GENIUSPAY,
      amountCents: input.amountCents,
      currency: SUPPORTED_CHECKOUT_CURRENCY,
      method: "card",
      status: PaymentStatus.INITIALIZING,
      environment: env.GENIUSPAY_ENVIRONMENT === "production" ? "LIVE" : "SANDBOX",
      isTest: Boolean(input.isTest),
    },
  });

  const gateways = await getEligibleCardGateways(SUPPORTED_CHECKOUT_CURRENCY, input.amountCents);
  if (gateways.length === 0) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED } });
    throw new CardPaymentUnavailableError("NO_ELIGIBLE_GATEWAY", payment.id);
  }

  let attemptNo = 0;
  for (const gateway of gateways) {
    if (!(await acquireGatewaySlot(gateway.id))) continue;

    attemptNo += 1;
    const attemptRef = `${input.orderRef}-A${attemptNo}-${generateToken(4)}`;
    const startedAt = new Date();
    const attempt = await prisma.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        gatewayId: gateway.id,
        attemptNo,
        idempotencyKey: `${payment.id}:${attemptNo}:${generateToken(6)}`,
        externalReference: attemptRef,
        gatewayRequested: gateway.selection?.value ?? null,
        status: PaymentAttemptStatus.INITIALIZING,
      },
    });

    let session: GeniusPayPaymentResponse | null = null;
    try {
      session = await geniusPay.createPayment({
        orderId: input.orderId,
        orderRef: input.orderRef,
        paymentId: payment.id,
        attemptRef,
        amountCents: input.amountCents,
        currency: SUPPORTED_CHECKOUT_CURRENCY,
        selection: gateway.selection,
        customer: input.customer,
        successUrl: input.successUrl,
        errorUrl: input.errorUrl,
      });
    } catch (err) {
      const errorClass = classifyInitError(err);
      const gpErr = err instanceof GeniusPayError ? err : null;
      const baseUpdate = {
        errorClass,
        errorCode: gpErr?.errorCode ?? null,
        errorMessage: (gpErr?.message || (err as any)?.message || "error").slice(0, 500),
        httpStatus: gpErr?.httpStatus ?? null,
        providerReference: gpErr?.reference ?? null,
      };

      if (errorClass === "SAFE") {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: { ...baseUpdate, status: PaymentAttemptStatus.FAILED_INIT },
        });
        if (countsAgainstGatewayHealth(err)) {
          await recordGatewayFailure(gateway.id, baseUpdate.errorMessage);
        }
        continue;
      }

      if (errorClass === "DECLINE") {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: { ...baseUpdate, status: PaymentAttemptStatus.FAILED_INIT },
        });
        await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.DECLINED } });
        throw new CardPaymentUnavailableError("DECLINED", payment.id);
      }

      // AMBIGUOUS — reconcile before doing anything else.
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: { ...baseUpdate, status: PaymentAttemptStatus.AMBIGUOUS },
      });
      const outcome = await resolveAmbiguousAttempt({
        reference: gpErr?.reference ?? null,
        attemptRef,
        phone: input.customer.phone,
        amountCents: input.amountCents,
        since: startedAt,
      });

      if (outcome.kind === "payable") {
        session = outcome.session; // reuse the existing session — no duplicate
      } else if (outcome.kind === "orphan") {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: { status: PaymentAttemptStatus.SUPERSEDED, providerReference: outcome.reference },
        });
        continue;
      } else if (outcome.kind === "not_found") {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: { status: PaymentAttemptStatus.FAILED_INIT, errorMessage: `${baseUpdate.errorMessage} | reconciled: no session` },
        });
        if (countsAgainstGatewayHealth(err)) await recordGatewayFailure(gateway.id, baseUpdate.errorMessage);
        continue;
      } else {
        await prisma.$transaction([
          prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REQUIRES_RECONCILIATION } }),
          prisma.reconciliationException.create({
            data: {
              orderId: input.orderId,
              paymentId: payment.id,
              kind: ExceptionKind.PROVIDER_UNREACHABLE,
              notes: `Ambiguous initialization on ${gateway.id} (attempt ${attemptRef}) could not be reconciled: ${outcome.detail}`.slice(0, 1000),
            },
          }),
        ]);
        throw new CardPaymentUnavailableError("RECONCILIATION_REQUIRED", payment.id);
      }
    }

    // A session exists — only hand it to the customer if it is a EUR card session.
    if (!session || !isAcceptableCardSession(session.gateway, session.checkoutUrl) || !sessionCurrencyOk(session)) {
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: PaymentAttemptStatus.SUPERSEDED,
          errorClass: "REJECTED_ROUTE",
          providerReference: session?.reference ?? null,
          gatewayActual: session?.gateway ?? null,
          errorMessage: `Session not usable for EUR card payment (gateway=${session?.gateway ?? "none"}, currency=${session?.currency ?? "n/a"})`,
        },
      });
      continue;
    }

    await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: PaymentAttemptStatus.SUCCEEDED,
          providerReference: session.reference,
          gatewayActual: session.gateway,
        },
      }),
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PENDING,
          providerReference: session.reference,
          checkoutUrl: session.checkoutUrl,
          expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
        },
      }),
    ]);

    // An explicit gateway that produced a session routed to itself is now verified.
    const explicitlyConfirmed = gateway.selection !== null && (!session.gateway || session.gateway === gateway.id);
    await recordGatewaySuccess(gateway.id, { markVerified: explicitlyConfirmed });

    return {
      paymentId: payment.id,
      checkoutUrl: session.checkoutUrl,
      providerReference: session.reference,
      attemptId: attempt.id,
      gatewayId: gateway.id,
      gatewayActual: session.gateway,
      resumed: false,
    };
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED } });
  throw new CardPaymentUnavailableError(attemptNo === 0 ? "NO_ELIGIBLE_GATEWAY" : "ALL_GATEWAYS_FAILED", payment.id);
}

export type { ResolvedGateway };

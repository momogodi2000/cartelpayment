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
 *  - The marketplace order stays in EUR. The card session is created in XOF (Paystack through
 *    GeniusPay): Pawelium converts server-side (see fx.ts), persists the quote on the Payment and
 *    never lets GeniusPay convert implicitly.
 *  - A session is only handed to the customer if GeniusPay routed it to a card processor
 *    and the echoed currency/amount match what we sent (never mobile money).
 *  - Exactly one checkout URL is ever returned per Payment.
 */

import { prisma } from "../../db/client";
import { PaymentStatus, PaymentAttemptStatus, PaymentProviderType, ExceptionKind } from "@prisma/client";
import { getEnv } from "../../env";
import { generateToken } from "../../security/tokens";
import { formatAmountForGeniusPay, parseAmountFromGeniusPay } from "../../domain/money";
import { getEurXofQuote, isQuoteStale, FxUnavailableError, GATEWAY_FX_CURRENCY } from "./fx";
import { geniusPay, GeniusPayError, GeniusPayPaymentResponse } from "./geniuspay";
import { getResolvedRegistry, isAcceptableCardSession, ResolvedGateway } from "./gateway-registry";
import { acquireGatewaySlot, recordGatewayFailure, recordGatewaySuccess } from "./gateway-health";
import { classifyInitError, countsAgainstGatewayHealth } from "./payment-fallback";

/** Marketplace / order currency. */
export const ORDER_CURRENCY = "EUR";
/** Currency actually charged by the card gateway (GeniusPay/Paystack). */
export const GATEWAY_CURRENCY = GATEWAY_FX_CURRENCY;
/** SUPER_ADMIN controlled live test charge, whole XOF (FCFA). */
export const TEST_PAYMENT_XOF_AMOUNT = 1000;
/** fxSource marker for the SUPER_ADMIN controlled XOF test (no conversion involved). */
export const TEST_FIXED_XOF_SOURCE = "TEST_FIXED_XOF";

export type CardPaymentUnavailableReason =
  | "CURRENCY_NOT_SUPPORTED"
  | "NO_ELIGIBLE_GATEWAY"
  | "ALL_GATEWAYS_FAILED"
  | "RECONCILIATION_REQUIRED"
  | "FX_UNAVAILABLE"
  | "QUOTE_CHANGED"
  | "DECLINED";

export class CardPaymentUnavailableError extends Error {
  constructor(
    public readonly reason: CardPaymentUnavailableReason,
    public readonly paymentId?: string,
    /** Present for QUOTE_CHANGED: the current server quote the customer must re-authorize. */
    public readonly quote?: { eurCents: number; xofAmount: number; rate: string }
  ) {
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
  /** Whole-XOF amount the customer authorized; initialization is refused if the server quote differs. */
  expectedXofAmount?: number;
  /** SUPER_ADMIN controlled test only: charge exactly this many XOF (skips FX conversion). */
  fixedXofAmount?: number;
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
  /** Amount actually charged (whole XOF) and its currency. */
  chargedAmount: number;
  chargedCurrency: string;
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
  currency: string;
  since: Date;
}): Promise<AmbiguousOutcome> {
  try {
    let candidates: string[] = [];
    if (params.reference) {
      candidates = [params.reference];
    } else {
      const from = new Date(params.since.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10);
      const expectedAmount = formatAmountForGeniusPay(params.amountCents, params.currency);
      const items = await geniusPay.searchPayments(params.phone, from);
      // Newest first: the session we are looking for was created moments ago.
      candidates = items
        .filter((i) => Math.abs(i.amount - expectedAmount) < 1e-9)
        .sort((a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? "") || 0)
        .slice(0, 20)
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

/** The echoed currency/amount (when present) must equal exactly what Pawelium requested. */
function sessionMatchesRequest(session: GeniusPayPaymentResponse, currency: string, requestedAmount: number): boolean {
  if (session.currency && session.currency !== currency) return false;
  // The provider echoes the amount in its own unit (EUR major / XOF whole francs): normalise before comparing.
  if (session.amount !== null && Number.isFinite(session.amount) && parseAmountFromGeniusPay(session.amount, currency) !== requestedAmount) return false;
  return true;
}

interface PaymentQuote {
  xofAmount: number;
  rate: string;
  source: string;
  quotedAt: Date;
}

/**
 * A retry for the same order keeps the ORIGINAL quote while it is still fresh, so the amount
 * the customer authorized never silently changes between payment attempts.
 */
async function findReusableQuote(orderId: string, eurCents: number): Promise<PaymentQuote | null> {
  const prev = await prisma.payment.findFirst({
    where: { orderId, currency: GATEWAY_CURRENCY, originalAmountCents: eurCents, fxRate: { not: null }, fxQuotedAt: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  if (!prev || !prev.fxRate || !prev.fxQuotedAt || !prev.fxSource) return null;
  if (isQuoteStale(prev.fxQuotedAt)) return null;
  return { xofAmount: prev.amountCents, rate: prev.fxRate, source: prev.fxSource, quotedAt: prev.fxQuotedAt };
}

export async function initializeCardPayment(input: InitializeCardPaymentInput): Promise<CardPaymentInitResult> {
  if (input.currency.toUpperCase() !== ORDER_CURRENCY) {
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
      chargedAmount: open.amountCents,
      chargedCurrency: open.currency,
    };
  }

  // ---- Charge resolution: every gateway is charged in ITS OWN currency ---------------------------
  // EUR gateways (Stripe, once restored) charge the order amount. XOF gateways (Paystack) charge a
  // server-side EUR -> XOF quote, and only with the customer's authorization (expectedXofAmount)
  // or the SUPER_ADMIN fixed test amount. The quote is never taken from the client.
  if (input.fixedXofAmount !== undefined) {
    if (!input.isTest || !Number.isInteger(input.fixedXofAmount) || input.fixedXofAmount <= 0) {
      throw new CardPaymentUnavailableError("CURRENCY_NOT_SUPPORTED");
    }
  }
  const xofAuthorized = input.fixedXofAmount !== undefined || input.expectedXofAmount !== undefined;
  const chargeCurrencyOf = (g: ResolvedGateway) => (g.currencies.includes(ORDER_CURRENCY) ? ORDER_CURRENCY : g.currencies[0]);

  const registry = await getResolvedRegistry();
  const candidates = registry.filter((g) => {
    if (g.method !== "card" || !g.enabled || !g.verified || g.currencies.length === 0) return false;
    if (chargeCurrencyOf(g) === ORDER_CURRENCY) {
      return input.amountCents >= g.minAmountCents && input.amountCents <= g.maxAmountCents;
    }
    return chargeCurrencyOf(g) === GATEWAY_CURRENCY && xofAuthorized; // bounds are checked once the quote exists
  });

  interface Charge {
    currency: string;
    amount: number;
    fx: PaymentQuote | null;
  }
  let quoteMemo: PaymentQuote | null | undefined; // undefined = not computed, null = FX unavailable
  let fxFailed = false;
  const ctx: { paymentId?: string } = {}; // set once the Payment row exists

  async function getQuote(): Promise<PaymentQuote | null> {
    if (quoteMemo !== undefined) return quoteMemo;
    if (input.fixedXofAmount !== undefined) {
      quoteMemo = { xofAmount: input.fixedXofAmount, rate: "1", source: TEST_FIXED_XOF_SOURCE, quotedAt: new Date() };
      return quoteMemo;
    }
    const reusable = await findReusableQuote(input.orderId, input.amountCents);
    if (reusable) {
      quoteMemo = reusable;
    } else {
      try {
        const fresh = await getEurXofQuote(input.amountCents);
        quoteMemo = { xofAmount: fresh.xofAmount, rate: fresh.rate, source: fresh.source, quotedAt: fresh.quotedAt };
      } catch (err) {
        if (err instanceof FxUnavailableError) {
          console.error("[Payments] FX unavailable:", err.detail);
          fxFailed = true;
          quoteMemo = null;
          return null;
        }
        throw err;
      }
    }
    if (input.expectedXofAmount !== undefined && input.expectedXofAmount !== quoteMemo.xofAmount) {
      const changed = { eurCents: input.amountCents, xofAmount: quoteMemo.xofAmount, rate: quoteMemo.rate };
      if (ctx.paymentId) {
        await prisma.payment.update({ where: { id: ctx.paymentId }, data: { status: PaymentStatus.FAILED } });
      }
      throw new CardPaymentUnavailableError("QUOTE_CHANGED", ctx.paymentId, changed);
    }
    return quoteMemo;
  }

  async function chargeFor(g: ResolvedGateway): Promise<Charge | null> {
    if (chargeCurrencyOf(g) === ORDER_CURRENCY) return { currency: ORDER_CURRENCY, amount: input.amountCents, fx: null };
    const q = await getQuote();
    if (!q || q.xofAmount < g.minAmountCents || q.xofAmount > g.maxAmountCents) return null;
    return { currency: GATEWAY_CURRENCY, amount: q.xofAmount, fx: q };
  }

  let initial: Charge | null = null;
  for (const g of candidates) {
    initial = await chargeFor(g);
    if (initial) break;
  }
  if (!initial && fxFailed) throw new CardPaymentUnavailableError("FX_UNAVAILABLE");

  const env = getEnv();
  // With no usable candidate a placeholder row (order amount) records the failed attempt.
  const first: Charge = initial ?? { currency: ORDER_CURRENCY, amount: input.amountCents, fx: null };
  let current: Charge = first;
  const payment = await prisma.payment.create({
    data: {
      orderId: input.orderId,
      provider: PaymentProviderType.GENIUSPAY,
      // Charged amount: settlement validates provider confirmations against these two. XOF = whole francs.
      amountCents: first.amount,
      currency: first.currency,
      originalAmountCents: input.amountCents,
      originalCurrency: ORDER_CURRENCY,
      fxRate: first.fx?.rate ?? null,
      fxSource: first.fx?.source ?? null,
      fxQuotedAt: first.fx?.quotedAt ?? null,
      method: "card",
      status: PaymentStatus.INITIALIZING,
      environment: env.GENIUSPAY_ENVIRONMENT === "production" ? "LIVE" : "SANDBOX",
      isTest: Boolean(input.isTest),
    },
  });
  ctx.paymentId = payment.id;

  if (candidates.length === 0) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED } });
    throw new CardPaymentUnavailableError("NO_ELIGIBLE_GATEWAY", payment.id);
  }

  let attemptNo = 0;
  for (const gateway of candidates) {
    if (!(await acquireGatewaySlot(gateway.id))) continue;

    const charge = await chargeFor(gateway);
    if (!charge) continue; // FX unavailable / out of bounds for this gateway: not attempted
    if (charge.currency !== current.currency || charge.amount !== current.amount) {
      // Earlier attempts failed safely (no payable session exists), so the row may take the new gateway's charge.
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          amountCents: charge.amount,
          currency: charge.currency,
          fxRate: charge.fx?.rate ?? null,
          fxSource: charge.fx?.source ?? null,
          fxQuotedAt: charge.fx?.quotedAt ?? null,
        },
      });
      current = charge;
    }

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
        amountCents: charge.amount,
        currency: charge.currency,
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
        amountCents: charge.amount,
        currency: charge.currency,
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

    // A session exists — only hand it to the customer if it is a card session for the requested XOF amount.
    if (!session || !isAcceptableCardSession(session.gateway, session.checkoutUrl) || !sessionMatchesRequest(session, charge.currency, charge.amount)) {
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: PaymentAttemptStatus.SUPERSEDED,
          errorClass: "REJECTED_ROUTE",
          providerReference: session?.reference ?? null,
          gatewayActual: session?.gateway ?? null,
          errorMessage: `Session not usable for ${charge.currency} card payment (gateway=${session?.gateway ?? "none"}, currency=${session?.currency ?? "n/a"}, amount=${session?.amount ?? "n/a"}, expected=${charge.amount})`,
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
      chargedAmount: charge.amount,
      chargedCurrency: charge.currency,
    };
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED } });
  if (attemptNo === 0 && fxFailed) throw new CardPaymentUnavailableError("FX_UNAVAILABLE", payment.id);
  throw new CardPaymentUnavailableError(attemptNo === 0 ? "NO_ELIGIBLE_GATEWAY" : "ALL_GATEWAYS_FAILED", payment.id);
}

export type { ResolvedGateway };

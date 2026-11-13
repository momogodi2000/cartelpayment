"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyOrderRefSignature } from "@/lib/security/order-link";
import { acquireHold, releaseHold, AnimalUnavailableError } from "@/lib/services/inventory";
import { findOpenPayment, CardPaymentUnavailableError } from "@/lib/services/payments/payment-initialization";
import { createPaymentSessionForOrder } from "@/lib/services/payments/checkout-session";
import { getPrimaryCardCurrency } from "@/lib/services/payments/gateway-registry";
import { getEurXofQuote } from "@/lib/services/payments/fx";
import { calculatePricing } from "@/lib/domain/pricing";
import { applyProviderStatus, TERMINAL_FAILURE_STATUSES } from "@/lib/services/payments/settlement";
import { queueEmail, sendEmailNotification } from "@/lib/services/email/outbox";
import { formatMoney } from "@/lib/domain/money";
import { OrderStatus, ReservationStatus } from "@prisma/client";

const checkoutSchema = z.object({
  animalId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(60),
  deliveryMethod: z.enum(["standard", "express", "vip"]).default("standard"),
  termsAccepted: z.literal(true),
  // The customer must authorize the actual XOF charge shown on the form.
  // Required only while the active gateway charges XOF (enforced in startCheckout).
  xofConsent: z.boolean().default(false),
  expectedXofAmount: z.preprocess((v) => (v === null || v === "" ? undefined : v), z.coerce.number().int().positive().optional()),
  locale: z.enum(["en", "fr"]).default("en"),
});

export type CheckoutErrorCode =
  | "RATE_LIMITED"
  | "VALIDATION"
  | "ANIMAL_UNAVAILABLE"
  | "CARD_PAYMENT_UNAVAILABLE"
  | "PAYMENT_REVIEW"
  | "FX_UNAVAILABLE"
  | "QUOTE_CHANGED"
  | "RETRY_NOT_ALLOWED";

export interface CheckoutActionState {
  success: boolean;
  errorCode?: CheckoutErrorCode;
  error?: string;
  fieldErrors?: string[];
  checkoutUrl?: string;
  /** Present with QUOTE_CHANGED: the current server quote to re-display and re-authorize. */
  quote?: { eurCents: number; xofAmount: number; rate: string };
}

const ERROR_KEYS: Record<CheckoutErrorCode, string> = {
  RATE_LIMITED: "errorRateLimited",
  VALIDATION: "errorValidation",
  ANIMAL_UNAVAILABLE: "errorAnimalUnavailable",
  CARD_PAYMENT_UNAVAILABLE: "errorUnavailable",
  PAYMENT_REVIEW: "errorReview",
  FX_UNAVAILABLE: "errorFxUnavailable",
  QUOTE_CHANGED: "errorQuoteChanged",
  RETRY_NOT_ALLOWED: "errorUnavailable",
};

async function fail(
  locale: string,
  code: CheckoutErrorCode,
  fieldErrors?: string[],
  quote?: CheckoutActionState["quote"]
): Promise<CheckoutActionState> {
  const t = await getTranslations({ locale, namespace: "Checkout" });
  const amount = quote ? formatMoney(quote.xofAmount, "XOF", locale) : "";
  return { success: false, errorCode: code, error: t(ERROR_KEYS[code], { amount }), fieldErrors, quote };
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export type CheckoutQuoteResult =
  | { status: "ok"; quote: { eurCents: number; xofAmount: number; rate: string } }
  | { status: "unavailable" }
  | { status: "not_required" };

/**
 * Live quote for the customer's CURRENT selection (country + delivery method change the order
 * total). The amount shown on the form must come from here, never from the static page, so that
 * what the customer authorizes is exactly what startCheckout will charge.
 */
export async function quoteCheckout(animalId: string, country: string, deliveryMethod: string): Promise<CheckoutQuoteResult> {
  const method = z.enum(["standard", "express", "vip"]).safeParse(deliveryMethod);
  if (!method.success || !animalId || country.length < 2 || country.length > 60) return { status: "unavailable" };

  const rateLimit = await checkRateLimit(`checkout-quote:${await clientIp()}`, 120, 15 * 60);
  if (!rateLimit.success) return { status: "unavailable" };

  const animal = await prisma.animal.findUnique({ where: { id: animalId }, select: { priceCents: true, published: true, isPaymentTest: true } });
  if (!animal || !animal.published || animal.isPaymentTest) return { status: "unavailable" };

  const pricing = calculatePricing(animal.priceCents, { deliveryCountry: country.trim(), deliveryMethod: method.data });
  if ((await getPrimaryCardCurrency(pricing.totalCents)) !== "XOF") return { status: "not_required" };
  try {
    const q = await getEurXofQuote(pricing.totalCents);
    return { status: "ok", quote: { eurCents: q.eurCents, xofAmount: q.xofAmount, rate: q.rate } };
  } catch {
    return { status: "unavailable" };
  }
}

export async function startCheckout(formData: FormData): Promise<CheckoutActionState> {
  const localeRaw = String(formData.get("locale") || "en");
  const locale = localeRaw === "fr" ? "fr" : "en";

  const rateLimit = await checkRateLimit(`checkout:${await clientIp()}`, 10, 15 * 60);
  if (!rateLimit.success) return fail(locale, "RATE_LIMITED");

  const parsed = checkoutSchema.safeParse({
    animalId: formData.get("animalId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    deliveryMethod: formData.get("deliveryMethod") || "standard",
    termsAccepted: formData.get("termsAccepted") === "true" || formData.get("termsAccepted") === "on",
    xofConsent: formData.get("xofConsent") === "true" || formData.get("xofConsent") === "on",
    expectedXofAmount: formData.get("expectedXofAmount"),
    locale,
  });
  if (!parsed.success) {
    return fail(locale, "VALIDATION", [...new Set(parsed.error.issues.map((i) => String(i.path[0])))]);
  }
  const input = parsed.data;

  // While Paystack (XOF) is the active card gateway the customer must have authorized the XOF amount.
  // The server recomputes the quote at initialization and refuses a different amount.
  const priced = await prisma.animal.findUnique({ where: { id: input.animalId }, select: { priceCents: true } });
  const xofRequired = (await getPrimaryCardCurrency(priced?.priceCents ?? 0)) === "XOF";
  if (xofRequired && (!input.xofConsent || input.expectedXofAmount === undefined)) {
    return fail(locale, "VALIDATION", ["xofConsent"]);
  }

  let hold;
  try {
    const address = { street: input.street, city: input.city, postalCode: input.postalCode, country: input.country };
    hold = await acquireHold({
      animalId: input.animalId,
      customer: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        country: input.country,
        billingAddress: address,
        deliveryAddress: address,
        locale: input.locale,
      },
      deliveryCountry: input.country,
      deliveryMethod: input.deliveryMethod,
      termsVersion: "2026-v1",
      allowPaymentTest: false,
    });
  } catch (err) {
    if (err instanceof AnimalUnavailableError) return fail(locale, "ANIMAL_UNAVAILABLE");
    throw err;
  }

  let session;
  try {
    session = await createPaymentSessionForOrder(hold.orderId, { expectedXofAmount: input.expectedXofAmount });
  } catch (err) {
    // No payable session was handed to the customer: releasing the hold is safe.
    await releaseHold(hold.reservationId, `Card payment initialization failed: ${(err as Error).message}`);
    if (err instanceof CardPaymentUnavailableError) {
      if (err.reason === "RECONCILIATION_REQUIRED") return fail(locale, "PAYMENT_REVIEW");
      if (err.reason === "FX_UNAVAILABLE") return fail(locale, "FX_UNAVAILABLE");
      if (err.reason === "QUOTE_CHANGED") return fail(locale, "QUOTE_CHANGED", undefined, err.quote);
    }
    console.error("[Checkout] Payment initialization failed:", (err as Error).message);
    return fail(locale, "CARD_PAYMENT_UNAVAILABLE");
  }

  const item = await prisma.orderItem.findUnique({ where: { orderId: hold.orderId } });
  const notifId = await queueEmail({
    idempotencyKey: `order:${hold.orderId}:pending`,
    template: "order_pending",
    locale: input.locale,
    toEmail: input.email,
    payload: {
      customerName: input.name,
      orderRef: hold.orderReference,
      animalName: item?.animalName || "",
      total: formatMoney(hold.pricing.totalCents, "EUR", input.locale),
      checkoutUrl: session.checkoutUrl,
      holdMinutes: getEnv().HOLD_MINUTES,
    },
  });
  sendEmailNotification(notifId).catch((e) => console.error("[Checkout] email:", e?.message));

  return { success: true, checkoutUrl: session.checkoutUrl };
}

/**
 * Customer retry from the signed return/cancel link: allowed only while the reservation is
 * still ACTIVE and the previous payment session is terminal at the provider (or resumable).
 */
export async function retryCheckoutPayment(orderRef: string, signature: string, localeRaw: string): Promise<CheckoutActionState> {
  const locale = localeRaw === "fr" ? "fr" : "en";
  if (!verifyOrderRefSignature(orderRef, signature)) return fail(locale, "RETRY_NOT_ALLOWED");

  const rateLimit = await checkRateLimit(`checkout-retry:${orderRef}`, 5, 15 * 60);
  if (!rateLimit.success) return fail(locale, "RATE_LIMITED");

  const order = await prisma.order.findUnique({
    where: { reference: orderRef },
    include: { reservation: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (
    !order ||
    order.isTest ||
    !([OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_PROCESSING] as OrderStatus[]).includes(order.status) ||
    order.reservation?.status !== ReservationStatus.ACTIVE ||
    order.reservation.expiresAt <= new Date()
  ) {
    return fail(locale, "RETRY_NOT_ALLOWED");
  }

  const latest = order.payments[0];
  if (latest?.providerReference) {
    const result = await applyProviderStatus(latest.providerReference).catch(() => null);
    if (!result) return fail(locale, "CARD_PAYMENT_UNAVAILABLE");
    if (!TERMINAL_FAILURE_STATUSES.includes(result.paymentStatus)) {
      // Still open at the provider: resume the same session, never create a second one.
      const open = await findOpenPayment(order.id);
      if (open?.checkoutUrl) return { success: true, checkoutUrl: open.checkoutUrl };
      return fail(locale, "PAYMENT_REVIEW");
    }
  }

  try {
    // The customer already authorized the previous XOF amount: a retry may never change it silently.
    const authorized = latest?.currency === "XOF" ? latest.amountCents : undefined;
    const session = await createPaymentSessionForOrder(order.id, { expectedXofAmount: authorized });
    return { success: true, checkoutUrl: session.checkoutUrl };
  } catch (err) {
    if (err instanceof CardPaymentUnavailableError) {
      if (err.reason === "RECONCILIATION_REQUIRED") return fail(locale, "PAYMENT_REVIEW");
      if (err.reason === "FX_UNAVAILABLE") return fail(locale, "FX_UNAVAILABLE");
      if (err.reason === "QUOTE_CHANGED") return fail(locale, "QUOTE_CHANGED", undefined, err.quote);
    }
    return fail(locale, "CARD_PAYMENT_UNAVAILABLE");
  }
}

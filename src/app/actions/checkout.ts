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
  locale: z.enum(["en", "fr"]).default("en"),
});

export type CheckoutErrorCode =
  | "RATE_LIMITED"
  | "VALIDATION"
  | "ANIMAL_UNAVAILABLE"
  | "CARD_PAYMENT_UNAVAILABLE"
  | "PAYMENT_REVIEW"
  | "RETRY_NOT_ALLOWED";

export interface CheckoutActionState {
  success: boolean;
  errorCode?: CheckoutErrorCode;
  error?: string;
  fieldErrors?: string[];
  checkoutUrl?: string;
}

const ERROR_KEYS: Record<CheckoutErrorCode, string> = {
  RATE_LIMITED: "errorRateLimited",
  VALIDATION: "errorValidation",
  ANIMAL_UNAVAILABLE: "errorAnimalUnavailable",
  CARD_PAYMENT_UNAVAILABLE: "errorUnavailable",
  PAYMENT_REVIEW: "errorReview",
  RETRY_NOT_ALLOWED: "errorUnavailable",
};

async function fail(locale: string, code: CheckoutErrorCode, fieldErrors?: string[]): Promise<CheckoutActionState> {
  const t = await getTranslations({ locale, namespace: "Checkout" });
  return { success: false, errorCode: code, error: t(ERROR_KEYS[code]), fieldErrors };
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
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
    locale,
  });
  if (!parsed.success) {
    return fail(locale, "VALIDATION", [...new Set(parsed.error.issues.map((i) => String(i.path[0])))]);
  }
  const input = parsed.data;

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
    session = await createPaymentSessionForOrder(hold.orderId);
  } catch (err) {
    // No payable session was handed to the customer: releasing the hold is safe.
    await releaseHold(hold.reservationId, `Card payment initialization failed: ${(err as Error).message}`);
    if (err instanceof CardPaymentUnavailableError && err.reason === "RECONCILIATION_REQUIRED") {
      return fail(locale, "PAYMENT_REVIEW");
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
    const session = await createPaymentSessionForOrder(order.id);
    return { success: true, checkoutUrl: session.checkoutUrl };
  } catch (err) {
    if (err instanceof CardPaymentUnavailableError && err.reason === "RECONCILIATION_REQUIRED") {
      return fail(locale, "PAYMENT_REVIEW");
    }
    return fail(locale, "CARD_PAYMENT_UNAVAILABLE");
  }
}

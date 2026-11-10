"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { acquireHold, releaseHold } from "@/lib/services/inventory";
import { initializeCardPayment } from "@/lib/services/payments/payment-initialization";
import { queueEmail, sendEmailNotification } from "@/lib/services/email/outbox";
import { formatMoney } from "@/lib/domain/money";

const checkoutSchema = z.object({
  animalId: z.string().min(1, "Animal ID required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Valid phone number required"),
  street: z.string().min(3, "Street address required"),
  city: z.string().min(2, "City required"),
  postalCode: z.string().min(2, "Postal code required"),
  country: z.string().min(2, "Country required"),
  deliveryMethod: z.enum(["standard", "express", "vip"]).default("standard"),
  termsAccepted: z.literal(true, {
    message: "You must accept the terms of service.",
  }),
  locale: z.enum(["en", "fr"]).default("en"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export interface CheckoutActionState {
  success: boolean;
  error?: string;
  checkoutUrl?: string;
}

export async function startCheckout(formData: FormData): Promise<CheckoutActionState> {
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0] ||
    reqHeaders.get("x-real-ip") ||
    "127.0.0.1";

  // Rate limit: 10 checkout attempts per 15 minutes per IP
  const rateLimit = await checkRateLimit(`checkout:${ip}`, 10, 15 * 60);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many checkout attempts. Please try again later.",
    };
  }

  const rawData = {
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
    locale: formData.get("locale") || "en",
  };

  const parsed = checkoutSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg };
  }

  const input = parsed.data;
  const env = getEnv();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");

  let holdResult;
  try {
    holdResult = await acquireHold({
      animalId: input.animalId,
      customer: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        country: input.country,
        billingAddress: {
          street: input.street,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
        },
        deliveryAddress: {
          street: input.street,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
        },
        locale: input.locale,
      },
      deliveryCountry: input.country,
      deliveryMethod: input.deliveryMethod,
      termsVersion: "2026-v1",
    });
  } catch (err: any) {
    return { success: false, error: err.message || "Animal is no longer available." };
  }

  const { orderId, orderReference, reservationId, pricing } = holdResult;

  // URLs for GeniusPay redirect
  const successUrl = `${siteUrl}/${input.locale}/checkout/return?ref=${orderReference}`;
  const errorUrl = `${siteUrl}/${input.locale}/checkout/cancel?ref=${orderReference}`;

  let paymentSession;
  try {
    paymentSession = await initializeCardPayment({
      orderId,
      orderRef: orderReference,
      amountCents: pricing.totalCents,
      currency: "EUR",
      customer: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        country: input.country,
      },
      successUrl,
      errorUrl,
    });
  } catch (providerError: any) {
    console.error("[Checkout] Payment provider error:", providerError);
    // Provider failure: immediately release reservation hold
    await releaseHold(reservationId, "Card checkout session initialization failed");
    return {
      success: false,
      error: "Card payment is temporarily unavailable. You have not been charged.",
    };
  }

  // Queue pending order confirmation email
  const notifId = await queueEmail({
    idempotencyKey: `order:${orderId}:pending`,
    template: "order_pending",
    locale: input.locale,
    toEmail: input.email,
    payload: {
      customerName: input.name,
      orderRef: orderReference,
      animalName: "votre compagnon",
      total: formatMoney(pricing.totalCents, "EUR", input.locale),
      checkoutUrl: paymentSession.checkoutUrl,
    },
  });

  sendEmailNotification(notifId).catch(console.error);

  // Return checkout URL for redirect
  return {
    success: true,
    checkoutUrl: paymentSession.checkoutUrl,
  };
}

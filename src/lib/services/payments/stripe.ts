/**
 * src/lib/services/payments/stripe.ts
 *
 * Official Stripe European Card Integration for Pawelium 2.0.
 * Priority 1 for all European card payments in EUR.
 * Supports Stripe Checkout with 3D-Secure (SCA), exact minor-unit integer cents,
 * cryptographic webhook verification, and authoritative status retrieval.
 */

import Stripe from "stripe";

function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia" as any,
    typescript: true,
  });
}

export function isStripeDirectConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return Boolean(key && (key.startsWith("sk_test_") || key.startsWith("sk_live_")));
}

export interface CreateStripeSessionInput {
  orderId: string;
  orderRef: string;
  animalName: string;
  breedName?: string;
  amountCents: number;
  currency?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
  };
  successUrl: string;
  cancelUrl: string;
}

export interface StripeSessionResult {
  sessionId: string;
  checkoutUrl: string;
  providerReference: string;
}

export async function createStripeCheckoutSession(
  input: CreateStripeSessionInput
): Promise<StripeSessionResult> {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("STRIPE_NOT_CONFIGURED: STRIPE_SECRET_KEY is missing from environment.");
  }

  const currency = (input.currency || "EUR").toLowerCase();
  if (currency !== "eur" && currency !== "usd") {
    throw new Error(`STRIPE_UNSUPPORTED_CURRENCY: Only EUR (and USD) are permitted. Received: ${input.currency}`);
  }

  const createParams: any = {
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: input.customer.email,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Pawelium — ${input.animalName}`,
            description: input.breedName
              ? `European Companion Reservation: ${input.breedName}`
              : "European Companion Veterinary & Delivery Protocol",
          },
          unit_amount: input.amountCents, // Integer minor units (cents)
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: input.orderId,
      orderRef: input.orderRef,
      customerName: input.customer.name,
      customerPhone: input.customer.phone || "",
    },
    payment_intent_data: {
      metadata: {
        orderId: input.orderId,
        orderRef: input.orderRef,
      },
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  const session = await stripe.checkout.sessions.create(createParams);

  if (!session.url) {
    throw new Error("STRIPE_SESSION_NO_URL: Stripe failed to return a checkout URL.");
  }

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    providerReference: session.id,
  };
}

export async function retrieveStripeSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("STRIPE_NOT_CONFIGURED: STRIPE_SECRET_KEY is missing.");
  }
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

export function constructStripeWebhookEvent(
  rawBody: string | Buffer,
  signature: string,
  secret?: string
): Stripe.Event {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("STRIPE_NOT_CONFIGURED: Stripe client not initialized.");
  }
  const webhookSecret = secret || process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET_MISSING: Cannot verify Stripe webhook signature without secret.");
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

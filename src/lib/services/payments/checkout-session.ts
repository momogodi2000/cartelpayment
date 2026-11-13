/**
 * src/lib/services/payments/checkout-session.ts
 *
 * Server-only helpers shared by public checkout, the customer retry action and the
 * SUPER_ADMIN test-payment flow. Deliberately NOT a "use server" module, so none of these
 * functions can be invoked directly from a browser.
 */

import { prisma } from "../../db/client";
import { getEnv } from "../../env";
import { getPathname } from "@/i18n/routing";
import { signOrderRef } from "../../security/order-link";
import { initializeCardPayment } from "./payment-initialization";

export function buildReturnUrls(orderRef: string, localeRaw: string) {
  const locale = localeRaw === "fr" ? "fr" : "en";
  const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  const query = { ref: orderRef, t: signOrderRef(orderRef) };
  return {
    successUrl: siteUrl + getPathname({ href: { pathname: "/checkout/return", query }, locale }),
    errorUrl: siteUrl + getPathname({ href: { pathname: "/checkout/cancel", query }, locale }),
  };
}

export interface PaymentSessionOptions {
  /** Whole-XOF amount the customer authorized (refused if the server quote differs). */
  expectedXofAmount?: number;
  /** SUPER_ADMIN controlled test only (requires an isTest order): charge exactly this XOF amount. */
  fixedXofAmount?: number;
}

/** Creates (or resumes) the card payment session of an order that holds an ACTIVE reservation. */
export async function createPaymentSessionForOrder(
  orderId: string,
  options: PaymentSessionOptions = {}
): Promise<{ checkoutUrl: string; resumed: boolean; chargedAmount: number; chargedCurrency: string }> {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { customer: true } });
  const { successUrl, errorUrl } = buildReturnUrls(order.reference, order.locale);
  const session = await initializeCardPayment({
    orderId: order.id,
    orderRef: order.reference,
    amountCents: order.totalCents,
    currency: order.currency,
    isTest: order.isTest,
    expectedXofAmount: options.expectedXofAmount,
    fixedXofAmount: options.fixedXofAmount,
    customer: {
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      country: order.customer.country,
    },
    successUrl,
    errorUrl,
  });
  return {
    checkoutUrl: session.checkoutUrl,
    resumed: session.resumed,
    chargedAmount: session.chargedAmount,
    chargedCurrency: session.chargedCurrency,
  };
}

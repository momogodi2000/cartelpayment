/**
 * scripts/xof-test-payment.ts
 *
 *   npm run test:xof-payment -- --confirm            create the controlled 1,000 XOF session
 *   npm run test:xof-payment -- --status <orderRef>   re-read the authoritative provider status
 *
 * Same service path as the SUPER_ADMIN /admin/test-payment flow: an isTest order on the internal
 * EUR 1.00 test animal and a Payment of exactly 1,000 XOF through GeniusPay / Paystack. Creating
 * the session charges nothing; money moves only if someone pays the checkout URL with their own
 * instrument. Never touches a real animal. Secrets are never printed.
 */
import "dotenv/config";
import { prisma } from "../src/lib/db/client";
import { acquireHold } from "../src/lib/services/inventory";
import { createPaymentSessionForOrder } from "../src/lib/services/payments/checkout-session";
import { TEST_PAYMENT_XOF_AMOUNT } from "../src/lib/services/payments/payment-initialization";
import { applyProviderStatus } from "../src/lib/services/payments/settlement";
import { getEnv } from "../src/lib/env";

function summarize(payment: {
  id: string;
  providerReference: string | null;
  status: string;
  amountCents: number;
  currency: string;
  originalAmountCents: number | null;
  originalCurrency: string | null;
  fxSource: string | null;
  checkoutUrl?: string | null;
  attempts?: Array<{ gatewayRequested: string | null; gatewayActual: string | null }>;
}) {
  return {
    paymentId: payment.id,
    providerReference: payment.providerReference,
    paymentStatus: payment.status,
    charged: `${payment.amountCents} ${payment.currency}`,
    orderAmount: `${payment.originalAmountCents} ${payment.originalCurrency}`,
    fxSource: payment.fxSource,
    gatewayRequested: payment.attempts?.[0]?.gatewayRequested ?? null,
    gatewayActual: payment.attempts?.[0]?.gatewayActual ?? null,
    checkoutUrl: payment.checkoutUrl ?? undefined,
  };
}

async function start() {
  const env = getEnv();
  const dogs = await prisma.animal.findMany({ where: { isPaymentTest: true } });
  if (dogs.length !== 1) throw new Error(`Expected exactly one payment-test animal, found ${dogs.length}`);
  const dog = dogs[0];
  if (dog.priceCents !== 100 || dog.currency !== "EUR") throw new Error("Test animal price is not exactly EUR 1.00");

  const hold = await acquireHold({
    animalId: dog.id,
    customer: { name: "Pawelium Payment Test", email: env.NEXT_PUBLIC_CONTACT_EMAIL, phone: env.NEXT_PUBLIC_WHATSAPP_NUMBER, country: "FR", locale: "en" },
    deliveryCountry: "FR",
    termsVersion: "internal-payment-test",
    allowPaymentTest: true,
  });
  if (!hold.isTest || hold.pricing.totalCents !== 100) throw new Error("Hold is not the EUR 1.00 test order");

  const session = await createPaymentSessionForOrder(hold.orderId, { fixedXofAmount: TEST_PAYMENT_XOF_AMOUNT });
  const payment = await prisma.payment.findFirstOrThrow({ where: { orderId: hold.orderId }, orderBy: { createdAt: "desc" }, include: { attempts: true } });
  console.log(JSON.stringify({ orderRef: hold.orderReference, ...summarize({ ...payment, checkoutUrl: session.checkoutUrl }) }, null, 2));
}

async function status(orderRef: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { reference: orderRef }, include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!order.isTest) throw new Error("Not an internal test order");
  const ref = order.payments[0]?.providerReference;
  if (!ref) throw new Error("No provider reference on this order");
  const result = await applyProviderStatus(ref);
  const payment = await prisma.payment.findFirstOrThrow({ where: { providerReference: ref }, include: { attempts: true, events: true } });
  const animal = await prisma.orderItem.findUniqueOrThrow({ where: { orderId: order.id }, include: { animal: true } });
  console.log(
    JSON.stringify(
      { orderRef, settlement: result, orderStatus: (await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status, animalStatus: animal.animal.status, webhookEvents: payment.events.length, ...summarize(payment) },
      null,
      2
    )
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--status" && args[1]) return status(args[1]);
  if (!args.includes("--confirm")) throw new Error("Refusing to run without --confirm (creates a live, unpaid Paystack session of 1,000 XOF).");
  return start();
}

main()
  .catch((e) => {
    console.error("FAILED:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

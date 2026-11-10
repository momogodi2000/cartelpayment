import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { constructStripeWebhookEvent } from "@/lib/services/payments/stripe";
import { settlePaymentAuthoritative } from "@/lib/services/payments/settlement";
import { releaseHold } from "@/lib/services/inventory";
import { PaymentStatus, OrderStatus, ReservationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: any;
  try {
    event = constructStripeWebhookEvent(rawBody, signature);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 401 });
  }

  // Idempotency: Check if this event was already recorded
  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { providerEventId: event.id },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, note: "Duplicate event already processed" });
  }

  // Record inbound webhook event
  await prisma.paymentEvent.create({
    data: {
      providerEventId: event.id,
      eventType: event.type,
      signatureValid: true,
      payload: rawBody,
      outcome: "processing",
    },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const sessionId = session.id;

        // Authoritative settlement for Stripe session
        await settlePaymentAuthoritative(sessionId, {
          id: sessionId,
          reference: sessionId,
          status: "completed",
          amount: session.amount_total / 100, // to major units for adapter
          currency: (session.currency || "eur").toUpperCase(),
          metadata: session.metadata,
        });

        await prisma.paymentEvent.update({
          where: { providerEventId: event.id },
          data: { outcome: "completed: settled successfully" },
        });
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const payment = await prisma.payment.findFirst({
          where: { providerReference: session.id },
          include: { order: { include: { reservation: true } } },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.EXPIRED },
          });

          if (payment.order?.reservation?.status === ReservationStatus.ACTIVE) {
            await releaseHold(payment.order.reservation.id, "Stripe checkout session expired");
          }
        }

        await prisma.paymentEvent.update({
          where: { providerEventId: event.id },
          data: { outcome: "expired: hold released" },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const payment = await prisma.payment.findFirst({
          where: { providerReference: pi.id },
          include: { order: { include: { reservation: true } } },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
          });

          if (payment.order?.reservation?.status === ReservationStatus.ACTIVE) {
            await releaseHold(payment.order.reservation.id, "Stripe card payment declined");
          }
        }

        await prisma.paymentEvent.update({
          where: { providerEventId: event.id },
          data: { outcome: "failed: payment declined" },
        });
        break;
      }

      default: {
        await prisma.paymentEvent.update({
          where: { providerEventId: event.id },
          data: { outcome: `ignored: unhandled type ${event.type}` },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe Webhook] Processing error:", err);
    await prisma.paymentEvent.update({
      where: { providerEventId: event.id },
      data: { outcome: `error: ${err.message}` },
    });
    // Return 500 so Stripe retries delivery
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

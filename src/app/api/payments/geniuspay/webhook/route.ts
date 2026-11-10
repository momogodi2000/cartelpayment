import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { geniusPay } from "@/lib/services/payments/geniuspay";
import { applyProviderStatus } from "@/lib/services/payments/settlement";

export const dynamic = "force-dynamic";

/**
 * GeniusPay webhook (https://geniuspay.ci/docs/api#webhooks).
 *
 * 1. Verify HMAC-SHA256 over the RAW body + 300 s replay window + environment header.
 * 2. Require a real event identity (payload `id` or `X-Webhook-Delivery`).
 * 3. Persist the event once (unique providerEventId). A redelivery of an event that was
 *    already processed is acknowledged; a redelivery of an event whose settlement failed
 *    is processed again.
 * 4. Never trust the payload status: re-fetch GET /payments/{reference} and settle through
 *    the idempotent settlement service. Return 500 on failure so GeniusPay retries.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");
  const incomingEnv = req.headers.get("x-webhook-environment");
  const headerEvent = req.headers.get("x-webhook-event");
  const deliveryId = req.headers.get("x-webhook-delivery");

  if (!geniusPay.verifyWebhookSignature(rawBody, signature, timestamp, incomingEnv)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const providerEventId: string | null = payload?.id ? String(payload.id) : deliveryId || null;
  if (!providerEventId) {
    return NextResponse.json({ error: "Missing event identity." }, { status: 400 });
  }
  const eventType = String(payload?.event || headerEvent || "unknown");
  const paymentRef: string | null = payload?.data?.reference ? String(payload.data.reference) : null;

  const linkedPayment = paymentRef
    ? await prisma.payment.findFirst({ where: { providerReference: paymentRef }, select: { id: true } })
    : null;

  let event = await prisma.paymentEvent.findUnique({ where: { providerEventId } });
  if (event?.processedAt) {
    return NextResponse.json({ status: "already_processed" }, { status: 200 });
  }
  if (!event) {
    try {
      event = await prisma.paymentEvent.create({
        data: {
          providerEventId,
          eventType,
          signatureValid: true,
          payload: rawBody.slice(0, 20000),
          paymentId: linkedPayment?.id ?? null,
        },
      });
    } catch (err: any) {
      if (err?.code !== "P2002") throw err;
      // Concurrent delivery of the same event: the other request owns processing.
      return NextResponse.json({ status: "in_progress" }, { status: 200 });
    }
  }

  // Events without a payment (e.g. webhook.test, cashout.*) are acknowledged only.
  if (!paymentRef || eventType === "webhook.test" || eventType.startsWith("cashout.")) {
    await prisma.paymentEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date(), outcome: `Acknowledged (${eventType}); no settlement required.` },
    });
    return NextResponse.json({ status: "acknowledged" }, { status: 200 });
  }

  try {
    const result = await applyProviderStatus(paymentRef);
    await prisma.paymentEvent.update({
      where: { id: event.id },
      data: {
        processedAt: new Date(),
        paymentId: linkedPayment?.id ?? event.paymentId,
        outcome: `Settled: payment=${result.paymentStatus}, order=${result.orderStatus}${result.exceptionCreated ? " (exception opened)" : ""}`,
      },
    });
    return NextResponse.json({ status: "processed" }, { status: 200 });
  } catch (err: any) {
    console.error("[GeniusPay Webhook] Settlement failed:", err?.message);
    await prisma.paymentEvent.update({
      where: { id: event.id },
      data: { processedAt: null, outcome: `Settlement failed (will retry): ${String(err?.message || "error").slice(0, 400)}` },
    });
    return NextResponse.json({ error: "Settlement failed; retry later." }, { status: 500 });
  }
}

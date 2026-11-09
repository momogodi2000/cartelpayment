import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { geniusPay } from "@/lib/services/payments/geniuspay";
import { applyProviderStatus } from "@/lib/services/payments/settlement";

export const dynamic = "force-dynamic";

/**
 * GeniusPay Webhook Handler
 * Verified according to geniuspay.ci/docs/api
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const incomingEnv = req.headers.get("x-webhook-environment");
    const eventType = req.headers.get("x-webhook-event") || "payment.status";
    const deliveryId = req.headers.get("x-webhook-delivery") || "";

    // 1. Cryptographic HMAC-SHA256 signature and replay verification
    const isValidSignature = geniusPay.verifyWebhookSignature(
      rawBody,
      signature,
      timestamp,
      incomingEnv
    );

    if (!isValidSignature) {
      console.warn("[GeniusPay Webhook] Invalid signature or timestamp delta exceeded.");
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const providerEventId = payload.id || deliveryId || `evt-${Date.now()}`;
    const paymentRef = payload.data?.reference || payload.reference;

    // 2. Idempotency Check via unique providerEventId in PaymentEvent
    const existingEvent = await prisma.paymentEvent.findUnique({
      where: { providerEventId },
    });

    if (existingEvent) {
      // Event already recorded and processed: return 200 idempotent response immediately
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    // 3. Record raw PaymentEvent
    const eventRecord = await prisma.paymentEvent.create({
      data: {
        providerEventId,
        eventType,
        signatureValid: true,
        payload: rawBody,
        receivedAt: new Date(),
      },
    });

    // 4. Apply status authoritatively via re-querying GET /payments/{reference}
    if (paymentRef) {
      try {
        const result = await applyProviderStatus(paymentRef);
        await prisma.paymentEvent.update({
          where: { id: eventRecord.id },
          data: {
            processedAt: new Date(),
            outcome: `Settled with status: ${result.paymentStatus} / order: ${result.orderStatus}`,
          },
        });
      } catch (settleError: any) {
        console.error("[GeniusPay Webhook] Error settling payment:", settleError);
        await prisma.paymentEvent.update({
          where: { id: eventRecord.id },
          data: {
            processedAt: new Date(),
            outcome: `Settlement error: ${settleError.message}`,
          },
        });
      }
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error: any) {
    console.error("[GeniusPay Webhook] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

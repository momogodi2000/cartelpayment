import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { geniusPay } from "@/lib/services/payments/geniuspay";
import { applyProviderStatus } from "@/lib/services/payments/settlement";

export const dynamic = "force-dynamic";

/**
 * GeniusPay Webhook Route Handler
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

    // Require an authoritative provider event id
    const providerEventId = payload.id || deliveryId || payload.data?.reference || payload.reference;
    if (!providerEventId) {
      return NextResponse.json({ error: "Missing event delivery identification." }, { status: 400 });
    }

    const paymentRef = payload.data?.reference || payload.reference;

    // 2. Atomic Idempotency Record (Catch P2002 on concurrent deliveries)
    let eventRecordId: string;
    try {
      const eventRecord = await prisma.paymentEvent.create({
        data: {
          providerEventId,
          eventType,
          signatureValid: true,
          payload: rawBody,
          receivedAt: new Date(),
        },
      });
      eventRecordId = eventRecord.id;
    } catch (createErr: any) {
      // Prisma P2002: Unique constraint violation on providerEventId
      if (createErr.code === "P2002") {
        return NextResponse.json({ status: "already_processed" }, { status: 200 });
      }
      throw createErr;
    }

    // 3. Authoritative Settlement: re-query GET /payments/{reference}
    if (paymentRef) {
      try {
        const result = await applyProviderStatus(paymentRef);

        await prisma.paymentEvent.update({
          where: { id: eventRecordId },
          data: {
            processedAt: new Date(),
            outcome: `Settled: payment=${result.paymentStatus}, order=${result.orderStatus}`,
          },
        });
      } catch (settleError: any) {
        console.error("[GeniusPay Webhook] Critical settlement failure:", settleError);

        // Update record with error details
        await prisma.paymentEvent.update({
          where: { id: eventRecordId },
          data: {
            outcome: `Settlement exception: ${settleError.message}`,
          },
        });

        // Return HTTP 500 so GeniusPay webhook retry mechanism retries delivery
        return NextResponse.json(
          { error: "Settlement processing exception. Retrying." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ status: "processed" }, { status: 200 });
  } catch (error: any) {
    console.error("[GeniusPay Webhook] Unexpected runtime error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

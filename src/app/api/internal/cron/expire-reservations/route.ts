import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { timingSafeCompare } from "@/lib/security/tokens";
import { geniusPay } from "@/lib/services/payments/geniuspay";
import { applyProviderStatus } from "@/lib/services/payments/settlement";
import { releaseHold } from "@/lib/services/inventory";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || !timingSafeCompare(token, getEnv().CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Find active reservations past expiration time
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    include: {
      order: {
        include: {
          payments: {
            where: { provider: "GENIUSPAY" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  let settledCount = 0;
  let releasedCount = 0;

  for (const res of expiredReservations) {
    const payment = res.order.payments[0];

    // If there is an associated payment reference, query status first before releasing
    if (payment?.providerReference) {
      try {
        const providerStatus = await geniusPay.getPaymentStatus(payment.providerReference);
        if (providerStatus.status === "completed") {
          // Late payment confirmed!
          await applyProviderStatus(payment.providerReference);
          settledCount++;
          continue;
        }
      } catch (err) {
        console.warn(`[Cron Expiry] Could not verify provider status for ref ${payment.providerReference}:`, err);
      }
    }

    // Release hold
    await releaseHold(res.id, "Hold expired after 30 minutes window");
    releasedCount++;
  }

  return NextResponse.json({
    status: "success",
    evaluated: expiredReservations.length,
    settled: settledCount,
    released: releasedCount,
  });
}

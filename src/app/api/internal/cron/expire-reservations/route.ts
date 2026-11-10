import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { timingSafeCompare } from "@/lib/security/tokens";
import { geniusPay } from "@/lib/services/payments/geniuspay";
import { applyProviderStatus } from "@/lib/services/payments/settlement";
import { releaseHold } from "@/lib/services/inventory";

export const dynamic = "force-dynamic";

/**
 * Safe reservation expiration cron handler.
 * Invariant: Never releases holds when provider transaction is pending, processing,
 * or when status check fails. Respects provider expiresAt plus grace period.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || !timingSafeCompare(token, getEnv().CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10-minute grace period

  // Find active reservations past local expiration time
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    include: {
      order: {
        include: {
          payments: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  let settledCount = 0;
  let releasedCount = 0;
  let deferredCount = 0;

  for (const res of expiredReservations) {
    const payment = res.order.payments[0];

    // If an external checkout session was initiated with GeniusPay:
    if (payment?.providerReference) {
      try {
        const providerStatus = await geniusPay.getPaymentStatus(payment.providerReference);
        const status = providerStatus.status.toLowerCase();

        if (status === "completed" || status === "success" || status === "successful") {
          // Late payment confirmed: settle authoritatively
          await applyProviderStatus(payment.providerReference);
          settledCount++;
          continue;
        }

        if (status === "pending" || status === "processing") {
          // Customer might still be completing 3DS verification: check provider expiry
          const sessionExpiresAt = payment.expiresAt ? payment.expiresAt.getTime() : 0;
          const isWithinGrace = sessionExpiresAt > 0 && now.getTime() < sessionExpiresAt + GRACE_PERIOD_MS;

          if (isWithinGrace || now.getTime() < res.expiresAt.getTime() + GRACE_PERIOD_MS) {
            // Defer release until session expires or grace period passes
            deferredCount++;
            continue;
          }
        }

        if (status === "failed" || status === "cancelled" || status === "expired") {
          // Terminal provider status: settle status and release hold safely
          await applyProviderStatus(payment.providerReference);
          releasedCount++;
          continue;
        }
      } catch (err) {
        console.warn(
          `[Cron Expiry] Verification failed for provider ref ${payment.providerReference}. Deferring hold release:`,
          err
        );
        // On network error or status query failure, DO NOT release hold
        deferredCount++;
        continue;
      }
    }

    // No payment reference exists, or grace period has fully elapsed past expiration:
    const isPastGrace = now.getTime() >= res.expiresAt.getTime() + GRACE_PERIOD_MS;
    if (isPastGrace || !payment) {
      await releaseHold(res.id, `Hold expired after reservation window`);
      releasedCount++;
    } else {
      deferredCount++;
    }
  }

  return NextResponse.json({
    status: "success",
    evaluated: expiredReservations.length,
    settled: settledCount,
    released: releasedCount,
    deferred: deferredCount,
  });
}

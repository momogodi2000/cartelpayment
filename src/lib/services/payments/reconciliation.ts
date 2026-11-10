/**
 * src/lib/services/payments/reconciliation.ts
 *
 * Transaction Reconciliation & Expiry Engine for Pawelium 2.0.
 * Periodically and authoritatively reconciles pending/processing payments against
 * Stripe and GeniusPay, preventing transactions from remaining indefinitely "En attente".
 */

import { prisma } from "../../db/client";
import { PaymentStatus, ReservationStatus, PaymentProviderType } from "@prisma/client";
import { geniusPay } from "./geniuspay";
import { retrieveStripeSession, isStripeDirectConfigured } from "./stripe";
import { settlePaymentAuthoritative } from "./settlement";
import { releaseHold } from "../inventory";
import { getEnv } from "../../env";

export interface ReconciliationReport {
  evaluatedCount: number;
  settledCount: number;
  expiredCount: number;
  deferredCount: number;
  errors: Array<{ reference: string; error: string }>;
}

export async function reconcileUnresolvedPayments(): Promise<ReconciliationReport> {
  const env = getEnv();
  const holdMinutes = env.HOLD_MINUTES || 30;
  const now = Date.now();
  const holdDurationMs = holdMinutes * 60 * 1000;

  const unresolvedPayments = await prisma.payment.findMany({
    where: {
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.INITIALIZING],
      },
      providerReference: { not: null },
    },
    include: {
      order: {
        include: {
          reservation: true,
          item: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const report: ReconciliationReport = {
    evaluatedCount: unresolvedPayments.length,
    settledCount: 0,
    expiredCount: 0,
    deferredCount: 0,
    errors: [],
  };

  for (const payment of unresolvedPayments) {
    const ref = payment.providerReference!;
    const ageMs = now - payment.createdAt.getTime();
    const isPastHold = ageMs > holdDurationMs;

    try {
      if (payment.provider === PaymentProviderType.STRIPE) {
        if (!isStripeDirectConfigured()) {
          report.deferredCount++;
          continue;
        }

        const stripeSession = await retrieveStripeSession(ref);

        if (stripeSession.payment_status === "paid") {
          // Cleared payment: settle order to PAID
          await settlePaymentAuthoritative(ref, {
            id: ref,
            reference: ref,
            status: "completed",
            amount: (stripeSession.amount_total || payment.amountCents) / 100,
            currency: (stripeSession.currency || payment.currency).toUpperCase(),
            metadata: stripeSession.metadata as Record<string, any>,
          });
          report.settledCount++;
          continue;
        }

        if (stripeSession.status === "expired" || isPastHold) {
          // Expired or abandoned: transition to EXPIRED and release reservation
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.EXPIRED },
          });

          if (payment.order?.reservation?.status === ReservationStatus.ACTIVE) {
            await releaseHold(payment.order.reservation.id, "Stripe session abandoned/expired past hold window");
          }
          report.expiredCount++;
          continue;
        }

        report.deferredCount++;
      } else {
        // GeniusPay Merchant Provider
        const statusRes = await geniusPay.getPaymentStatus(ref);
        const providerStatus = (statusRes.status || "").toLowerCase();

        if (providerStatus === "completed" || providerStatus === "success" || providerStatus === "successful") {
          // Late verified payment: settle authoritatively
          await settlePaymentAuthoritative(ref, statusRes);
          report.settledCount++;
          continue;
        }

        if (providerStatus === "failed" || providerStatus === "cancelled" || providerStatus === "expired") {
          // Terminal status: transition locally and release hold
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status:
                providerStatus === "cancelled"
                  ? PaymentStatus.CANCELLED
                  : providerStatus === "expired"
                  ? PaymentStatus.EXPIRED
                  : PaymentStatus.FAILED,
            },
          });

          if (payment.order?.reservation?.status === ReservationStatus.ACTIVE) {
            await releaseHold(payment.order.reservation.id, `GeniusPay provider returned terminal ${providerStatus}`);
          }
          report.expiredCount++;
          continue;
        }

        // Provider still reports pending or processing:
        if (isPastHold) {
          // Customer abandoned checkout without completing payment: expire hold
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.EXPIRED },
          });

          if (payment.order?.reservation?.status === ReservationStatus.ACTIVE) {
            await releaseHold(
              payment.order.reservation.id,
              `Hold expired: transaction remained pending at provider after ${holdMinutes} minutes`
            );
          }
          report.expiredCount++;
        } else {
          // Still within active hold window: defer
          report.deferredCount++;
        }
      }
    } catch (err: any) {
      report.errors.push({ reference: ref, error: err.message || "Unknown error" });
    }
  }

  return report;
}

/**
 * src/lib/services/payments/reconciliation.ts
 *
 * Scheduled reconciliation & reservation expiry (Netlify scheduled functions call the
 * /api/internal/cron/* routes, which delegate here).
 *
 *  reconcileUnresolvedPayments — re-queries every open payment at GeniusPay and settles it
 *    through the idempotent settlement service. Pending payments are NEVER marked failed
 *    because of local age; only the provider's own terminal status (failed/cancelled/
 *    expired) closes them.
 *
 *  expireReservations — releases holds past their expiry only when safe:
 *    - no open payment, or the latest payment is terminal          -> release
 *    - provider says paid                                            -> settle (no release)
 *    - provider says pending (customer has not paid) past grace      -> release the inventory,
 *      keep the payment open; a late success is still settled (re-acquires the animal if
 *      nobody took it, otherwise late-payment exception + refund)
 *    - provider says processing / requires action                   -> defer (payment in flight)
 *    - provider unreachable                                          -> defer; after a long
 *      delay raise a PROVIDER_UNREACHABLE exception for manual review (never blind release)
 */

import { PaymentStatus, ReservationStatus, ExceptionKind } from "@prisma/client";
import { prisma } from "../../db/client";
import { applyProviderStatus, TERMINAL_FAILURE_STATUSES } from "./settlement";
import { releaseHold } from "../inventory";

const PENDING_RELEASE_GRACE_MS = 10 * 60 * 1000;
const PROCESSING_MAX_DEFER_MS = 60 * 60 * 1000;
const UNREACHABLE_ESCALATION_MS = 2 * 60 * 60 * 1000;
const STUCK_INITIALIZING_MS = 15 * 60 * 1000;

export interface ReconciliationReport {
  evaluated: number;
  settled: number;
  terminal: number;
  stillOpen: number;
  failedStuckInit: number;
  errors: Array<{ reference: string; error: string }>;
}

export interface ExpiryReport {
  evaluated: number;
  released: number;
  settled: number;
  deferred: number;
  escalated: number;
}

async function escalateUnreachable(orderId: string, paymentId: string, detail: string) {
  const existing = await prisma.reconciliationException.findFirst({
    where: { paymentId, kind: ExceptionKind.PROVIDER_UNREACHABLE, status: "OPEN" },
  });
  if (existing) return false;
  await prisma.reconciliationException.create({
    data: { orderId, paymentId, kind: ExceptionKind.PROVIDER_UNREACHABLE, notes: detail.slice(0, 1000) },
  });
  return true;
}

export async function reconcileUnresolvedPayments(now = new Date()): Promise<ReconciliationReport> {
  const report: ReconciliationReport = { evaluated: 0, settled: 0, terminal: 0, stillOpen: 0, failedStuckInit: 0, errors: [] };

  // Initialization that crashed midway: no session was ever handed to the customer.
  const stuck = await prisma.payment.updateMany({
    where: {
      status: PaymentStatus.INITIALIZING,
      checkoutUrl: null,
      createdAt: { lt: new Date(now.getTime() - STUCK_INITIALIZING_MS) },
    },
    data: { status: PaymentStatus.FAILED },
  });
  report.failedStuckInit = stuck.count;

  const open = await prisma.payment.findMany({
    where: {
      status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.REQUIRES_ACTION] },
      providerReference: { not: null },
      createdAt: { lt: new Date(now.getTime() - 2 * 60 * 1000) },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  report.evaluated = open.length;

  for (const payment of open) {
    const ref = payment.providerReference!;
    try {
      const result = await applyProviderStatus(ref);
      if (result.paymentStatus === PaymentStatus.SUCCESSFUL) report.settled++;
      else if (TERMINAL_FAILURE_STATUSES.includes(result.paymentStatus)) report.terminal++;
      else report.stillOpen++;
    } catch (err: any) {
      report.errors.push({ reference: ref, error: err?.message || "unknown error" });
      const providerExpiry = (payment.expiresAt ?? new Date(payment.createdAt.getTime() + 24 * 3600 * 1000)).getTime();
      if (now.getTime() > providerExpiry + UNREACHABLE_ESCALATION_MS) {
        await escalateUnreachable(payment.orderId, payment.id, `Status of ${ref} could not be retrieved after provider expiry: ${err?.message}`);
      }
    }
  }
  return report;
}

export async function expireReservations(now = new Date()): Promise<ExpiryReport> {
  const report: ExpiryReport = { evaluated: 0, released: 0, settled: 0, deferred: 0, escalated: 0 };

  const expired = await prisma.reservation.findMany({
    where: { status: ReservationStatus.ACTIVE, expiresAt: { lte: now } },
    include: { order: { include: { payments: { orderBy: { createdAt: "desc" } } } } },
    take: 200,
  });
  report.evaluated = expired.length;

  for (const res of expired) {
    const latest = res.order.payments[0];
    const sinceExpiry = now.getTime() - res.expiresAt.getTime();

    // No session, or the latest session is terminal: nothing can still be paid by the customer.
    if (!latest || TERMINAL_FAILURE_STATUSES.includes(latest.status) || latest.status === PaymentStatus.FAILED) {
      await releaseHold(res.id, "Reservation expired without a successful payment");
      report.released++;
      continue;
    }
    if (latest.status === PaymentStatus.SUCCESSFUL || latest.status === PaymentStatus.REQUIRES_RECONCILIATION) {
      report.deferred++; // settlement already handled (or awaiting admin) — never release here
      continue;
    }
    if (!latest.providerReference) {
      // Initialization in flight right now.
      if (sinceExpiry > STUCK_INITIALIZING_MS) {
        await releaseHold(res.id, "Reservation expired: payment initialization never completed");
        report.released++;
      } else report.deferred++;
      continue;
    }

    try {
      const result = await applyProviderStatus(latest.providerReference);
      if (result.paymentStatus === PaymentStatus.SUCCESSFUL || result.paymentStatus === PaymentStatus.REQUIRES_RECONCILIATION) {
        report.settled++;
        continue;
      }
      if (TERMINAL_FAILURE_STATUSES.includes(result.paymentStatus)) {
        await releaseHold(res.id, `Reservation expired; provider reported ${result.paymentStatus}`);
        report.released++;
        continue;
      }
      if (result.paymentStatus === PaymentStatus.PENDING && sinceExpiry >= PENDING_RELEASE_GRACE_MS) {
        await releaseHold(res.id, "Reservation expired; customer has not completed payment (session still open at provider)");
        report.released++;
        continue;
      }
      if (
        (result.paymentStatus === PaymentStatus.PROCESSING || result.paymentStatus === PaymentStatus.REQUIRES_ACTION) &&
        sinceExpiry >= PROCESSING_MAX_DEFER_MS
      ) {
        const escalated = await escalateUnreachable(res.orderId, latest.id, `Payment ${latest.providerReference} still ${result.paymentStatus} ${Math.round(sinceExpiry / 60000)} min after hold expiry.`);
        if (escalated) report.escalated++;
      }
      report.deferred++;
    } catch (err: any) {
      if (sinceExpiry >= UNREACHABLE_ESCALATION_MS) {
        const escalated = await escalateUnreachable(res.orderId, latest.id, `Hold expired but provider status unavailable: ${err?.message}`);
        if (escalated) report.escalated++;
      }
      report.deferred++;
    }
  }
  return report;
}

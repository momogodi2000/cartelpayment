/**
 * src/lib/services/payments/settlement.ts
 *
 * Idempotent, reservation-owned settlement of provider payment states.
 *
 * Invariants:
 *  1. Idempotent: any number of webhook deliveries / return-page refreshes / cron passes
 *     produce at most one PAID order, one SOLD animal, one exception per (payment, kind).
 *  2. Ownership: a payment can only sell the animal if (a) its own reservation is ACTIVE
 *     and the animal is HELD, or (b) nobody holds it (animal AVAILABLE). An animal held by
 *     another order or already SOLD is NEVER touched -> late-payment exception + refund.
 *  3. Zero tolerance: amount or currency mismatch never marks anything PAID.
 *  4. Terminal failures do NOT release the hold early: the hold stays until its expiry so
 *     the customer can retry within the window; the expiry job releases it safely.
 */

import { Prisma } from "@prisma/client";
import {
  PaymentStatus,
  OrderStatus,
  AnimalStatus,
  ReservationStatus,
  RefundStatus,
  ExceptionKind,
  ExceptionStatus,
} from "@prisma/client";
import { prisma } from "../../db/client";
import { geniusPay, GeniusPayStatusResponse } from "./geniuspay";
import { queueEmail } from "../email/outbox";
import { parseFromGeniusPay, formatMoney } from "../../domain/money";
import { getEnv } from "../../env";

export interface SettlementResult {
  orderId: string;
  orderRef: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  exceptionCreated?: boolean;
}

export function mapProviderStatus(providerStatus: string | null | undefined): PaymentStatus {
  switch ((providerStatus || "").toLowerCase()) {
    case "completed":
    case "success":
    case "successful":
    case "paid":
      return PaymentStatus.SUCCESSFUL;
    case "processing":
      return PaymentStatus.PROCESSING;
    case "requires_action":
      return PaymentStatus.REQUIRES_ACTION;
    case "pending":
    case "initiated":
      return PaymentStatus.PENDING;
    case "declined":
      return PaymentStatus.DECLINED;
    case "failed":
      return PaymentStatus.FAILED;
    case "cancelled":
    case "canceled":
      return PaymentStatus.CANCELLED;
    case "expired":
      return PaymentStatus.EXPIRED;
    case "refunded":
      return PaymentStatus.REFUNDED;
    case "partially_refunded":
      return PaymentStatus.PARTIALLY_REFUNDED;
    default:
      return PaymentStatus.PENDING;
  }
}

export const TERMINAL_FAILURE_STATUSES: PaymentStatus[] = [
  PaymentStatus.FAILED,
  PaymentStatus.DECLINED,
  PaymentStatus.CANCELLED,
  PaymentStatus.EXPIRED,
];

const OPEN_STATUSES: PaymentStatus[] = [
  PaymentStatus.CREATED,
  PaymentStatus.INITIALIZING,
  PaymentStatus.PENDING,
  PaymentStatus.PROCESSING,
  PaymentStatus.REQUIRES_ACTION,
];

/** GET the authoritative status from GeniusPay and settle it. */
export async function applyProviderStatus(providerReference: string): Promise<SettlementResult> {
  const providerData = await geniusPay.getPaymentStatus(providerReference);
  return settlePaymentAuthoritative(providerReference, providerData);
}

async function findPaymentForReference(providerReference: string, providerData: GeniusPayStatusResponse) {
  const include = { order: { include: { customer: true, reservation: true, item: true } } } as const;
  const direct = await prisma.payment.findFirst({
    where: { providerReference: { in: [providerReference, providerData.reference] } },
    include,
  });
  if (direct) return { payment: direct, isPrimary: true };

  // A secondary attempt reference (superseded / orphan session) of an existing payment.
  const attempt = await prisma.paymentAttempt.findFirst({
    where: { providerReference: { in: [providerReference, providerData.reference] } },
  });
  if (!attempt) return null;
  const payment = await prisma.payment.findUnique({ where: { id: attempt.paymentId }, include });
  return payment ? { payment, isPrimary: false } : null;
}

async function openExceptionOnce(
  tx: Prisma.TransactionClient,
  data: { orderId: string; paymentId: string; kind: ExceptionKind; notes: string }
): Promise<boolean> {
  const existing = await tx.reconciliationException.findFirst({
    where: { paymentId: data.paymentId, kind: data.kind },
  });
  if (existing) return false;
  await tx.reconciliationException.create({ data: { ...data, status: ExceptionStatus.OPEN } });
  return true;
}

async function alertAdmin(tx: Prisma.TransactionClient, key: string, payload: Record<string, unknown>) {
  const to = getEnv().NEXT_PUBLIC_CONTACT_EMAIL;
  await queueEmail({ idempotencyKey: `admin_alert:${key}`, template: "admin_payment_alert", locale: "en", toEmail: to, payload }, tx);
}

export async function settlePaymentAuthoritative(
  providerReference: string,
  providerData: GeniusPayStatusResponse
): Promise<SettlementResult> {
  const found = await findPaymentForReference(providerReference, providerData);
  if (!found || !found.payment.order) {
    throw new Error(`Payment record not found for provider reference: ${providerReference}`);
  }
  const { payment, isPrimary } = found;
  const order = payment.order;
  const base = { orderId: order.id, orderRef: order.reference };
  const mapped = mapProviderStatus(providerData.status);
  const snapshot = JSON.stringify(providerData).slice(0, 8000);

  // ---- Secondary (orphan/superseded) session reported paid: duplicate capture -------------
  if (!isPrimary) {
    if (mapped === PaymentStatus.SUCCESSFUL) {
      const created = await prisma.$transaction(async (tx) => {
        const c = await openExceptionOnce(tx, {
          orderId: order.id,
          paymentId: payment.id,
          kind: ExceptionKind.DUPLICATE_CAPTURE,
          notes: `Secondary session ${providerData.reference} reported paid. Refund required.`,
        });
        if (c) await alertAdmin(tx, `dup:${providerData.reference}`, { orderRef: order.reference, reference: providerData.reference, kind: "DUPLICATE_CAPTURE" });
        return c;
      });
      return { ...base, paymentStatus: payment.status, orderStatus: order.status, exceptionCreated: created };
    }
    return { ...base, paymentStatus: payment.status, orderStatus: order.status };
  }

  // ---- Refund reported by provider (applies even to already-paid payments) ---------------
  if (mapped === PaymentStatus.REFUNDED || mapped === PaymentStatus.PARTIALLY_REFUNDED) {
    return prisma.$transaction(async (tx) => {
      const gate = await tx.payment.updateMany({
        where: { id: payment.id, status: { not: mapped } },
        data: { status: mapped, rawLast: snapshot },
      });
      if (gate.count === 1 && mapped === PaymentStatus.REFUNDED) {
        if (order.status !== OrderStatus.REFUNDED) {
          await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.REFUNDED } });
          await tx.orderStatusHistory.create({
            data: { orderId: order.id, fromStatus: order.status, toStatus: OrderStatus.REFUNDED, actorType: "PROVIDER", reason: `Refund confirmed by provider (ref ${providerData.reference}).` },
          });
        }
        await tx.refund.updateMany({
          where: { paymentId: payment.id, status: { in: [RefundStatus.REQUESTED, RefundStatus.PENDING_PROVIDER] } },
          data: { status: RefundStatus.COMPLETED },
        });
      }
      const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
      return { ...base, paymentStatus: mapped, orderStatus: current.status };
    });
  }

  // ---- Already settled: idempotent no-op ---------------------------------------------------
  if (payment.status === PaymentStatus.SUCCESSFUL || payment.status === PaymentStatus.REQUIRES_RECONCILIATION) {
    const current = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    return { ...base, paymentStatus: payment.status, orderStatus: current.status };
  }

  // ---- Successful payment ------------------------------------------------------------------
  if (mapped === PaymentStatus.SUCCESSFUL) {
    const animalId = order.item?.animalId;
    if (!animalId) throw new Error(`Order ${order.id} has no associated animal item.`);

    const providerCurrency = (providerData.currency || "").toUpperCase();
    const providerMinor = Number.isFinite(providerData.amount) ? parseFromGeniusPay(providerData.amount) : NaN;
    const currencyMismatch = !providerCurrency || providerCurrency !== payment.currency.toUpperCase();
    const amountMismatch = !Number.isFinite(providerMinor) || providerMinor !== payment.amountCents;

    return prisma.$transaction(async (tx) => {
      if (currencyMismatch || amountMismatch) {
        const gate = await tx.payment.updateMany({
          where: { id: payment.id, status: { in: OPEN_STATUSES } },
          data: { status: PaymentStatus.REQUIRES_RECONCILIATION, rawLast: snapshot },
        });
        let created = false;
        if (gate.count === 1) {
          created = await openExceptionOnce(tx, {
            orderId: order.id,
            paymentId: payment.id,
            kind: currencyMismatch ? ExceptionKind.CURRENCY_MISMATCH : ExceptionKind.AMOUNT_MISMATCH,
            notes: `Provider reported ${providerData.amount} ${providerCurrency || "(no currency)"}; expected ${payment.amountCents} minor units ${payment.currency}. Not marked paid.`,
          });
          await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.DISPUTED } });
          await tx.orderStatusHistory.create({
            data: { orderId: order.id, fromStatus: order.status, toStatus: OrderStatus.DISPUTED, actorType: "SYSTEM", reason: "Amount/currency mismatch — manual reconciliation required." },
          });
          await alertAdmin(tx, `mismatch:${payment.id}`, { orderRef: order.reference, reference: providerData.reference, kind: currencyMismatch ? "CURRENCY_MISMATCH" : "AMOUNT_MISMATCH" });
        }
        return { ...base, paymentStatus: PaymentStatus.REQUIRES_RECONCILIATION, orderStatus: OrderStatus.DISPUTED, exceptionCreated: created };
      }

      // Idempotency gate — only one settlement can ever pass this point.
      const gate = await tx.payment.updateMany({
        where: { id: payment.id, status: { in: [...OPEN_STATUSES, ...TERMINAL_FAILURE_STATUSES] } },
        data: { status: PaymentStatus.SUCCESSFUL, rawLast: snapshot },
      });
      if (gate.count === 0) {
        const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
        return { ...base, paymentStatus: PaymentStatus.SUCCESSFUL, orderStatus: current.status };
      }

      // The same order was already paid through another payment session: duplicate capture.
      const otherPaid = await tx.payment.findFirst({
        where: { orderId: order.id, id: { not: payment.id }, status: PaymentStatus.SUCCESSFUL },
      });
      if (otherPaid) {
        const created = await openExceptionOnce(tx, {
          orderId: order.id,
          paymentId: payment.id,
          kind: ExceptionKind.DUPLICATE_CAPTURE,
          notes: `Order already paid by payment ${otherPaid.id}; second capture ${providerData.reference} must be refunded.`,
        });
        if (created) {
          await tx.refund.create({
            data: { paymentId: payment.id, amountCents: payment.amountCents, reason: "Duplicate capture for an already paid order", status: RefundStatus.REQUESTED },
          });
          await alertAdmin(tx, `dup:${payment.id}`, { orderRef: order.reference, reference: providerData.reference, kind: "DUPLICATE_CAPTURE" });
        }
        const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
        return { ...base, paymentStatus: PaymentStatus.SUCCESSFUL, orderStatus: current.status, exceptionCreated: created };
      }

      // Ownership: (a) our own ACTIVE reservation on a HELD animal …
      const reservation = await tx.reservation.findUnique({ where: { orderId: order.id } });
      let acquired = false;
      if (reservation && reservation.status === ReservationStatus.ACTIVE && reservation.activeAnimalId === animalId) {
        const held = await tx.animal.updateMany({ where: { id: animalId, status: AnimalStatus.HELD }, data: { status: AnimalStatus.SOLD } });
        acquired = held.count === 1;
      }
      // … or (b) nobody holds the animal any more (our hold expired, nobody else took it).
      if (!acquired && (!reservation || reservation.status !== ReservationStatus.ACTIVE)) {
        const free = await tx.animal.updateMany({ where: { id: animalId, status: AnimalStatus.AVAILABLE }, data: { status: AnimalStatus.SOLD } });
        acquired = free.count === 1;
      }

      if (acquired) {
        if (reservation) {
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.CONVERTED, activeAnimalId: null, releasedAt: null },
          });
        }
        await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.PAID } });
        await tx.orderStatusHistory.create({
          data: { orderId: order.id, fromStatus: order.status, toStatus: OrderStatus.PAID, actorType: "PROVIDER", reason: `Card payment confirmed by provider (ref ${providerData.reference}).` },
        });

        const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
        if (order.isTest || payment.isTest) {
          await alertAdmin(tx, `test_paid:${payment.id}`, { orderRef: order.reference, reference: providerData.reference, kind: "TEST_PAYMENT_SUCCEEDED", amount: formatMoney(payment.amountCents, payment.currency, "en") });
        } else {
          await queueEmail(
            {
              idempotencyKey: `order:${order.id}:paid`,
              template: "order_paid",
              locale: order.locale,
              toEmail: order.customer.email,
              payload: {
                customerName: order.customer.name,
                orderRef: order.reference,
                animalName: order.item?.animalName || "",
                total: formatMoney(order.totalCents, order.currency, order.locale),
                trackingUrl: `${siteUrl}/${order.locale}/${order.locale === "fr" ? "suivi-commande" : "track-order"}`,
              },
            },
            tx
          );
        }
        return { ...base, paymentStatus: PaymentStatus.SUCCESSFUL, orderStatus: OrderStatus.PAID };
      }

      // Late payment: the animal is held by someone else or already sold.
      await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.DISPUTED } });
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, fromStatus: order.status, toStatus: OrderStatus.DISPUTED, actorType: "SYSTEM", reason: "Payment confirmed after the animal was no longer available — refund required." },
      });
      const created = await openExceptionOnce(tx, {
        orderId: order.id,
        paymentId: payment.id,
        kind: ExceptionKind.LATE_PAYMENT_AFTER_SALE,
        notes: `Payment ${providerData.reference} confirmed after the animal became unavailable. Refund required.`,
      });
      if (created) {
        await tx.refund.create({
          data: { paymentId: payment.id, amountCents: payment.amountCents, reason: "Late payment after the animal was no longer available", status: RefundStatus.REQUESTED },
        });
        await alertAdmin(tx, `late:${payment.id}`, { orderRef: order.reference, reference: providerData.reference, kind: "LATE_PAYMENT_AFTER_SALE" });
      }
      return { ...base, paymentStatus: PaymentStatus.SUCCESSFUL, orderStatus: OrderStatus.DISPUTED, exceptionCreated: created };
    });
  }

  // ---- Terminal failure: record it, keep the hold until expiry (retry window) --------------
  if (TERMINAL_FAILURE_STATUSES.includes(mapped)) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { in: OPEN_STATUSES } },
      data: { status: mapped, rawLast: snapshot },
    });
    const current = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
    return { ...base, paymentStatus: current.status, orderStatus: order.status };
  }

  // ---- Still open (pending / processing / requires action) --------------------------------
  if (payment.status !== mapped && OPEN_STATUSES.includes(payment.status)) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { in: OPEN_STATUSES } },
      data: { status: mapped, rawLast: snapshot },
    });
  }
  return { ...base, paymentStatus: mapped, orderStatus: order.status };
}

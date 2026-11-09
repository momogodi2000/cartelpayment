import { AnimalStatus, OrderStatus, PaymentStatus, ReservationStatus, ExceptionKind, ExceptionStatus, RefundStatus, Prisma } from "@prisma/client";
import { prisma } from "../../db/client";
import { geniusPay } from "./geniuspay";
import { parseFromGeniusPay, formatMoney } from "../../domain/money";
import { queueEmail, sendEmailNotification } from "../email/outbox";
import { getEnv } from "../../env";

export interface SyncPaymentResult {
  orderId: string;
  orderRef: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  exceptionCreated?: boolean;
}

/**
 * Re-queries GeniusPay authoritatively and settles the order and inventory state atomically.
 */
export async function applyProviderStatus(providerReference: string): Promise<SyncPaymentResult> {
  const providerData = await geniusPay.getPaymentStatus(providerReference);

  const payment = await prisma.payment.findUnique({
    where: { providerReference },
    include: {
      order: {
        include: {
          customer: true,
          item: true,
          reservation: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error(`Payment with reference ${providerReference} not found in database.`);
  }

  const order = payment.order;
  const orderId = order.id;
  const orderRef = order.reference;

  // Map provider status string to PaymentStatus enum
  let mappedPaymentStatus: PaymentStatus = PaymentStatus.PENDING;
  if (providerData.status === "completed") mappedPaymentStatus = PaymentStatus.SUCCESSFUL;
  else if (providerData.status === "failed") mappedPaymentStatus = PaymentStatus.FAILED;
  else if (providerData.status === "cancelled") mappedPaymentStatus = PaymentStatus.CANCELLED;
  else if (providerData.status === "expired") mappedPaymentStatus = PaymentStatus.EXPIRED;
  else if (providerData.status === "processing") mappedPaymentStatus = PaymentStatus.PROCESSING;
  else if (providerData.status === "refunded") mappedPaymentStatus = PaymentStatus.REFUNDED;

  // 1. If Payment Completed -> Settle Success
  if (mappedPaymentStatus === PaymentStatus.SUCCESSFUL) {
    // Validate currency and amount
    const providerAmountCents = parseFromGeniusPay(providerData.amount);
    const amountMismatch = Math.abs(providerAmountCents - payment.amountCents) > 100; // >1 EUR discrepancy
    const currencyMismatch = providerData.currency.toUpperCase() !== payment.currency.toUpperCase();

    if (amountMismatch || currencyMismatch) {
      await prisma.reconciliationException.create({
        data: {
          orderId: order.id,
          paymentId: payment.id,
          kind: amountMismatch ? ExceptionKind.AMOUNT_MISMATCH : ExceptionKind.CURRENCY_MISMATCH,
          status: ExceptionStatus.OPEN,
          notes: `Discrepancy: provider amount=${providerData.amount} ${providerData.currency}, local amount=${payment.amountCents} cents ${payment.currency}`,
        },
      });
    }

    const animalId = order.item?.animalId;
    if (!animalId) {
      throw new Error(`Order ${orderId} has no associated animal item.`);
    }

    return await prisma.$transaction(async (tx) => {
      // Check if animal is still HELD by this reservation or can be sold
      const animalUpdate = await tx.animal.updateMany({
        where: {
          id: animalId,
          status: { in: [AnimalStatus.HELD, AnimalStatus.AVAILABLE] },
        },
        data: {
          status: AnimalStatus.SOLD,
        },
      });

      if (animalUpdate.count === 1) {
        // Success: Animal acquired and marked SOLD
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESSFUL,
            rawLast: JSON.stringify(providerData),
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAID },
        });

        if (order.reservation) {
          await tx.reservation.update({
            where: { id: order.reservation.id },
            data: {
              status: ReservationStatus.CONVERTED,
              releasedAt: new Date(),
              activeAnimalId: null, // Clear active lock
            },
          });
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: OrderStatus.PAID,
            actorType: "PROVIDER",
            reason: `Payment confirmed by GeniusPay (${providerReference})`,
          },
        });

        // Queue order_paid email
        const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL;
        const trackingUrl = `${siteUrl}/${order.locale}/track-order?ref=${order.reference}`;
        const notifId = await queueEmail(
          {
            idempotencyKey: `order:${order.id}:paid`,
            template: "order_paid",
            locale: order.locale,
            toEmail: order.customer.email,
            payload: {
              customerName: order.customer.name,
              orderRef: order.reference,
              animalName: order.item?.animalName || "votre compagnon",
              trackingUrl,
            },
          },
          tx
        );

        // Immediate background send
        sendEmailNotification(notifId).catch(console.error);

        return {
          orderId,
          orderRef,
          paymentStatus: PaymentStatus.SUCCESSFUL,
          orderStatus: OrderStatus.PAID,
        };
      } else {
        // Late payment after sale to someone else!
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESSFUL,
            rawLast: JSON.stringify(providerData),
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.DISPUTED },
        });

        await tx.reconciliationException.create({
          data: {
            orderId: order.id,
            paymentId: payment.id,
            kind: ExceptionKind.LATE_PAYMENT_AFTER_SALE,
            status: ExceptionStatus.OPEN,
            notes: `Payment confirmed after animal was sold to another customer. Automatic refund requested.`,
          },
        });

        await tx.refund.create({
          data: {
            paymentId: payment.id,
            amountCents: payment.amountCents,
            reason: "Late payment after sale to another adopter",
            status: RefundStatus.REQUESTED,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: OrderStatus.DISPUTED,
            actorType: "PROVIDER",
            reason: "Payment received after animal inventory was no longer available",
          },
        });

        return {
          orderId,
          orderRef,
          paymentStatus: PaymentStatus.SUCCESSFUL,
          orderStatus: OrderStatus.DISPUTED,
          exceptionCreated: true,
        };
      }
    });
  }

  // 2. If Payment Failed / Expired / Cancelled
  if (
    mappedPaymentStatus === PaymentStatus.FAILED ||
    mappedPaymentStatus === PaymentStatus.EXPIRED ||
    mappedPaymentStatus === PaymentStatus.CANCELLED
  ) {
    return await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: mappedPaymentStatus,
          rawLast: JSON.stringify(providerData),
        },
      });

      if (order.reservation && order.reservation.status === ReservationStatus.ACTIVE) {
        await tx.reservation.update({
          where: { id: order.reservation.id },
          data: {
            status:
              mappedPaymentStatus === PaymentStatus.EXPIRED
                ? ReservationStatus.EXPIRED
                : ReservationStatus.RELEASED,
            releasedAt: new Date(),
            activeAnimalId: null,
          },
        });

        if (order.item?.animalId) {
          await tx.animal.updateMany({
            where: {
              id: order.item.animalId,
              status: AnimalStatus.HELD,
            },
            data: { status: AnimalStatus.AVAILABLE },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          actorType: "PROVIDER",
          reason: `GeniusPay payment resolved with status: ${providerData.status}`,
        },
      });

      return {
        orderId,
        orderRef,
        paymentStatus: mappedPaymentStatus,
        orderStatus: OrderStatus.CANCELLED,
      };
    });
  }

  // Fallback: update status record
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: mappedPaymentStatus,
      rawLast: JSON.stringify(providerData),
    },
  });

  return {
    orderId,
    orderRef,
    paymentStatus: mappedPaymentStatus,
    orderStatus: order.status,
  };
}

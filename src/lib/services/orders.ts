import { OrderStatus, ActorType, AnimalStatus, ReservationStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../db/client";
import { assertValidOrderTransition } from "../domain/order-state";
import { logAudit } from "./audit";
import { queueEmail, sendEmailNotification } from "./email/outbox";
import { getEnv } from "../env";

export interface TransitionOrderParams {
  orderId: string;
  toStatus: OrderStatus;
  actor: {
    actorType: ActorType;
    adminId?: string;
    ip?: string;
  };
  reason?: string;
}

/**
 * Executes a valid order status transition with state machine validation and audit logging.
 * Rejects setting to PAID directly (must go through payment settlement or recordManualPayment).
 */
export async function transitionOrderStatus(params: TransitionOrderParams): Promise<void> {
  const { orderId, toStatus, actor, reason } = params;

  if (toStatus === OrderStatus.PAID) {
    throw new Error(
      "Direct transition to PAID is forbidden. Orders become PAID only through verified payment webhooks or recordManualPayment()."
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  assertValidOrderTransition(order.status, toStatus);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: toStatus },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus,
        actorType: actor.actorType,
        adminId: actor.adminId || null,
        reason: reason || null,
      },
    });

    if (actor.adminId) {
      await logAudit(
        {
          actorType: actor.actorType,
          adminId: actor.adminId,
          action: "ORDER_STATUS_UPDATE",
          entity: "Order",
          entityId: orderId,
          ip: actor.ip,
          diff: { from: order.status, to: toStatus, reason },
        },
        tx
      );
    }
  });
}

export interface RecordManualPaymentInput {
  orderId: string;
  adminId: string;
  bankReference: string;
  justification: string;
  ip?: string;
}

/**
 * Records an authorized manual transaction (e.g. wire transfer / direct bank clearance).
 * Strictly requires written justification, bank reference, and audit log.
 */
export async function recordManualPayment(input: RecordManualPaymentInput): Promise<void> {
  const { orderId, adminId, bankReference, justification, ip } = input;

  if (!bankReference.trim()) {
    throw new Error("A valid bank transaction reference is required for manual settlement.");
  }
  if (!justification.trim() || justification.trim().length < 10) {
    throw new Error("A comprehensive written justification (minimum 10 characters) is mandatory.");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      item: true,
      reservation: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  if (order.status === OrderStatus.PAID) {
    throw new Error("Order is already marked as PAID.");
  }

  const animalId = order.item?.animalId;
  if (!animalId) {
    throw new Error("Order has no associated animal.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Mark animal SOLD
    await tx.animal.updateMany({
      where: { id: animalId },
      data: { status: AnimalStatus.SOLD },
    });

    // 2. Convert reservation
    if (order.reservation) {
      await tx.reservation.update({
        where: { id: order.reservation.id },
        data: {
          status: ReservationStatus.CONVERTED,
          releasedAt: new Date(),
          activeAnimalId: null,
        },
      });
    }

    // 3. Create or update payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: "GENIUSPAY",
        providerReference: `MANUAL-${bankReference.trim()}`,
        amountCents: order.totalCents,
        currency: order.currency,
        method: "bank_transfer_manual",
        status: PaymentStatus.SUCCESSFUL,
        rawLast: JSON.stringify({
          type: "MANUAL_RECORD",
          bankReference,
          justification,
          adminId,
        }),
      },
    });

    // 4. Update order status
    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID },
    });

    // 5. Order history
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: OrderStatus.PAID,
        actorType: "ADMIN",
        adminId,
        reason: `Manual payment authorized. Ref: ${bankReference}. Justification: ${justification}`,
      },
    });

    // 6. Audit log
    await logAudit(
      {
        actorType: "ADMIN",
        adminId,
        action: "RECORD_MANUAL_PAYMENT",
        entity: "Order",
        entityId: order.id,
        ip,
        diff: {
          bankReference,
          justification,
          amountCents: order.totalCents,
        },
      },
      tx
    );

    // 7. Queue confirmation email
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
          animalName: order.item?.animalName || "votre animal",
          trackingUrl,
        },
      },
      tx
    );

    sendEmailNotification(notifId).catch(console.error);
  });
}

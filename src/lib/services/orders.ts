import { OrderStatus, ActorType, AnimalStatus, ReservationStatus, PaymentStatus, RefundStatus } from "@prisma/client";
import { prisma } from "../db/client";
import { assertValidOrderTransition } from "../domain/order-state";
import { logAudit } from "./audit";
import { queueEmail } from "./email/outbox";
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
    // Conditional update: fails if the order changed since it was read (no lost updates).
    const gate = await tx.order.updateMany({ where: { id: orderId, status: order.status }, data: { status: toStatus } });
    if (gate.count !== 1) throw new Error("ORDER_CHANGED_CONCURRENTLY");

    const paid = await tx.payment.findFirst({ where: { orderId, status: PaymentStatus.SUCCESSFUL }, orderBy: { createdAt: "desc" } });
    if (toStatus === OrderStatus.REFUND_PENDING && paid) {
      const open = await tx.refund.findFirst({ where: { paymentId: paid.id, status: { in: [RefundStatus.REQUESTED, RefundStatus.PENDING_PROVIDER] } } });
      if (!open) {
        await tx.refund.create({ data: { paymentId: paid.id, amountCents: paid.amountCents, reason: reason || "Refund requested by SUPER_ADMIN", status: RefundStatus.REQUESTED, adminId: actor.adminId || null } });
      }
    }
    if (toStatus === OrderStatus.REFUNDED && paid) {
      await tx.refund.updateMany({ where: { paymentId: paid.id, status: { in: [RefundStatus.REQUESTED, RefundStatus.PENDING_PROVIDER] } }, data: { status: RefundStatus.COMPLETED, adminId: actor.adminId || null } });
      await tx.payment.update({ where: { id: paid.id }, data: { status: PaymentStatus.REFUNDED } });
    }

    // Customer notification for customer-visible milestones (never for internal tests).
    const NOTIFY: OrderStatus[] = [OrderStatus.DOCUMENTATION_REVIEW, OrderStatus.PREPARING, OrderStatus.TRANSPORT_SCHEDULED, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUND_PENDING, OrderStatus.REFUNDED];
    if (!order.isTest && NOTIFY.includes(toStatus)) {
      const customer = await tx.customer.findUnique({ where: { id: order.customerId } });
      if (customer) {
        await queueEmail(
          {
            idempotencyKey: `order:${orderId}:status:${toStatus}`,
            template: "order_status_update",
            locale: order.locale,
            toEmail: customer.email,
            payload: { customerName: customer.name, orderRef: order.reference, status: toStatus },
          },
          tx
        );
      }
    }

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

  if (order.isTest) {
    throw new Error("Manual payments cannot be recorded for internal test orders.");
  }
  const settleable: OrderStatus[] = [OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_PROCESSING, OrderStatus.CANCELLED];
  if (!settleable.includes(order.status)) {
    throw new Error(`Order status ${order.status} cannot receive a manual payment.`);
  }

  const animalId = order.item?.animalId;
  if (!animalId) {
    throw new Error("Order has no associated animal.");
  }

  await prisma.$transaction(async (tx) => {
    // 0. Never double-settle: no other successful payment may exist for this order.
    const alreadyPaid = await tx.payment.findFirst({
      where: { orderId: order.id, status: PaymentStatus.SUCCESSFUL },
    });
    if (alreadyPaid) {
      throw new Error("This order already has a successful payment.");
    }

    // 1. Ownership-checked sale: our own ACTIVE hold on a HELD animal, or a free animal.
    const reservation = await tx.reservation.findUnique({ where: { orderId: order.id } });
    let acquired = false;
    if (reservation?.status === ReservationStatus.ACTIVE && reservation.activeAnimalId === animalId) {
      acquired = (await tx.animal.updateMany({ where: { id: animalId, status: AnimalStatus.HELD }, data: { status: AnimalStatus.SOLD } })).count === 1;
    } else if (!reservation || reservation.status !== ReservationStatus.ACTIVE) {
      acquired = (await tx.animal.updateMany({ where: { id: animalId, status: AnimalStatus.AVAILABLE }, data: { status: AnimalStatus.SOLD } })).count === 1;
    }

    if (!acquired) {
      throw new Error("Cannot record manual payment: the animal is held by another order or already sold.");
    }

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
    // Delivered by the outbox worker after commit (never send from inside the transaction).
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
          trackingUrl,
        },
      },
      tx
    );

  });
}

import { OrderStatus } from "@prisma/client";

/**
 * Valid state transitions map for the Pawelium 2.0 Order State Machine.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAYMENT_PROCESSING", "PAID", "CANCELLED"],
  PAYMENT_PROCESSING: ["PAID", "PENDING_PAYMENT", "CANCELLED"],
  PAID: ["DOCUMENTATION_REVIEW", "REFUND_PENDING", "DISPUTED"],
  DOCUMENTATION_REVIEW: ["PREPARING", "REFUND_PENDING", "DISPUTED"],
  PREPARING: ["TRANSPORT_SCHEDULED", "REFUND_PENDING", "DISPUTED"],
  TRANSPORT_SCHEDULED: ["IN_TRANSIT", "REFUND_PENDING", "DISPUTED"],
  IN_TRANSIT: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  REFUND_PENDING: ["REFUNDED", "PAID"],
  REFUNDED: [],
  DISPUTED: ["REFUND_PENDING", "DOCUMENTATION_REVIEW", "PREPARING", "IN_TRANSIT", "DELIVERED", "COMPLETED"],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  const allowed = ALLOWED_TRANSITIONS[from];
  return !!allowed && allowed.includes(to);
}

export function assertValidOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Illegal order state transition from ${from} to ${to}`);
  }
}

/**
 * Helper to determine if an order state is pre-payment.
 */
export function isPrePayment(status: OrderStatus): boolean {
  return status === "PENDING_PAYMENT" || status === "PAYMENT_PROCESSING";
}

/**
 * Helper to determine if an order has been paid.
 */
export function isPostPayment(status: OrderStatus): boolean {
  return !isPrePayment(status) && status !== "CANCELLED";
}

/**
 * Maps a payment's raw state to an operational label the SUPER_ADMIN can act on, separating
 * gateway initialisation failures, card declines, cancellations, abandoned checkouts,
 * unresolved payments and payments that are paid but still waiting for their webhook.
 */
import { PaymentStatus } from "@prisma/client";

export type PaymentStateLabel =
  | "initializing"
  | "initFailed"
  | "pending"
  | "abandoned"
  | "processing"
  | "declined"
  | "cancelled"
  | "expired"
  | "review"
  | "paidAwaitingWebhook"
  | "paid"
  | "refundPending"
  | "refunded"
  | "partiallyRefunded";

export function derivePaymentStateLabel(
  p: { status: PaymentStatus; providerReference: string | null; createdAt: Date },
  opts: { processedWebhookCount: number; holdMinutes: number; now?: number }
): PaymentStateLabel {
  const now = opts.now ?? Date.now();
  switch (p.status) {
    case PaymentStatus.CREATED:
    case PaymentStatus.INITIALIZING:
      return "initializing";
    case PaymentStatus.PENDING:
      return now - p.createdAt.getTime() > opts.holdMinutes * 60_000 ? "abandoned" : "pending";
    case PaymentStatus.PROCESSING:
    case PaymentStatus.REQUIRES_ACTION:
      return "processing";
    case PaymentStatus.FAILED:
      return p.providerReference ? "declined" : "initFailed";
    case PaymentStatus.DECLINED:
      return "declined";
    case PaymentStatus.CANCELLED:
      return "cancelled";
    case PaymentStatus.EXPIRED:
      return "expired";
    case PaymentStatus.REQUIRES_RECONCILIATION:
      return "review";
    case PaymentStatus.SUCCESSFUL:
    case PaymentStatus.SUCCEEDED:
      return opts.processedWebhookCount > 0 ? "paid" : "paidAwaitingWebhook";
    case PaymentStatus.REFUND_PENDING:
      return "refundPending";
    case PaymentStatus.REFUNDED:
      return "refunded";
    case PaymentStatus.PARTIALLY_REFUNDED:
      return "partiallyRefunded";
    default:
      return "pending";
  }
}

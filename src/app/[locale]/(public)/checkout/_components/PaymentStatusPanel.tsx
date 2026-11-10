import React from "react";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, Clock, XCircle, ShieldAlert, Mail } from "lucide-react";
import { OrderStatus, PaymentStatus, ReservationStatus } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/db/client";
import { verifyOrderRefSignature } from "@/lib/security/order-link";
import { applyProviderStatus } from "@/lib/services/payments/settlement";
import { formatDateTime, isInFuture } from "@/lib/format";
import RetryPaymentButton from "./RetryPaymentButton";
import AutoRefresh from "./AutoRefresh";

type ViewState = "success" | "pending" | "processing" | "failed" | "cancelled" | "expired" | "review";

const PAID_OR_LATER: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.DOCUMENTATION_REVIEW,
  OrderStatus.PREPARING,
  OrderStatus.TRANSPORT_SCHEDULED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];

function toViewState(orderStatus: OrderStatus, paymentStatus: PaymentStatus | null): ViewState {
  if (PAID_OR_LATER.includes(orderStatus)) return "success";
  if (orderStatus === OrderStatus.DISPUTED || paymentStatus === PaymentStatus.REQUIRES_RECONCILIATION) return "review";
  switch (paymentStatus) {
    case PaymentStatus.PROCESSING:
    case PaymentStatus.REQUIRES_ACTION:
      return "processing";
    case PaymentStatus.FAILED:
    case PaymentStatus.DECLINED:
      return "failed";
    case PaymentStatus.CANCELLED:
      return "cancelled";
    case PaymentStatus.EXPIRED:
      return "expired";
    default:
      return "pending";
  }
}

/**
 * Read-only payment status view for the provider return/cancel redirects.
 * A redirect is never proof of payment: the status is re-fetched from the provider and
 * applied through the idempotent settlement service. Nothing is released from here.
 * Details are only shown with a valid signed link (prevents order-reference enumeration).
 */
export default async function PaymentStatusPanel({
  locale,
  orderRef,
  signature,
}: {
  locale: string;
  orderRef?: string;
  signature?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Confirmation" });

  const order =
    orderRef && verifyOrderRefSignature(orderRef, signature)
      ? await prisma.order.findUnique({
          where: { reference: orderRef },
          include: { reservation: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
        })
      : null;

  if (!order) {
    return (
      <Panel icon={<Mail className="h-10 w-10" />} tone="neutral" title={t("linkInvalidTitle")} subtitle={t("linkInvalidSubtitle")}>
        <Link href="/track-order" className="inline-flex px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm">
          {t("trackOrderBtn")}
        </Link>
      </Panel>
    );
  }

  let paymentStatus = order.payments[0]?.status ?? null;
  let orderStatus = order.status;
  const providerRef = order.payments[0]?.providerReference;
  if (providerRef) {
    try {
      const result = await applyProviderStatus(providerRef);
      paymentStatus = result.paymentStatus;
      orderStatus = result.orderStatus;
    } catch (err) {
      console.warn("[PaymentStatusPanel] provider status unavailable:", (err as Error).message);
    }
  }

  const state = toViewState(orderStatus, paymentStatus);
  const reservation = order.reservation;
  const holdActive = reservation?.status === ReservationStatus.ACTIVE && isInFuture(reservation.expiresAt);
  const openCheckoutUrl = state === "pending" && order.payments[0]?.checkoutUrl ? order.payments[0].checkoutUrl : null;

  const reference = (
    <div className="inline-block bg-[#F8F6F0] dark:bg-zinc-800 px-6 py-3 rounded-2xl border border-black/[0.04]">
      <span className="text-xs text-gray-500 uppercase font-semibold block">{t("orderRefLabel")}</span>
      <span className="font-mono text-xl font-bold text-[#183C32] dark:text-emerald-400">{order.reference}</span>
    </div>
  );

  if (state === "success") {
    return (
      <Panel icon={<CheckCircle2 className="h-10 w-10" />} tone="success" title={t("successTitle")} subtitle={t("successSubtitle")}>
        {reference}
        <p className="text-xs text-gray-500">{t("orderRefCopy")}</p>
        <Link
          href={{ pathname: "/track-order", query: { ref: order.reference } }}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-sm"
        >
          {t("trackOrderBtn")}
        </Link>
      </Panel>
    );
  }

  if (state === "pending" || state === "processing") {
    return (
      <Panel
        icon={<Clock className="h-10 w-10" />}
        tone="info"
        title={t(state === "pending" ? "pendingTitle" : "processingTitle")}
        subtitle={t(state === "pending" ? "pendingSubtitle" : "processingSubtitle")}
      >
        {reference}
        {openCheckoutUrl && (
          <a href={openCheckoutUrl} className="inline-flex px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm">
            {t("resumePaymentBtn")}
          </a>
        )}
        <AutoRefresh intervalMs={6000} maxRuns={20} />
      </Panel>
    );
  }

  if (state === "review") {
    return (
      <Panel icon={<ShieldAlert className="h-10 w-10" />} tone="warning" title={t("reviewTitle")} subtitle={t("reviewSubtitle")}>
        {reference}
      </Panel>
    );
  }

  const titles = { failed: "failedTitle", cancelled: "cancelledTitle", expired: "expiredTitle" } as const;
  const subtitles = { failed: "failedSubtitle", cancelled: "cancelledSubtitle", expired: "expiredSubtitle" } as const;
  return (
    <Panel icon={<XCircle className="h-10 w-10" />} tone="error" title={t(titles[state])} subtitle={t(subtitles[state])}>
      {reference}
      {holdActive && !order.isTest && signature ? (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("holdStillActive", { time: formatDateTime(reservation!.expiresAt, locale) })}
          </p>
          <RetryPaymentButton orderRef={order.reference} signature={signature} locale={locale} label={t("retryPaymentBtn")} />
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t("holdReleased")}</p>
          <Link href="/animals" className="inline-flex px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm">
            {t("browseCatalogBtn")}
          </Link>
        </>
      )}
    </Panel>
  );
}

function Panel({
  icon,
  tone,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  tone: "success" | "info" | "warning" | "error" | "neutral";
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  const toneClass = {
    success: "bg-emerald-50 text-emerald-700",
    info: "bg-blue-50 text-blue-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    neutral: "bg-zinc-100 text-zinc-600",
  }[tone];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 border border-black/[0.06] dark:border-zinc-800 shadow-sm text-center space-y-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${toneClass}`} aria-hidden="true">
          {icon}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed" role="status">
          {subtitle}
        </p>
        <div className="flex flex-col items-center gap-4">{children}</div>
      </div>
    </div>
  );
}

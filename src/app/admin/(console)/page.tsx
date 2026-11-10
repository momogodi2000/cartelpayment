import React from "react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { TrendingUp, ShoppingBag, Clock, AlertOctagon, ArrowRight, ShieldAlert, PawPrint, Headphones, CreditCard } from "lucide-react";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { formatDateTime } from "@/lib/format";
import ScopedIntl from "@/i18n/ScopedIntl";
import ExceptionResolveButton from "./ExceptionResolveButton";

export const dynamic = "force-dynamic";

const PAID_STATES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.DOCUMENTATION_REVIEW,
  OrderStatus.PREPARING,
  OrderStatus.TRANSPORT_SCHEDULED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];

export default async function AdminOverviewPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminDashboard"), getTranslations("AdminCommon"), getLocale()]);

  const realOrder = { isTest: false } as const;
  const [ordersCount, paidAgg, holds, exceptions, recent, payTotal, paySuccess, animalGroups, openTickets] = await Promise.all([
    prisma.order.count({ where: realOrder }),
    prisma.order.aggregate({ where: { ...realOrder, status: { in: PAID_STATES } }, _sum: { totalCents: true } }),
    prisma.reservation.count({ where: { status: "ACTIVE", order: realOrder } }),
    prisma.reconciliationException.findMany({
      where: { status: "OPEN" },
      include: { order: { select: { reference: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.order.findMany({
      where: realOrder,
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } }, item: { select: { animalName: true } } },
    }),
    prisma.payment.count({ where: { isTest: false, status: { notIn: [PaymentStatus.CREATED, PaymentStatus.INITIALIZING] } } }),
    prisma.payment.count({ where: { isTest: false, status: PaymentStatus.SUCCESSFUL } }),
    prisma.animal.groupBy({ by: ["status"], where: { isPaymentTest: false }, _count: { _all: true } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  const byStatus = (s: string) => animalGroups.find((g) => g.status === s)?._count._all ?? 0;
  const totalAnimals = animalGroups.reduce((n, g) => n + g._count._all, 0);
  const successRate = payTotal > 0 ? Math.round((paySuccess / payTotal) * 100) : null;

  const cards = [
    { icon: TrendingUp, label: t("revenue"), value: formatMoney(paidAgg._sum.totalCents ?? 0, "EUR", locale), hint: t("revenueHint") },
    { icon: ShoppingBag, label: t("orders"), value: String(ordersCount), hint: t("ordersHint") },
    { icon: Clock, label: t("holds"), value: String(holds), hint: t("holdsHint") },
    { icon: CreditCard, label: t("successRate"), value: successRate === null ? "—" : `${successRate} %`, hint: t("successRateHint", { successful: paySuccess, total: payTotal }) },
    { icon: PawPrint, label: t("animals"), value: String(totalAnimals), hint: t("animalsHint", { available: byStatus("AVAILABLE"), held: byStatus("HELD"), sold: byStatus("SOLD") }) },
    { icon: Headphones, label: t("tickets"), value: String(openTickets), hint: t("ticketsHint") },
    { icon: AlertOctagon, label: t("exceptions"), value: String(exceptions.length), hint: t("exceptionsHint"), alert: exceptions.length > 0 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="space-y-1.5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {c.label}
              <c.icon className={`h-4 w-4 ${c.alert ? "text-red-600" : "text-[#B69A65]"}`} aria-hidden="true" />
            </p>
            <p className={`text-3xl font-bold tabular-nums ${c.alert ? "text-red-600" : "text-zinc-900 dark:text-white"}`}>{c.value}</p>
            <p className="text-xs text-zinc-500">{c.hint}</p>
          </div>
        ))}
      </section>

      {exceptions.length > 0 && (
        <section className="space-y-4 rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-red-950 dark:text-red-100">{t("exceptionsTitle", { count: exceptions.length })}</h2>
              <p className="text-sm text-red-800 dark:text-red-200">{t("exceptionsBody")}</p>
            </div>
          </div>
          <ul className="divide-y divide-red-100 overflow-hidden rounded-2xl border border-red-200 bg-white text-sm dark:divide-red-900 dark:border-red-900 dark:bg-zinc-900">
            {exceptions.map((ex) => (
              <li key={ex.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                <div>
                  <span className="mr-2 rounded bg-red-100 px-2 py-0.5 font-mono text-xs font-bold text-red-700">{ex.kind}</span>
                  <span className="font-semibold">{t("exceptionOrder", { ref: ex.order?.reference ?? "—" })}</span>
                  {ex.notes && <p className="mt-1 text-zinc-600 dark:text-zinc-300">{ex.notes}</p>}
                </div>
                <ScopedIntl namespaces={["AdminPayments"]}>
                  <ExceptionResolveButton exceptionId={ex.id} />
                </ScopedIntl>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold">{t("recentOrders")}</h2>
            <p className="text-xs text-zinc-500">{t("recentOrdersHint")}</p>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183C32] hover:underline dark:text-emerald-400">
            {tc("viewAll")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("noOrders")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                <tr>
                  {(["colRef", "colCustomer", "colAnimal", "colTotal", "colStatus", "colCreated"] as const).map((k) => (
                    <th key={k} scope="col" className="px-4 py-2.5 font-semibold">{t(k)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-2.5 font-mono font-semibold">
                      <Link href={`/admin/orders?q=${encodeURIComponent(o.reference)}`} className="text-[#183C32] hover:underline dark:text-emerald-400">
                        {o.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block">{o.customer.name}</span>
                      <span className="block text-xs text-zinc-500">{o.customer.email}</span>
                    </td>
                    <td className="px-4 py-2.5">{o.item?.animalName ?? "—"}</td>
                    <td className="px-4 py-2.5 tabular-nums">{formatMoney(o.totalCents, o.currency, locale)}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-800">
                        {tc(`orderStatus.${o.status}`)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">{formatDateTime(o.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

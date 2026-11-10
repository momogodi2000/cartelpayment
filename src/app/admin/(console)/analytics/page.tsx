import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { PageHeader, DataTable, Td, Empty } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAID: OrderStatus[] = [OrderStatus.PAID, OrderStatus.DOCUMENTATION_REVIEW, OrderStatus.PREPARING, OrderStatus.TRANSPORT_SCHEDULED, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.COMPLETED];

export default async function AdminAnalyticsPage() {
  await requireSuperAdmin();
  const [t, locale] = await Promise.all([getTranslations("AdminAnalytics"), getLocale()]);

  const [orders, paidOrders, payTotal, paySuccess, attempts, customers] = await Promise.all([
    prisma.order.count({ where: { isTest: false } }),
    prisma.order.findMany({ where: { isTest: false, status: { in: PAID } }, select: { totalCents: true, createdAt: true } }),
    prisma.payment.count({ where: { isTest: false, status: { notIn: [PaymentStatus.CREATED, PaymentStatus.INITIALIZING] } } }),
    prisma.payment.count({ where: { isTest: false, status: PaymentStatus.SUCCESSFUL } }),
    prisma.paymentAttempt.groupBy({ by: ["gatewayId", "status"], where: { payment: { isTest: false } }, _count: { _all: true } }),
    prisma.customer.count({ where: { anonymizedAt: null } }),
  ]);

  const revenue = paidOrders.reduce((n, o) => n + o.totalCents, 0);
  const months = new Map<string, { orders: number; revenue: number }>();
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 7);
    const m = months.get(key) ?? { orders: 0, revenue: 0 };
    m.orders += 1;
    m.revenue += o.totalCents;
    months.set(key, m);
  }
  const monthRows = [...months.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);

  const gateways = new Map<string, { total: number; ok: number; failed: number }>();
  for (const a of attempts) {
    const g = gateways.get(a.gatewayId) ?? { total: 0, ok: 0, failed: 0 };
    g.total += a._count._all;
    if (a.status === "SUCCEEDED") g.ok += a._count._all;
    if (a.status === "FAILED_INIT") g.failed += a._count._all;
    gateways.set(a.gatewayId, g);
  }

  const cards: Array<[string, string]> = [
    [t("revenue"), formatMoney(revenue, "EUR", locale)],
    [t("paidOrders"), String(paidOrders.length)],
    [t("avgOrder"), paidOrders.length ? formatMoney(Math.round(revenue / paidOrders.length), "EUR", locale) : "—"],
    [t("conversion"), orders ? `${Math.round((paidOrders.length / orders) * 100)} %` : "—"],
    [t("successRate"), payTotal ? `${Math.round((paySuccess / payTotal) * 100)} %` : "—"],
    [t("customers"), String(customers)],
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold text-zinc-500">{label}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("monthlyTitle")}</h2>
        {monthRows.length === 0 ? <Empty>{t("empty")}</Empty> : (
          <DataTable columns={[t("monthCols.month"), t("monthCols.orders"), t("monthCols.revenue")]}>
            {monthRows.map(([m, v]) => (
              <tr key={m}><Td className="font-mono">{m}</Td><Td className="tabular-nums">{v.orders}</Td><Td className="tabular-nums">{formatMoney(v.revenue, "EUR", locale)}</Td></tr>
            ))}
          </DataTable>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("gatewayTitle")}</h2>
        {gateways.size === 0 ? <Empty>{t("empty")}</Empty> : (
          <DataTable columns={[t("gatewayCols.gateway"), t("gatewayCols.attempts"), t("gatewayCols.succeeded"), t("gatewayCols.failed"), t("gatewayCols.rate")]}>
            {[...gateways.entries()].map(([id, g]) => (
              <tr key={id}><Td className="font-mono">{id}</Td><Td className="tabular-nums">{g.total}</Td><Td className="tabular-nums">{g.ok}</Td><Td className="tabular-nums">{g.failed}</Td><Td className="tabular-nums">{Math.round((g.ok / g.total) * 100)} %</Td></tr>
            ))}
          </DataTable>
        )}
      </section>
    </div>
  );
}

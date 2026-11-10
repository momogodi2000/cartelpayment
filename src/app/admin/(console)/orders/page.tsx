import React from "react";
import Link from "next/link";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { OrderStatus, Prisma } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { formatDateTime } from "@/lib/format";
import { ALLOWED_TRANSITIONS } from "@/lib/domain/order-state";
import ScopedIntl from "@/i18n/ScopedIntl";
import OrderActionModal, { type OrderDialogData } from "./OrderActionModal";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

const filters = z.object({
  q: z.string().trim().max(120).optional().catch(undefined),
  status: z.nativeEnum(OrderStatus).optional().catch(undefined),
  type: z.enum(["real", "test"]).default("real").catch("real"),
  page: z.coerce.number().int().min(1).max(1000).default(1).catch(1),
});

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSuperAdmin();
  const f = filters.parse(await searchParams);
  const [t, tc, locale] = await Promise.all([getTranslations("AdminOrders"), getTranslations("AdminCommon"), getLocale()]);

  const where: Prisma.OrderWhereInput = {
    isTest: f.type === "test",
    ...(f.status ? { status: f.status } : {}),
    ...(f.q
      ? { OR: [{ reference: { contains: f.q } }, { customer: { name: { contains: f.q } } }, { customer: { email: { contains: f.q.toLowerCase() } } }] }
      : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: true,
        item: true,
        payments: { orderBy: { createdAt: "desc" } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (page: number) => `?${new URLSearchParams({ ...(f.q ? { q: f.q } : {}), ...(f.status ? { status: f.status } : {}), type: f.type, page: String(page) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
        <span className="rounded-xl bg-[#183C32] px-3 py-1.5 text-xs font-bold text-white">{t("count", { count: total })}</span>
      </header>

      <form method="get" className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm sm:grid-cols-[1fr_auto_auto_auto] dark:border-zinc-800 dark:bg-zinc-900">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("searchLabel")}</span>
          <input name="q" defaultValue={f.q} className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("statusLabel")}</span>
          <select name="status" defaultValue={f.status ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>{tc(`orderStatus.${s}`)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("typeLabel")}</span>
          <select name="type" defaultValue={f.type} className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="real">{t("typeReal")}</option>
            <option value="test">{t("typeTest")}</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded-lg bg-[#183C32] px-4 py-2 font-semibold text-white">{tc("apply")}</button>
          <Link href="/admin/orders" className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700">{tc("reset")}</Link>
        </div>
      </form>

      <section className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">{t("empty")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                {(["colRef", "colCustomer", "colAnimal", "colTotal", "colStatus", "colCreated", "colActions"] as const).map((k) => (
                  <th key={k} scope="col" className="px-4 py-2.5 font-semibold">{t(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {orders.map((o) => {
                const data: OrderDialogData = {
                  id: o.id,
                  reference: o.reference,
                  status: o.status,
                  statusLabel: tc(`orderStatus.${o.status}`),
                  isTest: o.isTest,
                  customer: { name: o.customer.name, email: o.customer.email, phone: o.customer.phone },
                  animalName: o.item?.animalName ?? "—",
                  breedName: o.item?.breedName ?? "—",
                  amounts: {
                    subtotal: formatMoney(o.subtotalCents, o.currency, locale),
                    transport: formatMoney(o.transportCents, o.currency, locale),
                    fees: formatMoney(o.feesCents, o.currency, locale),
                    tax: formatMoney(o.taxCents, o.currency, locale),
                    total: formatMoney(o.totalCents, o.currency, locale),
                  },
                  payments: o.payments.map((p) => ({ id: p.id, status: p.status, amount: formatMoney(p.amountCents, p.currency, locale), reference: p.providerReference, at: formatDateTime(p.createdAt, locale) })),
                  history: o.statusHistory.map((h) => ({ id: h.id, to: tc(`orderStatus.${h.toStatus}`), reason: h.reason, at: formatDateTime(h.createdAt, locale) })),
                  nextStatuses: (ALLOWED_TRANSITIONS[o.status] || []).filter((s) => s !== OrderStatus.PAID).map((s) => ({ value: s, label: tc(`orderStatus.${s}`) })),
                  canRecordManualPayment: !o.isTest && ([OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_PROCESSING, OrderStatus.CANCELLED] as OrderStatus[]).includes(o.status),
                };
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-2.5 font-mono font-semibold text-[#183C32] dark:text-emerald-400">
                      {o.reference}
                      {o.isTest && <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">{t("testBadge")}</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block font-medium">{o.customer.name}</span>
                      <span className="block text-xs text-zinc-500">{o.customer.email}</span>
                    </td>
                    <td className="px-4 py-2.5">{o.item?.animalName ?? "—"}</td>
                    <td className="px-4 py-2.5 tabular-nums">{formatMoney(o.totalCents, o.currency, locale)}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-800">{tc(`orderStatus.${o.status}`)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">{formatDateTime(o.createdAt, locale)}</td>
                    <td className="px-4 py-2.5">
                      <ScopedIntl namespaces={["AdminOrders", "AdminCommon"]}>
                        <OrderActionModal order={data} />
                      </ScopedIntl>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <nav aria-label={tc("pageOf", { page: f.page, pages })} className="flex items-center justify-between text-sm">
        {f.page > 1 ? <Link className="rounded-lg border px-3 py-1.5" href={link(f.page - 1)}>{tc("previous")}</Link> : <span />}
        <span className="text-zinc-500">{tc("pageOf", { page: f.page, pages })}</span>
        {f.page < pages ? <Link className="rounded-lg border px-3 py-1.5" href={link(f.page + 1)}>{tc("next")}</Link> : <span />}
      </nav>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { formatDate } from "@/lib/format";
import { actionAnonymizeCustomer } from "@/app/actions/admin";
import { PageHeader, DataTable, Td, Badge, Empty, Pagination } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;
const filters = z.object({ q: z.string().trim().max(120).optional().catch(undefined), page: z.coerce.number().int().min(1).max(1000).default(1).catch(1) });
const PAID = ["PAID", "DOCUMENTATION_REVIEW", "PREPARING", "TRANSPORT_SCHEDULED", "IN_TRANSIT", "DELIVERED", "COMPLETED"];

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSuperAdmin();
  const f = filters.parse(await searchParams);
  const [t, tc, locale] = await Promise.all([getTranslations("AdminCustomers"), getTranslations("AdminCommon"), getLocale()]);
  const where = f.q ? { OR: [{ name: { contains: f.q } }, { email: { contains: f.q.toLowerCase() } }] } : {};
  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { orders: { where: { isTest: false }, select: { status: true, totalCents: true } } },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const errors = { ORDER_IN_PROGRESS: t("anonymizeBlocked") };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Badge>{t("count", { count: total })}</Badge>
        <form method="get" className="flex gap-2 text-sm">
          <label className="sr-only" htmlFor="cust-q">{t("search")}</label>
          <input id="cust-q" name="q" defaultValue={f.q} placeholder={t("search")} className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" />
          <button className="rounded-lg bg-[#183C32] px-3 py-1.5 font-semibold text-white">{tc("search")}</button>
        </form>
      </PageHeader>
      {customers.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.customer"), t("cols.country"), t("cols.orders"), t("cols.spent"), t("cols.created"), t("cols.actions")]}>
          {customers.map((c) => {
            const spent = c.orders.filter((o) => PAID.includes(o.status)).reduce((n, o) => n + o.totalCents, 0);
            return (
              <tr key={c.id}>
                <Td>
                  <span className="block font-semibold">{c.name}</span>
                  <span className="block text-xs text-zinc-500">{c.email}</span>
                  {c.anonymizedAt && <Badge>{t("anonymized", { date: formatDate(c.anonymizedAt, locale) })}</Badge>}
                </Td>
                <Td>{c.country}</Td>
                <Td className="tabular-nums">
                  <Link className="text-[#183C32] hover:underline dark:text-emerald-400" href={`/admin/orders?q=${encodeURIComponent(c.email)}`}>{c.orders.length}</Link>
                </Td>
                <Td className="tabular-nums">{formatMoney(spent, "EUR", locale)}</Td>
                <Td className="whitespace-nowrap">{formatDate(c.createdAt, locale)}</Td>
                <Td>
                  {c.anonymizedAt ? (
                    "—"
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <a href={`/api/admin/customers/${c.id}/export`} className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700">
                        {t("export")}
                      </a>
                      <ActionButton action={actionAnonymizeCustomer.bind(null, c.id) as unknown as () => Promise<unknown>} label={t("anonymize")} confirmText={t("anonymizeConfirm")} errors={errors} fallbackError={tc("error")} />
                    </div>
                  )}
                </Td>
              </tr>
            );
          })}
        </DataTable>
      )}
      <Pagination
        page={f.page}
        pages={pages}
        href={(p) => `?${new URLSearchParams({ ...(f.q ? { q: f.q } : {}), page: String(p) })}`}
        labels={{ previous: tc("previous"), next: tc("next"), pageOf: tc("pageOf", { page: f.page, pages }) }}
      />
    </div>
  );
}

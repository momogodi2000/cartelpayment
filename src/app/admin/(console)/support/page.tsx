import React from "react";
import Link from "next/link";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { TicketStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDateTime } from "@/lib/format";
import { PageHeader, DataTable, Td, Badge, Empty, Pagination } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;
const filters = z.object({ status: z.nativeEnum(TicketStatus).optional().catch(undefined), page: z.coerce.number().int().min(1).max(1000).default(1).catch(1) });

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSuperAdmin();
  const f = filters.parse(await searchParams);
  const [t, tc, locale] = await Promise.all([getTranslations("AdminSupport"), getTranslations("AdminCommon"), getLocale()]);
  const where = f.status ? { status: f.status } : {};
  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (f.page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Badge>{t("count", { count: total })}</Badge>
        <form method="get" className="flex items-center gap-2 text-sm">
          <label className="sr-only" htmlFor="tk-status">{t("statusFilter")}</label>
          <select id="tk-status" name="status" defaultValue={f.status ?? ""} className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {Object.values(TicketStatus).map((s) => <option key={s} value={s}>{tc(`ticketStatus.${s}`)}</option>)}
          </select>
          <button className="rounded-lg bg-[#183C32] px-3 py-1.5 font-semibold text-white">{tc("apply")}</button>
        </form>
      </PageHeader>
      {tickets.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.ref"), t("cols.customer"), t("cols.subject"), t("cols.category"), t("cols.priority"), t("cols.status"), t("cols.updated")]}>
          {tickets.map((k) => (
            <tr key={k.id}>
              <Td className="font-mono font-semibold">
                <Link className="text-[#183C32] hover:underline dark:text-emerald-400" href={`/admin/support/${k.id}`}>{k.reference}</Link>
              </Td>
              <Td><span className="block">{k.name}</span><span className="block text-xs text-zinc-500">{k.customerEmail}</span></Td>
              <Td className="max-w-xs">{k.subject}</Td>
              <Td>{tc(`ticketCategory.${k.category}`)}</Td>
              <Td><Badge tone={k.priority === "URGENT" || k.priority === "HIGH" ? "danger" : "neutral"}>{tc(`ticketPriority.${k.priority}`)}</Badge></Td>
              <Td><Badge tone={k.status === "OPEN" || k.status === "IN_PROGRESS" ? "warning" : "success"}>{tc(`ticketStatus.${k.status}`)}</Badge></Td>
              <Td className="whitespace-nowrap">{formatDateTime(k.updatedAt, locale)}</Td>
            </tr>
          ))}
        </DataTable>
      )}
      <Pagination
        page={f.page}
        pages={pages}
        href={(p) => `?${new URLSearchParams({ ...(f.status ? { status: f.status } : {}), page: String(p) })}`}
        labels={{ previous: tc("previous"), next: tc("next"), pageOf: tc("pageOf", { page: f.page, pages }) }}
      />
    </div>
  );
}

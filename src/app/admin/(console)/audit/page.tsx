import React from "react";
import Link from "next/link";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDateTime } from "@/lib/format";
import { PageHeader, DataTable, Td, Empty, Pagination } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;
const filters = z.object({
  action: z.string().trim().max(60).optional().catch(undefined),
  entity: z.string().trim().max(60).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(2000).default(1).catch(1),
});

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSuperAdmin();
  const f = filters.parse(await searchParams);
  const [t, tc, locale] = await Promise.all([getTranslations("AdminAudit"), getTranslations("AdminCommon"), getLocale()]);
  const where = { ...(f.action ? { action: { contains: f.action.toUpperCase() } } : {}), ...(f.entity ? { entity: { contains: f.entity } } : {}) };
  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (f.page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { admin: { select: { email: true } } } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <form method="get" className="flex flex-wrap items-end gap-2 text-sm">
          <label className="flex flex-col gap-1"><span className="text-xs font-semibold text-zinc-500">{t("filters.action")}</span><input name="action" defaultValue={f.action} className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" /></label>
          <label className="flex flex-col gap-1"><span className="text-xs font-semibold text-zinc-500">{t("filters.entity")}</span><input name="entity" defaultValue={f.entity} className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" /></label>
          <button className="rounded-lg bg-[#183C32] px-3 py-1.5 font-semibold text-white">{tc("apply")}</button>
          <Link href="/admin/audit" className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">{tc("reset")}</Link>
        </form>
      </PageHeader>
      {logs.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.time"), t("cols.actor"), t("cols.action"), t("cols.entity"), t("cols.ip"), t("cols.details")]}>
          {logs.map((l) => (
            <tr key={l.id}>
              <Td className="whitespace-nowrap">{formatDateTime(l.createdAt, locale)}</Td>
              <Td>{l.admin?.email ?? t("system")}</Td>
              <Td className="font-mono text-xs">{l.action}</Td>
              <Td><span className="block">{l.entity}</span><span className="block font-mono text-xs text-zinc-500">{l.entityId ?? ""}</span></Td>
              <Td className="font-mono text-xs">{l.ip ?? "—"}</Td>
              <Td className="max-w-xs break-words font-mono text-xs text-zinc-600 dark:text-zinc-300">{l.diff ?? "—"}</Td>
            </tr>
          ))}
        </DataTable>
      )}
      <Pagination
        page={f.page}
        pages={pages}
        href={(p) => `?${new URLSearchParams({ ...(f.action ? { action: f.action } : {}), ...(f.entity ? { entity: f.entity } : {}), page: String(p) })}`}
        labels={{ previous: tc("previous"), next: tc("next"), pageOf: tc("pageOf", { page: f.page, pages }) }}
      />
    </div>
  );
}

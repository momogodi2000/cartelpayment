import React from "react";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { ReservationStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { formatDateTime } from "@/lib/format";
import { actionForceReleaseReservation } from "@/app/actions/admin";
import { PageHeader, DataTable, Td, Badge, Empty, Pagination } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;
const filters = z.object({
  status: z.nativeEnum(ReservationStatus).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).default(1).catch(1),
});

export default async function AdminReservationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSuperAdmin();
  const f = filters.parse(await searchParams);
  const [t, tc, locale] = await Promise.all([getTranslations("AdminReservations"), getTranslations("AdminCommon"), getLocale()]);
  const where = f.status ? { status: f.status } : {};
  const [total, activeCount, rows] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.count({ where: { status: ReservationStatus.ACTIVE } }),
    prisma.reservation.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        animal: { select: { name: true, priceCents: true, currency: true } },
        order: { select: { reference: true, isTest: true, customer: { select: { email: true, phone: true } } } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const errors = Object.fromEntries(["NOT_ACTIVE", "ALREADY_PAID", "PAYMENT_IN_PROGRESS", "PROVIDER_UNREACHABLE"].map((k) => [k, t(`errors.${k}`)]));

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Badge tone="warning">{t("active", { count: activeCount })}</Badge>
        <form method="get" className="flex items-center gap-2 text-sm">
          <label className="sr-only" htmlFor="res-status">{t("filterStatus")}</label>
          <select id="res-status" name="status" defaultValue={f.status ?? ""} className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {Object.values(ReservationStatus).map((s) => <option key={s} value={s}>{tc(`reservationStatus.${s}`)}</option>)}
          </select>
          <button className="rounded-lg bg-[#183C32] px-3 py-1.5 font-semibold text-white">{tc("apply")}</button>
        </form>
      </PageHeader>

      {rows.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.order"), t("cols.animal"), t("cols.customer"), t("cols.value"), t("cols.status"), t("cols.expires"), t("cols.actions")]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td className="font-mono font-semibold">
                {r.order.reference}
                {r.order.isTest && <span className="ml-2"><Badge tone="info">{t("testBadge")}</Badge></span>}
              </Td>
              <Td>{r.animal.name}</Td>
              <Td>
                <span className="block">{r.order.customer.email}</span>
                <span className="block text-xs text-zinc-500">{r.order.customer.phone}</span>
              </Td>
              <Td className="tabular-nums">{formatMoney(r.animal.priceCents, r.animal.currency, locale)}</Td>
              <Td>
                <Badge tone={r.status === "ACTIVE" ? "warning" : r.status === "CONVERTED" ? "success" : "neutral"}>{tc(`reservationStatus.${r.status}`)}</Badge>
              </Td>
              <Td className="whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                {r.releasedAt
                  ? t("released", { time: formatDateTime(r.releasedAt, locale) })
                  : r.status === "ACTIVE"
                    ? t("expires", { time: formatDateTime(r.expiresAt, locale) })
                    : t("expired", { time: formatDateTime(r.expiresAt, locale) })}
              </Td>
              <Td>
                {r.status === "ACTIVE" ? (
                  <ActionButton
                    action={actionForceReleaseReservation.bind(null, r.id)}
                    label={t("release")}
                    confirmText={t("releaseConfirm")}
                    errors={errors}
                    fallbackError={tc("error")}
                  />
                ) : (
                  "—"
                )}
              </Td>
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

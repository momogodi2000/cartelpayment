import React from "react";
import Link from "next/link";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimalStatus, Prisma, Species } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { PageHeader, Card, Empty } from "@/components/admin/ui";
import ScopedIntl from "@/i18n/ScopedIntl";
import InventoryBulkTable from "./InventoryBulkTable";

export const dynamic = "force-dynamic";

const filters = z.object({
  species: z.nativeEnum(Species).optional().catch(undefined),
  status: z.nativeEnum(AnimalStatus).optional().catch(undefined),
  breed: z.string().uuid().optional().catch(undefined),
});

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSuperAdmin();
  const f = filters.parse(await searchParams);
  const [t, tc, locale] = await Promise.all([getTranslations("AdminInventory"), getTranslations("AdminCommon"), getLocale()]);

  const base: Prisma.AnimalWhereInput = { isPaymentTest: false };
  const [groups, valueAvailable, valueSold, breeds, animals] = await Promise.all([
    prisma.animal.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
    prisma.animal.aggregate({ where: { ...base, status: AnimalStatus.AVAILABLE }, _sum: { priceCents: true } }),
    prisma.animal.aggregate({ where: { ...base, status: AnimalStatus.SOLD }, _sum: { priceCents: true } }),
    prisma.breed.findMany({ orderBy: { slug: "asc" }, select: { id: true, nameEn: true, nameFr: true } }),
    prisma.animal.findMany({
      where: { ...base, ...(f.species ? { species: f.species } : {}), ...(f.status ? { status: f.status } : {}), ...(f.breed ? { breedId: f.breed } : {}) },
      orderBy: { name: "asc" },
      take: 300,
      include: { breed: { select: { nameEn: true, nameFr: true } } },
    }),
  ]);
  const count = (s: string) => groups.find((g) => g.status === s)?._count._all ?? 0;
  const metrics = [
    ["total", String(groups.reduce((n, g) => n + g._count._all, 0))],
    ["available", String(count("AVAILABLE"))],
    ["held", String(count("HELD"))],
    ["sold", String(count("SOLD"))],
    ["unavailable", String(count("UNAVAILABLE"))],
    ["archived", String(count("ARCHIVED"))],
    ["availableValue", formatMoney(valueAvailable._sum.priceCents ?? 0, "EUR", locale)],
    ["soldValue", formatMoney(valueSold._sum.priceCents ?? 0, "EUR", locale)],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold text-zinc-500">{t(`metrics.${k}`)}</p>
            <p className="text-2xl font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </section>

      <form method="get" aria-label={t("filters")} className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <label className="flex flex-col gap-1"><span className="text-xs font-semibold text-zinc-500">{t("species")}</span>
          <select name="species" defaultValue={f.species ?? ""} className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {Object.values(Species).map((s) => <option key={s} value={s}>{tc(`species.${s}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1"><span className="text-xs font-semibold text-zinc-500">{t("status")}</span>
          <select name="status" defaultValue={f.status ?? ""} className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {Object.values(AnimalStatus).map((s) => <option key={s} value={s}>{tc(`animalStatus.${s}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1"><span className="text-xs font-semibold text-zinc-500">{t("breed")}</span>
          <select name="breed" defaultValue={f.breed ?? ""} className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {breeds.map((b) => <option key={b.id} value={b.id}>{locale === "fr" ? b.nameFr : b.nameEn}</option>)}
          </select>
        </label>
        <button className="rounded-lg bg-[#183C32] px-3 py-1.5 font-semibold text-white">{tc("apply")}</button>
        <Link href="/admin/inventory" className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">{tc("reset")}</Link>
      </form>

      <Card>
        {animals.length === 0 ? (
          <Empty>{t("empty")}</Empty>
        ) : (
          <ScopedIntl namespaces={["AdminInventory", "AdminCommon"]}>
            <InventoryBulkTable
              rows={animals.map((a) => ({
                id: a.id,
                name: a.name,
                href: `/admin/animals/${a.id}`,
                breed: locale === "fr" ? a.breed.nameFr : a.breed.nameEn,
                status: a.status,
                price: formatMoney(a.priceCents, a.currency, locale),
                published: a.published,
              }))}
            />
          </ScopedIntl>
        )}
      </Card>
    </div>
  );
}

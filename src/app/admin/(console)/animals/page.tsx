import React from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimalStatus, Prisma, Species } from "@prisma/client";
import { Plus, Edit } from "lucide-react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import ScopedIntl from "@/i18n/ScopedIntl";
import AnimalStatusSelect from "./AnimalStatusToggle";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

const filters = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  species: z.nativeEnum(Species).optional().catch(undefined),
  status: z.nativeEnum(AnimalStatus).optional().catch(undefined),
  visibility: z.enum(["published", "unpublished"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(500).default(1).catch(1),
});

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  HELD: "bg-amber-100 text-amber-800",
  SOLD: "bg-red-100 text-red-800",
  UNAVAILABLE: "bg-zinc-200 text-zinc-800",
  ARCHIVED: "bg-zinc-100 text-zinc-600",
};

export default async function AdminAnimalsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSuperAdmin();
  const f = filters.parse(await searchParams);
  const [t, tc, locale] = await Promise.all([getTranslations("AdminAnimals"), getTranslations("AdminCommon"), getLocale()]);

  const where: Prisma.AnimalWhereInput = {
    ...(f.q ? { OR: [{ name: { contains: f.q } }, { slug: { contains: f.q.toLowerCase() } }] } : {}),
    ...(f.species ? { species: f.species } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.visibility ? { published: f.visibility === "published" } : {}),
  };
  const [total, animals] = await Promise.all([
    prisma.animal.count({ where }),
    prisma.animal.findMany({
      where,
      orderBy: [{ isPaymentTest: "asc" }, { createdAt: "desc" }],
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { breed: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (page: number) =>
    `?${new URLSearchParams({ ...(f.q ? { q: f.q } : {}), ...(f.species ? { species: f.species } : {}), ...(f.status ? { status: f.status } : {}), ...(f.visibility ? { visibility: f.visibility } : {}), page: String(page) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{t("count", { count: total })}</span>
          <Link href="/admin/animals/new" className="inline-flex items-center gap-1.5 rounded-xl bg-[#183C32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12302A]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("add")}
          </Link>
        </div>
      </header>

      <form method="get" className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto] dark:border-zinc-800 dark:bg-zinc-900">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("search")}</span>
          <input name="q" defaultValue={f.q} className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("species")}</span>
          <select name="species" defaultValue={f.species ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {Object.values(Species).map((s) => <option key={s} value={s}>{tc(`species.${s}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("status")}</span>
          <select name="status" defaultValue={f.status ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            {Object.values(AnimalStatus).map((s) => <option key={s} value={s}>{tc(`animalStatus.${s}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("visibility")}</span>
          <select name="visibility" defaultValue={f.visibility ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{tc("all")}</option>
            <option value="published">{tc("published")}</option>
            <option value="unpublished">{tc("unpublished")}</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded-lg bg-[#183C32] px-4 py-2 font-semibold text-white">{tc("apply")}</button>
          <Link href="/admin/animals" className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700">{tc("reset")}</Link>
        </div>
      </form>

      <section className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {animals.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">{t("empty")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                {(["colPhoto", "colName", "colSpecies", "colPrice", "colLocation", "colStatus", "colActions"] as const).map((k) => (
                  <th key={k} scope="col" className="px-4 py-2.5 font-semibold">{t(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {animals.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-zinc-100">
                      {a.images[0]?.url && <Image src={a.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="block font-semibold">{a.name}</span>
                    <span className="block text-xs text-[#8C7343]">{locale === "fr" ? a.breed.nameFr : a.breed.nameEn}</span>
                    {a.isPaymentTest && <span className="mt-0.5 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">{t("testBadge")}</span>}
                    {!a.published && !a.isPaymentTest && <span className="mt-0.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600">{tc("unpublished")}</span>}
                  </td>
                  <td className="px-4 py-2">{tc(`species.${a.species}`)}</td>
                  <td className="px-4 py-2 tabular-nums">{formatMoney(a.priceCents, a.currency, locale)}</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">{[a.city, a.country].filter(Boolean).join(", ")}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[a.status]}`}>{tc(`animalStatus.${a.status}`)}</span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/animals/${a.id}`} className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                        <Edit className="h-3 w-3" aria-hidden="true" />
                        {t("edit")}
                      </Link>
                      <ScopedIntl namespaces={["AdminAnimals", "AdminCommon"]}>
                        <AnimalStatusSelect animalId={a.id} status={a.status} />
                      </ScopedIntl>
                    </div>
                  </td>
                </tr>
              ))}
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

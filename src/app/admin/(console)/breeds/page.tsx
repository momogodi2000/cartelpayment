import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Species } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { actionSaveBreed, actionDeleteBreed } from "@/app/actions/admin-ops";
import { PageHeader, Card, DataTable, Td, Badge, Empty, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";

export default async function AdminBreedsPage() {
  await requireSuperAdmin();
  const [t, tc] = await Promise.all([getTranslations("AdminBreeds"), getTranslations("AdminCommon"), getLocale()]);
  const breeds = await prisma.breed.findMany({ orderBy: { slug: "asc" }, include: { _count: { select: { animals: true } } } });
  const errors = Object.fromEntries(["VALIDATION", "SLUG_TAKEN", "BREED_IN_USE"].map((k) => [k, t(`errors.${k}`)]));

  const form = (b?: (typeof breeds)[number]) => (
    <AdminForm action={actionSaveBreed} submitLabel={t("save")} savingLabel={t("saving")} savedText={t("saved")} errors={errors} fallbackError={tc("error")} resetOnSuccess={!b} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={b?.id ?? ""} />
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("slug")}</span><input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={b?.slug} className={`${fieldClass} font-mono`} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("species")}</span>
        <select name="species" defaultValue={b?.species ?? "DOG"} className={fieldClass}>
          {Object.values(Species).map((s) => <option key={s} value={s}>{tc(`species.${s}`)}</option>)}
        </select>
      </label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("nameEn")}</span><input name="nameEn" required lang="en" defaultValue={b?.nameEn} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("nameFr")}</span><input name="nameFr" required lang="fr" defaultValue={b?.nameFr} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("descriptionEn")}</span><textarea name="descriptionEn" rows={3} lang="en" defaultValue={b?.descriptionEn} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("descriptionFr")}</span><textarea name="descriptionFr" rows={3} lang="fr" defaultValue={b?.descriptionFr} className={fieldClass} /></label>
    </AdminForm>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Badge>{t("count", { count: breeds.length })}</Badge>
      </PageHeader>
      <Card>
        <details>
          <summary className="cursor-pointer font-semibold text-[#183C32] dark:text-emerald-400">{t("add")}</summary>
          <div className="mt-4">{form()}</div>
        </details>
      </Card>
      {breeds.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.name"), t("cols.slug"), t("cols.species"), t("cols.animals"), t("cols.actions")]}>
          {breeds.map((b) => (
            <tr key={b.id}>
              <Td><span className="block font-semibold">{b.nameEn}</span><span className="block text-xs text-zinc-500">{b.nameFr}</span></Td>
              <Td className="font-mono text-xs">{b.slug}</Td>
              <Td>{tc(`species.${b.species}`)}</Td>
              <Td className="tabular-nums">{b._count.animals}</Td>
              <Td>
                <details>
                  <summary className="cursor-pointer text-xs font-semibold">{tc("edit")}</summary>
                  <div className="mt-3 w-[min(90vw,40rem)]">{form(b)}</div>
                </details>
                {b._count.animals === 0 && (
                  <div className="mt-2">
                    <ActionButton action={actionDeleteBreed.bind(null, b.id)} label={t("delete")} confirmText={t("deleteConfirm")} errors={errors} fallbackError={tc("error")} />
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}

import React from "react";
import { getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { actionSaveSeo } from "@/app/actions/admin-content";
import { PageHeader, Card, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  await requireSuperAdmin();
  const t = await getTranslations("AdminSeo");
  const tc = await getTranslations("AdminCommon");
  const row = await prisma.siteSetting.findUnique({ where: { key: "seo_metadata" } });
  let v: { siteTitle?: string; siteDescription?: string; ogImage?: string } = {};
  try {
    v = row ? JSON.parse(row.value) : {};
  } catch {
    v = {};
  }
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Card>
        <AdminForm action={actionSaveSeo} submitLabel={t("save")} savingLabel={t("saving")} savedText={t("saved")} errors={{ VALIDATION: t("errors.VALIDATION") }} fallbackError={tc("error")}>
          <label className="block text-sm"><span className="mb-1 block font-semibold">{t("siteTitle")}</span><input name="siteTitle" maxLength={70} defaultValue={v.siteTitle} className={fieldClass} /></label>
          <label className="block text-sm"><span className="mb-1 block font-semibold">{t("siteDescription")}</span><input name="siteDescription" maxLength={170} defaultValue={v.siteDescription} className={fieldClass} /></label>
          <label className="block text-sm"><span className="mb-1 block font-semibold">{t("ogImage")}</span><input name="ogImage" maxLength={300} defaultValue={v.ogImage} className={fieldClass} /></label>
        </AdminForm>
      </Card>
      <Card>
        <h2 className="font-serif text-lg font-bold">{t("indexingTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t("indexingBody")}</p>
      </Card>
    </div>
  );
}

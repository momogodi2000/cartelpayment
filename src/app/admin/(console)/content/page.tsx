import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDate } from "@/lib/format";
import { actionSaveContentBlock, actionDeleteContentBlock } from "@/app/actions/admin-content";
import { PageHeader, Card, DataTable, Td, Empty, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminContent"), getTranslations("AdminCommon"), getLocale()]);
  const blocks = await prisma.contentBlock.findMany({ orderBy: [{ key: "asc" }, { locale: "asc" }] });
  const errors = { VALIDATION: t("errors.VALIDATION") };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Card>
        <h2 className="mb-3 font-serif text-xl font-bold">{t("add")}</h2>
        <AdminForm action={actionSaveContentBlock} submitLabel={t("save")} savingLabel={t("saving")} savedText={t("saved")} errors={errors} fallbackError={tc("error")} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("key")}</span><input name="key" required pattern="[a-z0-9_.\-]{2,80}" aria-describedby="key-help" className={`${fieldClass} font-mono`} /><span id="key-help" className="text-xs text-zinc-500">{t("keyHelp")}</span></label>
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("locale")}</span>
            <select name="locale" className={fieldClass}><option value="en">English</option><option value="fr">Français</option></select></label>
          <label className="text-sm sm:col-span-2"><span className="mb-1 block font-semibold">{t("titleField")}</span><input name="title" maxLength={200} className={fieldClass} /></label>
          <label className="text-sm sm:col-span-2"><span className="mb-1 block font-semibold">{t("content")}</span><textarea name="content" rows={5} required maxLength={20000} className={fieldClass} /></label>
        </AdminForm>
      </Card>
      {blocks.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.key"), t("cols.locale"), t("cols.preview"), t("cols.updated"), t("cols.actions")]}>
          {blocks.map((b) => (
            <tr key={b.id}>
              <Td className="font-mono text-xs">{b.key}</Td>
              <Td>{b.locale.toUpperCase()}</Td>
              <Td className="max-w-md truncate">{b.title ? <strong>{b.title} — </strong> : null}{b.content.slice(0, 140)}</Td>
              <Td className="whitespace-nowrap">{formatDate(b.updatedAt, locale)}</Td>
              <Td><ActionButton action={actionDeleteContentBlock.bind(null, b.id) as unknown as () => Promise<unknown>} label={t("delete")} confirmText={t("deleteConfirm")} fallbackError={tc("error")} /></Td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}

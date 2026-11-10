import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDate } from "@/lib/format";
import { NAMESPACES, namespaceLoaders } from "@/i18n/namespaces";
import { actionSaveTranslationOverride, actionDeleteTranslationOverride } from "@/app/actions/admin-content";
import { PageHeader, Card, DataTable, Td, Badge, Empty, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";

function countLeaves(v: unknown): number {
  if (v && typeof v === "object") return Object.values(v as Record<string, unknown>).reduce<number>((n, x) => n + countLeaves(x), 0);
  return 1;
}

export default async function AdminTranslationsPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminTranslations"), getTranslations("AdminCommon"), getLocale()]);

  const parity = await Promise.all(
    NAMESPACES.map(async (ns) => {
      const [en, fr] = await Promise.all([namespaceLoaders[ns].en(), namespaceLoaders[ns].fr()]);
      return { ns, en: countLeaves(en.default), fr: countLeaves(fr.default) };
    })
  );
  const overrides = await prisma.translationOverride.findMany({ orderBy: [{ namespace: "asc" }, { key: "asc" }], take: 300 });
  const overridable = NAMESPACES.filter((n) => /^(public|marketplace|checkout|customer)\//.test(n) || n === "common");
  const errors = { VALIDATION: t("errors.VALIDATION") };

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("parityTitle")}</h2>
        <DataTable columns={[t("parityCols.namespace"), t("parityCols.en"), t("parityCols.fr"), t("parityCols.status")]}>
          {parity.map((p) => (
            <tr key={p.ns}>
              <Td className="font-mono text-xs">{p.ns}</Td>
              <Td className="tabular-nums">{p.en}</Td>
              <Td className="tabular-nums">{p.fr}</Td>
              <Td><Badge tone={p.en === p.fr ? "success" : "danger"}>{p.en === p.fr ? t("parityOk") : t("parityDiff")}</Badge></Td>
            </tr>
          ))}
        </DataTable>
      </section>

      <Card>
        <h2 className="mb-3 font-serif text-xl font-bold">{t("overrideTitle")}</h2>
        <AdminForm action={actionSaveTranslationOverride} submitLabel={t("save")} savingLabel={t("saving")} savedText={t("saved")} errors={errors} fallbackError={tc("error")} resetOnSuccess className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("locale")}</span>
            <select name="locale" className={fieldClass}><option value="en">English</option><option value="fr">Français</option></select></label>
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("namespace")}</span>
            <select name="namespace" className={fieldClass}>{overridable.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label className="text-sm sm:col-span-2"><span className="mb-1 block font-semibold">{t("key")}</span><input name="key" required pattern="[A-Za-z0-9_.]{1,160}" className={`${fieldClass} font-mono`} /></label>
          <label className="text-sm sm:col-span-2"><span className="mb-1 block font-semibold">{t("value")}</span><textarea name="value" rows={3} required maxLength={2000} className={fieldClass} /></label>
        </AdminForm>
      </Card>

      {overrides.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.locale"), t("cols.namespace"), t("cols.key"), t("cols.value"), t("cols.updated"), t("cols.actions")]}>
          {overrides.map((o) => (
            <tr key={o.id}>
              <Td>{o.locale.toUpperCase()}</Td>
              <Td className="font-mono text-xs">{o.namespace}</Td>
              <Td className="font-mono text-xs">{o.key}</Td>
              <Td className="max-w-sm">{o.value}</Td>
              <Td className="whitespace-nowrap">{formatDate(o.updatedAt, locale)}</Td>
              <Td><ActionButton action={actionDeleteTranslationOverride.bind(null, o.id) as unknown as () => Promise<unknown>} label={t("delete")} confirmText={t("deleteConfirm")} fallbackError={tc("error")} /></Td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}

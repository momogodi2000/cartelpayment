import React from "react";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, XCircle } from "lucide-react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { isMediaConfigured } from "@/lib/services/media";
import { actionSaveSettings } from "@/app/actions/admin-content";
import { PageHeader, Card, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";

export const dynamic = "force-dynamic";

const readJson = (v?: string) => {
  try {
    return v ? (JSON.parse(v) as string) : "";
  } catch {
    return "";
  }
};

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const [t, tc] = await Promise.all([getTranslations("AdminSettings"), getTranslations("AdminCommon")]);
  const env = getEnv();
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ["concierge_phone", "business_siren"] } } });
  const val = (k: string) => readJson(rows.find((r) => r.key === k)?.value);

  const status: Array<[string, boolean]> = [
    ["payments", Boolean(env.GENIUSPAY_API_KEY && env.GENIUSPAY_API_SECRET)],
    ["webhook", Boolean(env.GENIUSPAY_WEBHOOK_SECRET)],
    ["email", Boolean(env.RESEND_API_KEY)],
    ["media", isMediaConfigured()],
    ["database", Boolean(env.DATABASE_URL)],
    ["cron", env.CRON_SECRET.length >= 16 && !env.CRON_SECRET.startsWith("dev-only")],
    ["encryption", !env.ENCRYPTION_KEY.startsWith("dev-only")],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Card>
        <h2 className="mb-3 font-serif text-xl font-bold">{t("businessTitle")}</h2>
        <AdminForm action={actionSaveSettings} submitLabel={t("save")} savingLabel={t("saving")} savedText={t("saved")} errors={{ VALIDATION: t("errors.VALIDATION") }} fallbackError={tc("error")} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("phone")}</span><input name="concierge_phone" maxLength={40} defaultValue={val("concierge_phone")} className={fieldClass} /></label>
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("siren")}</span><input name="business_siren" maxLength={60} defaultValue={val("business_siren")} aria-describedby="siren-help" className={fieldClass} /><span id="siren-help" className="text-xs text-zinc-500">{t("sirenHelp")}</span></label>
        </AdminForm>
      </Card>
      <Card>
        <h2 className="mb-3 font-serif text-xl font-bold">{t("statusTitle")}</h2>
        <ul className="space-y-1.5 text-sm">
          {status.map(([k, ok]) => (
            <li key={k} className="flex items-center gap-2">
              {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />}
              <span>{t(`items.${k}`)}</span>
              <span className={`text-xs font-semibold ${ok ? "text-emerald-700" : "text-red-700"}`}>{ok ? t("configured") : t("missing")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{t("environment", { env: env.GENIUSPAY_ENVIRONMENT })}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("hold", { minutes: env.HOLD_MINUTES })}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("gatewaysNote")}</p>
      </Card>
    </div>
  );
}

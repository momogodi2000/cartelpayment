import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSuperAdmin, adminListSessions } from "@/lib/services/admin-auth";
import { formatDateTime, isInFuture } from "@/lib/format";
import ScopedIntl from "@/i18n/ScopedIntl";
import AccountSecurityClient from "./AccountSecurityClient";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const { admin, session: current } = await requireSuperAdmin();
  const [t, locale, sessions] = await Promise.all([getTranslations("AdminAccount"), getLocale(), adminListSessions(admin.id)]);

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{t("subtitle")}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">{admin.name}</p>
          <p className="text-zinc-500">{admin.email}</p>
          <p className="text-xs font-bold text-[#183C32] dark:text-emerald-400 mt-0.5">{t("role")}</p>
        </div>
      </header>

      {admin.mustChangePassword && (
        <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p className="font-semibold">{t("mustChangeTitle")}</p>
          <p className="text-sm mt-1">{t("mustChangeBody")}</p>
        </div>
      )}

      <ScopedIntl namespaces={["AdminAccount"]}>
        <AccountSecurityClient
          totpEnabled={admin.totpEnabled}
          passwordChangedAt={admin.passwordChangedAt ? formatDateTime(admin.passwordChangedAt, locale) : null}
          sessions={sessions.map((s) => ({
            id: s.id,
            device: s.userAgent || null,
            ip: s.ip || null,
            createdAt: formatDateTime(s.createdAt, locale),
            lastSeenAt: formatDateTime(s.lastSeenAt, locale),
            expiresAt: formatDateTime(s.expiresAt, locale),
            state: s.revokedAt ? "revoked" : isInFuture(s.expiresAt) ? "active" : "expired",
            isCurrent: s.id === current.id,
          }))}
        />
      </ScopedIntl>
    </div>
  );
}

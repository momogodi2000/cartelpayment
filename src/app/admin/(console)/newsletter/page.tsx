import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDate } from "@/lib/format";
import { actionSetSubscriberStatus } from "@/app/actions/admin-content";
import { PageHeader, DataTable, Td, Badge, Empty } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminNewsletter"), getTranslations("AdminCommon"), getLocale()]);
  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Badge>{t("count", { count: subs.length })}</Badge>
        {/* File download: a plain anchor is required (not client navigation). */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/newsletter/export" className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-700">
          <Download className="h-4 w-4" aria-hidden="true" />
          {t("export")}
        </a>
      </PageHeader>
      {subs.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.email"), t("cols.locale"), t("cols.status"), t("cols.created"), t("cols.actions")]}>
          {subs.map((s) => (
            <tr key={s.id}>
              <Td>{s.email}</Td>
              <Td>{s.locale.toUpperCase()}</Td>
              <Td><Badge tone={s.status === "CONFIRMED" ? "success" : s.status === "UNSUBSCRIBED" ? "neutral" : "warning"}>{tc(`newsletterStatus.${s.status}`)}</Badge></Td>
              <Td className="whitespace-nowrap">{formatDate(s.createdAt, locale)}</Td>
              <Td>
                <div className="flex gap-2">
                  {s.status !== "UNSUBSCRIBED" && <ActionButton action={actionSetSubscriberStatus.bind(null, s.id, "UNSUBSCRIBED") as unknown as () => Promise<unknown>} label={t("unsubscribe")} confirmText={t("unsubscribeConfirm")} fallbackError={tc("error")} />}
                  <ActionButton action={actionSetSubscriberStatus.bind(null, s.id, "DELETE") as unknown as () => Promise<unknown>} label={t("delete")} confirmText={t("deleteConfirm")} fallbackError={tc("error")} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}

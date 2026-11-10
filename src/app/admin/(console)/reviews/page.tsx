import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDate } from "@/lib/format";
import { actionModerateReview } from "@/app/actions/admin-content";
import { PageHeader, DataTable, Td, Badge, Empty } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminReviews"), getTranslations("AdminCommon"), getLocale()]);
  const reviews = await prisma.review.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 });
  const errors = { NOT_VERIFIED_PURCHASE: t("errors.NOT_VERIFIED_PURCHASE"), NOT_FOUND: t("errors.NOT_FOUND") };
  const act = (id: string, status: "APPROVED" | "REJECTED" | "PENDING", label: string) => (
    <ActionButton action={actionModerateReview.bind(null, id, status) as unknown as () => Promise<unknown>} label={label} errors={errors} fallbackError={tc("error")} />
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {reviews.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.author"), t("cols.rating"), t("cols.body"), t("cols.status"), t("cols.created"), t("cols.actions")]}>
          {reviews.map((r) => (
            <tr key={r.id}>
              <Td>
                <span className="block font-semibold">{r.author}</span>
                <span className="block text-xs text-zinc-500">{r.verifiedPurchase ? t("verified") : t("notVerified")}</span>
              </Td>
              <Td className="whitespace-nowrap">
                <span aria-label={`${r.rating}/5`}>{"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}</span>
              </Td>
              <Td className="max-w-md">{r.body}</Td>
              <Td><Badge tone={r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "danger" : "warning"}>{tc(`reviewStatus.${r.status}`)}</Badge></Td>
              <Td className="whitespace-nowrap">{formatDate(r.createdAt, locale)}</Td>
              <Td>
                <div className="flex flex-col gap-1.5">
                  {r.status !== "APPROVED" && act(r.id, "APPROVED", t("approve"))}
                  {r.status !== "REJECTED" && act(r.id, "REJECTED", t("reject"))}
                  {r.status !== "PENDING" && act(r.id, "PENDING", t("reopen"))}
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}

import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { formatDateTime } from "@/lib/format";
import { actionUpdateRefund } from "@/app/actions/admin";
import { PageHeader, DataTable, Td, Badge, Empty } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminRefunds"), getTranslations("AdminCommon"), getLocale()]);
  const refunds = await prisma.refund.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { payment: { include: { order: { select: { reference: true, customer: { select: { name: true, email: true } } } } } } },
  });
  const open = refunds.filter((r) => r.status === "REQUESTED" || r.status === "PENDING_PROVIDER").length;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        {open > 0 && <Badge tone="warning">{t("open", { count: open })}</Badge>}
      </PageHeader>
      {refunds.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <DataTable columns={[t("cols.created"), t("cols.order"), t("cols.customer"), t("cols.amount"), t("cols.reason"), t("cols.status"), t("cols.providerRef"), t("cols.actions")]}>
          {refunds.map((r) => {
            const isOpen = r.status === "REQUESTED" || r.status === "PENDING_PROVIDER";
            return (
              <tr key={r.id}>
                <Td className="whitespace-nowrap">{formatDateTime(r.createdAt, locale)}</Td>
                <Td className="font-mono font-semibold">{r.payment.order.reference}</Td>
                <Td>
                  <span className="block">{r.payment.order.customer.name}</span>
                  <span className="block text-xs text-zinc-500">{r.payment.order.customer.email}</span>
                </Td>
                <Td className="tabular-nums">{formatMoney(r.amountCents, r.payment.currency, locale)}</Td>
                <Td className="max-w-xs">{r.reason}</Td>
                <Td>
                  <Badge tone={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "danger" : "warning"}>{tc(`refundStatus.${r.status}`)}</Badge>
                </Td>
                <Td className="font-mono text-xs">{r.providerRef ?? "—"}</Td>
                <Td>
                  {isOpen ? (
                    <div className="flex flex-col gap-1.5">
                      {r.status === "REQUESTED" && (
                        <ActionButton action={actionUpdateRefund.bind(null, r.id, "submitted")} label={t("markSubmitted")} promptText={t("providerRefPrompt")} fallbackError={t("failedAction")} />
                      )}
                      <ActionButton action={actionUpdateRefund.bind(null, r.id, "completed")} label={t("markCompleted")} promptText={t("providerRefPrompt")} fallbackError={t("failedAction")} />
                      <ActionButton action={actionUpdateRefund.bind(null, r.id, "failed")} label={t("markFailed")} promptText={t("providerRefPrompt")} fallbackError={t("failedAction")} />
                    </div>
                  ) : (
                    "—"
                  )}
                </Td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}

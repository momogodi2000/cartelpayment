import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { getTicketForAdmin } from "@/lib/services/support";
import { formatDateTime } from "@/lib/format";
import { actionAdminReplyTicket, actionUpdateTicket } from "@/app/actions/admin-content";
import { PageHeader, Card, Badge, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";

export const dynamic = "force-dynamic";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const ticket = await getTicketForAdmin(id);
  if (!ticket) notFound();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminSupport"), getTranslations("AdminCommon"), getLocale()]);
  const errors = { VALIDATION: t("errors.VALIDATION"), NOT_FOUND: t("errors.NOT_FOUND") };

  async function update(fd: FormData) {
    "use server";
    return actionUpdateTicket(id, { status: String(fd.get("status")), priority: String(fd.get("priority")) });
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/support" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("back")}
      </Link>
      <PageHeader
        title={`${ticket.reference} — ${ticket.subject}`}
        subtitle={`${ticket.name} · ${ticket.customerEmail} · ${tc(`ticketCategory.${ticket.category}`)} · ${t("opened", { date: formatDateTime(ticket.createdAt, locale) })}`}
      >
        <Badge>{ticket.order ? t("order", { ref: ticket.order.reference }) : t("noOrder")}</Badge>
      </PageHeader>

      <Card>
        <AdminForm action={update} submitLabel={t("update")} savingLabel={t("sending")} savedText={t("updated")} fallbackError={tc("error")} className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-semibold">{t("status")}</span>
            <select name="status" defaultValue={ticket.status} className={fieldClass}>
              {Object.values(TicketStatus).map((s) => <option key={s} value={s}>{tc(`ticketStatus.${s}`)}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">{t("priority")}</span>
            <select name="priority" defaultValue={ticket.priority} className={fieldClass}>
              {Object.values(TicketPriority).map((s) => <option key={s} value={s}>{tc(`ticketPriority.${s}`)}</option>)}
            </select>
          </label>
        </AdminForm>
      </Card>

      <section aria-labelledby="conv" className="space-y-3">
        <h2 id="conv" className="font-serif text-xl font-bold">{t("conversation")}</h2>
        <ul className="space-y-3">
          {ticket.messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border p-4 text-sm ${
                m.isInternalNote
                  ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                  : m.authorType === "ADMIN"
                    ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span className="font-semibold">
                  {m.authorType === "ADMIN" ? m.admin?.name || t("you") : t("customerLabel")}
                  {m.isInternalNote && <span className="ml-2 text-amber-800">{t("internalBadge")}</span>}
                </span>
                <span>{formatDateTime(m.createdAt, locale)}</span>
              </div>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <Card>
        <h2 className="mb-3 font-serif text-xl font-bold">{t("replyTitle")}</h2>
        <AdminForm action={actionAdminReplyTicket} submitLabel={t("send")} savingLabel={t("sending")} savedText={t("sent")} errors={errors} fallbackError={tc("error")} resetOnSuccess>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">{t("body")}</span>
            <textarea name="body" rows={5} required maxLength={5000} className={fieldClass} />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isInternalNote" />
            {t("internal")}
          </label>
        </AdminForm>
      </Card>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDate } from "@/lib/format";
import AdminTicketReplyForm from "../AdminTicketReplyForm";
import { ArrowLeft, Headphones, Mail, Clock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketDetailPage({ params }: PageProps) {
  await requireSuperAdmin();
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { admin: true },
      },
      order: true,
    },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Support Tickets</span>
      </Link>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#183C32] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                {ticket.reference}
              </span>
              <span className="text-xs font-bold text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                {ticket.status}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">
                {ticket.category}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
              {ticket.subject}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              From: <strong>{ticket.name}</strong> &lt;{ticket.customerEmail}&gt;
            </p>
          </div>

          <div className="text-right text-xs text-zinc-400">
            <div>Opened: {formatDate(ticket.createdAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true })}</div>
            {ticket.order && (
              <div className="mt-1 font-mono text-[11px] text-[#183C32] dark:text-emerald-400 font-bold">
                Order: {ticket.order.reference}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {ticket.messages.map((m) => {
            const isInternal = m.isInternalNote;
            const isAdmin = m.authorType === "ADMIN";

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl text-xs space-y-1.5 border ${
                  isInternal
                    ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-950 dark:text-amber-200"
                    : isAdmin
                    ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 ml-6"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 mr-6"
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="uppercase tracking-wider text-[10px]">
                    {isInternal
                      ? "🔒 Internal Note (Hidden from Customer)"
                      : isAdmin
                      ? `Staff Reply (${m.admin?.name || "Admin"})`
                      : `Customer (${ticket.name})`}
                  </span>
                  <span className="text-zinc-400 font-normal text-[10px]">
                    {formatDate(m.createdAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
              </div>
            );
          })}
        </div>

        {/* Reply form */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <AdminTicketReplyForm ticketId={ticket.id} />
        </div>
      </div>
    </div>
  );
}

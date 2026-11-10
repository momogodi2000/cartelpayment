import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { Headphones, MessageSquare, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/format";
import AdminTicketReplyForm from "./AdminTicketReplyForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ ticketId?: string; status?: string }>;
}

export default async function AdminSupportPage({ searchParams }: PageProps) {
  await requireSuperAdmin();
  const { ticketId, status } = await searchParams;

  const where: any = {};
  if (status) where.status = status;

  const [tickets, selectedTicket] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    ticketId
      ? prisma.supportTicket.findUnique({
          where: { id: ticketId },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              include: { admin: { select: { name: true } } },
            },
          },
        })
      : null,
  ]);

  const active = selectedTicket || tickets[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">
            Customer Support & Concierge Tickets
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Handle inquiries, send client replies, and record internal confidential staff notes.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#183C32] text-white text-xs font-bold">
          {tickets.length} Active Tickets
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden divide-y divide-zinc-100 max-h-[750px] overflow-y-auto">
          {tickets.map((t) => (
            <a
              key={t.id}
              href={`/admin/support?ticketId=${t.id}`}
              className={`p-4 block transition-colors ${
                active?.id === t.id ? "bg-emerald-50/70 border-l-4 border-[#183C32]" : "hover:bg-zinc-50"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[11px] font-bold text-[#183C32]">
                  {t.reference}
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  {t.category}
                </span>
              </div>
              <h4 className="font-bold text-zinc-900 text-sm truncate">{t.subject}</h4>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {t.name} ({t.customerEmail})
              </p>
              <div className="flex justify-between items-center mt-2 text-[10px] text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold">
                  {t.status}
                </span>
                <span>{formatDate(t.createdAt, "en-GB", { timeZone: "Europe/Paris" })}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Selected Ticket Thread Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-6">
          {active ? (
            <>
              <div className="border-b border-zinc-200 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs font-bold text-[#183C32] bg-emerald-50 px-2 py-0.5 rounded">
                    {active.reference}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 uppercase">
                    {active.status}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-zinc-900">
                  {active.subject}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  From: <strong>{active.name}</strong> &lt;{active.customerEmail}&gt;
                </p>
              </div>

              {/* Thread */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {active.messages.map((m: any) => {
                  const isInternal = m.isInternalNote;
                  const isAdmin = m.authorType === "ADMIN";

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl text-xs space-y-1.5 border ${
                        isInternal
                          ? "bg-amber-50/80 border-amber-200 text-amber-950"
                          : isAdmin
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950 ml-6"
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 mr-6"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className="uppercase tracking-wider text-[10px]">
                          {isInternal
                            ? "🔒 Internal Note (Hidden from Customer)"
                            : isAdmin
                            ? `Staff Reply (${m.admin?.name || "Admin"})`
                            : `Customer (${active.name})`}
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

              {/* Reply Form */}
              <div className="pt-4 border-t border-zinc-200">
                <AdminTicketReplyForm ticketId={active.id} />
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-zinc-400 text-sm">
              No tickets selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

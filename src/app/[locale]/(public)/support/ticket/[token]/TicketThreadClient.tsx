"use client";

import React, { useState } from "react";
import { actionReplyCustomerTicket } from "@/app/actions/support";
import { Send, Loader2, ShieldCheck, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/format";

interface Props {
  ticket: any;
  accessToken: string;
  locale: string;
}

export default function TicketThreadClient({ ticket, accessToken, locale }: Props) {
  const t = useTranslations("Support");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState(ticket.messages || []);
  const [error, setError] = useState<string | null>(null);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setError(null);
    setSubmitting(true);

    const res = await actionReplyCustomerTicket(accessToken, replyText);
    setSubmitting(false);

    if (res.success) {
      setMessages((prev: any[]) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          authorType: "CUSTOMER",
          body: replyText,
          createdAt: new Date().toISOString(),
        },
      ]);
      setReplyText("");
    } else {
      setError(res.error || "An error occurred.");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-black/[0.06] dark:border-zinc-800 shadow-sm space-y-6">
      {/* Ticket Header */}
      <div className="border-b border-black/[0.06] dark:border-zinc-800 pb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs font-bold text-[#183C32] dark:text-emerald-400 bg-[#183C32]/10 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
            {ticket.reference}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#B69A65]">
            {ticket.status}
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {ticket.subject}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {ticket.name} ({ticket.customerEmail})
        </p>
      </div>

      {/* Messages Thread */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {messages.map((m: any) => {
          const isCustomer = m.authorType === "CUSTOMER";
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isCustomer ? "justify-end" : "justify-start"}`}
            >
              {!isCustomer && (
                <div className="w-8 h-8 rounded-full bg-[#183C32] text-white flex items-center justify-center shrink-0 mt-1">
                  <ShieldCheck className="h-4 w-4 text-[#B69A65]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  isCustomer
                    ? "bg-[#183C32] text-white rounded-tr-none shadow-sm"
                    : "bg-[#F8F6F0] dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-black/[0.04] dark:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-center gap-4 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isCustomer ? t("authorYou") : t("authorTeam")}
                  </span>
                  <span className="text-[10px] opacity-60">
                    {formatDateTime(m.createdAt, locale)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
              </div>
              {isCustomer && (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply Box */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleReply} className="pt-4 border-t border-black/[0.06] dark:border-zinc-800 space-y-3">
        <textarea
          rows={3}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={t("replyPlaceholder")}
          required
          className="w-full px-4 py-3 rounded-2xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !replyText.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#183C32] text-white font-bold text-xs hover:bg-[#183C32]/90 shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-[#B69A65]" />}
            <span>{submitting ? t("sendingReplyBtn") : t("sendReplyBtn")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { actionReplyCustomerTicket } from "@/app/actions/support";
import { Send, Loader2, User, ShieldCheck } from "lucide-react";

interface Props {
  ticket: any;
  accessToken: string;
  locale: string;
}

export default function TicketThreadClient({ ticket, accessToken, locale }: Props) {
  const isEn = locale === "en";
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
      setError(res.error || "Erreur lors de l'envoi du message.");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-6">
      {/* Ticket Header */}
      <div className="border-b border-black/[0.06] pb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-xs font-bold text-[#183C32] dark:text-emerald-400 bg-[#183C32]/10 px-2.5 py-1 rounded-md">
            {ticket.reference}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {ticket.status}
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
          {ticket.subject}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {isEn ? "Adopter:" : "Demandeur :"} {ticket.name} ({ticket.customerEmail})
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
                <div className="w-8 h-8 rounded-full bg-[#183C32] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  isCustomer
                    ? "bg-[#183C32] text-white rounded-tr-none"
                    : "bg-[#F8F6F0] dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-black/[0.04]"
                }`}
              >
                <div className="flex justify-between items-center gap-4 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isCustomer ? (isEn ? "You" : "Vous") : (isEn ? "Pawelium Concierge" : "Conciergerie Pawelium")}
                  </span>
                  <span className="text-[10px] opacity-60">
                    {new Date(m.createdAt).toLocaleDateString(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
              </div>
              {isCustomer && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply Input */}
      <form onSubmit={handleReply} className="pt-4 border-t border-black/[0.06] space-y-3">
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <div className="flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isEn ? "Write a reply to the concierge..." : "Répondre à la conciergerie..."}
            className="flex-1 px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
          <button
            type="submit"
            disabled={submitting || !replyText.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#183C32] text-white font-bold text-sm flex items-center gap-1.5 hover:bg-[#183C32]/90 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">{isEn ? "Send" : "Envoyer"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

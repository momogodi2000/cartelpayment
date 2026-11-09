"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { actionCreateSupportTicket } from "@/app/actions/support";
import { Link } from "@/i18n/routing";

export default function ContactFormClient({ locale }: { locale: string }) {
  const t = useTranslations("Contact");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketRef: string;
    accessToken: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("category", "GENERAL");
    formData.set("locale", locale);

    startTransition(async () => {
      const res = await actionCreateSupportTicket(formData);
      if (res.success && res.ticketRef && res.accessToken) {
        setSubmittedTicket({ ticketRef: res.ticketRef, accessToken: res.accessToken });
      } else {
        setError(res.error || "Failed to submit message.");
      }
    });
  };

  if (submittedTicket) {
    return (
      <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold font-heading text-text-premium">{t("successTitle")}</h3>
        <p className="text-sm text-text-premium/70 max-w-md mx-auto leading-relaxed">
          {t("successBody", { ref: submittedTicket.ticketRef })}
        </p>
        <div className="pt-2">
          <Link
            href={{
              pathname: "/support/ticket/[token]",
              params: { token: submittedTicket.accessToken },
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-sm"
          >
            {t("faqLink")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-heading text-text-premium">{t("formTitle")}</h2>
        <p className="text-sm text-text-premium/60 leading-relaxed">{t("formDesc")}</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-3 text-xs text-danger font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-premium/80 uppercase tracking-wider block">
              {t("nameLabel")}
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-premium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-premium/80 uppercase tracking-wider block">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-premium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-premium/80 uppercase tracking-wider block">
            {t("subjectLabel")}
          </label>
          <input
            type="text"
            name="subject"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-premium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-premium/80 uppercase tracking-wider block">
            {t("messageLabel")}
          </label>
          <textarea
            name="message"
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-premium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <Send className="h-4 w-4" />
          <span>{isPending ? t("sendingBtn") : t("sendBtn")}</span>
        </button>
      </form>
    </div>
  );
}

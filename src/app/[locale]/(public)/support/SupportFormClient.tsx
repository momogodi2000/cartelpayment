"use client";

import React, { useState } from "react";
import { actionCreateSupportTicket } from "@/app/actions/support";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface Props {
  locale: string;
}

export default function SupportFormClient({ locale }: Props) {
  const t = useTranslations("Support");
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ ticketRef: string; accessToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("locale", locale);

    const res = await actionCreateSupportTicket(formData);
    setLoading(false);

    if (res.success && res.ticketRef && res.accessToken) {
      setCreatedResult({ ticketRef: res.ticketRef, accessToken: res.accessToken });
    } else {
      setError(res.error || "An error occurred.");
    }
  };

  if (createdResult) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-[#B69A65]" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t("successTitle")}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
          {t("successSubtitle")}
        </p>
        <div className="inline-block bg-[#F8F6F0] dark:bg-zinc-800 px-8 py-4 rounded-2xl border border-black/[0.04]">
          <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
            {t("ticketRefLabel")}
          </span>
          <span className="font-mono text-xl font-bold text-[#183C32] dark:text-emerald-400">
            {createdResult.ticketRef}
          </span>
        </div>
        <div className="pt-2">
          <Link
            href={{ pathname: "/support/ticket/[token]", params: { token: createdResult.accessToken } }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-xs shadow-md hover:bg-[#183C32]/90 transition-colors"
          >
            {t("openThreadBtn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {t("nameLabel")} *
          </label>
          <input
            name="name"
            required
            placeholder={t("namePlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {t("emailLabel")} *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {t("categoryLabel")} *
          </label>
          <select
            name="category"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32] bg-white"
          >
            <option value="GENERAL">{t("catGeneral")}</option>
            <option value="ORDER">{t("catOrder")}</option>
            <option value="TRANSPORT">{t("catTransport")}</option>
            <option value="HEALTH">{t("catHealth")}</option>
            <option value="BREEDER">{t("catBreeder")}</option>
            <option value="OTHER">{t("catOther")}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {t("orderRefLabel")}
          </label>
          <input
            name="orderRef"
            placeholder={t("orderRefPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32] font-mono uppercase"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
          {t("subjectLabel")} *
        </label>
        <input
          name="subject"
          required
          placeholder={t("subjectPlaceholder")}
          className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
          {t("messageLabel")} *
        </label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder={t("messagePlaceholder")}
          className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-sm hover:bg-[#183C32]/90 shadow-md transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        <span>{loading ? t("submittingBtn") : t("submitBtn")}</span>
      </button>
    </form>
  );
}

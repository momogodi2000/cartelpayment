import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SupportFormClient from "./SupportFormClient";
import { Headphones, Mail, MessageSquare } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("supportTitle"),
    description: tMeta("supportDescription"),
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Support");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#183C32]/10 dark:bg-emerald-950/40 text-[#183C32] dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
          <Headphones className="h-4 w-4 text-[#B69A65]" />
          <span>{t("title")}</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Support Ticket Form */}
        <div className="md:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-black/[0.06] dark:border-zinc-800 shadow-sm">
          <SupportFormClient locale={locale} />
        </div>

        {/* Sidebar Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-[#F8F6F0] dark:bg-zinc-800/60 rounded-3xl p-6 sm:p-8 border border-black/[0.04] dark:border-zinc-700 space-y-4">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="pt-4 border-t border-black/[0.06] dark:border-zinc-700 space-y-3 text-xs">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Mail className="h-4 w-4 text-[#B69A65]" />
                <span>contact@pawelium.fyi</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                <MessageSquare className="h-4 w-4" />
                <span>+33 6 41 32 53 28</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

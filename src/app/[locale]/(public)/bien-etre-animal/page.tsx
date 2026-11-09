import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeartHandshake, ShieldCheck, Award, Stethoscope, Home, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("welfareTitle"),
    description: tMeta("welfareDescription"),
  };
}

export default async function AnimalWelfarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Welfare");

  const pillars = [
    {
      icon: Award,
      title: t("pillars.pedigreeTitle"),
      desc: t("pillars.pedigreeDesc"),
    },
    {
      icon: Stethoscope,
      title: t("pillars.vetTitle"),
      desc: t("pillars.vetDesc"),
    },
    {
      icon: Home,
      title: t("pillars.familyTitle"),
      desc: t("pillars.familyDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("pillars.weaningTitle"),
      desc: t("pillars.weaningDesc"),
    },
  ];

  return (
    <div className="bg-[#F8F6F0] dark:bg-zinc-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#183C32]/10 dark:bg-emerald-950/40 text-[#183C32] dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <HeartHandshake className="w-4 h-4 text-[#B69A65]" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#183C32] dark:text-white font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="h-1 w-20 bg-[#B69A65] mx-auto rounded-full" />
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-[#EDE7DC] dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-[#183C32]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#183C32]/10 dark:bg-emerald-950/60 text-[#183C32] dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 text-[#B69A65]" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#202823] dark:text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Audits & Standards Deep Dive */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-[#EDE7DC] dark:border-zinc-800 shadow-sm p-8 sm:p-12 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B69A65]">
              <Sparkles className="w-4 h-4" />
              <span>{t("audits.title")}</span>
            </div>
            <h2 className="text-3xl font-serif text-[#183C32] dark:text-white font-bold">
              {t("audits.title")}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("audits.p1")}
            </p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("audits.p2")}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F6F0] dark:bg-zinc-800/60 border border-[#EDE7DC] dark:border-zinc-700 space-y-3">
            <h4 className="font-serif font-bold text-lg text-[#183C32] dark:text-emerald-400">
              {t("transport.title")}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("transport.desc")}
            </p>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="rounded-3xl bg-[#183C32] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              {t("ctaTitle")}
            </h3>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              {t("ctaSubtitle")}
            </p>
            <div className="pt-2">
              <Link
                href="/animals"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#B69A65] text-white font-bold text-sm hover:bg-[#B69A65]/90 shadow-md transition-all hover:scale-105"
              >
                <span>{t("ctaButton")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

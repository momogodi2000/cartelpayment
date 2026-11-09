import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, CreditCard, Truck, Scale, Lock, Clock, FileCheck } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("termsTitle"),
    description: tMeta("termsDescription"),
  };
}

export default async function TermsOfSalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Terms");

  return (
    <div className="bg-[#F8F6F0] dark:bg-zinc-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-[#EDE7DC] dark:border-zinc-800 p-8 sm:p-14 space-y-10">
        {/* Header */}
        <div className="border-b border-[#EDE7DC] dark:border-zinc-800 pb-8 text-center sm:text-left space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#B69A65] font-bold">
            {t("badge")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183C32] dark:text-white font-bold">
            {t("title")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#183C32] dark:text-emerald-400 flex items-center gap-3">
              <Scale className="w-5 h-5 text-[#B69A65] shrink-0" />
              <span>{t("s1Title")}</span>
            </h2>
            <p>{t("s1Text")}</p>
          </section>

          {/* Section 2: Full Payment Policy */}
          <section className="space-y-3 bg-[#F8F6F0] dark:bg-zinc-800/60 p-6 sm:p-8 rounded-2xl border border-[#EDE7DC] dark:border-zinc-700">
            <h2 className="text-xl font-serif font-bold text-[#183C32] dark:text-emerald-400 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#B69A65] shrink-0" />
              <span>{t("s2Title")}</span>
            </h2>
            <p className="font-medium text-gray-900 dark:text-white leading-relaxed">
              {t("s2Text")}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#183C32] dark:text-emerald-400">
              <Lock className="w-4 h-4 text-[#B69A65]" />
              <span>3D-Secure • GeniusPay PCI-DSS • EUR Only</span>
            </div>
          </section>

          {/* Section 3: Hold Reservation */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#183C32] dark:text-emerald-400 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#B69A65] shrink-0" />
              <span>{t("s3Title")}</span>
            </h2>
            <p>{t("s3Text")}</p>
          </section>

          {/* Section 4: Veterinary Guarantee */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#183C32] dark:text-emerald-400 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#B69A65] shrink-0" />
              <span>{t("s4Title")}</span>
            </h2>
            <p>{t("s4Text")}</p>
          </section>

          {/* Section 5: Transport */}
          <section className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#183C32] dark:text-emerald-400 flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#B69A65] shrink-0" />
              <span>{t("s5Title")}</span>
            </h2>
            <p>{t("s5Text")}</p>
          </section>

          {/* Section 6: Law */}
          <section className="space-y-3 pt-4 border-t border-[#EDE7DC] dark:border-zinc-800">
            <h2 className="text-xl font-serif font-bold text-[#183C32] dark:text-emerald-400 flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-[#B69A65] shrink-0" />
              <span>{t("s6Title")}</span>
            </h2>
            <p>{t("s6Text")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

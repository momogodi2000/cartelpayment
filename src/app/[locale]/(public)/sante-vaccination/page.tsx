import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Syringe, Shield, FileCheck, AlertTriangle, Info, CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { getWhatsAppLink } from "@/data/site";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("healthTitle"),
    description: t("healthDescription"),
    alternates: {
      canonical: locale === "fr" ? "/sante-vaccination" : "/en/sante-vaccination",
      languages: { "fr-FR": "/sante-vaccination", "en-GB": "/en/sante-vaccination", "x-default": "/sante-vaccination" },
    },
  };
}

export default async function SanteVaccinationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Health");
  const whatsappUrl = getWhatsAppLink(t("whatsappMessage"));

  const euCards = [
    { icon: Shield, title: t("chipTitle"), content: t("chipDesc") },
    { icon: Syringe, title: t("rabiesTitle"), content: t("rabiesDesc") },
    { icon: FileCheck, title: t("passportTitle"), content: t("passportDesc") },
    { icon: Info, title: t("certTitle"), content: t("certDesc") },
  ];

  const registries = [
    { country: "France", registry: "LOF — Livre des Origines Françaises", body: "Société Centrale Canine (SCC) — FCI" },
    { country: "Deutschland", registry: "VDH — Verband für das Deutsche Hundewesen", body: "FCI-affiliated" },
    { country: "Belgique", registry: "LOSH — Livre des Origines Saint-Hubert", body: "Union Royale Cynologique Saint-Hubert" },
    { country: "Nederland", registry: "NHSB — Nederlands Hondenstamboek", body: "Raad van Beheer" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
          <Syringe className="h-4 w-4" />
          {t("badge")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">{t("title")}</h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">{t("intro")}</p>
        <div className="h-1 w-16 bg-emerald-600 mx-auto rounded-full" />
      </div>

      <section className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <FileCheck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-heading text-text-premium">{t("euTitle")}</h2>
            <p className="text-text-premium/60 text-sm mt-1">{t("euSource")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {euCards.map(({ icon: Icon, title, content }) => (
            <div
              key={title}
              className="p-5 rounded-2xl border bg-white dark:bg-black/20 border-black/[0.05] dark:border-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-sm text-text-premium">{title}</h3>
              </div>
              <p className="text-xs text-text-premium/70 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            <Syringe className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-heading text-text-premium">{t("wsavaTitle")}</h2>
            <p className="text-text-premium/60 text-sm mt-1">{t("wsavaSource")}</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-4">
          <h3 className="font-extrabold text-text-premium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            {t("coreTitle")}
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white dark:bg-black/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="font-bold text-sm text-text-premium mb-1">{t("dhppiName")}</div>
              <ul className="text-xs text-text-premium/70 space-y-1 list-disc list-inside">
                <li>{t("dhppi1")}</li>
                <li>{t("dhppi2")}</li>
                <li>{t("dhppi3")}</li>
                <li>{t("dhppi4")}</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-black/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="font-bold text-sm text-text-premium mb-1">{t("rabiesCoreName")}</div>
              <ul className="text-xs text-text-premium/70 space-y-1 list-disc list-inside">
                <li>{t("rabiesCore1")}</li>
                <li>{t("rabiesCore2")}</li>
                <li>{t("rabiesCore3")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-4">
          <h3 className="font-extrabold text-text-premium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {t("nonCoreTitle")}
          </h3>
          <div className="p-4 rounded-xl bg-white dark:bg-black/20 border border-amber-100 dark:border-amber-900/30">
            <div className="font-bold text-sm text-text-premium mb-1">{t("leptoName")}</div>
            <ul className="text-xs text-text-premium/70 space-y-1 list-disc list-inside">
              <li>{t("lepto1")}</li>
              <li>{t("lepto2")}</li>
              <li>{t("lepto3")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black font-heading text-text-premium flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          {t("pedigreeTitle")}
        </h2>
        <div className="p-6 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {registries.map(({ country, registry, body }) => (
              <div key={country} className="p-4 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]">
                <div className="font-extrabold text-sm text-text-premium">{country}</div>
                <div className="text-xs font-semibold text-primary mt-1">{registry}</div>
                <div className="text-xs text-text-premium/50 mt-0.5">{body}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-text-premium/70 leading-relaxed">{t("fciNote")}</p>
          </div>
        </div>
      </section>

      <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-5">
        <h2 className="text-2xl font-black font-heading text-text-premium">{t("ctaTitle")}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" />
            {t("ctaWhatsapp")}
          </a>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-text-premium text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02] hover:bg-text-premium/90"
          >
            {t("ctaCatalogue")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

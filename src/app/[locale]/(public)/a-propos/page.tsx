import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, Heart, FileText, MessageCircle, Award, MapPin, Clock, Star } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
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
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    alternates: {
      canonical: locale === "fr" ? "/a-propos" : "/en/a-propos",
      languages: { "fr-FR": "/a-propos", "en-GB": "/en/a-propos", "x-default": "/a-propos" },
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const whatsappUrl = getWhatsAppLink(t("whatsappMessage"));

  const values = [
    { icon: ShieldCheck, title: t("values.selectionTitle"), desc: t("values.selectionDesc") },
    { icon: Heart, title: t("values.welfareTitle"), desc: t("values.welfareDesc") },
    { icon: FileText, title: t("values.transparencyTitle"), desc: t("values.transparencyDesc") },
    { icon: MessageCircle, title: t("values.supportTitle"), desc: t("values.supportDesc") },
  ];

  const timeline = [
    { year: "2018", label: t("timeline.t2018Label"), desc: t("timeline.t2018Desc") },
    { year: "2020", label: t("timeline.t2020Label"), desc: t("timeline.t2020Desc") },
    { year: "2022", label: t("timeline.t2022Label"), desc: t("timeline.t2022Desc") },
    { year: "2024", label: t("timeline.t2024Label"), desc: t("timeline.t2024Desc") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-widest">
          <Award className="h-4 w-4" />
          {t("badge")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">{t("title")}</h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed">{t("subtitle")}</p>
        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Star className="h-3.5 w-3.5" />
            {t("founderBadge")}
          </div>
          <h2 className="text-3xl font-black font-heading text-text-premium">{t("founderName")}</h2>
          <div className="space-y-3 text-sm text-text-premium/70 leading-relaxed">
            <p>{t("founderP1")}</p>
            <p>{t("founderP2")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-extrabold text-text-premium text-sm">{t("experience")}</span>
              </div>
              <p className="text-xs text-text-premium/60">{t("experienceLabel")}</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-extrabold text-text-premium text-sm">{t("locationCity")}</span>
              </div>
              <p className="text-xs text-text-premium/60">{t("locationAddress")}</p>
            </div>
          </div>
        </div>

        <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-primary/5 border border-primary/10">
          <Image
            src="/logo.jpg"
            alt={`CaniPrestige — ${t("founderName")}`}
            fill
            className="object-contain p-12"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      <div className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium">{t("journeyTitle")}</h2>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
        </div>
        <div className="space-y-6 relative before:absolute before:left-[2.25rem] before:top-0 before:h-full before:w-0.5 before:bg-primary/20">
          {timeline.map(({ year, label, desc }) => (
            <div key={year} className="flex gap-6 items-start pl-2">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
                <span className="text-xs font-extrabold text-primary">{year}</span>
              </div>
              <div className="pt-3 space-y-1">
                <h3 className="font-extrabold text-text-premium">{label}</h3>
                <p className="text-sm text-text-premium/60 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium">{t("valuesTitle")}</h2>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-7 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 space-y-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-extrabold text-text-premium">{title}</h3>
              <p className="text-sm text-text-premium/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-6 p-10 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/10">
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-text-premium">{t("ctaTitle")}</h2>
        <p className="text-text-premium/60 text-sm leading-relaxed max-w-lg mx-auto">{t("ctaSubtitle")}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" />
            {t("contactTheodore")}
          </a>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-primary text-primary font-extrabold text-sm transition-all hover:bg-primary hover:text-white hover:scale-[1.02]"
          >
            {t("viewCatalogue")}
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Truck, MapPin, FileCheck, Shield, Info, CheckCircle2, MessageCircle, AlertTriangle } from "lucide-react";
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
    title: t("deliveryTitle"),
    description: t("deliveryDescription"),
    alternates: {
      canonical: locale === "fr" ? "/livraison-transport" : "/en/livraison-transport",
      languages: {
        "fr-FR": "/livraison-transport",
        "en-GB": "/en/livraison-transport",
        "x-default": "/livraison-transport",
      },
    },
  };
}

export default async function LivraisonTransportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Delivery");
  const whatsappUrl = getWhatsAppLink(t("whatsappMessage"));

  const optionAItems = [t("optionAItem1"), t("optionAItem2"), t("optionAItem3"), t("optionAItem4")];
  const transportCards = [
    { icon: Shield, title: t("transportComplianceTitle"), desc: t("transportComplianceDesc") },
    { icon: FileCheck, title: t("docTitle"), desc: t("docDesc") },
    { icon: Info, title: t("welfareTitle"), desc: t("welfareDesc") },
    { icon: AlertTriangle, title: t("conditionsTitle"), desc: t("conditionsDesc") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest">
          <Truck className="h-4 w-4" />
          {t("badge")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">{t("title")}</h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">{t("intro")}</p>
        <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full" />
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-black font-heading text-text-premium flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          {t("optionATitle")}
        </h2>
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-4">
          <p className="text-sm text-text-premium/80 leading-relaxed">{t("optionAIntro")}</p>
          <ul className="space-y-2">
            {optionAItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-premium/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black font-heading text-text-premium flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          {t("optionBTitle")}
        </h2>
        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-4">
          <p className="text-sm text-text-premium/80 leading-relaxed">{t("optionBIntro")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {transportCards.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-4 rounded-xl bg-white dark:bg-black/20 border border-blue-100 dark:border-blue-900/30 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-sm text-text-premium">{title}</span>
                </div>
                <p className="text-xs text-text-premium/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-text-premium text-sm mb-2">{t("reminderTitle")}</h3>
            <p className="text-xs text-text-premium/70 leading-relaxed">{t("reminderDesc")}</p>
          </div>
        </div>
      </div>

      <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-5">
        <h2 className="text-2xl font-black font-heading text-text-premium">{t("ctaTitle")}</h2>
        <p className="text-text-premium/60 text-sm max-w-lg mx-auto">{t("ctaBody")}</p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
        >
          <MessageCircle className="h-4 w-4" />
          {t("ctaWhatsapp")}
        </a>
      </div>
    </div>
  );
}

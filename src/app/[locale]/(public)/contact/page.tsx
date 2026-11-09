import React from "react";
import type { Metadata } from "next";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getWhatsAppLink, siteConfig } from "@/data/site";
import ContactFormClient from "./ContactFormClient";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
    alternates: {
      canonical: locale === "fr" ? "/contact" : "/en/contact",
      languages: { "fr-FR": "/contact", "en-GB": "/en/contact", "x-default": "/contact" },
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const whatsappUrl = getWhatsAppLink(t("whatsappMessage"));
  const email = siteConfig.email;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">{t("title")}</h1>
        <p className="text-text-premium/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-center space-y-6 shadow-2xl shadow-emerald-600/25">
        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
          <MessageCircle className="h-8 w-8 fill-white text-emerald-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">{t("whatsappTitle")}</h2>
          <p className="text-emerald-100 text-sm leading-relaxed">{t("whatsappDesc")}</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-emerald-700 font-extrabold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <MessageCircle className="h-5 w-5" />
          {t("openWhatsapp")}
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: Mail, title: t("email"), value: email, href: `mailto:${email}` },
          { icon: Clock, title: t("availability"), value: t("availabilityValue"), href: null },
          { icon: MapPin, title: t("serviceArea"), value: t("serviceAreaValue"), href: null },
        ].map(({ icon: Icon, title, value, href }) => (
          <div
            key={title}
            className="p-6 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 space-y-3 text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-extrabold text-text-premium">{title}</h3>
            {href ? (
              <a href={href} className="text-sm text-primary hover:text-primary-hover font-semibold">
                {value}
              </a>
            ) : (
              <p className="text-sm text-text-premium/60">{value}</p>
            )}
          </div>
        ))}
      </div>

      <ContactFormClient locale={locale} />

      <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
        <p className="text-sm text-text-premium/70">{t("faqText")}</p>
        <Link href="/faq" className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
          {t("faqLink")}
        </Link>
      </div>
    </div>
  );
}

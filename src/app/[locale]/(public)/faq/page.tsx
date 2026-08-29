import React from "react";
import type { Metadata } from "next";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { getWhatsAppLink } from "@/data/site";
import { faqs } from "@/data/faq";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("faqTitle"),
    description: t("faqDescription"),
    alternates: {
      canonical: locale === "fr" ? "/faq" : "/en/faq",
      languages: { "fr-FR": "/faq", "en-GB": "/en/faq", "x-default": "/faq" },
    },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Faq");
  const isEn = (await getLocale()) === "en";
  const whatsappUrl = getWhatsAppLink(t("whatsappMessage"));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: isEn ? faq.questionEn : faq.question,
              acceptedAnswer: { "@type": "Answer", text: isEn ? faq.answerEn : faq.answer },
            })),
          }),
        }}
      />

      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">{t("title")}</h1>
        <p className="text-text-premium/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-black/10 hover:shadow-sm transition-all duration-300 cursor-pointer open:border-primary/20 open:shadow-sm"
          >
            <summary className="flex items-start gap-3 list-none font-extrabold text-sm sm:text-base text-text-premium group-open:text-primary transition-colors cursor-pointer">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="flex-grow">{isEn ? faq.questionEn : faq.question}</span>
              <span className="text-primary/60 ml-auto shrink-0 text-sm font-bold">+</span>
            </summary>
            <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed pl-8 mt-3">
              {isEn ? faq.answerEn : faq.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/10 space-y-5">
        <h2 className="text-2xl font-black font-heading text-text-premium">{t("notListedTitle")}</h2>
        <p className="text-text-premium/60 text-sm">{t("notListedBody")}</p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
        >
          <MessageCircle className="h-4 w-4" />
          {t("askWhatsapp")}
        </a>
      </div>
    </div>
  );
}

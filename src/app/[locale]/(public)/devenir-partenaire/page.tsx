import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/data/site";
import PartnerLanding from "./PartnerLanding";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("partnerTitle"),
    description: t("partnerDescription"),
    alternates: {
      canonical: locale === "fr" ? "/devenir-partenaire" : "/en/devenir-partenaire",
      languages: {
        "fr-FR": "/devenir-partenaire",
        "en-GB": "/en/devenir-partenaire",
        "x-default": "/devenir-partenaire",
      },
    },
    openGraph: { title: t("partnerTitle"), description: t("partnerDescription"), type: "website" },
  };
}

export default async function DevenirPartenairePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Partner");
  const base = siteConfig.siteUrl;

  const faqItems = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
    q: t(`faq.q${i}`),
    a: t(`faq.a${i}`),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: t("hero.title"),
            serviceType: "Breeder partnership programme",
            provider: { "@type": "Organization", name: "pawelium", url: base },
            areaServed: "Europe",
            description: t("hero.subtitle"),
          }),
        }}
      />
      <PartnerLanding />
    </>
  );
}

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Handshake } from "lucide-react";
import { siteConfig } from "@/data/site";
import dogs from "@/data/dogs";
import breeds from "@/data/breeds";
import CatalogClient from "./CatalogClient";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("catalogueTitle"),
    description: t("catalogueDescription"),
    alternates: {
      canonical: locale === "fr" ? "/catalogue" : "/en/catalogue",
      languages: { "fr-FR": "/catalogue", "en-GB": "/en/catalogue", "x-default": "/catalogue" },
    },
    openGraph: { title: t("catalogueTitle"), description: t("catalogueDescription"), type: "website" },
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Catalogue");
  const tNav = await getTranslations("Nav");
  const dogCount = dogs.filter((d) => d.availability === "disponible").length;
  const base = siteConfig.siteUrl;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "Accueil", item: base },
              {
                "@type": "ListItem",
                position: 2,
                name: tNav("catalog"),
                item: `${base}${locale === "fr" ? "" : "/en"}/catalogue`,
              },
            ],
          }),
        }}
      />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 border border-primary/10 px-8 py-12 sm:py-16 text-center space-y-4">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest">
          {t("dogsAvailable", { count: dogCount })}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-text-premium tracking-tight">{t("title")}</h1>
        <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
      </div>

      <Suspense
        fallback={
          <div className="text-center py-20 text-text-premium/50 font-bold animate-pulse">{t("loading")}</div>
        }
      >
        <CatalogClient initialDogs={dogs} breeds={breeds} />
      </Suspense>

      {/* Partner CTA */}
      <Link
        href="/devenir-partenaire"
        className="flex items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
      >
        <Handshake className="h-5 w-5 shrink-0" />
        {t("partnerCta")}
      </Link>
    </div>
  );
}

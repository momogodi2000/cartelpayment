import React, { Suspense } from "react";
import { getServerTranslation } from "@/lib/serverTranslations";
import dogs from "@/data/dogs";
import breeds from "@/data/breeds";
import CatalogClient from "./CatalogClient";

export const revalidate = 86400;

export async function generateMetadata() {
  return {
    title: "Catalogue Chiens & Chiots de Race | PawElite",
    description:
      "Découvrez notre catalogue complet de chiens et chiots de race disponibles en Europe. Filtrez par race, sexe, âge et localisation.",
    openGraph: {
      title: "Catalogue Chiens & Chiots | PawElite",
      description: "Tous nos chiens et chiots de race disponibles en Europe.",
      type: "website",
    },
  };
}

export default async function CatalogPage() {
  const { t, locale } = await getServerTranslation();
  const dogCount = dogs.filter((d) => d.availability === "disponible").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": locale === "en" ? "Home" : "Accueil",
                "item": process.env.NEXT_PUBLIC_SITE_URL || "https://pawelite.eu",
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": t("nav.catalog"),
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://pawelite.eu"}/catalogue`,
              },
            ],
          }),
        }}
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 border border-primary/10 px-8 py-12 sm:py-16 text-center space-y-4">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest">
          {dogCount} {locale === "en" ? "dogs available" : "chiens disponibles"}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-text-premium tracking-tight">
          {t("catalog.title")}
        </h1>
        <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed max-w-2xl mx-auto">
          {t("catalog.subtitle")}
        </p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
      </div>

      <Suspense
        fallback={
          <div className="text-center py-20 text-text-premium/50 font-bold animate-pulse">
            {locale === "en" ? "Loading catalog..." : "Chargement du catalogue..."}
          </div>
        }
      >
        <CatalogClient initialDogs={dogs} breeds={breeds} />
      </Suspense>
    </div>
  );
}

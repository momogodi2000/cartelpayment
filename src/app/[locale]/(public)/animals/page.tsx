import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/data/site";
import { prisma } from "@/lib/db/client";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

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
      canonical: locale === "fr" ? "/fr/animaux" : "/en/animals",
      languages: { "fr-FR": "/fr/animaux", "en-GB": "/en/animals", "x-default": "/en/animals" },
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
  const base = siteConfig.siteUrl;

  const [dbAnimals, dbBreeds] = await Promise.all([
    prisma.animal.findMany({
      where: { published: true },
      include: {
        breed: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.breed.findMany({
      orderBy: { nameEn: "asc" },
    }),
  ]);

  const availableCount = dbAnimals.filter((d) => d.status === "AVAILABLE").length;

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
                item: `${base}/${locale}/animals`,
              },
            ],
          }),
        }}
      />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#183C32]/10 via-transparent to-[#B69A65]/10 border border-[#183C32]/15 px-8 py-12 sm:py-16 text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183C32]/10 text-[#183C32] text-xs font-bold uppercase tracking-wider">
          {t("dogsAvailable", { count: availableCount })}
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
          {t("title")}
        </h1>
        <p className="max-w-xl mx-auto text-base text-gray-600 dark:text-gray-300">
          {t("subtitle")}
        </p>
      </div>

      <CatalogClient initialDogs={dbAnimals as any} breeds={dbBreeds as any} />
    </div>
  );
}

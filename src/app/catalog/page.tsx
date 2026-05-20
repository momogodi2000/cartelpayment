import React, { Suspense } from "react";
import prisma from "@/lib/db";
import CatalogClient from "./CatalogClient";
import { getServerTranslation } from "@/lib/serverTranslations";

// Disable build cache cache to ensure client always sees correct database statuses
export const revalidate = 0;

async function getCatalogData() {
  try {
    const list = await prisma.parrot.findMany({
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parrots = list.map((p) => ({
      ...p,
      price: Number(p.price),
    }));

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return { parrots, categories };
  } catch (error) {
    console.error("Error fetching catalog data:", error);
    return { parrots: [], categories: [] };
  }
}

export default async function CatalogPage() {
  const { t, locale } = await getServerTranslation();
  const { parrots, categories } = await getCatalogData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-text-premium tracking-tight">
          {t("catalog.title")}
        </h1>
        <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
          {t("catalog.subtitle")}
        </p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full mt-4" />
      </div>

      <Suspense
        fallback={
          <div className="text-center py-20 text-text-premium/50 font-bold animate-pulse">
            {locale === "en" ? "Loading Exotic Bird Catalog..." : "Chargement du catalogue d'oiseaux..."}
          </div>
        }
      >
        <CatalogClient initialParrots={parrots} categories={categories} />
      </Suspense>
    </div>
  );
}

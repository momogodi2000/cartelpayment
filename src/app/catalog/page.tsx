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
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 border border-primary/10 px-8 py-12 sm:py-16 text-center space-y-4">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest">
          {parrots.length} {locale === "en" ? "birds available" : "oiseaux disponibles"}
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
            {locale === "en" ? "Loading Exotic Bird Catalog..." : "Chargement du catalogue d'oiseaux..."}
          </div>
        }
      >
        <CatalogClient initialParrots={parrots} categories={categories} />
      </Suspense>
    </div>
  );
}

import React from "react";
import prisma from "@/lib/db";
import GalleryClient from "./GalleryClient";
import { getServerTranslation } from "@/lib/serverTranslations";

export async function generateMetadata() {
  const { t } = await getServerTranslation();
  return {
    title: t("meta.gallery.title"),
    description: t("meta.gallery.desc"),
    openGraph: {
      title: t("meta.gallery.title"),
      description: t("meta.gallery.desc"),
    },
  };
}

async function getGalleryItems() {
  try {
    return await prisma.galleryItem.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
}

export default async function GalleryPage() {
  const { t } = await getServerTranslation();
  const items = await getGalleryItems();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-text-premium tracking-tight">
          {t("gallery.title")}
        </h1>
        <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
          {t("gallery.subtitle")}
        </p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full mt-4" />
      </div>

      {/* Interactive Client Component for Filtering */}
      <GalleryClient initialItems={items} />
    </div>
  );
}

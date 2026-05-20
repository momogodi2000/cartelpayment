import React from "react";
import prisma from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const revalidate = 0; // Always fetch fresh items

async function getGalleryItems() {
  try {
    return await prisma.galleryItem.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Error retrieving admin gallery items:", error);
    return [];
  }
}

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-black/[0.04] pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          Media Gallery Directory
        </h1>
        <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider mt-0.5">
          CMS Photos & Videos Management
        </p>
      </div>

      <GalleryClient initialItems={items} />
    </div>
  );
}

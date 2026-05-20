"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, Camera, Video } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { translateGalleryItem } from "@/lib/translations";

interface GalleryItem {
  id: string;
  title: string;
  type: string;
  url: string;
  caption: string;
  category: string;
}

interface GalleryClientProps {
  initialItems: GalleryItem[];
}

const CATEGORIES = ["All", "Nursery", "Facility", "Socialization", "Nutrition", "Tamed Birds"];

export default function GalleryClient({ initialItems }: GalleryClientProps) {
  const { language } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? initialItems
      : initialItems.filter(
          (item) => item.category.toLowerCase() === activeCategory.toLowerCase()
        );

  const getCategoryLabel = (category: string) => {
    if (language === "en") {
      if (category.toLowerCase() === "all") return "All Media";
      if (category.toLowerCase() === "nursery") return "Nursery & Hatching";
      if (category.toLowerCase() === "facility") return "Flight Aviaries";
      if (category.toLowerCase() === "socialization") return "Socialization";
      if (category.toLowerCase() === "nutrition") return "Nutrition & Diet";
      if (category.toLowerCase() === "tamed birds") return "Tamed Companions";
      return category;
    } else {
      if (category.toLowerCase() === "all") return "Tous les Médias";
      if (category.toLowerCase() === "nursery") return "Nurserie & Éclosion";
      if (category.toLowerCase() === "facility") return "Volières & Installations";
      if (category.toLowerCase() === "socialization") return "Socialisation";
      if (category.toLowerCase() === "nutrition") return "Nutrition & Alimentation";
      if (category.toLowerCase() === "tamed birds") return "Compagnons Apprivoisés";
      return category;
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-black/[0.04] pb-6">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeCategory.toLowerCase() === category.toLowerCase()
                ? "bg-primary text-white shadow-sm"
                : "bg-white hover:bg-black/[0.02] text-text-premium/70 border border-black/[0.05]"
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-black/[0.08] rounded-3xl">
          <p className="text-text-premium/50 text-sm font-semibold">
            {language === "en" ? "No media items found in this category." : "Aucun média trouvé dans cette catégorie."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const translated = translateGalleryItem(item, language);
            return (
              <div
                key={translated.id}
                className="group relative flex flex-col rounded-3xl overflow-hidden border border-black/[0.06] bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Media Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-premium">
                  <Image
                    src={translated.url}
                    alt={translated.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Media Type Icon */}
                  <div className="absolute top-4 left-4 h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white shadow-sm">
                    {translated.type === "VIDEO" ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </div>

                  {/* Zoom Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                      <ZoomIn className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                {/* Caption details */}
                <div className="p-5 space-y-1">
                  <span className="text-[10px] text-primary font-bold tracking-wider uppercase">
                    {getCategoryLabel(translated.category)}
                  </span>
                  <h3 className="font-extrabold text-base text-text-premium group-hover:text-primary transition-colors">
                    {translated.title}
                  </h3>
                  <p className="text-xs text-text-premium/70 leading-relaxed line-clamp-2">
                    {translated.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

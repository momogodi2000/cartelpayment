"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageItem {
  id: string;
  url: string;
  alt: string;
}

interface DetailGalleryProps {
  images: ImageItem[];
  parrotName: string;
}

export default function DetailGallery({ images, parrotName }: DetailGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const activeImage =
    images[activeIdx]?.url ||
    "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="space-y-4">
      {/* Active Big Image */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-black/[0.06] shadow-sm group">
        <Image
          src={activeImage}
          alt={`${parrotName} detail image ${activeIdx + 1}`}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 40vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-white shadow-sm transition-all ${
                activeIdx === idx
                  ? "border-primary scale-102"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={`${parrotName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

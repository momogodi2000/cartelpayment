"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Premium dog photography from Unsplash — demonstration images
const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1920&q=85&auto=format&fit=crop",
    alt: "Golden Retriever élégant dans un cadre naturel européen",
  },
  {
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&q=85&auto=format&fit=crop",
    alt: "Chiot de race dans un jardin fleuri",
  },
  {
    url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1920&q=85&auto=format&fit=crop",
    alt: "Labrador Retriever majestueux — sélection premium",
  },
  {
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=85&auto=format&fit=crop",
    alt: "Deux chiens de race courant ensemble dans la nature",
  },
];

export default function HeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Background slideshow */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-none">
        {heroImages.map((img, i) => (
          <div
            key={img.url}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
              quality={85}
            />
          </div>
        ))}

        {/* Premium overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
      </div>

      {/* Slide indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}

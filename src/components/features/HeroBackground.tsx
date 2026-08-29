"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Premium dog photography — demonstration images.
const heroImageUrls = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&auto=format&fit=crop",
];

export default function HeroBackground() {
  const t = useTranslations("Home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImageUrls.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden rounded-none">
        {heroImageUrls.map((url, i) => (
          <div
            key={url}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentIndex ? "opacity-100" : "opacity-0"
            } ${!isLoaded && i === 0 ? "opacity-100" : ""}`}
          >
            <Image
              src={url}
              alt={t("heroImageAlt")}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroImageUrls.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}

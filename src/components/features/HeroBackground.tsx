"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

interface Slide {
  url: string;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
}

const HERO_SLIDES: Slide[] = [
  {
    url: "/images/hero/scarlet_macaw.png",
    nameEn: "Scarlet Macaw Baby",
    nameFr: "Bébé Ara Rouge (Macao)",
    descEn: "Closed-Loop Captive Breed — Hand-Raised with Love",
    descFr: "Né en captivité — Élevé à la main avec amour",
  },
  {
    url: "/images/hero/hyacinth_macaw.png",
    nameEn: "Hyacinth Macaw Baby",
    nameFr: "Bébé Ara Hyacinthe",
    descEn: "Gentle Giant — Exceptional Socialization",
    descFr: "Géant bleu pacifique — Excellente socialisation",
  },
  {
    url: "/images/hero/blue_gold.png",
    nameEn: "Blue & Gold Macaw",
    nameFr: "Ara Bleu et Or",
    descEn: "Active Nursery Graduate — Highly Communicative Companion",
    descFr: "Diplômé de la nurserie — Compagnon très expressif",
  },
  {
    url: "/images/hero/golden_conure.png",
    nameEn: "Golden Conure Baby",
    nameFr: "Bébé Conure Dorée",
    descEn: "Vibrant Golden Plumage — CITES Appendix I Registered",
    descFr: "Plumage d'or éclatant — Enregistré CITES Annexe I",
  },
  {
    url: "/images/hero/african_grey.png",
    nameEn: "African Grey Baby",
    nameFr: "Bébé Perroquet Gris du Gabon",
    descEn: "Highly Cognitive — Advanced Mimicry & Intellectual Bond",
    descFr: "Haute capacité cognitive — Mimétisme avancé et lien intellectuel",
  },
];

export default function HeroBackground() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(advance, 9000);
    return () => clearInterval(interval);
  }, [advance, isPaused]);

  const slide = HERO_SLIDES[currentSlideIndex];

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Container with Ken Burns */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.58, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={slide.url}
            alt={language === "en" ? slide.nameEn : slide.nameFr}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays — layered for maximum readability */}
      {/* Top gradient — for header contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
      {/* Bottom gradient — for hero text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-premium via-bg-premium/30 to-transparent pointer-events-none" />
      {/* Radial vignette for cinematic depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Bottom-right: Slide info card */}
      <div className="absolute bottom-8 right-6 z-20 hidden sm:block max-w-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, x: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0)" }}
            exit={{ opacity: 0, x: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-4 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/[0.12] shadow-2xl text-left"
          >
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400 block mb-1">
              {t("hero.bgShowcase")}
            </span>
            <h4 className="text-sm font-black text-white leading-tight">
              {language === "en" ? slide.nameEn : slide.nameFr}
            </h4>
            <p className="text-white/80 text-[11px] mt-0.5 leading-relaxed font-semibold">
              {language === "en" ? slide.descEn : slide.descFr}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom-center: Slide navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlideIndex
                ? "w-8 bg-white shadow-md shadow-black/30"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

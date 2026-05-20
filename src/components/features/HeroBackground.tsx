"use client";

import React, { useState, useEffect } from "react";
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
    url: "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=1600&q=80",
    nameEn: "Scarlet Macaw Baby",
    nameFr: "Bébé Ara Rouge (Macao)",
    descEn: "Closed-Loop Captive Breed — Hand-Raised with Love",
    descFr: "Né en captivité — Élevé à la main avec amour"
  },
  {
    url: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=1600&q=80",
    nameEn: "Hyacinth Macaw Baby",
    nameFr: "Bébé Ara Hyacinthe",
    descEn: "Gentle Giant — Exceptional Socialization Swabs",
    descFr: "Géant bleu pacifique — Excellente socialisation"
  },
  {
    url: "https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&w=1600&q=80",
    nameEn: "Blue & Gold Macaw",
    nameFr: "Ara Bleu et Or",
    descEn: "Active Nursery Graduate — Highly Communicative Companion",
    descFr: "Diplômé de la nurserie — Compagnon très expressif"
  },
  {
    url: "https://images.unsplash.com/photo-1608826798020-f1db4d682497?auto=format&fit=crop&w=1600&q=80",
    nameEn: "Golden Conure Baby",
    nameFr: "Bébé Conure Dorée",
    descEn: "Vibrant Golden Plumage — CITES Appendix I Registered",
    descFr: "Plumage d'or éclatant — Enregistré CITES Annexe I"
  }
];

export default function HeroBackground() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 10000); // 10 seconds rotate

    return () => clearInterval(interval);
  }, []);

  const slide = HERO_SLIDES[currentSlideIndex];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none">
      {/* Slide Container */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.35, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
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

      {/* Dark overlay gradients matching page context */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-premium via-transparent to-black/35 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_var(--color-bg-premium)_95%)] opacity-80 pointer-events-none" />

      {/* Slide Info Card - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20 hidden sm:block max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.5 }}
            className="p-4 rounded-2xl bg-white/10 dark:bg-black/25 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg text-left"
          >
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary dark:text-emerald-400 block mb-1">
              {t("hero.bgShowcase")}
            </span>
            <h4 className="text-sm font-black text-white leading-tight">
              {language === "en" ? slide.nameEn : slide.nameFr}
            </h4>
            <p className="text-white/85 text-[11px] mt-0.5 leading-relaxed font-semibold">
              {language === "en" ? slide.descEn : slide.descFr}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

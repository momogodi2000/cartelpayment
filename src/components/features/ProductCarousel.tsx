"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useMotionValue } from "framer-motion";
import ParrotCard from "./ParrotCard";

interface Parrot {
  id: string;
  name: string;
  slug: string;
  species: string;
  shortDescription: string;
  price: number;
  status: string;
  rarity: string;
  origin: string;
  size: string;
  images: { url: string; alt: string }[];
}

interface ProductCarouselProps {
  parrots: Parrot[];
}

export default function ProductCarousel({ parrots }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track swipe drag gestures
  const dragX = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => {
      if (!window) return;
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalCards = parrots.length;
  const maxIndex = Math.max(0, totalCards - visibleCards);

  // Auto-bounding
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [visibleCards, maxIndex, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleDragEnd = () => {
    const x = dragX.get();
    if (x < -50 && currentIndex < maxIndex) {
      handleNext();
    } else if (x > 50 && currentIndex > 0) {
      handlePrev();
    }
    dragX.set(0); // Reset drag offset
  };

  // If no products, return empty state
  if (!parrots || parrots.length === 0) return null;

  return (
    <div className="relative w-full group" ref={containerRef}>
      {/* Viewport Wrapper */}
      <div className="overflow-hidden w-full py-4 px-1">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x: dragX }}
          onDragEnd={handleDragEnd}
          animate={{ x: `-${currentIndex * (100 / visibleCards)}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 25 }}
          className="flex cursor-grab active:cursor-grabbing"
        >
          {parrots.map((parrot) => (
            <div
              key={parrot.id}
              className="px-3 select-none flex-shrink-0"
              style={{ width: `${100 / visibleCards}%` }}
            >
              <div className="h-full pointer-events-auto">
                <ParrotCard parrot={parrot} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows - Left */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-4 z-20 p-3 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] text-text-premium shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Previous parrot"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Navigation Arrows - Right */}
      {currentIndex < maxIndex && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-4 z-20 p-3 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] text-text-premium shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Next parrot"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Slide Progress Dot Indicators */}
      {maxIndex > 0 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-7 bg-primary"
                  : "w-2.5 bg-black/[0.15] dark:bg-white/[0.2] hover:bg-black/30 dark:hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

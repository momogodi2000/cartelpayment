"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DogCard from "./DogCard";
import type { Dog } from "@/data/dogs";

interface Props {
  dogs: Dog[];
}

export default function DogCarousel({ dogs }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 3;
  const maxIndex = Math.max(0, dogs.length - itemsToShow);

  const prev = () => setCurrentIndex((c) => Math.max(0, c - 1));
  const next = () => setCurrentIndex((c) => Math.min(maxIndex, c + 1));

  if (dogs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: `-${currentIndex * (100 / itemsToShow)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: `${(dogs.length / itemsToShow) * 100}%` }}
        >
          {dogs.map((dog) => (
            <div key={dog.id} style={{ width: `${100 / dogs.length}%` }} className="shrink-0">
              <DogCard dog={dog} />
            </div>
          ))}
        </motion.div>
      </div>

      {dogs.length > itemsToShow && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="h-10 w-10 rounded-xl border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-text-premium/60 hover:text-text-premium hover:bg-black/[0.02] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all ${
                  i === currentIndex ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-text-premium/20 hover:bg-text-premium/40"
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={currentIndex === maxIndex}
            className="h-10 w-10 rounded-xl border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-text-premium/60 hover:text-text-premium hover:bg-black/[0.02] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

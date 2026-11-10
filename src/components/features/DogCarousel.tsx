"use client";

import { useTranslations } from "next-intl";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DogCard, { type UnifiedAnimalItem } from "./DogCard";

interface Props {
  dogs: UnifiedAnimalItem[];
}

/**
 * Touch-friendly, scroll-snap carousel.
 * Mobile: one card fills the width with the next peeking; tablet/desktop: 2–3 up.
 * Arrows scroll by one card; they hide when there's nothing to scroll to.
 */
export default function DogCarousel({ dogs }: Props) {
  const tl = useTranslations("PublicPages.labels");
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, dogs.length]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (dogs.length === 0) return null;

  const showControls = dogs.length > 1;

  return (
    <div className="space-y-4">
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {dogs.map((dog) => (
          <div
            key={dog.id}
            data-card
            className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <DogCard dog={dog} />
          </div>
        ))}
      </div>

      {showControls && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            className="h-10 w-10 rounded-xl border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-text-premium/60 hover:text-text-premium hover:bg-black/[0.02] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label={tl("previous")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            className="h-10 w-10 rounded-xl border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-text-premium/60 hover:text-text-premium hover:bg-black/[0.02] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label={tl("next")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

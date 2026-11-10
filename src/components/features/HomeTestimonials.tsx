"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";

export interface TestimonialItem {
  id?: string;
  author?: string;
  name?: string;
  rating: number;
  body?: string;
  content?: string;
  contentEn?: string;
  location?: string;
  breed?: string;
  date?: string;
  avatar?: string;
  verifiedPurchase?: boolean;
}

interface Props {
  testimonials: TestimonialItem[];
}

export default function HomeTestimonials({ testimonials }: Props) {
  const locale = useLocale();
  const [current, setCurrent] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const t = testimonials[current];
  const content = t.body || (locale === "en" ? t.contentEn || t.content : t.content || t.contentEn) || "";
  const authorName = t.author || t.name || "Adopter";
  const initial = authorName.charAt(0).toUpperCase();

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-black/10 rounded-3xl border border-black/[0.05] dark:border-white/[0.06] p-8 shadow-sm"
          >
            {/* Stars */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-text-premium/20"}`}
                />
              ))}
              {t.verifiedPurchase && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Placement
                </span>
              )}
            </div>

            <blockquote className="text-base sm:text-lg text-text-premium font-medium leading-relaxed mb-6">
              &ldquo;{content}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                {t.avatar || initial}
              </div>
              <div>
                <p className="font-extrabold text-sm text-text-premium">{authorName}</p>
                <p className="text-xs text-text-premium/50">
                  {t.location || "Europe"} {t.breed ? `· ${t.breed}` : ""} {t.date ? `· ${t.date}` : ""}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current ? "h-2.5 w-6 bg-primary" : "h-2.5 w-2.5 bg-text-premium/20 hover:bg-text-premium/40"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="h-9 w-9 rounded-xl border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-text-premium/60 hover:text-text-premium hover:bg-black/[0.02] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="h-9 w-9 rounded-xl border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-text-premium/60 hover:text-text-premium hover:bg-black/[0.02] transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

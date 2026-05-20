"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string | null;
}

interface HomeTestimonialsProps {
  testimonials: Testimonial[];
}

export default function HomeTestimonials({ testimonials }: HomeTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play every 8 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (!testimonials || testimonials.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const item = testimonials[activeIndex];

  return (
    <div className="relative max-w-3xl mx-auto px-4">
      {/* Quote Symbol background decoration */}
      <div className="absolute -top-12 -left-4 text-primary/5 dark:text-white/5 pointer-events-none select-none">
        <Quote className="h-28 h-28" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-black/15 border border-black/[0.05] dark:border-white/[0.05] shadow-lg rounded-3xl p-8 sm:p-10 text-left space-y-6"
        >
          {/* Stars */}
          <div className="flex gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`h-4 w-4 shrink-0 ${
                  idx < item.rating ? "fill-amber-500" : "text-gray-300 dark:text-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Testimonial Quote Text */}
          <p className="text-sm sm:text-base md:text-lg text-text-premium/80 font-medium italic leading-relaxed">
            &ldquo;{item.content}&rdquo;
          </p>

          {/* Client Details */}
          <div className="flex items-center gap-4 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
            {item.avatar ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-black/[0.08]">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm border border-black/[0.08]">
                {item.name.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-extrabold text-sm text-text-premium tracking-tight">
                {item.name}
              </h4>
              <p className="text-xs text-text-premium/50 font-bold uppercase tracking-wider">
                {item.role}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute -left-6 sm:-left-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-black/55 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.1] text-text-premium shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-6 sm:-right-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-black/55 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.1] text-text-premium shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Next review"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {testimonials.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-5 bg-primary"
                  : "w-2 bg-black/[0.12] dark:bg-white/[0.2] hover:bg-black/25 dark:hover:bg-white/40"
              }`}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

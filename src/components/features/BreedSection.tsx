"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Breed } from "@/data/breeds";

interface Props {
  breeds: Breed[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export default function BreedSection({ breeds }: Props) {
  const { language } = useApp();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {breeds.slice(0, 10).map((breed) => {
        const name = language === "en" ? breed.nameEn : breed.name;
        return (
          <motion.div key={breed.id} variants={item}>
            <Link
              href={`/catalogue?breed=${breed.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-black/[0.04] group-hover:ring-primary/20 transition-all">
                <Image
                  src={breed.image}
                  alt={`${name} — race canine`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="64px"
                />
              </div>
              <div>
                <p className="text-xs font-extrabold text-text-premium group-hover:text-primary transition-colors leading-tight">
                  {name}
                </p>
                <p className="text-[10px] text-text-premium/50 mt-0.5 capitalize">
                  {language === "fr"
                    ? (breed.category === "petit" ? "Petit" : breed.category === "moyen" ? "Moyen" : "Grand")
                    : (breed.category === "petit" ? "Small" : breed.category === "moyen" ? "Medium" : "Large")}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

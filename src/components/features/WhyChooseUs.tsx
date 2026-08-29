"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Heart, FileText, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const ICONS = [ShieldCheck, Heart, FileText, MessageCircle];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function WhyChooseUs() {
  const t = useTranslations("WhyChooseUs");

  const data = [1, 2, 3, 4].map((n, i) => ({
    Icon: ICONS[i],
    title: t(`item${n}Title`),
    description: t(`item${n}Desc`),
  }));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {data.map(({ Icon, title, description }) => (
        <motion.div
          key={title}
          variants={item}
          className="p-7 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 hover:shadow-lg hover:shadow-black/[0.05] hover:-translate-y-1 transition-all duration-300 space-y-4"
        >
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-extrabold text-text-premium">{title}</h3>
          <p className="text-sm text-text-premium/60 leading-relaxed">{description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

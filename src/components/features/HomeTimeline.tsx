"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Heart, MessageSquare, ClipboardCheck, Home } from "lucide-react";
import { useTranslations } from "next-intl";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const ICONS = [Search, Heart, MessageSquare, ClipboardCheck, Home];

export default function HomeTimeline() {
  const t = useTranslations("Process");

  const steps = ["01", "02", "03", "04", "05"].map((step, i) => ({
    icon: ICONS[i],
    step,
    title: t(`step${step}Title`),
    desc: t(`step${step}Desc`),
  }));

  return (
    <div className="relative">
      <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0 mx-16" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 relative z-10"
      >
        {steps.map(({ icon: Icon, step, title, desc }) => (
          <motion.div key={step} variants={item} className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                {step}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-text-premium">{title}</h3>
            <p className="text-xs text-text-premium/60 leading-relaxed max-w-[140px]">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

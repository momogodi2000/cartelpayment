"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Dna, FileCheck2, PlaneTakeoff, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

export default function HomeTimeline() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: ShieldCheck,
      title: t("home.timeline.step1.title"),
      desc: t("home.timeline.step1.desc"),
      label: "Step 1"
    },
    {
      icon: Dna,
      title: t("home.timeline.step2.title"),
      desc: t("home.timeline.step2.desc"),
      label: "Step 2"
    },
    {
      icon: FileCheck2,
      title: t("home.timeline.step3.title"),
      desc: t("home.timeline.step3.desc"),
      label: "Step 3"
    },
    {
      icon: PlaneTakeoff,
      title: t("home.timeline.step4.title"),
      desc: t("home.timeline.step4.desc"),
      label: "Step 4"
    }
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Step Nodes Row */}
      <div className="relative flex justify-between items-center w-full">
        {/* Connecting Progress Line Background */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-black/[0.06] dark:bg-white/[0.08] z-0" />
        
        {/* Active Progress Line Overlay */}
        <motion.div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[3px] bg-primary z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${(activeStep / (steps.length - 1)) * 90}%` }}
          transition={{ duration: 0.4 }}
        />

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx <= activeStep;
          const isCurrent = idx === activeStep;

          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              {/* Node Circle */}
              <motion.div
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  backgroundColor: isCurrent
                    ? "var(--color-primary)"
                    : isActive
                    ? "var(--color-primary-hover)"
                    : "var(--color-bg-premium)",
                  borderColor: isActive ? "var(--color-primary)" : "rgba(0,0,0,0.12)"
                }}
                transition={{ duration: 0.3 }}
                className={`h-12 w-12 rounded-full border-2 flex items-center justify-center shadow-md transition-all text-text-premium dark:border-white/10 ${
                  isCurrent ? "text-white" : isActive ? "text-white" : "text-text-premium/40"
                }`}
              >
                <StepIcon className="h-5 w-5 shrink-0" />
              </motion.div>

              {/* Node Title (Desktop) */}
              <span
                className={`hidden md:block text-[11px] font-extrabold uppercase mt-3 tracking-wider transition-colors ${
                  isCurrent
                    ? "text-primary"
                    : isActive
                    ? "text-primary/75"
                    : "text-text-premium/40"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Details Card Panel */}
      <div className="bg-white dark:bg-black/15 rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-md p-6 sm:p-8 min-h-[160px] flex flex-col justify-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
          {React.createElement(steps[activeStep].icon, { className: "w-56 h-56" })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 relative z-10 text-left"
          >
            <span className="text-[10px] tracking-widest font-black uppercase text-primary/70 dark:text-emerald-400">
              {steps[activeStep].label} — {language === "en" ? "Protocol Stage" : "Phase de Protocole"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-text-premium tracking-tight">
              {steps[activeStep].title}
            </h3>
            <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed max-w-2xl">
              {steps[activeStep].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Help */}
      <div className="flex justify-between items-center text-xs font-bold text-text-premium/50 px-2">
        <button
          onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
          disabled={activeStep === 0}
          className="hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-text-premium/50 cursor-pointer"
        >
          &larr; {language === "en" ? "Previous Stage" : "Étape précédente"}
        </button>
        <div className="flex gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                idx === activeStep ? "bg-primary" : "bg-black/[0.08] dark:bg-white/[0.15]"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
          disabled={activeStep === steps.length - 1}
          className="hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-text-premium/50 flex items-center gap-0.5 cursor-pointer"
        >
          <span>{language === "en" ? "Next Stage" : "Étape suivante"}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

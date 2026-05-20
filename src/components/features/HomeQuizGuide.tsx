"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle, Home, Clock, Award } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

export default function HomeQuizGuide() {
  const { language } = useApp();
  const { t } = useTranslation(language);

  const [step, setStep] = useState<"q1" | "q2" | "result">("q1");
  const [q1Selection, setQ1Selection] = useState<number | null>(null);
  const [q2Selection, setQ2Selection] = useState<number | null>(null);

  const handleQ1Select = (idx: number) => {
    setQ1Selection(idx);
    setStep("q2");
  };

  const handleQ2Select = (idx: number) => {
    setQ2Selection(idx);
    setStep("result");
  };

  const handleReset = () => {
    setQ1Selection(null);
    setQ2Selection(null);
    setStep("q1");
  };

  // Logic to determine recommendations
  const getRecommendation = () => {
    // If user has space and time -> Macaw
    if (q1Selection === 0 && q2Selection === 0) {
      return {
        title: t("home.quiz.result.macaws"),
        desc: t("home.quiz.result.macawsDesc"),
        matchRate: "98%",
        tags: ["Spacious", "High Activity", "Expressive"]
      };
    }
    // If small space or low time -> Conures
    if (q1Selection === 2 || q2Selection === 2) {
      return {
        title: t("home.quiz.result.conures"),
        desc: t("home.quiz.result.conuresDesc"),
        matchRate: "95%",
        tags: ["Compact", "Quiet Pref.", "Affectionate"]
      };
    }
    // Midrange -> Amazons / African Greys
    return {
      title: t("home.quiz.result.amazons"),
      desc: t("home.quiz.result.amazonsDesc"),
      matchRate: "92%",
      tags: ["High Intellect", "Talker", "Structured Care"]
    };
  };

  const rec = getRecommendation();

  return (
    <div className="bg-white dark:bg-black/15 rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-md p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex h-9 w-9 rounded-full bg-primary/10 text-primary items-center justify-center mx-auto mb-1">
          <Award className="h-5 w-5" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-text-premium tracking-tight leading-none">
          {t("home.quiz.title")}
        </h3>
        <p className="text-xs text-text-premium/60">
          {t("home.quiz.subtitle")}
        </p>
      </div>

      {/* Quiz Body */}
      <div className="min-h-[220px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Question 1 */}
          {step === "q1" && (
            <motion.div
              key="q1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 text-left"
            >
              <h4 className="text-sm font-extrabold text-text-premium/80 uppercase tracking-wider flex items-center gap-2">
                <Home className="h-4 w-4 text-primary shrink-0" />
                {t("home.quiz.q1")}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleQ1Select(0)}
                  className="w-full text-left p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] hover:border-primary dark:hover:border-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-xs font-bold text-text-premium transition-all duration-300 active:scale-[0.99] cursor-pointer"
                >
                  {t("home.quiz.q1.o1")}
                </button>
                <button
                  onClick={() => handleQ1Select(1)}
                  className="w-full text-left p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] hover:border-primary dark:hover:border-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-xs font-bold text-text-premium transition-all duration-300 active:scale-[0.99] cursor-pointer"
                >
                  {t("home.quiz.q1.o2")}
                </button>
                <button
                  onClick={() => handleQ1Select(2)}
                  className="w-full text-left p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] hover:border-primary dark:hover:border-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-xs font-bold text-text-premium transition-all duration-300 active:scale-[0.99] cursor-pointer"
                >
                  {t("home.quiz.q1.o3")}
                </button>
              </div>
            </motion.div>
          )}

          {/* Question 2 */}
          {step === "q2" && (
            <motion.div
              key="q2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 text-left"
            >
              <h4 className="text-sm font-extrabold text-text-premium/80 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                {t("home.quiz.q2")}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleQ2Select(0)}
                  className="w-full text-left p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] hover:border-primary dark:hover:border-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-xs font-bold text-text-premium transition-all duration-300 active:scale-[0.99] cursor-pointer"
                >
                  {t("home.quiz.q2.o1")}
                </button>
                <button
                  onClick={() => handleQ2Select(1)}
                  className="w-full text-left p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] hover:border-primary dark:hover:border-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-xs font-bold text-text-premium transition-all duration-300 active:scale-[0.99] cursor-pointer"
                >
                  {t("home.quiz.q2.o2")}
                </button>
                <button
                  onClick={() => handleQ2Select(2)}
                  className="w-full text-left p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] hover:border-primary dark:hover:border-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-xs font-bold text-text-premium transition-all duration-300 active:scale-[0.99] cursor-pointer"
                >
                  {t("home.quiz.q2.o3")}
                </button>
              </div>
            </motion.div>
          )}

          {/* Results View */}
          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {t("home.quiz.result.title")}
                </span>
                <span className="text-xs bg-primary/10 text-primary font-black px-2.5 py-0.5 rounded-full">
                  {rec.matchRate} Match
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg sm:text-xl font-black text-text-premium">
                  {rec.title}
                </h4>
                <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed">
                  {rec.desc}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {rec.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.04] text-[10px] font-extrabold text-text-premium/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Reset CTA */}
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-end">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-xs font-extrabold text-text-premium transition-all active:scale-[0.98] cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{t("home.quiz.reset")}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

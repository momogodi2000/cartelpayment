"use client";

import React, { useState, useEffect } from "react";
import { Thermometer, Droplets, Radio, Sparkles, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

export default function HomeNurseryFeed() {
  const { language } = useApp();
  const { t } = useTranslation(language);

  // Fluctuating Stats
  const [temperature, setTemperature] = useState(37.5);
  const [humidity, setHumidity] = useState(55);
  const [caretakerTaskIdx, setCaretakerTaskIdx] = useState(0);

  const caretakerTasks = [
    t("home.nursery.feedingTime"),
    t("home.nursery.sleeping"),
    t("home.nursery.socializing"),
    language === "en" ? "Weighing and sizing session" : "Session de pesée et de mesure",
    language === "en" ? "Incubator disinfection checklist" : "Désinfection systématique des incubateurs"
  ];

  useEffect(() => {
    // Stat fluctuations
    const statsInterval = setInterval(() => {
      setTemperature((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        return parseFloat(Math.min(37.8, Math.max(37.2, prev + delta)).toFixed(1));
      });
      setHumidity((prev) => {
        const delta = Math.round((Math.random() - 0.5) * 2);
        return Math.min(58, Math.max(52, prev + delta));
      });
    }, 4000);

    // Caretaker action cycles
    const taskInterval = setInterval(() => {
      setCaretakerTaskIdx((prev) => (prev + 1) % caretakerTasks.length);
    }, 6000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(taskInterval);
    };
  }, [caretakerTasks.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Telemetry Stats Column (Left 1/3) */}
      <div className="lg:col-span-1 flex flex-col justify-between gap-4 text-left">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary dark:text-emerald-400">
            {t("home.nursery.status")}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-text-premium tracking-tight leading-tight">
            {t("home.nursery.title")}
          </h3>
          <p className="text-xs text-text-premium/65 leading-relaxed">
            {t("home.nursery.subtitle")}
          </p>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          {/* Temperature Sensor */}
          <div className="p-4 rounded-2xl bg-white dark:bg-black/15 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Thermometer className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-text-premium/50 uppercase font-bold tracking-wider">
                {t("home.nursery.temp")}
              </span>
              <p className="font-black text-base text-text-premium">{temperature}°C</p>
            </div>
          </div>

          {/* Humidity Sensor */}
          <div className="p-4 rounded-2xl bg-white dark:bg-black/15 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-text-premium/50 uppercase font-bold tracking-wider">
                {t("home.nursery.humidity")}
              </span>
              <p className="font-black text-base text-text-premium">{humidity}%</p>
            </div>
          </div>

          {/* Hatchlings Indicator */}
          <div className="p-4 rounded-2xl bg-white dark:bg-black/15 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-text-premium/50 uppercase font-bold tracking-wider">
                {t("home.nursery.hatchlings")}
              </span>
              <p className="font-black text-base text-text-premium">8 {language === "en" ? "Chicks" : "Oisillons"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Camera Stream (Right 2/3) */}
      <div className="lg:col-span-2 relative aspect-video w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-lg overflow-hidden flex flex-col justify-between p-6">
        {/* Mock Stream Background Overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=1200&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Scan lines & Vignette */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_96%,_rgba(18,24,38,0.15)_98%)] bg-[size:100%_4px] pointer-events-none" />

        {/* Top Indicators Bar */}
        <div className="relative flex justify-between items-center z-10">
          <div className="flex items-center gap-2 bg-red-600/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest shadow-md">
            <Radio className="h-3 w-3 animate-pulse shrink-0" />
            <span className="animate-pulse">{t("home.nursery.online")}</span>
          </div>

          <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider font-mono">
            CAM_NURSERY_03
          </span>
        </div>

        {/* Stream Stats Overlay */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-left">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider font-black text-emerald-400 flex items-center gap-1">
              <UserCheck className="h-3 w-3 shrink-0" />
              {t("home.nursery.caretaker")}
            </span>
            <div className="h-8">
              <AnimatePresence mode="wait">
                <motion.h4
                  key={caretakerTaskIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm sm:text-base font-extrabold text-white"
                >
                  {caretakerTasks[caretakerTaskIdx]}
                </motion.h4>
              </AnimatePresence>
            </div>
          </div>

          {/* Time & Audio Waveform Mock */}
          <div className="flex flex-col items-start sm:items-end text-[10px] font-mono text-white/40">
            <p>{t("home.nursery.simTitle")}</p>
            <div className="flex gap-0.5 items-end h-3 mt-1.5">
              <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_100ms] h-full" />
              <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_300ms] h-3/4" />
              <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_200ms] h-1/2" />
              <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_400ms] h-full" />
              <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_150ms] h-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

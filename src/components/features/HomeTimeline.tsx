"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Heart, MessageSquare, ClipboardCheck, Home } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

const steps = {
  fr: [
    { icon: Search, step: "01", title: "Découvrir", desc: "Parcourez notre catalogue de chiens et chiots disponibles avec tous leurs détails : race, âge, santé, caractère." },
    { icon: Heart, step: "02", title: "Choisir", desc: "Trouvez le compagnon idéal en filtrant par race, sexe, âge et localisation européenne." },
    { icon: MessageSquare, step: "03", title: "Contacter", desc: "Envoyez un message WhatsApp directement depuis la fiche du chien qui vous intéresse." },
    { icon: ClipboardCheck, step: "04", title: "Échanger", desc: "Discutez de tous les détails : santé, documents, transport, logistique." },
    { icon: Home, step: "05", title: "Accueillir", desc: "Organisez l'arrivée de votre nouveau compagnon dans les meilleures conditions possibles." },
  ],
  en: [
    { icon: Search, step: "01", title: "Discover", desc: "Browse our catalog of available dogs and puppies with full details: breed, age, health, temperament." },
    { icon: Heart, step: "02", title: "Choose", desc: "Find your ideal companion by filtering by breed, sex, age and European location." },
    { icon: MessageSquare, step: "03", title: "Contact", desc: "Send a WhatsApp message directly from the dog's profile page." },
    { icon: ClipboardCheck, step: "04", title: "Exchange", desc: "Discuss all details: health, documents, transport, logistics." },
    { icon: Home, step: "05", title: "Welcome", desc: "Organise the arrival of your new companion in the best possible conditions." },
  ],
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HomeTimeline() {
  const { language } = useApp();
  const stepsData = steps[language as "fr" | "en"] ?? steps.fr;

  return (
    <div className="relative">
      {/* Connector line — desktop only */}
      <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0 mx-16" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 relative z-10"
      >
        {stepsData.map(({ icon: Icon, step, title, desc }) => (
          <motion.div
            key={step}
            variants={item}
            className="flex flex-col items-center text-center space-y-3"
          >
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
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

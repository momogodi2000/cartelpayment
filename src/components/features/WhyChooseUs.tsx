"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Heart, FileText, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  Heart,
  FileText,
  MessageCircle,
};

const values = {
  fr: [
    {
      icon: "ShieldCheck",
      title: "Sélection Rigoureuse",
      description: "Chaque chien est sélectionné selon des critères stricts de santé, de tempérament et de lignée vérifiés par notre équipe.",
    },
    {
      icon: "Heart",
      title: "Bien-être Animal",
      description: "Nos partenaires éleveurs respectent les standards européens de bien-être animal et pratiquent un élevage responsable.",
    },
    {
      icon: "FileText",
      title: "Transparence Totale",
      description: "Informations de santé, pedigree et historique complet présentés clairement pour chaque animal.",
    },
    {
      icon: "MessageCircle",
      title: "Contact Direct WhatsApp",
      description: "Un échange direct, rapide et personnalisé par WhatsApp pour répondre à toutes vos questions.",
    },
  ],
  en: [
    {
      icon: "ShieldCheck",
      title: "Rigorous Selection",
      description: "Every dog is selected according to strict health, temperament and lineage criteria verified by our team.",
    },
    {
      icon: "Heart",
      title: "Animal Welfare",
      description: "Our partner breeders comply with European animal welfare standards and responsible breeding practices.",
    },
    {
      icon: "FileText",
      title: "Full Transparency",
      description: "Health records, pedigrees and full history presented clearly for each animal.",
    },
    {
      icon: "MessageCircle",
      title: "Direct WhatsApp Contact",
      description: "Direct, fast and personalised WhatsApp exchanges to answer all your questions.",
    },
  ],
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function WhyChooseUs() {
  const { language } = useApp();
  const data = values[language as "fr" | "en"] ?? values.fr;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {data.map(({ icon, title, description }) => {
        const Icon = iconMap[icon] ?? ShieldCheck;
        return (
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
        );
      })}
    </motion.div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  MapPin,
  FileText,
  Check,
  ExternalLink,
  Award,
  ShieldAlert,
  Heart,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useCart } from "@/context/CartContext";
import { translateParrot, useTranslation } from "@/lib/translations";
import { getWhatsAppLink } from "@/lib/whatsapp";

type TabType = "overview" | "care" | "taming";

export default function ProductDetailModal() {
  const { language, selectedParrot, setSelectedParrot } = useApp();
  const { t } = useTranslation(language);
  const { addToCart, isInCart } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Reset index when parrot changes
  useEffect(() => {
    setActiveImageIndex(0);
    setActiveTab("overview");
  }, [selectedParrot]);

  if (!selectedParrot) return null;

  const translated = translateParrot(selectedParrot, language);
  const inCart = isInCart(selectedParrot.id);
  const isAvailable = selectedParrot.status === "AVAILABLE";

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const inquiryText = language === "en"
    ? `Hello! I am interested in the parrot ${translated.name} (Species: ${translated.species}) shown on your website. Could you please give me more information about its availability and shipping?`
    : `Bonjour ! Je suis intéressé(e) par le perroquet ${translated.name} (Espèce : ${translated.species}) présenté sur votre site. Pourriez-vous me donner plus d'informations sur sa disponibilité et son transport ?`;
  const whatsappUrl = getWhatsAppLink(phone, inquiryText);

  const images = selectedParrot.images || [];
  const primaryImage =
    images[activeImageIndex]?.url ||
    "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80";

  const sizeLabel = language === "en"
    ? `${translated.size} Size`
    : translated.size === "LARGE"
    ? "Grande Taille"
    : translated.size === "MEDIUM"
    ? "Taille Moyenne"
    : "Petite Taille";

  // Prevent scroll when modal is open
  if (typeof window !== "undefined") {
    if (selectedParrot) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }

  const handleClose = () => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "unset";
    }
    setSelectedParrot(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-5xl bg-bg-premium text-text-premium rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] z-10"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-white md:text-text-premium/70 hover:text-text-premium backdrop-blur-md transition-all shadow-sm"
            title={t("detail.close") as string}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Media & Thumbnails */}
          <div className="w-full md:w-1/2 flex flex-col bg-black/[0.02] dark:bg-white/[0.01] border-b md:border-b-0 md:border-r border-black/[0.06] dark:border-white/[0.06]">
            {/* Primary Large Image */}
            <div className="relative aspect-[4/3] sm:aspect-video md:aspect-[4/3] w-full overflow-hidden flex-grow min-h-[220px] sm:min-h-[280px]">
              <Image
                src={primaryImage}
                alt={images[activeImageIndex]?.alt || translated.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Rarity & Status Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                {translated.rarity === "EXCEPTIONAL" && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-accent text-white shadow-md">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    {translated.rarityLabel}
                  </span>
                )}
                {translated.rarity !== "EXCEPTIONAL" && (
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-white/95 text-primary shadow-sm border border-black/[0.03]">
                    {translated.rarityLabel}
                  </span>
                )}

                <span
                  className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold text-white shadow-md ${
                    translated.status === "AVAILABLE"
                      ? "bg-emerald-600"
                      : translated.status === "RESERVED"
                      ? "bg-amber-600"
                      : "bg-red-600"
                  }`}
                >
                  {translated.statusLabel}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto scrollbar-none bg-black/[0.01] dark:bg-white/[0.005] border-t border-black/[0.04] dark:border-white/[0.04]">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-14 w-18 sm:h-16 sm:w-22 rounded-xl overflow-hidden shrink-0 border-2 transition-all shadow-sm ${
                      idx === activeImageIndex
                        ? "border-primary scale-[1.03]"
                        : "border-transparent opacity-70 hover:opacity-100 hover:scale-[1.01]"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || translated.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Spec Grid, Tabs, Actions */}
          <div className="w-full md:w-1/2 flex flex-col h-full overflow-y-auto max-h-[60vh] md:max-h-full">
            <div className="p-6 sm:p-8 flex-grow space-y-6">
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-text-premium tracking-tight">
                      {translated.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-primary font-bold italic mt-0.5">
                      {translated.species}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary block">
                      ${Number(translated.price).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-text-premium/50 uppercase tracking-widest font-extrabold">
                      Value (USD)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-text-premium/65 font-medium pt-1">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{translated.origin}</span>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-xs">
                {translated.sex && (
                  <div className="space-y-0.5">
                    <span className="text-text-premium/40 font-bold uppercase tracking-wider text-[9px]">
                      {language === "en" ? "Gender / Sex" : "Sexe"}
                    </span>
                    <p className="font-extrabold text-text-premium">
                      {translated.sex === "MALE"
                        ? language === "en" ? "Male" : "Mâle"
                        : language === "en" ? "Female" : "Femelle"}
                    </p>
                  </div>
                )}
                {translated.age && (
                  <div className="space-y-0.5">
                    <span className="text-text-premium/40 font-bold uppercase tracking-wider text-[9px]">
                      {language === "en" ? "Age" : "Âge"}
                    </span>
                    <p className="font-extrabold text-text-premium">{translated.age}</p>
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="text-text-premium/40 font-bold uppercase tracking-wider text-[9px]">
                    {language === "en" ? "Size Class" : "Classe de Taille"}
                  </span>
                  <p className="font-extrabold text-text-premium uppercase">{sizeLabel}</p>
                </div>
                {translated.lifespan && (
                  <div className="space-y-0.5">
                    <span className="text-text-premium/40 font-bold uppercase tracking-wider text-[9px]">
                      {t("detail.lifespan")}
                    </span>
                    <p className="font-extrabold text-text-premium">{translated.lifespan}</p>
                  </div>
                )}
                {translated.weight && (
                  <div className="space-y-0.5">
                    <span className="text-text-premium/40 font-bold uppercase tracking-wider text-[9px]">
                      {t("detail.weight")}
                    </span>
                    <p className="font-extrabold text-text-premium">{translated.weight}</p>
                  </div>
                )}
                {translated.careLevel && (
                  <div className="space-y-0.5">
                    <span className="text-text-premium/40 font-bold uppercase tracking-wider text-[9px]">
                      {t("detail.care")}
                    </span>
                    <p className="font-extrabold text-text-premium">{translated.careLevel}</p>
                  </div>
                )}
              </div>

              {/* Dynamic Content Tabs */}
              <div className="space-y-4">
                {/* Tabs bar */}
                <div className="flex border-b border-black/[0.08] dark:border-white/[0.08]">
                  {(["overview", "care", "taming"] as TabType[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const labels = {
                      overview: language === "en" ? "Overview" : "Aperçu",
                      care: language === "en" ? "Diet & Care" : "Soin & Alimentation",
                      taming: language === "en" ? "Nursery & Health" : "Nurserie & Santé"
                    };

                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 pb-3 text-xs font-extrabold text-center border-b-2 transition-all ${
                          isActive
                            ? "border-primary text-primary"
                            : "border-transparent text-text-premium/50 hover:text-text-premium/80"
                        }`}
                      >
                        {labels[tab]}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Panel Content */}
                <div className="min-h-[120px] text-xs sm:text-sm leading-relaxed text-text-premium/80 space-y-3">
                  {activeTab === "overview" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <p>{translated.description}</p>
                      {translated.behavior && (
                        <div className="pt-2">
                          <h4 className="font-extrabold text-xs text-text-premium flex items-center gap-1.5 uppercase tracking-wide">
                            <Heart className="h-3.5 w-3.5 text-primary shrink-0" />
                            {t("detail.behaviorTitle")}
                          </h4>
                          <p className="text-xs text-text-premium/70 mt-1">{translated.behavior}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "care" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      {translated.feeding && (
                        <div>
                          <h4 className="font-extrabold text-xs text-text-premium flex items-center gap-1.5 uppercase tracking-wide">
                            <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                            {t("detail.feedingTitle")}
                          </h4>
                          <p className="text-xs text-text-premium/75 mt-1">{translated.feeding}</p>
                        </div>
                      )}
                      {translated.careInstructions && (
                        <div className="pt-2">
                          <h4 className="font-extrabold text-xs text-text-premium flex items-center gap-1.5 uppercase tracking-wide">
                            <Award className="h-3.5 w-3.5 text-primary shrink-0" />
                            {t("detail.careInstructions")}
                          </h4>
                          <p className="text-xs text-text-premium/70 mt-1">{translated.careInstructions}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "taming" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      {translated.domestication && (
                        <div>
                          <h4 className="font-extrabold text-xs text-text-premium flex items-center gap-1.5 uppercase tracking-wide">
                            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                            {t("detail.tamingTitle")}
                          </h4>
                          <p className="text-xs text-text-premium/75 mt-1">{translated.domestication}</p>
                        </div>
                      )}
                      {translated.healthNotes && (
                        <div className="pt-2">
                          <h4 className="font-extrabold text-xs text-text-premium flex items-center gap-1.5 uppercase tracking-wide">
                            <ShieldAlert className="h-3.5 w-3.5 text-primary shrink-0" />
                            {t("detail.healthTitle")}
                          </h4>
                          <p className="text-xs text-text-premium/70 mt-1">{translated.healthNotes}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="p-6 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.005] flex flex-wrap gap-3">
              {/* WhatsApp Inquiry */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow min-w-[140px] inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-[0.98] focus:outline-none"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{language === "en" ? "Inquire on WhatsApp" : "S'enquérir par WhatsApp"}</span>
              </a>

              {/* Add to reservation list */}
              {isAvailable && (
                <button
                  onClick={() => {
                    if (inCart) return;
                    addToCart({
                      id: selectedParrot.id,
                      name: translated.name,
                      slug: translated.slug,
                      species: translated.species,
                      price: Number(translated.price),
                      imageUrl: primaryImage,
                    });
                  }}
                  disabled={inCart}
                  className={`py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${
                    inCart
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                      : "border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-text-premium"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{t("detail.addedToCart")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>{t("cart.add")}</span>
                    </>
                  )}
                </button>
              )}

              {/* dedicated page link */}
              <Link
                href={`/catalog/${translated.slug}`}
                onClick={handleClose}
                className="inline-flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] hover:border-solid hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-xs font-bold text-text-premium/80 hover:text-text-premium transition-all"
              >
                <span>{t("detail.fullPage")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

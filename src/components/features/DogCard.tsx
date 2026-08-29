"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, MapPin, Heart, Shield, CheckCircle } from "lucide-react";
import { getDogInquiryMessage } from "@/data/site";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";
import type { Dog } from "@/data/dogs";

interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  const { language } = useApp();
  const { t } = useTranslation(language);

  const name = dog.name;
  const breedName = language === "en" ? dog.breedNameEn : dog.breedName;
  const description = language === "en" ? dog.descriptionEn : dog.description;
  const primaryImage = dog.images?.[0]?.url || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80";
  const primaryAlt = dog.images?.[0]?.alt || `${name} - ${breedName}`;

  const whatsappUrl = getDogInquiryMessage(name, breedName, dog.slug, language as "fr" | "en");
  const whatsappLink = `https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "33600000000").replace(/\D/g, "")}?text=${encodeURIComponent(whatsappUrl)}`;

  const isAvailable = dog.availability === "disponible";

  const availabilityLabel = () => {
    if (dog.availability === "disponible") return language === "fr" ? "Disponible" : "Available";
    if (dog.availability === "réservé") return language === "fr" ? "Réservé" : "Reserved";
    return language === "fr" ? "Vendu" : "Sold";
  };

  const availabilityClass = () => {
    if (dog.availability === "disponible") return "bg-emerald-600 text-white";
    if (dog.availability === "réservé") return "bg-amber-500 text-white";
    return "bg-red-600 text-white";
  };

  const sexLabel = dog.sex === "male"
    ? (language === "fr" ? "Mâle" : "Male")
    : (language === "fr" ? "Femelle" : "Female");

  return (
    <article className="flex flex-col bg-white dark:bg-black/10 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-xl hover:shadow-black/[0.08] hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 group overflow-hidden h-full">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-bg-premium overflow-hidden">
        <Image
          src={primaryImage}
          alt={primaryAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 pointer-events-none">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${availabilityClass()}`}>
            {availabilityLabel()}
          </span>
          {dog.featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary text-white shadow-sm">
              <Heart className="h-2.5 w-2.5" />
              {language === "fr" ? "Sélectionné" : "Featured"}
            </span>
          )}
        </div>

        {/* Trust badges top-right */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-none">
          {dog.pedigree && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-primary shadow-sm border border-black/[0.04]">
              <Shield className="h-2.5 w-2.5" />
              Pedigree
            </span>
          )}
          {(dog.vaccinations && dog.vaccinations.length > 0) && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-emerald-700 shadow-sm border border-black/[0.04]">
              <CheckCircle className="h-2.5 w-2.5" />
              {language === "fr" ? "Vacciné" : "Vaccinated"}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-extrabold text-base text-text-premium group-hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
              <p className="text-xs text-primary font-semibold italic">{breedName}</p>
            </div>
            <span className="font-black text-primary text-base whitespace-nowrap">
              {dog.price.toLocaleString("fr-FR")} {dog.currency}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-premium/60 font-medium">
            <span>{sexLabel}</span>
            <span>·</span>
            <span>{dog.age}</span>
            <span>·</span>
            <span className="capitalize">{language === "fr" ? dog.size : (dog.size === "petit" ? "Small" : dog.size === "moyen" ? "Medium" : "Large")}</span>
          </div>

          <p className="text-xs text-text-premium/60 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{dog.location}, {dog.country}</span>
          </p>

          <p className="text-sm text-text-premium/70 leading-relaxed line-clamp-2 pt-0.5">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex gap-2">
          <Link
            href={`/catalogue/${dog.slug}`}
            className="flex-grow text-center py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-xs font-bold text-text-premium transition-colors"
          >
            {t("card.details")}
          </Link>

          {isAvailable && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-grow inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t("card.inquire")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { MessageSquare, MapPin, Heart, Shield, CheckCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getDogInquiryMessage, getWhatsAppLink } from "@/data/site";
import { DISCOUNT_LABEL, PLACEHOLDER_IMAGE, type Dog } from "@/data/dogs";

interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  const locale = useLocale();
  const t = useTranslations("DogCard");

  const name = dog.name;
  const breedName = locale === "en" ? dog.breedNameEn : dog.breedName;
  const description = locale === "en" ? dog.descriptionEn : dog.description;
  const primaryImage = dog.images?.[0]?.url || PLACEHOLDER_IMAGE;
  const primaryAlt = dog.images?.[0]?.alt || `${name} - ${breedName}`;
  const priceLocale = locale === "en" ? "en-GB" : "fr-FR";
  const hasDiscount = typeof dog.originalPrice === "number" && dog.originalPrice > dog.price;

  const whatsappLink = getWhatsAppLink(
    getDogInquiryMessage(name, breedName, dog.slug, locale as "fr" | "en")
  );

  const isAvailable = dog.availability === "disponible";

  const availabilityLabel = () => {
    if (dog.availability === "disponible") return t("available");
    if (dog.availability === "réservé") return t("reserved");
    return t("sold");
  };

  const availabilityClass = () => {
    if (dog.availability === "disponible") return "bg-emerald-600 text-white";
    if (dog.availability === "réservé") return "bg-amber-500 text-white";
    return "bg-red-600 text-white";
  };

  const sexLabel = dog.sex === "male" ? t("male") : t("female");
  const sizeLabel = dog.size === "petit" ? t("small") : dog.size === "moyen" ? t("medium") : t("large");

  return (
    <article className="flex flex-col bg-white dark:bg-black/10 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-xl hover:shadow-black/[0.08] hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 group overflow-hidden h-full">
      <div className="relative aspect-[4/3] w-full bg-bg-premium overflow-hidden">
        <Image
          src={primaryImage}
          alt={primaryAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 pointer-events-none">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${availabilityClass()}`}>
            {availabilityLabel()}
          </span>
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-600 text-white shadow-sm">
              {DISCOUNT_LABEL}
            </span>
          )}
          {dog.featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary text-white shadow-sm">
              <Heart className="h-2.5 w-2.5" />
              {t("featured")}
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-none">
          {dog.pedigree && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-primary shadow-sm border border-black/[0.04]">
              <Shield className="h-2.5 w-2.5" />
              Pedigree
            </span>
          )}
          {dog.vaccinations && dog.vaccinations.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-emerald-700 shadow-sm border border-black/[0.04]">
              <CheckCircle className="h-2.5 w-2.5" />
              {t("vaccinated")}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-extrabold text-base text-text-premium group-hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
              <p className="text-xs text-primary font-semibold italic">{breedName}</p>
            </div>
            <span className="flex flex-col items-end leading-tight whitespace-nowrap">
              {hasDiscount && (
                <span className="text-[11px] font-semibold text-text-premium/40 line-through">
                  {dog.originalPrice.toLocaleString(priceLocale)} {dog.currency}
                </span>
              )}
              <span className="font-black text-primary text-base">
                {dog.price.toLocaleString(priceLocale)} {dog.currency}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-premium/60 font-medium">
            <span>{sexLabel}</span>
            <span>·</span>
            <span>{dog.age}</span>
            <span>·</span>
            <span>{sizeLabel}</span>
          </div>

          <p className="text-xs text-text-premium/60 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              {dog.location}, {dog.country}
            </span>
          </p>

          <p className="text-sm text-text-premium/70 leading-relaxed line-clamp-2 pt-0.5">{description}</p>
        </div>

        <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex gap-2">
          <Link
            href={`/catalogue/${dog.slug}`}
            className="flex-grow text-center py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-xs font-bold text-text-premium transition-colors"
          >
            {t("viewProfile")}
          </Link>

          {isAvailable && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-grow inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t("inquire")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

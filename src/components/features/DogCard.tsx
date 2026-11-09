"use client";

import React from "react";
import Image from "next/image";
import { MessageSquare, MapPin, Heart, Shield, CheckCircle, CreditCard } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getDogInquiryMessage, getWhatsAppLink } from "@/data/site";
import { formatMoney } from "@/lib/domain/money";
import { formatAgeFromDob } from "@/lib/domain/dates";

export interface UnifiedAnimalItem {
  id: string;
  slug: string;
  name: string;
  species?: string;
  breed?: {
    nameEn: string;
    nameFr: string;
  } | string;
  breedName?: string;
  breedNameEn?: string;
  city?: string;
  country?: string;
  location?: string;
  priceCents?: number;
  price?: number;
  currency?: string;
  status?: string;
  availability?: string;
  dateOfBirth?: Date | string;
  age?: string;
  gender?: string;
  sex?: string;
  size?: string;
  category?: string;
  featured?: boolean;
  pedigree?: string | boolean | null;
  microchip?: string | boolean | null;
  images?: Array<{
    url: string;
    alt?: string | null;
    altEn?: string | null;
    altFr?: string | null;
    publicId?: string | null;
  }>;
  descriptionEn?: string;
  descriptionFr?: string;
  description?: string;
}

interface DogCardProps {
  dog: UnifiedAnimalItem;
}

export default function DogCard({ dog }: DogCardProps) {
  const locale = useLocale();
  const t = useTranslations("DogCard");

  const name = dog.name;
  const isEn = locale === "en";
  const breedName =
    typeof dog.breed === "object"
      ? (isEn ? dog.breed?.nameEn : dog.breed?.nameFr) || dog.breedName || ""
      : isEn
      ? dog.breedNameEn || dog.breed || ""
      : dog.breedName || dog.breed || "";

  const primaryImage =
    dog.images?.[0]?.url || "/images/chien/golden-retriever-1.jpeg";
  const primaryAlt =
    (isEn ? dog.images?.[0]?.altEn : dog.images?.[0]?.altFr) ||
    dog.images?.[0]?.alt ||
    `${name} - ${breedName}`;

  // Real price in cents (no fake originalPrice discount)
  const priceCents = dog.priceCents ?? (dog.price ? Math.round(dog.price * 100) : 0);
  const formattedPrice = formatMoney(priceCents, dog.currency || "EUR", locale);

  const rawStatus = (dog.status || dog.availability || "AVAILABLE").toUpperCase();
  const isAvailable = rawStatus === "AVAILABLE" || rawStatus === "DISPONIBLE";
  const isHeld = rawStatus === "HELD" || rawStatus === "RÉSERVÉ";

  const availabilityLabel = () => {
    if (isAvailable) return t("available");
    if (isHeld) return t("reserved");
    return t("sold");
  };

  const availabilityClass = () => {
    if (isAvailable) return "bg-emerald-600 text-white";
    if (isHeld) return "bg-amber-500 text-white";
    return "bg-red-600 text-white";
  };

  const city = dog.city || dog.location || "France";
  const country = dog.country || "France";

  const displayAge = dog.dateOfBirth
    ? formatAgeFromDob(new Date(dog.dateOfBirth), locale)
    : dog.age || "";

  const whatsappLink = getWhatsAppLink(
    getDogInquiryMessage(name, breedName, dog.slug, locale as "fr" | "en")
  );

  return (
    <article className="flex flex-col bg-white dark:bg-black/10 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-xl hover:shadow-black/[0.08] hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 group overflow-hidden h-full">
      <div className="relative aspect-[4/3] w-full bg-[#F8F6F0] dark:bg-zinc-800 overflow-hidden">
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
          {dog.featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#183C32] text-white shadow-sm">
              <Heart className="h-2.5 w-2.5" />
              {t("featured")}
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-none">
          {dog.pedigree && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#183C32] shadow-sm border border-black/[0.04]">
              <Shield className="h-2.5 w-2.5" />
              Pedigree
            </span>
          )}
          {dog.microchip && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#183C32] shadow-sm border border-black/[0.04]">
              <CheckCircle className="h-2.5 w-2.5" />
              Puce
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white group-hover:text-[#183C32] dark:group-hover:text-emerald-400 transition-colors">
              {name}
            </h3>
            <span className="text-xl font-bold text-[#183C32] dark:text-emerald-400">
              {formattedPrice}
            </span>
          </div>

          <p className="text-xs uppercase tracking-wider font-semibold text-[#B69A65] mb-3">
            {breedName}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#B69A65]" />
              {city}, {country}
            </span>
            {displayAge && <span>• {displayAge}</span>}
          </div>
        </div>

        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
          <Link
            href={{ pathname: "/animals/[slug]", params: { slug: dog.slug } }}
            className="flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-[#183C32] text-white hover:bg-[#183C32]/90 shadow-sm transition-colors"
          >
            {isAvailable ? (locale === "fr" ? "Réserver / Adopter" : "Reserve / Adopt") : t("viewProfile")}
          </Link>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Concierge"
            className="p-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

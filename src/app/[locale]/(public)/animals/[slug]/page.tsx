import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Calendar,
  Weight,
  Palette,
  Info,
  CreditCard,
  Lock,
  Truck,
  FileCheck,
} from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getDogInquiryMessage, getWhatsAppLink, siteConfig } from "@/data/site";
import { getAnimalBySlug } from "@/lib/services/catalogue";
import { formatMoney } from "@/lib/domain/money";
import { formatAgeFromDob } from "@/lib/domain/dates";
import DogCard from "@/components/features/DogCard";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const data = await getAnimalBySlug(slug);
  if (!data?.animal) return {};

  const { animal } = data;
  const isEn = locale === "en";
  const title = animal.seoTitle || `${animal.name} – ${isEn ? animal.breed.nameEn : animal.breed.nameFr} | Pawelium`;
  const description = animal.seoDescription || (isEn ? animal.descriptionEn : animal.descriptionFr);
  const primaryImage = animal.images[0]?.url || "/images/chien/golden-retriever-1.jpeg";

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [{ url: primaryImage }],
    },
  };
}

export default async function AnimalDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DogDetail");
  const isEn = (await getLocale()) === "en";

  const data = await getAnimalBySlug(slug);
  if (!data?.animal) notFound();

  const { animal, related } = data;
  const name = animal.name;
  const breedName = isEn ? animal.breed.nameEn : animal.breed.nameFr;
  const description = isEn ? animal.descriptionEn : animal.descriptionFr;
  const temperaments: string[] = isEn
    ? JSON.parse(animal.temperamentEn || "[]")
    : JSON.parse(animal.temperamentFr || "[]");

  const formattedPrice = formatMoney(animal.priceCents, animal.currency, locale);
  const isAvailable = animal.status === "AVAILABLE";
  const isHeld = animal.status === "HELD";

  const displayAge = formatAgeFromDob(new Date(animal.dateOfBirth), locale);

  const whatsappUrl = getWhatsAppLink(
    getDogInquiryMessage(name, breedName, animal.slug, isEn ? "en" : "fr")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${animal.name} - ${breedName}`,
    image: animal.images.map((img) => img.url),
    description,
    brand: {
      "@type": "Brand",
      name: "Pawelium Concierge",
    },
    offers: {
      "@type": "Offer",
      price: (animal.priceCents / 100).toFixed(2),
      priceCurrency: animal.currency,
      availability: isAvailable
        ? "https://schema.org/InStock"
        : isHeld
        ? "https://schema.org/PreOrder"
        : "https://schema.org/SoldOut",
      url: `${siteConfig.siteUrl}/${locale}/animals/${animal.slug}`,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm font-medium">
        <Link
          href="/animals"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#183C32] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? "Back to catalogue" : "Retour au catalogue"}
        </Link>
      </nav>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-[#F8F6F0] border border-black/[0.06] shadow-sm">
            <Image
              src={animal.images[0]?.url || "/images/chien/golden-retriever-1.jpeg"}
              alt={`${animal.name} - ${breedName}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md ${
                  isAvailable
                    ? "bg-emerald-600"
                    : isHeld
                    ? "bg-amber-500"
                    : "bg-red-600"
                }`}
              >
                {isAvailable
                  ? isEn ? "Available for Adoption" : "Disponible à l'adoption"
                  : isHeld
                  ? isEn ? "Currently Reserved" : "Actuellement réservé"
                  : isEn ? "Adopted" : "Adopté"}
              </span>
            </div>
          </div>

          {animal.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {animal.images.slice(1, 5).map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[#F8F6F0] border border-black/[0.06]"
                >
                  <Image
                    src={img.url}
                    alt={`${animal.name} preview`}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    sizes="20vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Key Specs, Pricing, CTAs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#B69A65] mb-1">
                {breedName}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-[#B69A65]" />
                <span>{animal.city}, {animal.country}</span>
                <span>•</span>
                <span>{displayAge}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.06] flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[#183C32] dark:text-emerald-400">
                  {formattedPrice}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isEn ? "Includes health passport & veterinary exam" : "Comprend passeport européen et bilan vétérinaire"}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              {isAvailable ? (
                <Link
                  href={{ pathname: "/checkout", query: { animalId: animal.id } }}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-base font-bold bg-[#183C32] text-white hover:bg-[#183C32]/90 shadow-lg shadow-[#183C32]/10 transition-all hover:-translate-y-0.5"
                >
                  <CreditCard className="h-5 w-5 text-[#B69A65]" />
                  {isEn ? "Reserve Now Online" : "Réserver maintenant en ligne"}
                </Link>
              ) : (
                <div className="w-full text-center py-4 px-6 rounded-2xl text-sm font-bold bg-gray-100 dark:bg-zinc-800 text-gray-400">
                  {isHeld
                    ? isEn ? "Reserved – Contact us for standby list" : "Réservé – Contactez-nous pour la liste d'attente"
                    : isEn ? "This companion has found a home" : "Ce compagnon a déjà trouvé sa famille"}
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-semibold border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                {isEn ? "Ask Concierge on WhatsApp" : "Échanger avec notre conciergerie sur WhatsApp"}
              </a>
            </div>

            {/* Assurance Guarantees */}
            <div className="pt-6 border-t border-black/[0.06] space-y-3 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[#B69A65] shrink-0" />
                <span>{isEn ? "Certified Veterinary Health Guarantee" : "Garantie sanitaire et certificat vétérinaire officiel"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-[#B69A65] shrink-0" />
                <span>{isEn ? "Authorized climate-controlled European pet transport" : "Transport animalier agréé et climatisé à domicile"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-[#B69A65] shrink-0" />
                <span>{isEn ? "Secure checkout with escrow hold protection" : "Paiement sécurisé avec garantie de réservation 30 minutes"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Traits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-black/[0.06]">
        <div className="md:col-span-2 space-y-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            {isEn ? `About ${name}` : `À propos de ${name}`}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
            {description}
          </p>

          {temperaments.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#B69A65]">
                {isEn ? "Temperament & Behavior" : "Tempérament & Traits"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {temperaments.map((trait, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F8F6F0] dark:bg-zinc-800 text-[#183C32] dark:text-emerald-300 border border-black/[0.04]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Specifications & Medical Status */}
        <div className="bg-[#F8F6F0] dark:bg-zinc-800/50 rounded-3xl p-6 border border-black/[0.04] space-y-4">
          <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? "Official Identification" : "Identification & Santé"}
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-black/[0.04]">
              <span className="text-gray-500">{isEn ? "Microchip" : "Puce électronique"}</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {animal.microchip ? "ISO 11784/11785" : (isEn ? "Declared" : "Déclarée")}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-black/[0.04]">
              <span className="text-gray-500">{isEn ? "Pedigree" : "Pedigree officiel"}</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {animal.pedigree ? (isEn ? "Verified Lineage" : "Lignée certifiée") : (isEn ? "Available" : "Disponible")}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-black/[0.04]">
              <span className="text-gray-500">{isEn ? "Health Status" : "Statut sanitaire"}</span>
              <span className="font-bold text-emerald-600">
                {isEn ? "Veterinary Validated" : "Validé en clinique"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-black/[0.04]">
              <span className="text-gray-500">{isEn ? "Coat & Color" : "Robe & Couleur"}</span>
              <span className="font-bold text-gray-900 dark:text-white">{animal.color}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Animals */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-black/[0.06] space-y-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            {isEn ? "Other Companions You Might Love" : "D'autres compagnons à découvrir"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rel) => (
              <DogCard key={rel.id} dog={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

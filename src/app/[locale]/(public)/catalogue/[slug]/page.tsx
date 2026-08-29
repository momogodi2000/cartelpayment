import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  MessageSquare,
  ArrowLeft,
  Check,
  ShieldCheck,
  Heart,
  MapPin,
  Calendar,
  Weight,
  Palette,
  Info,
} from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getDogInquiryMessage, getWhatsAppLink, siteConfig } from "@/data/site";
import dogs from "@/data/dogs";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export function generateStaticParams() {
  return dogs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const dog = dogs.find((d) => d.slug === slug);
  if (!dog) return {};
  const path = `/catalogue/${slug}`;
  return {
    title: dog.seoTitle,
    description: dog.seoDescription,
    alternates: {
      canonical: locale === "fr" ? path : `/en${path}`,
      languages: { "fr-FR": path, "en-GB": `/en${path}`, "x-default": path },
    },
    openGraph: {
      title: dog.seoTitle,
      description: dog.seoDescription,
      images: dog.images[0] ? [{ url: dog.images[0].url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: dog.seoTitle,
      description: dog.seoDescription,
      images: dog.images[0] ? [dog.images[0].url] : [],
    },
  };
}

export default async function DogDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DogDetail");
  const isEn = (await getLocale()) === "en";

  const dog = dogs.find((d) => d.slug === slug);
  if (!dog) notFound();

  const name = dog.name;
  const breedName = isEn ? dog.breedNameEn : dog.breedName;
  const description = isEn ? dog.descriptionEn : dog.description;
  const temperament = isEn ? dog.temperamentEn : dog.temperament;
  const base = siteConfig.siteUrl;

  const whatsappUrl = getWhatsAppLink(getDogInquiryMessage(name, breedName, dog.slug, isEn ? "en" : "fr"));
  const isAvailable = dog.availability === "disponible";

  const availabilityLabel =
    dog.availability === "disponible" ? t("available") : dog.availability === "réservé" ? t("reserved") : t("sold");

  const availabilityClass =
    dog.availability === "disponible"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : dog.availability === "réservé"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";

  const sizeLabel = dog.size === "petit" ? t("small") : dog.size === "moyen" ? t("medium") : t("large");

  const infoItems = [
    { icon: MapPin, label: t("location"), value: `${dog.location}, ${dog.country}` },
    { icon: Calendar, label: t("age"), value: dog.age },
    { icon: Info, label: t("sex"), value: dog.sex === "male" ? t("male") : t("female") },
    { icon: Weight, label: t("weight"), value: dog.weight },
    { icon: Palette, label: t("color"), value: dog.color },
    { icon: Info, label: t("size"), value: sizeLabel },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${name} — ${breedName}`,
            description,
            image: dog.images.map((i) => i.url),
            category: breedName,
            offers: {
              "@type": "Offer",
              price: dog.price,
              priceCurrency: dog.currency,
              availability: isAvailable ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
              url: `${base}${isEn ? "/en" : ""}/catalogue/${dog.slug}`,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: isEn ? "Home" : "Accueil", item: base },
              {
                "@type": "ListItem",
                position: 2,
                name: t("breadcrumbDogs"),
                item: `${base}${isEn ? "/en" : ""}/catalogue`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name,
                item: `${base}${isEn ? "/en" : ""}/catalogue/${dog.slug}`,
              },
            ],
          }),
        }}
      />

      <Link
        href="/catalogue"
        className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/60 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToCatalog")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-3">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-bg-premium">
            <Image
              src={dog.images[0]?.url || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"}
              alt={dog.images[0]?.alt || `${name} - ${breedName}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {dog.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {dog.images.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.alt || `${name} ${i + 2}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="17vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${availabilityClass}`}>
                {availabilityLabel}
              </span>
              {dog.pedigree && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Pedigree
                </span>
              )}
              {dog.featured && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                  <Heart className="h-3.5 w-3.5" /> {t("featured")}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-text-premium">{name}</h1>
            <p className="text-lg text-primary font-semibold italic">{breedName}</p>
            <p className="text-3xl font-black text-primary">
              {dog.price.toLocaleString(isEn ? "en-GB" : "fr-FR")} {dog.currency}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-text-premium/50 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-text-premium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">{t("description")}</h2>
            <p className="text-sm text-text-premium/70 leading-relaxed">{description}</p>
          </div>

          {temperament.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">{t("temperament")}</h2>
              <div className="flex flex-wrap gap-2">
                {temperament.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/15"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dog.marketDetails && (
            <div className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
              <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">{t("marketTitle")}</h2>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-bold text-text-premium/80">{t("avgPrice")}</span>{" "}
                  <span className="text-text-premium/60">{dog.marketDetails.averageEuropeanPrice}</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-text-premium/80">{t("lineage")}</span>{" "}
                  <span className="text-text-premium/60">{dog.marketDetails.breedingLineage}</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-text-premium/80">{t("guarantees")}</span>{" "}
                  <span className="text-text-premium/60">{dog.marketDetails.healthGuarantee}</span>
                </div>
              </div>
            </div>
          )}

          {dog.vaccinations && dog.vaccinations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
              <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">
                {t("vaccinationRecord")}
              </h2>
              <ul className="space-y-2">
                {dog.vaccinations.map((vac, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{vac.disease}</span>
                      </div>
                      <div className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1 ml-6">
                        {t("veterinarian")} {vac.veterinarian}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 ml-6 sm:ml-0 text-xs font-medium text-emerald-700 dark:text-emerald-400 text-left sm:text-right">
                      <div>
                        {t("doneOn")} {vac.date}
                      </div>
                      <div>
                        {t("nextDue")} {vac.nextDueDate}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {dog.microchip && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60">
                <Check className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">{t("microchipped")}</span>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-3">
            {isAvailable ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <MessageSquare className="h-5 w-5" />
                {t("contactWhatsapp")}
              </a>
            ) : (
              <div className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-text-premium/10 text-text-premium/50 font-extrabold text-base cursor-not-allowed">
                {availabilityLabel}
              </div>
            )}
            <p className="text-xs text-text-premium/50 text-center leading-relaxed">{t("prefilledNote")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

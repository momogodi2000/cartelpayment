import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
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
  AlertCircle,
} from "lucide-react";
import { getDogInquiryMessage, getWhatsAppLink } from "@/data/site";
import { getServerTranslation } from "@/lib/serverTranslations";
import dogs from "@/data/dogs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return dogs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const dog = dogs.find((d) => d.slug === slug);
  if (!dog) return {};
  return {
    title: `${dog.seoTitle} | PawElite`,
    description: dog.seoDescription,
    openGraph: {
      title: `${dog.seoTitle} | PawElite`,
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
  const { slug } = await params;
  const { locale } = await getServerTranslation();

  const dog = dogs.find((d) => d.slug === slug);
  if (!dog) notFound();

  const name = dog.name;
  const breedName = locale === "en" ? dog.breedNameEn : dog.breedName;
  const description = locale === "en" ? dog.descriptionEn : dog.description;
  const temperament = locale === "en" ? dog.temperamentEn : dog.temperament;

  const inquiryMessage = getDogInquiryMessage(name, breedName, dog.slug, locale as "fr" | "en");
  const whatsappUrl = getWhatsAppLink(inquiryMessage);

  const isAvailable = dog.availability === "disponible";

  const availabilityLabel =
    dog.availability === "disponible"
      ? locale === "fr" ? "Disponible" : "Available"
      : dog.availability === "réservé"
      ? locale === "fr" ? "Réservé" : "Reserved"
      : locale === "fr" ? "Vendu" : "Sold";

  const availabilityClass =
    dog.availability === "disponible"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : dog.availability === "réservé"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";

  const infoItems = [
    { icon: MapPin, label: locale === "fr" ? "Localisation" : "Location", value: `${dog.location}, ${dog.country}` },
    { icon: Calendar, label: locale === "fr" ? "Age" : "Age", value: dog.age },
    { icon: Info, label: locale === "fr" ? "Sexe" : "Sex", value: dog.sex === "male" ? (locale === "fr" ? "Male" : "Male") : (locale === "fr" ? "Femelle" : "Female") },
    { icon: Weight, label: locale === "fr" ? "Poids" : "Weight", value: dog.weight },
    { icon: Palette, label: locale === "fr" ? "Couleur" : "Color", value: dog.color },
    { icon: Info, label: locale === "fr" ? "Taille" : "Size", value: locale === "fr" ? (dog.size === "petit" ? "Petit" : dog.size === "moyen" ? "Moyen" : "Grand") : (dog.size === "petit" ? "Small" : dog.size === "moyen" ? "Medium" : "Large") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": locale === "en" ? "Home" : "Accueil", "item": process.env.NEXT_PUBLIC_SITE_URL },
              { "@type": "ListItem", "position": 2, "name": locale === "en" ? "Dogs" : "Chiens", "item": `${process.env.NEXT_PUBLIC_SITE_URL}/catalogue` },
              { "@type": "ListItem", "position": 3, "name": name, "item": `${process.env.NEXT_PUBLIC_SITE_URL}/catalogue/${dog.slug}` },
            ],
          }),
        }}
      />

      <Link href="/catalogue" className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/60 hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {locale === "fr" ? "Retour au Catalogue" : "Back to Catalog"}
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
                  <Image src={img.url} alt={img.alt} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="17vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${availabilityClass}`}>{availabilityLabel}</span>
              {dog.pedigree && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Pedigree
                </span>
              )}
              {dog.featured && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                  <Heart className="h-3.5 w-3.5" /> {locale === "fr" ? "Selectionne" : "Featured"}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-text-premium">{name}</h1>
            <p className="text-lg text-primary font-semibold italic">{breedName}</p>
            <p className="text-3xl font-black text-primary">{dog.price.toLocaleString("fr-FR")} {dog.currency}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]">
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
            <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">Description</h2>
            <p className="text-sm text-text-premium/70 leading-relaxed">{description}</p>
          </div>

          {temperament.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">{locale === "fr" ? "Tempérament" : "Temperament"}</h2>
              <div className="flex flex-wrap gap-2">
                {temperament.map((trait) => (
                  <span key={trait} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/15">{trait}</span>
                ))}
              </div>
            </div>
          )}

          {dog.marketDetails && (
            <div className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
              <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">{locale === "fr" ? "Détails du Marché & Élevage" : "Market & Breeding Details"}</h2>
              <div className="space-y-2">
                <div className="text-sm"><span className="font-bold text-text-premium/80">{locale === "fr" ? "Prix Moyen Européen :" : "Average European Price:"}</span> <span className="text-text-premium/60">{dog.marketDetails.averageEuropeanPrice}</span></div>
                <div className="text-sm"><span className="font-bold text-text-premium/80">{locale === "fr" ? "Lignée :" : "Lineage:"}</span> <span className="text-text-premium/60">{dog.marketDetails.breedingLineage}</span></div>
                <div className="text-sm"><span className="font-bold text-text-premium/80">{locale === "fr" ? "Garanties :" : "Guarantees:"}</span> <span className="text-text-premium/60">{dog.marketDetails.healthGuarantee}</span></div>
              </div>
            </div>
          )}

          {dog.vaccinations && dog.vaccinations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
              <h2 className="text-sm font-extrabold text-text-premium uppercase tracking-wider">{locale === "fr" ? "Carnet de Vaccination" : "Vaccination Record"}</h2>
              <ul className="space-y-2">
                {dog.vaccinations.map((vac, idx) => (
                  <li key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{vac.disease}</span>
                      </div>
                      <div className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1 ml-6">
                        {locale === "fr" ? "Vétérinaire :" : "Veterinarian:"} {vac.veterinarian}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 ml-6 sm:ml-0 text-xs font-medium text-emerald-700 dark:text-emerald-400 text-left sm:text-right">
                      <div>{locale === "fr" ? "Fait le :" : "Done on:"} {vac.date}</div>
                      <div>{locale === "fr" ? "Rappel :" : "Next due:"} {vac.nextDueDate}</div>
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
                <span className="text-xs font-bold text-blue-700">{locale === "fr" ? "Micropuce" : "Microchipped"}</span>
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
                {locale === "fr" ? "Contacter via WhatsApp" : "Contact via WhatsApp"}
              </a>
            ) : (
              <div className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-text-premium/10 text-text-premium/50 font-extrabold text-base cursor-not-allowed">
                {availabilityLabel}
              </div>
            )}
            <p className="text-xs text-text-premium/50 text-center leading-relaxed">
              {locale === "fr" ? "Un message pre-rempli vous facilitera la prise de contact." : "A pre-filled message will open in WhatsApp."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

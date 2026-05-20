import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, ShieldAlert, Check } from "lucide-react";
import prisma from "@/lib/db";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { getServerTranslation, getServerLocale } from "@/lib/serverTranslations";
import { translateParrot } from "@/lib/translations";
import DetailGallery from "./DetailGallery";
import AddToCartButton from "@/components/common/AddToCartButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  
  try {
    const parrot = await prisma.parrot.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (!parrot) return {};

    const translated = translateParrot(parrot, locale);
    const pageTitle = locale === "en"
      ? `${translated.name} (${translated.species}) | AraHaven Aviary`
      : `${translated.name} (${translated.species}) | Élevage AraHaven`;
    
    const pageDesc = translated.shortDescription;
    const coverImage = translated.images[0]?.url || "";

    return {
      title: pageTitle,
      description: pageDesc,
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        images: coverImage ? [{ url: coverImage }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDesc,
        images: coverImage ? [coverImage] : [],
      },
    };
  } catch {
    return {
      title: "Parrot Specifications",
    };
  }
}

// 2. Main Page Render
export default async function ParrotDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getServerTranslation();

  const parrot = await prisma.parrot.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!parrot) {
    notFound();
  }

  const translated = translateParrot(parrot, locale);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  
  // Custom pre-filled contact message templates
  const inquiryText = locale === "en"
    ? `Hello! I am interested in the parrot ${translated.name} (Species: ${translated.species}) shown on your website. Could you please give me more information about its availability and shipping?`
    : `Bonjour ! Je suis intéressé(e) par le perroquet ${translated.name} (Espèce : ${translated.species}) présenté sur votre site. Pourriez-vous me donner plus d'informations sur sa disponibilité et son transport ?`;
  
  const whatsappUrl = getWhatsAppLink(phone, inquiryText);

  // Schema.org Availability Code Mapping
  let schemaAvailability = "https://schema.org/InStock";
  if (translated.status === "RESERVED") schemaAvailability = "https://schema.org/PreOrder";
  if (translated.status === "SOLD") schemaAvailability = "https://schema.org/OutOfStock";

  const specRows = [
    { label: locale === "en" ? "Species (Scientific)" : "Espèce (Scientifique)", value: translated.species, highlight: true },
    { label: locale === "en" ? "Sex (DNA Certified)" : "Sexe (Certifié ADN)", value: translated.sexLabel },
    { label: locale === "en" ? "Age" : "Âge", value: translated.age },
    { label: locale === "en" ? "Rarity Status" : "Statut de Rareté", value: translated.rarityLabel },
    { label: locale === "en" ? "Bird Size" : "Taille de l'Oiseau", value: translated.sizeLabel },
    { label: locale === "en" ? "Origin Sanctuary" : "Sanctuaire d'Origine", value: translated.origin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Schema.org Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": translated.name,
            "image": translated.images.map((img: { url: string }) => img.url),
            "description": translated.description,
            "category": "Birds",
            "brand": {
              "@type": "Brand",
              "name": "AraHaven Aviary"
            },
            "offers": {
              "@type": "Offer",
              "price": Number(translated.price),
              "priceCurrency": "USD",
              "availability": schemaAvailability,
              "url": `https://arahaven.com/catalog/${translated.slug}`
            }
          })
        }}
      />

      {/* Back Button */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/60 hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> {locale === "en" ? "Back to Catalog" : "Retour au catalogue"}
        </Link>
      </div>

      {/* Two-Column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Images */}
        <div className="lg:col-span-5">
          <DetailGallery images={translated.images} parrotName={translated.name} />
        </div>

        {/* Right Side: Details & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                translated.status === "AVAILABLE" ? "bg-emerald-600" : translated.status === "RESERVED" ? "bg-amber-600" : "bg-red-600"
              }`}>
                {translated.statusLabel}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-primary border border-black/[0.08] shadow-sm">
                {translated.rarityLabel}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-premium leading-tight tracking-tight">
              {translated.name}
            </h1>
            <p className="text-2xl font-extrabold text-primary">${Number(translated.price).toLocaleString()}</p>
          </div>

          <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
            {translated.description}
          </p>

          {/* Primary & Secondary Conversion CTA Cards */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-text-premium">
              {locale === "en" ? "Adopt This Companion" : "Adopter ce compagnon"}
            </h3>
            <p className="text-xs text-text-premium/65 leading-relaxed">
              {locale === "en"
                ? "We arrange secure international/domestic flights, veterinary testing clearances, and closed-ring CITES certifications. Direct inquiry via WhatsApp secures reservation discussions."
                : "Nous organisons des vols sécurisés nationaux et internationaux, les examens vétérinaires et les permis CITES de bague fermée. Une demande directe sur WhatsApp permet de réserver."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <AddToCartButton
                item={{
                  id: parrot.id,
                  name: translated.name,
                  slug: translated.slug,
                  species: translated.species,
                  price: Number(translated.price),
                  imageUrl: translated.images[0]?.url || "/logo.png",
                }}
                status={translated.status}
              />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageSquare className="h-4 w-4 fill-white text-emerald-600" />
                {locale === "en" ? "Inquire on WhatsApp" : "S'enquérir sur WhatsApp"}
              </a>
            </div>
          </div>

          {/* Spec Sheet Table */}
          <div className="border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm bg-white">
            <div className="px-6 py-4 border-b border-black/[0.04]">
              <h3 className="font-extrabold text-sm text-text-premium">
                {locale === "en" ? "Specifications" : "Spécifications"}
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <tbody>
                {specRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-black/[0.03] last:border-b-0 hover:bg-bg-premium/40 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-semibold text-text-premium/60 w-1/3">
                      {row.label}
                    </td>
                    <td className={`px-6 py-3.5 text-text-premium ${row.highlight ? "font-bold italic text-primary" : "font-semibold"}`}>
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rearing, Behavior & Food Tabs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-black/[0.05]">
        <div className="space-y-3 bg-white p-6 rounded-3xl border border-black/[0.06]">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Check className="h-4 w-4" />
          </div>
          <h3 className="font-extrabold text-sm text-text-premium">
            {locale === "en" ? "Behavior & Character" : "Comportement & Caractère"}
          </h3>
          <p className="text-xs text-text-premium/70 leading-relaxed">{translated.behavior}</p>
        </div>

        <div className="space-y-3 bg-white p-6 rounded-3xl border border-black/[0.06]">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Check className="h-4 w-4" />
          </div>
          <h3 className="font-extrabold text-sm text-text-premium">
            {locale === "en" ? "Nutrition & Feeding" : "Nutrition & Alimentation"}
          </h3>
          <p className="text-xs text-text-premium/70 leading-relaxed">{translated.feeding}</p>
        </div>

        <div className="space-y-3 bg-white p-6 rounded-3xl border border-black/[0.06]">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Check className="h-4 w-4" />
          </div>
          <h3 className="font-extrabold text-sm text-text-premium">
            {locale === "en" ? "Taming & Nursery Details" : "Apprivoisement & Nurserie"}
          </h3>
          <p className="text-xs text-text-premium/70 leading-relaxed">{translated.domestication}</p>
        </div>
      </section>

      {/* Safety Notice Warning Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex gap-3 text-left">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-xs text-amber-800 block">
            {locale === "en" ? "Health & Legality Certification" : "Certification de Santé & Légalité"}
          </span>
          <span className="text-xs text-amber-700 leading-relaxed block">
            {translated.healthNotes}. {locale === "en" ? "AraHaven ensures complete legal clearance prior to export/transfer." : "AraHaven assure le dédouanement légal complet avant l'exportation ou le transfert."}
          </span>
        </div>
      </div>
    </div>
  );
}

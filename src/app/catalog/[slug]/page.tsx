import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Heart, ShieldAlert, Award, ShieldCheck, Check } from "lucide-react";
import prisma from "@/lib/db";
import { getWhatsAppLink } from "@/lib/whatsapp";
import DetailGallery from "./DetailGallery";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    const parrot = await prisma.parrot.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (!parrot) return {};

    const pageTitle = `${parrot.name} (${parrot.species}) | AraHaven Aviary`;
    const pageDesc = parrot.shortDescription;
    const coverImage = parrot.images[0]?.url || "";

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
  } catch (error) {
    return {
      title: "Parrot Specifications",
    };
  }
}

// 2. Main Page Render
export default async function ParrotDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const parrot = await prisma.parrot.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!parrot) {
    notFound();
  }

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  
  // Custom pre-filled contact message templates
  const inquiryText = `Hello! I am interested in the parrot ${parrot.name} (Species: ${parrot.species}) shown on your website. Could you please give me more information about its availability and shipping?`;
  const whatsappUrl = getWhatsAppLink(phone, inquiryText);

  // Schema.org Availability Code Mapping
  let schemaAvailability = "https://schema.org/InStock";
  if (parrot.status === "RESERVED") schemaAvailability = "https://schema.org/PreOrder";
  if (parrot.status === "SOLD") schemaAvailability = "https://schema.org/OutOfStock";

  const specRows = [
    { label: "Species (Scientific)", value: parrot.species, highlight: true },
    { label: "Sex (DNA Certified)", value: parrot.sex },
    { label: "Age", value: parrot.age },
    { label: "Rarity Status", value: parrot.rarity },
    { label: "Bird Size", value: parrot.size },
    { label: "Origin Sanctuary", value: parrot.origin },
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
            "name": parrot.name,
            "image": parrot.images.map((img) => img.url),
            "description": parrot.description,
            "category": "Birds",
            "brand": {
              "@type": "Brand",
              "name": "AraHaven Aviary"
            },
            "offers": {
              "@type": "Offer",
              "price": Number(parrot.price),
              "priceCurrency": "USD",
              "availability": schemaAvailability,
              "url": `https://arahaven.com/catalog/${parrot.slug}`
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
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>

      {/* Two-Column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Images */}
        <div className="lg:col-span-5">
          <DetailGallery images={parrot.images} parrotName={parrot.name} />
        </div>

        {/* Right Side: Details & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                parrot.status === "AVAILABLE" ? "bg-emerald-600" : parrot.status === "RESERVED" ? "bg-amber-600" : "bg-red-600"
              }`}>
                {parrot.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-primary border border-black/[0.08] shadow-sm">
                {parrot.rarity} Rarity
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-premium leading-tight tracking-tight">
              {parrot.name}
            </h1>
            <p className="text-2xl font-extrabold text-primary">${Number(parrot.price).toLocaleString()}</p>
          </div>

          <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
            {parrot.description}
          </p>

          {/* Primary & Secondary Conversion CTA Cards */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-text-premium">Adopt This Companion</h3>
            <p className="text-xs text-text-premium/65 leading-relaxed">
              We arrange secure international/domestic flights, veterinary testing clearances, and closed-ring CITES certifications. Direct inquiry via WhatsApp secures reservation discussions.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors"
              >
                <MessageSquare className="h-5 w-5 fill-white text-emerald-600" />
                Inquire on WhatsApp
              </a>
              <Link
                href="/contact"
                className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 bg-white hover:bg-black/[0.01] text-text-premium font-bold px-8 py-3.5 rounded-xl border border-black/[0.08] shadow-sm transition-colors"
              >
                Send Message Form
              </Link>
            </div>
          </div>

          {/* Spec Sheet Table */}
          <div className="border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm bg-white">
            <div className="px-6 py-4 border-b border-black/[0.04]">
              <h3 className="font-extrabold text-sm text-text-premium">Specifications</h3>
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
          <h3 className="font-extrabold text-sm text-text-premium">Behavior & Character</h3>
          <p className="text-xs text-text-premium/70 leading-relaxed">{parrot.behavior}</p>
        </div>

        <div className="space-y-3 bg-white p-6 rounded-3xl border border-black/[0.06]">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Check className="h-4 w-4" />
          </div>
          <h3 className="font-extrabold text-sm text-text-premium">Nutrition & Feeding</h3>
          <p className="text-xs text-text-premium/70 leading-relaxed">{parrot.feeding}</p>
        </div>

        <div className="space-y-3 bg-white p-6 rounded-3xl border border-black/[0.06]">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Check className="h-4 w-4" />
          </div>
          <h3 className="font-extrabold text-sm text-text-premium">Taming & Nursery Details</h3>
          <p className="text-xs text-text-premium/70 leading-relaxed">{parrot.domestication}</p>
        </div>
      </section>

      {/* Safety Notice Warning Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex gap-3 text-left">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-xs text-amber-800 block">Health & Legality Certification</span>
          <span className="text-xs text-amber-700 leading-relaxed block">
            {parrot.healthNotes}. AraHaven ensures complete legal clearance prior to export/transfer.
          </span>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface ParrotImage {
  url: string;
  alt: string;
}

interface ParrotCardProps {
  parrot: {
    id: string;
    name: string;
    slug: string;
    species: string;
    shortDescription: string;
    price: number | any;
    status: "AVAILABLE" | "RESERVED" | "SOLD" | any;
    rarity: "COMMON" | "RARE" | "EXCEPTIONAL" | any;
    origin: string;
    size: "SMALL" | "MEDIUM" | "LARGE" | any;
    images: ParrotImage[];
  };
}

export default function ParrotCard({ parrot }: ParrotCardProps) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  
  // Custom pre-filled message for this specific parrot
  const inquiryText = `Hello! I am interested in the parrot ${parrot.name} (Species: ${parrot.species}) shown on your website. Could you please give me more information about its availability and shipping?`;
  const whatsappUrl = getWhatsAppLink(phone, inquiryText);

  const primaryImage =
    parrot.images[0]?.url ||
    "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-black/[0.06] shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden h-full">
      {/* Image and Badges */}
      <div className="relative aspect-[4/3] w-full bg-bg-premium overflow-hidden">
        <Image
          src={primaryImage}
          alt={parrot.images[0]?.alt || parrot.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {parrot.rarity === "EXCEPTIONAL" && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-accent text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              {parrot.rarity}
            </span>
          )}
          {parrot.rarity !== "EXCEPTIONAL" && (
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-white/95 text-primary shadow-sm border border-black/[0.03]">
              {parrot.rarity}
            </span>
          )}
          
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold text-white shadow-sm ${
              parrot.status === "AVAILABLE"
                ? "bg-emerald-600"
                : parrot.status === "RESERVED"
                ? "bg-amber-600"
                : "bg-red-600"
            }`}
          >
            {parrot.status}
          </span>
        </div>
      </div>

      {/* Bird Information */}
      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-extrabold text-lg text-text-premium group-hover:text-primary transition-colors line-clamp-1">
              {parrot.name}
            </h3>
            <span className="font-extrabold text-primary text-base whitespace-nowrap">
              ${Number(parrot.price).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-primary italic">{parrot.species}</span>
            <span className="text-text-premium/50 uppercase">{parrot.size} Size</span>
          </div>

          <p className="text-xs text-text-premium/60 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{parrot.origin}</span>
          </p>

          <p className="text-sm text-text-premium/70 leading-relaxed line-clamp-2 pt-1">
            {parrot.shortDescription}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-black/[0.04] flex gap-2">
          <Link
            href={`/catalog/${parrot.slug}`}
            className="flex-1 text-center py-2.5 rounded-xl border border-black/[0.08] hover:bg-black/[0.02] text-xs font-bold text-text-premium transition-colors"
          >
            Details
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Inquire Now
          </a>
        </div>
      </div>
    </div>
  );
}

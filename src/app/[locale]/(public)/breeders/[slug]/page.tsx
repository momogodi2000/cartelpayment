import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, ShieldCheck, AlertCircle } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import prisma from "@/lib/db/client";
import DogCard from "@/components/features/DogCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const breeder = await prisma.breeder.findUnique({ where: { slug } });
  if (!breeder) return { title: "Breeder Not Found | Pawelium" };

  const isVerified = breeder.verificationStatus === "VERIFIED";
  const isFr = locale === "fr";
  const title = isFr
    ? `${breeder.name} · Élevage Partenaire ${breeder.city}, ${breeder.country} | Pawelium`
    : `${breeder.name} · Partner Breeder ${breeder.city}, ${breeder.country} | Pawelium`;
  const description = isFr ? breeder.descriptionFr : breeder.descriptionEn;

  return {
    title,
    description: description.slice(0, 160),
    // Not indexed while unverified to avoid thin or low-trust indexation
    robots: isVerified ? undefined : { index: false, follow: false },
    alternates: {
      canonical: isFr ? `/fr/eleveurs/${slug}` : `/en/breeders/${slug}`,
      languages: {
        "fr-FR": `/fr/eleveurs/${slug}`,
        "en-GB": `/en/breeders/${slug}`,
        "x-default": `/en/breeders/${slug}`,
      },
    },
  };
}

export default async function BreederProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const breeder = await prisma.breeder.findUnique({
    where: { slug },
    include: {
      animals: {
        where: { published: true, isPaymentTest: false },
        include: { images: true, breed: true },
      },
    },
  });

  if (!breeder) {
    notFound();
  }

  const isFr = locale === "fr";
  const isVerified = breeder.verificationStatus === "VERIFIED";
  const desc = isFr ? breeder.descriptionFr : breeder.descriptionEn;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-4">
        <Link
          href="/animals"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isFr ? "Retour au catalogue" : "Back to Catalog"}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-premium/60">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{breeder.city}, {breeder.country}</span>
          </div>

          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isFr ? "Éleveur Européen Vérifié" : "Verified European Breeder"}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{isFr ? "Vérification en cours" : "Verification in Progress"}</span>
            </span>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {breeder.name}
        </h1>

        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed max-w-3xl">
          {desc}
        </p>
      </div>

      <div className="border-t border-border pt-8 space-y-6">
        <h2 className="text-2xl font-bold font-heading text-text-premium">
          {isFr
            ? `Animaux de cet élevage (${breeder.animals.length})`
            : `Companions from this Breeder (${breeder.animals.length})`}
        </h2>

        {breeder.animals.length === 0 ? (
          <p className="text-sm text-text-premium/50 italic">
            {isFr
              ? "Aucun animal disponible actuellement chez cet éleveur."
              : "No animals currently available from this breeder."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {breeder.animals.map((animal) => {
              const mapped = {
                id: animal.id,
                name: animal.name,
                breed: isFr ? animal.breed.nameFr : animal.breed.nameEn,
                species: animal.species.toLowerCase() as "dog" | "cat",
                price: animal.priceCents / 100,
                image: animal.images[0]?.url || "/images/placeholder.jpg",
                slug: animal.slug,
                available: animal.status === "AVAILABLE",
                badges: [animal.status],
                isDiscounted: false,
                discountRate: 0,
              };
              return <DogCard key={animal.id} dog={mapped} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

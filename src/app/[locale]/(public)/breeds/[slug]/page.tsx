import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
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
  const breed = await prisma.breed.findUnique({ where: { slug } });
  if (!breed) return { title: "Breed Not Found | Pawelium" };

  const isFr = locale === "fr";
  const breedName = isFr ? breed.nameFr : breed.nameEn;
  const title = isFr
    ? `${breedName} · Chiots & Élevage Européen | Pawelium`
    : `${breedName} · Puppies & European Breeding | Pawelium`;
  const description = isFr ? breed.descriptionFr : breed.descriptionEn;

  return {
    title,
    description: description.slice(0, 160),
    alternates: {
      canonical: isFr ? `/fr/races/${slug}` : `/en/breeds/${slug}`,
      languages: {
        "fr-FR": `/fr/races/${slug}`,
        "en-GB": `/en/breeds/${slug}`,
        "x-default": `/en/breeds/${slug}`,
      },
    },
  };
}

export default async function BreedLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const breed = await prisma.breed.findUnique({
    where: { slug },
    include: {
      animals: {
        where: { published: true },
        include: { images: true, breed: true },
      },
    },
  });

  // Only for breeds that have animals, to avoid thin pages
  if (!breed || breed.animals.length === 0) {
    notFound();
  }

  const isFr = locale === "fr";
  const breedName = isFr ? breed.nameFr : breed.nameEn;
  const desc = isFr ? breed.descriptionFr : breed.descriptionEn;

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

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-4 w-4" />
          <span>{breed.species === "DOG" ? (isFr ? "Race Canine" : "Dog Breed") : (isFr ? "Race Féline" : "Cat Breed")}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {breedName}
        </h1>

        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed max-w-3xl">
          {desc}
        </p>
      </div>

      <div className="border-t border-border pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-heading text-text-premium">
            {isFr ? `Compagnons disponibles (${breed.animals.length})` : `Available Companions (${breed.animals.length})`}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {breed.animals.map((animal) => {
            const mapped = {
              id: animal.id,
              name: animal.name,
              breed: breedName,
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
      </div>
    </div>
  );
}

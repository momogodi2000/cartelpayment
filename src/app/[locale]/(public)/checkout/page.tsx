import React from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { calculatePricing } from "@/lib/domain/pricing";
import { formatMoney } from "@/lib/domain/money";
import { ShieldCheck, Truck, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import CheckoutClientForm from "./CheckoutClientForm";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ animalId?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { animalId } = await searchParams;

  if (!animalId) {
    redirect(`/${locale}/animals`);
  }

  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    include: {
      breed: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (!animal || animal.status !== "AVAILABLE") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          {locale === "fr" ? "Compagnon indisponible" : "Companion Unavailable"}
        </h1>
        <p className="text-gray-600">
          {locale === "fr"
            ? "Ce profil a déjà été réservé ou adopté par un autre foyer."
            : "This companion has already been reserved or adopted by another family."}
        </p>
        <Link
          href="/animals"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "fr" ? "Découvrir nos autres compagnons" : "Discover available companions"}
        </Link>
      </div>
    );
  }

  const isEn = locale === "en";
  const breedName = isEn ? animal.breed.nameEn : animal.breed.nameFr;
  const initialPricing = calculatePricing(animal.priceCents, { deliveryCountry: "France" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          href={{ pathname: "/animals/[slug]", params: { slug: animal.slug } }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#183C32] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? "Back to companion profile" : "Retour à la fiche"}
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {isEn ? "Adoption Reservation & Checkout" : "Réservation & Protocole d'Adoption"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEn
            ? "Your reservation places an exclusive 30-minute hold on this companion."
            : "Votre démarche bloque ce compagnon en exclusivité pendant 30 minutes."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Checkout Form Component */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm">
          <CheckoutClientForm
            animalId={animal.id}
            locale={locale}
          />
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F8F6F0] dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 border border-black/[0.04] space-y-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white pb-3 border-b border-black/[0.06]">
              {isEn ? "Order Summary" : "Récapitulatif de la commande"}
            </h2>

            {/* Animal Card Mini */}
            <div className="flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white shrink-0 border border-black/[0.06]">
                <Image
                  src={animal.images[0]?.url || "/images/chien/golden-retriever-1.jpeg"}
                  alt={animal.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B69A65]">
                  {breedName}
                </span>
                <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                  {animal.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {animal.city}, {animal.country}
                </p>
              </div>
            </div>

            {/* Price Line Items */}
            <div className="space-y-3 pt-4 border-t border-black/[0.06] text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {isEn ? "Companion adoption price" : "Prix d'adoption du compagnon"}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.animalPriceCents, "EUR", locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {isEn ? "Veterinary dossier & European passport" : "Dossier sanitaire & passeport européen"}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.feesCents, "EUR", locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {isEn ? "Authorized climate-controlled courier" : "Transport animalier agréé direct domicile"}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.transportCents, "EUR", locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {isEn ? "Applicable VAT (services & logistics)" : "TVA légale (prestations et logistique)"}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.taxCents, "EUR", locale)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-black/[0.08] flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {isEn ? "Total to pay" : "Total à régler"}
                </span>
                <p className="text-[10px] text-gray-400">
                  {isEn ? "All taxes and delivery included" : "Toutes taxes et acheminement inclus"}
                </p>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#183C32] dark:text-emerald-400">
                {formatMoney(initialPricing.totalCents, "EUR", locale)}
              </span>
            </div>

            {/* Badges */}
            <div className="pt-4 space-y-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#B69A65]" />
                <span>{isEn ? "3D-Secure GeniusPay & Stripe Card Gateway" : "Paiement sécurisé GeniusPay 3D-Secure"}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#B69A65]" />
                <span>{isEn ? "Official European Veterinary Health Guarantee" : "Garantie sanitaire légale et contrôle vétérinaire"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

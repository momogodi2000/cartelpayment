import React from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { calculatePricing } from "@/lib/domain/pricing";
import { formatMoney } from "@/lib/domain/money";
import { getEnv } from "@/lib/env";
import { ShieldCheck, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import CheckoutClientForm from "./CheckoutClientForm";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ animalId?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("checkoutTitle"),
    description: tMeta("checkoutDescription"),
  };
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Checkout");
  const tl = await getTranslations("PublicPages.labels");
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

  // Unpublished listings and the internal payment-test animal are never purchasable here.
  if (!animal || !animal.published || animal.isPaymentTest) {
    notFound();
  }

  const holdMinutes = getEnv().HOLD_MINUTES;

  if (animal.status !== "AVAILABLE") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
          {t("errorAnimalUnavailable")}
        </h1>
        <Link
          href="/animals"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("backToCatalogue")}</span>
        </Link>
      </div>
    );
  }

  const breedName = locale === "fr" ? animal.breed.nameFr : animal.breed.nameEn;
  const initialPricing = calculatePricing(animal.priceCents, { deliveryCountry: "France" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          href={{ pathname: "/animals/[slug]", params: { slug: animal.slug } }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#183C32] dark:hover:text-emerald-400 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{animal.name}</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("holdNotice", { minutes: holdMinutes })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Checkout Form Component */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-zinc-800 shadow-sm">
          <CheckoutClientForm
            animalId={animal.id}
            locale={locale}
          />
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F8F6F0] dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 border border-black/[0.04] dark:border-zinc-700 space-y-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white pb-3 border-b border-black/[0.06] dark:border-zinc-700">
              {t("summarySection")}
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {animal.city}, {animal.country}
                </p>
              </div>
            </div>

            {/* Price Line Items */}
            <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-zinc-700 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {t("companionPrice")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.animalPriceCents, "EUR", locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {t("conciergeFee")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.feesCents, "EUR", locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {t("transportFee")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.transportCents, "EUR", locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {t("vatAmount")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(initialPricing.taxCents, "EUR", locale)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-black/[0.08] dark:border-zinc-700 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("totalAmount")}
                </span>
                <p className="text-[10px] text-gray-400">
                  {t("fullPaymentNote")}
                </p>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#183C32] dark:text-emerald-400">
                {formatMoney(initialPricing.totalCents, "EUR", locale)}
              </span>
            </div>

            {/* Badges */}
            <div className="pt-4 space-y-2 text-[11px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#B69A65]" />
                <span>{t("secureBadge")}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#B69A65]" />
                <span>{tl("checkoutProtocol")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

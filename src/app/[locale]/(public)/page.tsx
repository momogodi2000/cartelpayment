import React from "react";
import nextDynamic from "next/dynamic";
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight, Award, CheckCircle2, MessageSquare, Handshake, CreditCard, Lock, Truck, FileCheck2, Package } from "lucide-react";
import { getWhatsAppLink, siteConfig } from "@/data/site";
import { dogBreeds as staticDogBreeds, catBreeds as staticCatBreeds } from "@/data/breeds";
import { faqs } from "@/data/faq";
import { testimonials as staticTestimonials } from "@/data/testimonials";

import HeroBackground from "@/components/features/HeroBackground";
import HomeTimeline from "@/components/features/HomeTimeline";

const DogCarousel = nextDynamic(() => import("@/components/features/DogCarousel"));
const WhyChooseUs = nextDynamic(() => import("@/components/features/WhyChooseUs"));
const HomeTestimonials = nextDynamic(() => import("@/components/features/HomeTestimonials"));
const BreedSection = nextDynamic(() => import("@/components/features/BreedSection"));

import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: locale === "fr" ? "/" : "/en",
      languages: { "fr-FR": "/", "en-GB": "/en", "x-default": "/" },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const isEn = (await getLocale()) === "en";

  const [featuredDogs, featuredCats, totalAnimalsCount, totalBreedsCount, dbDogBreeds, dbCatBreeds, approvedReviews] = await Promise.all([
    prisma.animal.findMany({
      where: { species: "DOG", published: true, isPaymentTest: false },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { breed: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.animal.findMany({
      where: { species: "CAT", published: true, isPaymentTest: false },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { breed: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.animal.count({ where: { published: true, isPaymentTest: false } }),
    prisma.breed.count(),
    prisma.breed.findMany({
      where: { species: "DOG" },
      orderBy: { nameEn: "asc" },
      take: 10,
    }),
    prisma.breed.findMany({
      where: { species: "CAT" },
      orderBy: { nameEn: "asc" },
      take: 10,
    }),
    prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const homeFaqs = faqs.slice(0, 4);
  const base = siteConfig.siteUrl;
  const generalWhatsapp = getWhatsAppLink(t("whatsappMessage"));

  const stats = [
    { value: `${totalAnimalsCount}+`, label: t("stats.dogs") },
    { value: `${totalBreedsCount}`, label: t("stats.breeds") },
    { value: "5+", label: t("stats.countries") },
    { value: "< 2h", label: t("stats.response") },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen space-y-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "pawelium",
            description: t("schemaDescription"),
            url: base,
            logo: `${base}/logo.jpg`,
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: ["French", "English"],
            },
            areaServed: "Europe",
            sameAs: [],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "pawelium",
            url: base,
            inLanguage: isEn ? "en" : "fr",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${base}${isEn ? "/en" : ""}/animals?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative min-h-[95vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-black/[0.04] dark:border-white/[0.04]">
        <HeroBackground />
        <div className="max-w-7xl mx-auto w-full relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left p-6 sm:p-8 md:p-10 rounded-3xl bg-white/20 dark:bg-black/35 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-widest border border-white/30 shadow-sm">
              <Award className="h-4 w-4 shrink-0" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white leading-tight tracking-tight drop-shadow-sm">
              {t("hero.titleLine1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                {t("hero.titleAccent")}
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-semibold drop-shadow-sm">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/animals"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t("hero.cta")}
                <ArrowRight className="h-4.5 w-4.5 shrink-0" />
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-extrabold px-6 py-4 rounded-2xl border border-white/30 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm"
              >
                <Package className="h-4.5 w-4.5 text-[#B69A65] shrink-0" />
                <span>{t("trust.trackOrder")}</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 hidden lg:block" />
        </div>
      </section>

      {/* Marketplace Trust Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-30">
        <div className="bg-white dark:bg-black/40 backdrop-blur-md rounded-2xl border border-[#EDE7DC] dark:border-white/10 shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#183C32]/10 text-[#183C32] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-[#183C32]" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-serif text-[#202823] dark:text-white uppercase tracking-wider">
                {t("trust.paymentTitle")}
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {t("trust.paymentDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#183C32]/10 text-[#183C32] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#B69A65]" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-serif text-[#202823] dark:text-white uppercase tracking-wider">
                {t("trust.holdTitle")}
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {t("trust.holdDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#183C32]/10 text-[#183C32] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#183C32]" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-serif text-[#202823] dark:text-white uppercase tracking-wider">
                {t("trust.transportTitle")}
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {t("trust.transportDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#183C32]/10 text-[#183C32] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-serif text-[#202823] dark:text-white uppercase tracking-wider">
                {t("trust.docsTitle")}
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {t("trust.docsDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("credentials.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">{t("credentials.subtitle")}</p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <WhyChooseUs />
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/8 hover:border-primary/20 transition-all duration-300 group"
            >
              <p className="text-3xl sm:text-4xl font-black font-heading text-primary group-hover:scale-105 transition-transform duration-300 inline-block">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-text-premium/70 mt-1 tracking-wide uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featuredDogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
            <div className="space-y-2 text-left">
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
                {t("featured.title")}
              </h2>
              <p className="text-text-premium/70 text-xs sm:text-sm">{t("featured.subtitle")}</p>
            </div>
            <Link
              href="/animals"
              className="text-primary hover:text-primary-hover font-extrabold text-xs sm:text-sm flex items-center gap-1 shrink-0"
            >
              {t("featured.viewAll")}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <DogCarousel dogs={featuredDogs} />
        </section>
      )}

      {/* Featured cats */}
      {featuredCats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
            <div className="space-y-2 text-left">
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
                {t("catsFeatured.title")}
              </h2>
              <p className="text-text-premium/70 text-xs sm:text-sm">{t("catsFeatured.subtitle")}</p>
            </div>
            <Link
              href={{ pathname: "/animals", query: { species: "cat" } }}
              className="text-primary hover:text-primary-hover font-extrabold text-xs sm:text-sm flex items-center gap-1 shrink-0"
            >
              {t("catsFeatured.viewAll")}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <DogCarousel dogs={featuredCats} />
        </section>
      )}

      {/* Breeds */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("breeds.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">{t("breeds.subtitle")}</p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-text-premium/50">
              {t("breeds.dogsTitle")}
            </p>
            <BreedSection breeds={dbDogBreeds.length > 0 ? (dbDogBreeds as any) : staticDogBreeds} />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-text-premium/50">
              {t("breeds.catsTitle")}
            </p>
            <BreedSection breeds={dbCatBreeds.length > 0 ? (dbCatBreeds as any) : staticCatBreeds} />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-black/[0.01] dark:bg-white/[0.005] py-16 rounded-3xl border border-black/[0.03] dark:border-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("timeline.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">{t("timeline.subtitle")}</p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <HomeTimeline />
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("testimonials.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">{t("testimonials.subtitle")}</p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <HomeTestimonials
          testimonials={approvedReviews.length > 0 ? (approvedReviews as any) : staticTestimonials}
        />
      </section>

      {/* Partner banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/devenir-partenaire"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-primary/15 bg-primary/5 px-8 py-8 hover:bg-primary/10 transition-colors"
        >
          <span className="flex items-center gap-3 text-base font-extrabold text-text-premium">
            <Handshake className="h-6 w-6 text-primary shrink-0" />
            {t("partnerBanner.text")}
          </span>
          <span className="inline-flex items-center gap-2 text-primary font-extrabold text-sm">
            {t("partnerBanner.cta")}
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      {/* FAQ */}
      {homeFaqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: homeFaqs.map((faq) => ({
                  "@type": "Question",
                  name: isEn ? faq.questionEn : faq.question,
                  acceptedAnswer: { "@type": "Answer", text: isEn ? faq.answerEn : faq.answer },
                })),
              }),
            }}
          />
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
              {t("faq.title")}
            </h2>
            <p className="text-text-premium/70 text-xs sm:text-sm">{t("faq.subtitle")}</p>
            <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
          </div>
          <div className="space-y-4">
            {homeFaqs.map((faq) => (
              <div
                key={faq.id}
                className="p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-black/10 space-y-2.5 text-left hover:shadow-sm transition-all duration-300"
              >
                <h3 className="font-extrabold text-sm sm:text-base text-text-premium flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {isEn ? faq.questionEn : faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed pl-7">
                  {isEn ? faq.answerEn : faq.answer}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center pt-4">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-extrabold text-xs sm:text-sm"
            >
              {t("faq.viewAll")}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-10 sm:p-14 text-center text-white shadow-2xl shadow-primary/20">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/60 mb-4">{t("cta.limited")}</p>
          <h2 className="text-3xl sm:text-5xl font-black font-heading leading-tight mb-6 drop-shadow-sm">{t("cta.title")}</h2>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto mb-10 font-semibold leading-relaxed">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/animals"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary font-extrabold text-sm shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              {t("cta.browseDogs")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={generalWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-extrabold text-sm shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 text-emerald-300" />
              {t("cta.whatsapp")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

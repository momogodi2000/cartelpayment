import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Heart,
  Award,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { getWhatsAppLink, getDogInquiryMessage } from "@/data/site";
import { getServerTranslation } from "@/lib/serverTranslations";
import dogs from "@/data/dogs";
import breeds from "@/data/breeds";
import { faqs } from "@/data/faq";
import { testimonials } from "@/data/testimonials";

import HeroBackground from "@/components/features/HeroBackground";
import HomeTimeline from "@/components/features/HomeTimeline";

// Below-fold components loaded lazily to improve LCP
const DogCarousel = dynamic(() => import("@/components/features/DogCarousel"));
const WhyChooseUs = dynamic(() => import("@/components/features/WhyChooseUs"));
const HomeTestimonials = dynamic(() => import("@/components/features/HomeTestimonials"));
const BreedSection = dynamic(() => import("@/components/features/BreedSection"));

// Static generation — revalidate once a day (data is static)
export const revalidate = 86400;

export default async function HomePage() {
  const { t, locale } = await getServerTranslation();

  const featuredDogs = dogs.filter((d) => d.featured);
  const homeFaqs = faqs.slice(0, 4);

  const generalMessage = locale === "en"
    ? "Hello! I visited PawElite and would like to learn more about your available dogs and puppies."
    : "Bonjour ! J'ai visité PawElite et je souhaite en savoir plus sur vos chiens et chiots disponibles.";

  const generalWhatsapp = getWhatsAppLink(generalMessage);

  const stats = [
    { value: `${dogs.length}+`, labelFr: "Profils de Chiens", labelEn: "Dog Profiles" },
    { value: `${breeds.length}`, labelFr: "Races Disponibles", labelEn: "Breeds Available" },
    { value: "5+", labelFr: "Pays Européens", labelEn: "European Countries" },
    { value: "< 2h", labelFr: "Réponse WhatsApp", labelEn: "WhatsApp Response" },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen space-y-24 pb-20">
      {/* Schema.org Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "PawElite",
            "description": locale === "en"
              ? "Premium purebred dog and puppy selection for the European market."
              : "Sélection premium de chiens et chiots de race pour le marché européen.",
            "url": process.env.NEXT_PUBLIC_SITE_URL || "https://pawelite.eu",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": ["French", "English"]
            },
            "areaServed": "Europe",
            "sameAs": []
          })
        }}
      />

      {/* Schema.org WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "PawElite",
            "url": process.env.NEXT_PUBLIC_SITE_URL || "https://pawelite.eu",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://pawelite.eu"}/catalogue?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* ── Hero Section ── */}
      <section className="relative min-h-[95vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-black/[0.04] dark:border-white/[0.04]">
        <HeroBackground />

        <div className="max-w-7xl mx-auto w-full relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left p-6 sm:p-8 md:p-10 rounded-3xl bg-white/20 dark:bg-black/35 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-widest border border-white/30 shadow-sm">
              <Award className="h-4 w-4 shrink-0" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white leading-tight tracking-tight drop-shadow-sm">
              {locale === "en" ? (
                <>
                  Premium Purebred <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                    Dogs & Puppies
                  </span>
                </>
              ) : (
                <>
                  Chiens & Chiots <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                    de Race Premium
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-semibold drop-shadow-sm">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t("hero.cta")}
                <ArrowRight className="h-4.5 w-4.5 shrink-0" />
              </Link>
              <a
                href={generalWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-extrabold px-8 py-4 rounded-2xl border border-white/30 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <MessageSquare className="h-4.5 w-4.5 text-emerald-300 shrink-0" />
                {t("hero.secondary")}
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block" />
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("credentials.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">
            {t("credentials.subtitle")}
          </p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <WhyChooseUs />
      </section>

      {/* ── Trust Stats Strip ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/8 hover:border-primary/20 transition-all duration-300 group"
            >
              <p className="text-3xl sm:text-4xl font-black font-heading text-primary group-hover:scale-105 transition-transform duration-300 inline-block">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-text-premium/70 mt-1 tracking-wide uppercase">
                {locale === "en" ? stat.labelEn : stat.labelFr}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Dogs Carousel ── */}
      {featuredDogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
            <div className="space-y-2 text-left">
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
                {t("featured.title")}
              </h2>
              <p className="text-text-premium/70 text-xs sm:text-sm">
                {t("featured.subtitle")}
              </p>
            </div>
            <Link
              href="/catalogue"
              className="text-primary hover:text-primary-hover font-extrabold text-xs sm:text-sm flex items-center gap-1 shrink-0"
            >
              {t("featured.viewAll")}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>

          <DogCarousel dogs={featuredDogs} />
        </section>
      )}

      {/* ── Breeds Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {locale === "fr" ? "Races Disponibles" : "Available Breeds"}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">
            {locale === "fr"
              ? "Découvrez nos races sélectionnées — cliquez sur une race pour voir les chiens disponibles."
              : "Discover our selected breeds — click a breed to see available dogs."}
          </p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <BreedSection breeds={breeds} />
      </section>

      {/* ── How It Works Timeline ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-black/[0.01] dark:bg-white/[0.005] py-16 rounded-3xl border border-black/[0.03] dark:border-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("home.timeline.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">
            {t("home.timeline.subtitle")}
          </p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <HomeTimeline />
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("testimonials.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">
            {t("testimonials.subtitle")}
          </p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>
        <HomeTestimonials testimonials={testimonials} />
      </section>

      {/* ── FAQ Section ── */}
      {homeFaqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-8">
          {/* Schema FAQPage */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": homeFaqs.map((faq) => ({
                  "@type": "Question",
                  "name": locale === "en" ? faq.questionEn : faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === "en" ? faq.answerEn : faq.answer,
                  },
                })),
              })
            }}
          />

          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
              {t("faq.title")}
            </h2>
            <p className="text-text-premium/70 text-xs sm:text-sm">
              {t("faq.subtitle")}
            </p>
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
                  {locale === "en" ? faq.questionEn : faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed pl-7">
                  {locale === "en" ? faq.answerEn : faq.answer}
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

      {/* ── Final CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-10 sm:p-14 text-center text-white shadow-2xl shadow-primary/20">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <p className="text-xs font-extrabold uppercase tracking-widest text-white/60 mb-4">
            {t("cta.limited")}
          </p>
          <h2 className="text-3xl sm:text-5xl font-black font-heading leading-tight mb-6 drop-shadow-sm">
            {t("cta.title")}
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto mb-10 font-semibold leading-relaxed">
            {t("cta.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalogue"
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

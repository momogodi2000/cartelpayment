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
import prisma from "@/lib/db";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { getServerTranslation } from "@/lib/serverTranslations";
import { translateParrot, translateFAQ, translateTestimonial } from "@/lib/translations";

import HeroBackground from "@/components/features/HeroBackground";
import ProductCarousel from "@/components/features/ProductCarousel";
import HomeTimeline from "@/components/features/HomeTimeline";

// Below-fold components loaded lazily to improve LCP
const HomeNurseryFeed = dynamic(() => import("@/components/features/HomeNurseryFeed"));
const HomeQuizGuide = dynamic(() => import("@/components/features/HomeQuizGuide"));
const HomeTestimonials = dynamic(() => import("@/components/features/HomeTestimonials"));

// Disable server cache so updates in admin panel reflect immediately
export const revalidate = 0;

async function getHomeData() {
  try {
    const featuredParrots = await prisma.parrot.findMany({
      where: { featured: true },
      include: { images: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" }
    });

    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: "asc" },
      take: 4,
    });

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { rating: "desc" },
      take: 5,
    });

    return { featuredParrots, faqs, testimonials };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { featuredParrots: [], faqs: [], testimonials: [] };
  }
}

export default async function HomePage() {
  const { t, locale } = await getServerTranslation();
  const { featuredParrots, faqs, testimonials } = await getHomeData();
  
  // Translate data for rendering
  const translatedParrots = featuredParrots.map((parrot) => {
    const p = translateParrot(parrot, locale);
    return {
      ...p,
      price: Number(p.price)
    };
  });
  const translatedFaqs = faqs.map((faq) => translateFAQ(faq, locale));
  const translatedTestimonials = testimonials.map((test) => translateTestimonial(test, locale));

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  
  const generalInquiryText = locale === "en"
    ? "Hello! I visited your website and would like to ask some questions about your breeding methods and available birds."
    : "Bonjour ! J'ai visité votre site web et j'aimerais poser des questions sur vos méthodes d'élevage et les oiseaux disponibles.";
  
  const generalWhatsapp = getWhatsAppLink(phone, generalInquiryText);

  return (
    <div className="relative overflow-hidden min-h-screen space-y-24 pb-20">
      {/* Schema.org LocalBusiness JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "AraHaven Aviary",
            "image": featuredParrots[0]?.images[0]?.url || "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80",
            "description": "Certified exotic bird breeder specializing in ethically raised, hand-tamed macaws, cockatoos, and amazon parrots in Latin America.",
            "telephone": `+${phone}`,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "San José Central",
              "addressLocality": "San José",
              "addressCountry": "CR"
            },
            "priceRange": "$$$"
          })
        }}
      />

      {/* Hero Section with Animated Slideshow Background */}
      <section className="relative min-h-[95vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-black/[0.04] dark:border-white/[0.04]">
        {/* Background Slideshow Component */}
        <HeroBackground />

        {/* Content Overlay Container */}
        <div className="max-w-7xl mx-auto w-full relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content Left (Glass Card style for supreme readability on active background image) */}
          <div className="lg:col-span-7 space-y-8 text-left p-6 sm:p-8 md:p-10 rounded-3xl bg-white/20 dark:bg-black/35 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-widest border border-white/30 shadow-sm">
              <Award className="h-4 w-4 shrink-0" />
              {t("hero.badge")}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white leading-tight tracking-tight drop-shadow-sm">
              {locale === "en" ? (
                <>
                  Ethically Raised, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-300">
                    Hand-Tamed Parrots
                  </span>
                </>
              ) : (
                <>
                  Perroquets Élevés avec Éthique, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-300">
                    Apprivoisés à la Main
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-semibold drop-shadow-sm">
              {t("hero.subtitle")}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t("hero.cta")}
                <ArrowRight className="h-4.5 w-4.5 shrink-0" />
              </Link>
              <Link
                href={generalWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-extrabold px-8 py-4 rounded-2xl border border-white/30 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <MessageSquare className="h-4.5 w-4.5 text-emerald-300 shrink-0" />
                {t("hero.secondary")}
              </Link>
            </div>
          </div>

          {/* Right Column: Empty to allow the background image slide to remain visible on desktop, or we can use it to emphasize trust */}
          <div className="lg:col-span-5 hidden lg:block" />
        </div>
      </section>

      {/* Breeder Credentials & Aviary Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
            {t("credentials.title")}
          </h2>
          <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">
            {t("credentials.subtitle")}
          </p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 hover:shadow-md transition-all duration-300 space-y-4 text-left">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-text-premium tracking-tight">{t("cred.1.title")}</h3>
            <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed">
              {t("cred.1.desc")}
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 hover:shadow-md transition-all duration-300 space-y-4 text-left">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-text-premium tracking-tight">{t("cred.2.title")}</h3>
            <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed">
              {t("cred.2.desc")}
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 hover:shadow-md transition-all duration-300 space-y-4 text-left">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-text-premium tracking-tight">{t("cred.3.title")}</h3>
            <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed">
              {t("cred.3.desc")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust Stats Strip ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: "36+", labelEn: "Exotic Species", labelFr: "Espèces Exotiques" },
            { value: "100%", labelEn: "CITES Certified", labelFr: "Certifiés CITES" },
            { value: "12+", labelEn: "Years Expertise", labelFr: "Ans d'Expertise" },
            { value: "500+", labelEn: "Happy Owners", labelFr: "Propriétaires Heureux" },
          ].map((stat) => (
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

      {/* Featured Parrots Showcase Carousel */}
      {translatedParrots.length > 0 && (
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
              href="/catalog"
              className="text-primary hover:text-primary-hover font-extrabold text-xs sm:text-sm flex items-center gap-1 shrink-0"
            >
              {t("featured.viewAll")}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>

          {/* Interactive framer-motion Product Carousel Component */}
          <div className="relative">
            <ProductCarousel parrots={translatedParrots} />
          </div>
        </section>
      )}

      {/* Interactive CITES Compliance & Adoption Logistics Timeline */}
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

        {/* Timeline Component */}
        <HomeTimeline />
      </section>

      {/* Breeder Nursery Live Stats & Simulation Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HomeNurseryFeed />
      </section>

      {/* Client Placements & Veterinarians Testimonials Slider */}
      {translatedTestimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium tracking-tight">
              {t("testimonials.title")}
            </h2>
            <p className="text-text-premium/70 text-xs sm:text-sm leading-relaxed">
              {t("testimonials.subtitle")}
            </p>
            <div className="h-1 w-16 bg-primary mx-auto rounded-full mt-3" />
          </div>

          {/* Client Testimonials slider component */}
          <HomeTestimonials testimonials={translatedTestimonials} />
        </section>
      )}

      {/* Lifestyle Species Matching Quiz */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeQuizGuide />
      </section>

      {/* Frequently Asked Questions Section */}
      {translatedFaqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-8">
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
            {translatedFaqs.map((faq) => (
              <div
                key={faq.id}
                className="p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-black/10 space-y-2.5 text-left hover:shadow-sm transition-all duration-300"
              >
                <h3 className="font-extrabold text-sm sm:text-base text-text-premium flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed pl-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-extrabold text-xs sm:text-sm"
            >
              {locale === "en" ? "Still have questions? Contact us" : "Encore des questions ? Contactez-nous"}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Premium Final CTA Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-10 sm:p-14 text-center text-white shadow-2xl shadow-primary/20">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <p className="text-xs font-extrabold uppercase tracking-widest text-white/60 mb-4">
            {locale === "en" ? "Limited Availability" : "Disponibilité Limitée"}
          </p>
          <h2 className="text-3xl sm:text-5xl font-black font-heading leading-tight mb-6 drop-shadow-sm">
            {locale === "en"
              ? "Your Perfect Companion Awaits"
              : "Votre Compagnon Idéal Vous Attend"}
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto mb-10 font-semibold leading-relaxed">
            {locale === "en"
              ? "Every bird in our aviary is hand-raised, health-certified, and ready to bond with their forever family. Inquire now before availability changes."
              : "Chaque oiseau de notre élevage est élevé à la main, certifié sain, et prêt à créer un lien avec sa famille pour toujours. Renseignez-vous avant que la disponibilité change."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary font-extrabold text-sm shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              {locale === "en" ? "Browse All Parrots" : "Voir Tous les Perroquets"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={generalWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-extrabold text-sm shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 text-emerald-300" />
              {locale === "en" ? "WhatsApp Inquiry" : "Demande WhatsApp"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

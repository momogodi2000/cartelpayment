import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Heart, Award, CheckCircle2, MessageSquare } from "lucide-react";
import prisma from "@/lib/db";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { getServerTranslation } from "@/lib/serverTranslations";
import { translateParrot, translateFAQ } from "@/lib/translations";

// Fetch featured parrots and FAQs in a server component
async function getHomeData() {
  try {
    const featuredParrots = await prisma.parrot.findMany({
      where: { featured: true },
      take: 3,
      include: { images: { orderBy: { order: "asc" } } },
    });

    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: "asc" },
      take: 4,
    });

    return { featuredParrots, faqs };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { featuredParrots: [], faqs: [] };
  }
}

export default async function HomePage() {
  const { t, locale } = await getServerTranslation();
  const { featuredParrots, faqs } = await getHomeData();
  
  // Translate dynamic data
  const translatedParrots = featuredParrots.map((parrot) => translateParrot(parrot, locale));
  const translatedFaqs = faqs.map((faq) => translateFAQ(faq, locale));

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  
  const generalInquiryText = locale === "en"
    ? "Hello! I visited your website and would like to ask some questions about your breeding methods and available birds."
    : "Bonjour ! J'ai visité votre site web et j'aimerais poser des questions sur vos méthodes d'élevage et les oiseaux disponibles.";
  
  const generalWhatsapp = getWhatsAppLink(phone, generalInquiryText);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Schema.org LocalBusiness JSON-LD */}
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

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-bg-premium to-bg-premium py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest border border-primary/20">
              <Award className="h-4 w-4" /> {t("hero.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-premium leading-tight tracking-tight">
              {locale === "en" ? (
                <>
                  Ethically Raised, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Hand-Tamed Parrots
                  </span>
                </>
              ) : (
                <>
                  Perroquets Élevés avec Éthique, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Apprivoisés à la Main
                  </span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg text-text-premium/70 max-w-xl leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("hero.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={generalWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-black/[0.02] text-text-premium font-bold px-8 py-4 rounded-full border border-black/[0.08] shadow-sm transition-all duration-300 hover:scale-[1.02]"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" /> {t("hero.secondary")}
              </Link>
            </div>
          </div>

          {/* Hero Image / Badge */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-white/30 backdrop-blur-sm group">
              <Image
                src="https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80"
                alt="Beautiful Scarlet Macaw"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-2xl border border-white/20">
                <p className="text-white text-sm font-bold">
                  {locale === "en" ? "Scarlet Macaw Baby" : "Bébé Ara Rouge"}
                </p>
                <p className="text-white/80 text-xs">
                  {locale === "en" ? "Captive Bred - Hand-Raised with Love" : "Né en Captivité - Élevé avec Amour"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breeder Credentials & Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-text-premium tracking-tight">
              {t("credentials.title")}
            </h2>
            <p className="text-text-premium/70 text-sm sm:text-base">
              {t("credentials.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-black/[0.05] bg-bg-premium/40 hover:bg-bg-premium transition-colors space-y-4 text-left">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-text-premium">{t("cred.1.title")}</h3>
              <p className="text-sm text-text-premium/70 leading-relaxed">
                {t("cred.1.desc")}
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/[0.05] bg-bg-premium/40 hover:bg-bg-premium transition-colors space-y-4 text-left">
              <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-text-premium">{t("cred.2.title")}</h3>
              <p className="text-sm text-text-premium/70 leading-relaxed">
                {t("cred.2.desc")}
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/[0.05] bg-bg-premium/40 hover:bg-bg-premium transition-colors space-y-4 text-left">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-text-premium">{t("cred.3.title")}</h3>
              <p className="text-sm text-text-premium/70 leading-relaxed">
                {t("cred.3.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Parrots Showcase */}
      {translatedParrots.length > 0 && (
        <section className="py-20 bg-bg-premium">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-text-premium tracking-tight">
                  {t("featured.title")}
                </h2>
                <p className="text-text-premium/70 text-sm">
                  {t("featured.subtitle")}
                </p>
              </div>
              <Link
                href="/catalog"
                className="text-primary hover:text-primary-hover font-bold text-sm flex items-center gap-1 shrink-0"
              >
                {t("featured.viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {translatedParrots.map((parrot) => {
                const parrotUrl = `/catalog/${parrot.slug}`;
                const birdImage = parrot.images[0]?.url || "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80";
                
                const inquiryText = locale === "en"
                  ? `Hello! I am interested in the parrot ${parrot.name} (Species: ${parrot.species}) shown on your website. Could you please give me more information about its availability and shipping?`
                  : `Bonjour ! Je suis intéressé(e) par le perroquet ${parrot.name} (Espèce : ${parrot.species}) présenté sur votre site. Pourriez-vous me donner plus d'informations sur sa disponibilité et son transport ?`;
                
                const link = getWhatsAppLink(phone, inquiryText);

                return (
                  <div
                    key={parrot.id}
                    className="flex flex-col rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-bg-premium">
                      <Image
                        src={birdImage}
                        alt={parrot.images[0]?.alt || parrot.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-primary shadow-sm">
                          {parrot.rarityLabel}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                            parrot.status === "AVAILABLE"
                              ? "bg-emerald-600"
                              : parrot.status === "RESERVED"
                              ? "bg-amber-600"
                              : "bg-red-600"
                          }`}
                        >
                          {parrot.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-extrabold text-xl text-text-premium group-hover:text-primary transition-colors">
                            {parrot.name}
                          </h3>
                          <span className="font-extrabold text-primary text-lg">
                            ${Number(parrot.price).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-primary font-bold tracking-wide italic">
                          {parrot.species}
                        </p>
                        <p className="text-sm text-text-premium/70 line-clamp-2">
                          {parrot.shortDescription}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-black/[0.04] flex gap-3">
                        <Link
                          href={parrotUrl}
                          className="flex-1 text-center py-2.5 rounded-xl border border-black/[0.08] text-xs font-bold text-text-premium hover:bg-black/[0.02] transition-colors"
                        >
                          {t("catalog.detailsButton")}
                        </Link>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {locale === "en" ? "Inquiry" : "S'enquérir"}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {translatedFaqs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-extrabold text-text-premium tracking-tight">
                {t("faq.title")}
              </h2>
              <p className="text-text-premium/70 text-sm">
                {t("faq.subtitle")}
              </p>
            </div>

            <div className="space-y-6">
              {translatedFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-6 rounded-2xl border border-black/[0.05] bg-bg-premium/30 space-y-2 text-left"
                >
                  <h3 className="font-extrabold text-base text-text-premium flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-sm text-text-premium/70 leading-relaxed pl-7">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-bold text-sm"
              >
                {locale === "en" ? "Still have questions? Contact us" : "Encore des questions ? Contactez-nous"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * CaniPrestige — Central Site Configuration
 *
 * Single source of truth for all site-wide settings.
 * Update whatsappNumber, siteName, and siteUrl for production.
 */

export const siteConfig = {
  // Brand Identity
  name: "CaniPrestige",
  legalName: "CaniPrestige — Persin Thibaut",
  ownerName: "Persin Thibaut",
  ownerAddress: "77 Boulevard Saint-Jacques, 75014 Paris, France",
  ownerExperience: "6 ans d'expérience",
  tagline: "L'excellence canine européenne",
  taglineEn: "European Canine Excellence",
  description:
    "Découvrez des chiens et chiots de race sélectionnés avec soin par Persin Thibaut, 6 ans d'expérience dans la sélection canine européenne.",
  descriptionEn:
    "Discover carefully selected purebred dogs and puppies by Persin Thibaut, 6 years of experience in European canine selection.",

  // Contact & Commerce
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+33641325328",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "persinthibaut@gmail.com",

  // URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://caniprestige.eu",

  // Currency & Region
  currency: "EUR",
  currencySymbol: "€",
  defaultLocale: "fr" as const,
  locales: ["fr", "en"] as const,
  region: "Europe",

  // Social Media
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  // SEO Defaults
  seo: {
    titleSuffix: "| CaniPrestige",
    defaultTitle: "CaniPrestige — Chiens & Chiots de Race | Sélection Européenne",
    defaultDescription:
      "CaniPrestige sélectionne les meilleurs chiens et chiots de race pour vous accompagner. Découvrez nos profils détaillés, contactez-nous via WhatsApp.",
    keywords: [
      "chiens de race europe",
      "chiots de race",
      "chiots disponibles france",
      "golden retriever chiot",
      "labrador chiot",
      "berger allemand chiot",
      "élevage canin responsable",
      "chiot pedigree europe",
    ],
    ogImage: "/og-image.jpg",
  },
} as const;

/**
 * Generate a WhatsApp link with a contextualized message.
 */
export function getWhatsAppLink(message: string): string {
  const cleanPhone = siteConfig.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a contextualized WhatsApp inquiry for a specific dog.
 */
export function getDogInquiryMessage(
  dogName: string,
  breed: string,
  slug: string,
  locale: "fr" | "en" = "fr"
): string {
  const url = `${siteConfig.siteUrl}/catalogue/${slug}`;
  if (locale === "en") {
    return `Hello! I am interested in ${dogName} (${breed}) listed on your website. Could you provide more info about availability and next steps? Link: ${url}`;
  }
  return `Bonjour ! Je suis intéressé(e) par ${dogName} (${breed}) présenté(e) sur votre site. Pourriez-vous me donner plus d'informations sur la disponibilité et les modalités ? Lien : ${url}`;
}

export default siteConfig;

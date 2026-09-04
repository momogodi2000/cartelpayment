/**
 * pawelium — Central Site Configuration
 *
 * Single source of truth for all site-wide settings.
 * Update whatsappNumber, siteName, and siteUrl for production.
 */

export const siteConfig = {
  // Brand Identity
  name: "pawelium",
  legalName: "pawelium — Théodore de Parin",
  ownerName: "Théodore de Parin",
  ownerAddress: "77 Boulevard Saint-Jacques, 75014 Paris, France",
  ownerExperience: "6 ans d'expérience",
  tagline: "L'excellence canine et féline européenne",
  taglineEn: "European Canine & Feline Excellence",
  description:
    "pawelium sélectionne des chiens, chats, chiots et chatons de race auprès d'éleveurs européens responsables. Pedigree LOF/LOOF, carnet de santé à jour, contact direct via WhatsApp.",
  descriptionEn:
    "pawelium selects purebred dogs, cats, puppies and kittens from responsible European breeders. LOF/LOOF pedigree, up-to-date health records, direct contact via WhatsApp.",

  // Contact & Commerce
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+33641325328",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@pawelium.fyi",

  // Legal — French business registration. Displayed on /mentions-legales once set.
  // Selling animals with listed prices is a commercial activity in France and
  // requires a SIREN/SIRET on the legal notice.
  legalSiren: process.env.NEXT_PUBLIC_LEGAL_SIREN || "",

  // URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://pawelium.fyi",

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
    titleSuffix: "| pawelium",
    defaultTitle: "pawelium — Chiens, Chats, Chiots & Chatons de Race | Sélection Européenne",
    defaultDescription:
      "pawelium sélectionne des chiens, chats, chiots et chatons de race auprès d'éleveurs européens responsables. Profils détaillés, pedigree LOF/LOOF, contact direct via WhatsApp.",
    keywords: [
      "chiens de race europe",
      "chiots de race",
      "chats de race europe",
      "chatons de race",
      "golden retriever chiot",
      "labrador chiot",
      "bouledogue français chiot",
      "maine coon chaton",
      "élevage canin responsable",
      "chiot pedigree europe",
    ],
    ogImage: "/logo.jpg",
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

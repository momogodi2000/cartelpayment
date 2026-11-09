import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/animals": {
      en: "/animals",
      fr: "/animaux",
    },
    "/animals/[slug]": {
      en: "/animals/[slug]",
      fr: "/animaux/[slug]",
    },
    "/checkout": {
      en: "/checkout",
      fr: "/paiement",
    },
    "/checkout/return": {
      en: "/checkout/return",
      fr: "/checkout/return",
    },
    "/checkout/cancel": {
      en: "/checkout/cancel",
      fr: "/checkout/cancel",
    },
    "/track-order": {
      en: "/track-order",
      fr: "/suivi-commande",
    },
    "/support": {
      en: "/support",
      fr: "/support",
    },
    "/support/ticket/[token]": {
      en: "/support/ticket/[token]",
      fr: "/support/ticket/[token]",
    },
    "/a-propos": {
      en: "/about",
      fr: "/a-propos",
    },
    "/faq": {
      en: "/faq",
      fr: "/faq",
    },
    "/conditions-generales-de-vente": {
      en: "/terms",
      fr: "/conditions-generales-de-vente",
    },
    "/politique-de-confidentialite": {
      en: "/privacy",
      fr: "/politique-de-confidentialite",
    },
    "/sante-vaccination": {
      en: "/health-guarantee",
      fr: "/sante-vaccination",
    },
    "/livraison-transport": {
      en: "/transport",
      fr: "/livraison-transport",
    },
    "/devenir-partenaire": {
      en: "/partner",
      fr: "/devenir-partenaire",
    },
    "/mentions-legales": {
      en: "/legal-notice",
      fr: "/mentions-legales",
    },
    "/bien-etre-animal": {
      en: "/animal-welfare",
      fr: "/bien-etre-animal",
    },
    "/contact": {
      en: "/contact",
      fr: "/contact",
    },
    "/newsletter/confirm": {
      en: "/newsletter/confirm",
      fr: "/newsletter/confirmation",
    },
    "/breeds/[slug]": {
      en: "/breeds/[slug]",
      fr: "/races/[slug]",
    },
    "/breeders/[slug]": {
      en: "/breeders/[slug]",
      fr: "/eleveurs/[slug]",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

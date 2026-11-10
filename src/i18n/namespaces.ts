/**
 * src/i18n/namespaces.ts
 *
 * Typed registry of all translation namespaces in Pawelium 2.0.
 * Each namespace is mapped to explicit static import loaders for code-splitting.
 */

import type { Locale } from './config';

export const NAMESPACES = [
  'common',
  'public/home',
  'public/about',
  'public/contact',
  'public/faq',
  'public/health',
  'public/delivery',
  'public/partner',
  'public/welfare',
  'public/legal',
  'marketplace/catalog',
  'marketplace/animal-details',
  'marketplace/breeds',
  'checkout/checkout',
  'checkout/payment',
  'checkout/confirmation',
  'customer/order-tracking',
  'customer/support',
  'admin/dashboard',
  'admin/animals',
  'admin/orders',
  'admin/payments',
  'admin/customers',
  'admin/support',
  'admin/settings',
  'admin/audit',
  'admin/test-payment',
  'admin/shell',
  'admin/account',
  'admin/auth',
  'admin/common',
  'admin/reservations',
  'admin/refunds',
  'admin/deliveries',
  'admin/inventory',
  'admin/breeds',
  'admin/breeders',
  'admin/reviews',
  'admin/content',
  'admin/translations',
  'admin/seo',
  'admin/newsletter',
  'admin/analytics',
  'public/pages',
  'errors/not-found',
  'errors/general',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

export const namespaceLoaders: Record<
  Namespace,
  Record<Locale, () => Promise<{ default: Record<string, any> }>>
> = {
  common: {
    en: () => import('./locales/en/common.json'),
    fr: () => import('./locales/fr/common.json'),
  },
  'public/home': {
    en: () => import('./locales/en/public/home.json'),
    fr: () => import('./locales/fr/public/home.json'),
  },
  'public/about': {
    en: () => import('./locales/en/public/about.json'),
    fr: () => import('./locales/fr/public/about.json'),
  },
  'public/contact': {
    en: () => import('./locales/en/public/contact.json'),
    fr: () => import('./locales/fr/public/contact.json'),
  },
  'public/faq': {
    en: () => import('./locales/en/public/faq.json'),
    fr: () => import('./locales/fr/public/faq.json'),
  },
  'public/health': {
    en: () => import('./locales/en/public/health.json'),
    fr: () => import('./locales/fr/public/health.json'),
  },
  'public/delivery': {
    en: () => import('./locales/en/public/delivery.json'),
    fr: () => import('./locales/fr/public/delivery.json'),
  },
  'public/partner': {
    en: () => import('./locales/en/public/partner.json'),
    fr: () => import('./locales/fr/public/partner.json'),
  },
  'public/welfare': {
    en: () => import('./locales/en/public/welfare.json'),
    fr: () => import('./locales/fr/public/welfare.json'),
  },
  'public/legal': {
    en: () => import('./locales/en/public/legal.json'),
    fr: () => import('./locales/fr/public/legal.json'),
  },
  'marketplace/catalog': {
    en: () => import('./locales/en/marketplace/catalog.json'),
    fr: () => import('./locales/fr/marketplace/catalog.json'),
  },
  'marketplace/animal-details': {
    en: () => import('./locales/en/marketplace/animal-details.json'),
    fr: () => import('./locales/fr/marketplace/animal-details.json'),
  },
  'marketplace/breeds': {
    en: () => import('./locales/en/marketplace/breeds.json'),
    fr: () => import('./locales/fr/marketplace/breeds.json'),
  },
  'checkout/checkout': {
    en: () => import('./locales/en/checkout/checkout.json'),
    fr: () => import('./locales/fr/checkout/checkout.json'),
  },
  'checkout/payment': {
    en: () => import('./locales/en/checkout/payment.json'),
    fr: () => import('./locales/fr/checkout/payment.json'),
  },
  'checkout/confirmation': {
    en: () => import('./locales/en/checkout/confirmation.json'),
    fr: () => import('./locales/fr/checkout/confirmation.json'),
  },
  'customer/order-tracking': {
    en: () => import('./locales/en/customer/order-tracking.json'),
    fr: () => import('./locales/fr/customer/order-tracking.json'),
  },
  'customer/support': {
    en: () => import('./locales/en/customer/support.json'),
    fr: () => import('./locales/fr/customer/support.json'),
  },
  'admin/dashboard': {
    en: () => import('./locales/en/admin/dashboard.json'),
    fr: () => import('./locales/fr/admin/dashboard.json'),
  },
  'admin/animals': {
    en: () => import('./locales/en/admin/animals.json'),
    fr: () => import('./locales/fr/admin/animals.json'),
  },
  'admin/orders': {
    en: () => import('./locales/en/admin/orders.json'),
    fr: () => import('./locales/fr/admin/orders.json'),
  },
  'admin/payments': {
    en: () => import('./locales/en/admin/payments.json'),
    fr: () => import('./locales/fr/admin/payments.json'),
  },
  'admin/customers': {
    en: () => import('./locales/en/admin/customers.json'),
    fr: () => import('./locales/fr/admin/customers.json'),
  },
  'admin/support': {
    en: () => import('./locales/en/admin/support.json'),
    fr: () => import('./locales/fr/admin/support.json'),
  },
  'admin/settings': {
    en: () => import('./locales/en/admin/settings.json'),
    fr: () => import('./locales/fr/admin/settings.json'),
  },
  'admin/audit': {
    en: () => import('./locales/en/admin/audit.json'),
    fr: () => import('./locales/fr/admin/audit.json'),
  },
  'admin/test-payment': {
    en: () => import('./locales/en/admin/test-payment.json'),
    fr: () => import('./locales/fr/admin/test-payment.json'),
  },
  'admin/auth': {
    en: () => import('./locales/en/admin/auth.json'),
    fr: () => import('./locales/fr/admin/auth.json'),
  },
  'admin/account': {
    en: () => import('./locales/en/admin/account.json'),
    fr: () => import('./locales/fr/admin/account.json'),
  },
  'admin/shell': {
    en: () => import('./locales/en/admin/shell.json'),
    fr: () => import('./locales/fr/admin/shell.json'),
  },
  'admin/common': {
    en: () => import('./locales/en/admin/common.json'),
    fr: () => import('./locales/fr/admin/common.json'),
  },
  'admin/reservations': {
    en: () => import('./locales/en/admin/reservations.json'),
    fr: () => import('./locales/fr/admin/reservations.json'),
  },
  'admin/refunds': {
    en: () => import('./locales/en/admin/refunds.json'),
    fr: () => import('./locales/fr/admin/refunds.json'),
  },
  'admin/deliveries': {
    en: () => import('./locales/en/admin/deliveries.json'),
    fr: () => import('./locales/fr/admin/deliveries.json'),
  },
  'admin/inventory': {
    en: () => import('./locales/en/admin/inventory.json'),
    fr: () => import('./locales/fr/admin/inventory.json'),
  },
  'admin/breeds': {
    en: () => import('./locales/en/admin/breeds.json'),
    fr: () => import('./locales/fr/admin/breeds.json'),
  },
  'admin/breeders': {
    en: () => import('./locales/en/admin/breeders.json'),
    fr: () => import('./locales/fr/admin/breeders.json'),
  },
  'admin/reviews': {
    en: () => import('./locales/en/admin/reviews.json'),
    fr: () => import('./locales/fr/admin/reviews.json'),
  },
  'admin/content': {
    en: () => import('./locales/en/admin/content.json'),
    fr: () => import('./locales/fr/admin/content.json'),
  },
  'admin/translations': {
    en: () => import('./locales/en/admin/translations.json'),
    fr: () => import('./locales/fr/admin/translations.json'),
  },
  'admin/seo': {
    en: () => import('./locales/en/admin/seo.json'),
    fr: () => import('./locales/fr/admin/seo.json'),
  },
  'admin/newsletter': {
    en: () => import('./locales/en/admin/newsletter.json'),
    fr: () => import('./locales/fr/admin/newsletter.json'),
  },
  'admin/analytics': {
    en: () => import('./locales/en/admin/analytics.json'),
    fr: () => import('./locales/fr/admin/analytics.json'),
  },
  'public/pages': {
    en: () => import('./locales/en/public/pages.json'),
    fr: () => import('./locales/fr/public/pages.json'),
  },
  'errors/not-found': {
    en: () => import('./locales/en/errors/not-found.json'),
    fr: () => import('./locales/fr/errors/not-found.json'),
  },
  'errors/general': {
    en: () => import('./locales/en/errors/general.json'),
    fr: () => import('./locales/fr/errors/general.json'),
  },
};

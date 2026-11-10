/**
 * src/i18n/load-translations.ts
 *
 * Centralized translation loader for Pawelium 2.0.
 * Imports and merges modular translation files per locale:
 *   - loadModularTranslations(locale): full application dictionary (used by request.ts fallback)
 *   - loadNamespaces(locale, namespaces): selective route-level loader for zero-waste client bundles
 */

import { type Locale } from './config';
import { NAMESPACES, type Namespace, namespaceLoaders } from './namespaces';

// English modules
import enCommon from "./locales/en/common.json";
import enPublicHome from "./locales/en/public/home.json";
import enPublicAbout from "./locales/en/public/about.json";
import enPublicContact from "./locales/en/public/contact.json";
import enPublicFaq from "./locales/en/public/faq.json";
import enPublicHealth from "./locales/en/public/health.json";
import enPublicDelivery from "./locales/en/public/delivery.json";
import enPublicPartner from "./locales/en/public/partner.json";
import enPublicWelfare from "./locales/en/public/welfare.json";
import enPublicLegal from "./locales/en/public/legal.json";

import enMarketplaceCatalog from "./locales/en/marketplace/catalog.json";
import enMarketplaceDetails from "./locales/en/marketplace/animal-details.json";
import enMarketplaceBreeds from "./locales/en/marketplace/breeds.json";

import enCheckoutForm from "./locales/en/checkout/checkout.json";
import enCheckoutPayment from "./locales/en/checkout/payment.json";
import enCheckoutConfirm from "./locales/en/checkout/confirmation.json";

import enCustomerTracking from "./locales/en/customer/order-tracking.json";
import enCustomerSupport from "./locales/en/customer/support.json";

import enAdminDashboard from "./locales/en/admin/dashboard.json";
import enAdminAnimals from "./locales/en/admin/animals.json";
import enAdminOrders from "./locales/en/admin/orders.json";
import enAdminPayments from "./locales/en/admin/payments.json";
import enAdminCustomers from "./locales/en/admin/customers.json";
import enAdminSupport from "./locales/en/admin/support.json";
import enAdminSettings from "./locales/en/admin/settings.json";
import enAdminAudit from "./locales/en/admin/audit.json";
import enAdminTestPayment from "./locales/en/admin/test-payment.json";
import enAdminShell from "./locales/en/admin/shell.json";
import enAdminAccount from "./locales/en/admin/account.json";
import enAdminAuth from "./locales/en/admin/auth.json";

import enErrorsNotFound from "./locales/en/errors/not-found.json";
import enErrorsGeneral from "./locales/en/errors/general.json";

// French modules
import frCommon from "./locales/fr/common.json";
import frPublicHome from "./locales/fr/public/home.json";
import frPublicAbout from "./locales/fr/public/about.json";
import frPublicContact from "./locales/fr/public/contact.json";
import frPublicFaq from "./locales/fr/public/faq.json";
import frPublicHealth from "./locales/fr/public/health.json";
import frPublicDelivery from "./locales/fr/public/delivery.json";
import frPublicPartner from "./locales/fr/public/partner.json";
import frPublicWelfare from "./locales/fr/public/welfare.json";
import frPublicLegal from "./locales/fr/public/legal.json";

import frMarketplaceCatalog from "./locales/fr/marketplace/catalog.json";
import frMarketplaceDetails from "./locales/fr/marketplace/animal-details.json";
import frMarketplaceBreeds from "./locales/fr/marketplace/breeds.json";

import frCheckoutForm from "./locales/fr/checkout/checkout.json";
import frCheckoutPayment from "./locales/fr/checkout/payment.json";
import frCheckoutConfirm from "./locales/fr/checkout/confirmation.json";

import frCustomerTracking from "./locales/fr/customer/order-tracking.json";
import frCustomerSupport from "./locales/fr/customer/support.json";

import frAdminDashboard from "./locales/fr/admin/dashboard.json";
import frAdminAnimals from "./locales/fr/admin/animals.json";
import frAdminOrders from "./locales/fr/admin/orders.json";
import frAdminPayments from "./locales/fr/admin/payments.json";
import frAdminCustomers from "./locales/fr/admin/customers.json";
import frAdminSupport from "./locales/fr/admin/support.json";
import frAdminSettings from "./locales/fr/admin/settings.json";
import frAdminAudit from "./locales/fr/admin/audit.json";
import frAdminTestPayment from "./locales/fr/admin/test-payment.json";
import frAdminShell from "./locales/fr/admin/shell.json";
import frAdminAccount from "./locales/fr/admin/account.json";
import frAdminAuth from "./locales/fr/admin/auth.json";

import frErrorsNotFound from "./locales/fr/errors/not-found.json";
import frErrorsGeneral from "./locales/fr/errors/general.json";

function assembleLocale(modules: any[]) {
  const result: Record<string, any> = {};
  for (const mod of modules) {
    for (const [key, val] of Object.entries(mod)) {
      result[key] = val;
    }
  }
  return result;
}

const enMessages = assembleLocale([
  enCommon,
  enPublicHome,
  enPublicAbout,
  enPublicContact,
  enPublicFaq,
  enPublicHealth,
  enPublicDelivery,
  enPublicPartner,
  enPublicWelfare,
  enPublicLegal,
  enMarketplaceCatalog,
  enMarketplaceDetails,
  enMarketplaceBreeds,
  enCheckoutForm,
  enCheckoutPayment,
  enCheckoutConfirm,
  enCustomerTracking,
  enCustomerSupport,
  enAdminDashboard,
  enAdminAnimals,
  enAdminOrders,
  enAdminPayments,
  enAdminCustomers,
  enAdminSupport,
  enAdminSettings,
  enAdminAudit,
  enAdminTestPayment,
  enAdminShell,
  enAdminAccount,
  enAdminAuth,
  enErrorsNotFound,
  enErrorsGeneral,
]);

const frMessages = assembleLocale([
  frCommon,
  frPublicHome,
  frPublicAbout,
  frPublicContact,
  frPublicFaq,
  frPublicHealth,
  frPublicDelivery,
  frPublicPartner,
  frPublicWelfare,
  frPublicLegal,
  frMarketplaceCatalog,
  frMarketplaceDetails,
  frMarketplaceBreeds,
  frCheckoutForm,
  frCheckoutPayment,
  frCheckoutConfirm,
  frCustomerTracking,
  frCustomerSupport,
  frAdminDashboard,
  frAdminAnimals,
  frAdminOrders,
  frAdminPayments,
  frAdminCustomers,
  frAdminSupport,
  frAdminSettings,
  frAdminAudit,
  frAdminTestPayment,
  frAdminShell,
  frAdminAccount,
  frAdminAuth,
  frErrorsNotFound,
  frErrorsGeneral,
]);

export function loadModularTranslations(locale: string): Record<string, any> {
  return locale === "fr" ? frMessages : enMessages;
}

/**
 * Loads and nests specific namespaces requested by a page or server component.
 * Merges top-level keys for next-intl compatibility.
 */
export async function loadNamespaces(
  locale: Locale,
  namespaces: readonly Namespace[]
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  // Always include common
  const targetNamespaces = Array.from(new Set(['common' as Namespace, ...namespaces]));

  for (const ns of targetNamespaces) {
    const loader = namespaceLoaders[ns]?.[locale];
    if (loader) {
      const mod = await loader();
      const content = mod.default || mod;

      // Merge flat for root keys
      for (const [key, val] of Object.entries(content)) {
        result[key] = val;
      }

      // Also provide nested namespace access (e.g. public.home)
      const parts = ns.split('/');
      if (parts.length === 2) {
        const [domain, sub] = parts;
        if (!result[domain]) result[domain] = {};
        result[domain][sub] = content;
      }
    }
  }

  return result;
}

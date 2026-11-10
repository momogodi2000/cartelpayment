import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { loadModularTranslations } from './load-translations';
import { resolveAdminLocale } from './locale';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Public routes carry the locale in the [locale] segment; admin routes (outside [locale])
  // use the SUPER_ADMIN's language preference cookie.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : await resolveAdminLocale();

  return {
    locale,
    messages: loadModularTranslations(locale),
    onError(error) {
      if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
        console.warn(`[i18n warning]: ${error.message}`);
      }
    },
    getMessageFallback({ namespace, key }) {
      const path = [namespace, key].filter(Boolean).join('.');
      return path;
    },
  };
});

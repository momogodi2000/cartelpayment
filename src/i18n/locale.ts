/**
 * src/i18n/locale.ts
 *
 * Resolves the active locale across Pawelium 2.0 routes:
 *   - On public routes: parsed directly from the [locale] segment.
 *   - On admin routes: read from the 'pw_admin_locale' cookie, falling back
 *     to the browser's Accept-Language header, and finally defaulting to 'en'.
 */

import { cookies, headers } from 'next/headers';
import { locales, defaultLocale, type Locale } from './config';

export function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && (locales as readonly string[]).includes(locale);
}

export async function resolveAdminLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('pw_admin_locale')?.value;
    if (isValidLocale(cookieLocale)) {
      return cookieLocale;
    }

    const headerStore = await headers();
    const acceptLanguage = headerStore.get('accept-language');
    if (acceptLanguage) {
      if (acceptLanguage.startsWith('fr') || acceptLanguage.includes(',fr')) {
        return 'fr';
      }
    }
  } catch {
    // If called outside request context, return default
  }

  return defaultLocale;
}

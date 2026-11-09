/**
 * src/i18n/page-translations.ts
 *
 * Server-side route-level translation helpers:
 *   - getPageTranslator(locale, ns): creates an isolated translator for a given namespace
 *   - <PageIntl>: server component providing scoped translation messages to client components
 */

import React from 'react';
import { createTranslator, NextIntlClientProvider } from 'next-intl';
import type { Locale } from './config';
import type { Namespace } from './namespaces';
import { loadNamespaces } from './load-translations';

export async function getPageTranslator(locale: Locale, namespace?: Namespace) {
  const namespaces = namespace ? [namespace] : [];
  const messages = await loadNamespaces(locale, namespaces);
  return createTranslator({
    locale,
    messages,
    namespace: namespace ? namespace.replace('/', '.') : undefined,
  });
}

export interface PageIntlProps {
  locale: Locale;
  namespaces: readonly Namespace[];
  children: React.ReactNode;
}

export async function PageIntl({ locale, namespaces, children }: PageIntlProps) {
  const messages = await loadNamespaces(locale, namespaces);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

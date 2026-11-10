import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

/**
 * Provides client components with ONLY the translation namespaces they need.
 *
 * The full dictionary is resolved server-side (never shipped); each layout/page wraps its
 * client components in <ScopedIntl namespaces={[...]}> so the browser receives just the
 * namespaces of the current route. Nested providers replace (do not merge) messages, so
 * list every namespace used by the client components inside.
 */
export default async function ScopedIntl({
  namespaces,
  children,
}: {
  namespaces: readonly string[];
  children: React.ReactNode;
}) {
  const [locale, all] = await Promise.all([getLocale(), getMessages()]);
  const picked: Record<string, unknown> = {};
  for (const ns of namespaces) {
    if (ns in all) picked[ns] = (all as Record<string, unknown>)[ns];
  }
  return (
    <NextIntlClientProvider locale={locale} messages={picked as any}>
      {children}
    </NextIntlClientProvider>
  );
}

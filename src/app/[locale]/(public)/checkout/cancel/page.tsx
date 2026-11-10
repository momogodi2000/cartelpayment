import React from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import PaymentStatusPanel from "../_components/PaymentStatusPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; t?: string }>;
}

/**
 * Provider error/cancel redirect. Read-only: it never releases a hold. The hold stays until
 * its expiry so the customer can retry; the expiry job releases it after checking the provider.
 */
export default async function CheckoutCancelPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ref, t } = await searchParams;
  return <PaymentStatusPanel locale={locale} orderRef={ref} signature={t} />;
}

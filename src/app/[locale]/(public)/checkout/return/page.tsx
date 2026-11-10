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

/** Provider success redirect. Read-only: status is re-fetched server-side; never trusted from the URL. */
export default async function CheckoutReturnPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ref, t } = await searchParams;
  return <PaymentStatusPanel locale={locale} orderRef={ref} signature={t} />;
}

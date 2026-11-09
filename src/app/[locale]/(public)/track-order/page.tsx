import React from "react";
import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { getOrderTrackingBySession, TRACKING_COOKIE_NAME } from "@/lib/services/tracking";
import TrackOrderClient from "./TrackOrderClient";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function TrackOrderPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ref } = await searchParams;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(TRACKING_COOKIE_NAME)?.value;

  let authenticatedOrder = null;
  if (sessionToken) {
    authenticatedOrder = await getOrderTrackingBySession(sessionToken);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <TrackOrderClient
        initialRef={ref}
        locale={locale}
        authenticatedOrder={authenticatedOrder}
      />
    </div>
  );
}

import React from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTicketForCustomer } from "@/lib/services/support";
import TicketThreadClient from "./TicketThreadClient";

interface PageProps {
  params: Promise<{ locale: string; token: string }>;
}

export default async function CustomerTicketPage({ params }: PageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const ticket = await getTicketForCustomer(token);
  if (!ticket) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <TicketThreadClient ticket={ticket} accessToken={token} locale={locale} />
    </div>
  );
}

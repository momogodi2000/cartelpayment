import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/db/client";
import { releaseHold } from "@/lib/services/inventory";
import { XCircle, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function CheckoutCancelPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Confirmation");
  const { ref } = await searchParams;

  if (ref) {
    const order = await prisma.order.findUnique({
      where: { reference: ref },
      include: { reservation: true },
    });

    if (order?.reservation?.id && order.reservation.status === "ACTIVE") {
      await releaseHold(order.reservation.id, "Checkout session cancelled by customer in browser");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="h-8 w-8" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
        {t("cancelTitle")}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-sm leading-relaxed">
        {t("cancelSubtitle")}
      </p>
      <div className="pt-4">
        <Link
          href="/animals"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-sm shadow-md hover:bg-[#183C32]/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("browseCatalogBtn")}</span>
        </Link>
      </div>
    </div>
  );
}

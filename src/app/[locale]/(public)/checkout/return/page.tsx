import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { applyProviderStatus } from "@/lib/services/payments/settlement";
import { prisma } from "@/lib/db/client";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; o?: string }>;
}

export default async function CheckoutReturnPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Confirmation");
  const { ref, o } = await searchParams;
  const orderRef = ref || o;

  if (!orderRef) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <XCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
          {t("cancelTitle")}
        </h1>
        <Link href="/animals" className="inline-block px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm">
          {t("browseCatalogBtn")}
        </Link>
      </div>
    );
  }

  // Look up payment by order reference or provider reference
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { providerReference: orderRef },
        { order: { reference: orderRef } },
      ],
    },
    include: { order: true },
  });

  let syncResult;
  if (payment?.providerReference) {
    try {
      syncResult = await applyProviderStatus(payment.providerReference);
    } catch (err) {
      console.warn("[Return Page] Status sync warning:", err);
    }
  }

  const effectiveStatus = syncResult?.paymentStatus || payment?.status || "PENDING";
  const orderReference = syncResult?.orderRef || payment?.order?.reference || orderRef;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 border border-black/[0.06] dark:border-zinc-800 shadow-sm text-center space-y-6">
        {effectiveStatus === "SUCCESSFUL" && (
          <>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {t("successTitle")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
              {t("successSubtitle")}
            </p>
            <div className="inline-block bg-[#F8F6F0] dark:bg-zinc-800 px-6 py-3 rounded-2xl border border-black/[0.04]">
              <span className="text-xs text-gray-500 uppercase font-semibold block">
                {t("orderRefLabel")}
              </span>
              <span className="font-mono text-xl font-bold text-[#183C32] dark:text-emerald-400">
                {orderReference}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t("orderRefCopy")}
            </p>

            {/* Next steps checklist */}
            <div className="pt-6 border-t border-black/[0.06] dark:border-zinc-800 text-left space-y-4 max-w-md mx-auto">
              <h4 className="font-serif font-bold text-sm text-[#183C32] dark:text-emerald-400 uppercase tracking-wider">
                {t("nextStepsTitle")}
              </h4>
              <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#183C32]/10 text-[#183C32] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">1</div>
                  <div>
                    <strong className="block text-gray-900 dark:text-white font-semibold">{t("step1Title")}</strong>
                    <span>{t("step1Desc")}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#183C32]/10 text-[#183C32] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">2</div>
                  <div>
                    <strong className="block text-gray-900 dark:text-white font-semibold">{t("step2Title")}</strong>
                    <span>{t("step2Desc")}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#183C32]/10 text-[#183C32] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">3</div>
                  <div>
                    <strong className="block text-gray-900 dark:text-white font-semibold">{t("step3Title")}</strong>
                    <span>{t("step3Desc")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={{ pathname: "/track-order", query: { ref: orderReference } }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-sm shadow-md hover:bg-[#183C32]/90 transition-colors"
              >
                <span>{t("trackOrderBtn")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}

        {(effectiveStatus === "PENDING" || effectiveStatus === "PROCESSING") && (
          <>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-10 w-10 animate-pulse" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {t("nextStepsTitle")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
              {t("orderRefCopy")}
            </p>
            <div className="inline-block bg-[#F8F6F0] dark:bg-zinc-800 px-6 py-3 rounded-2xl border border-black/[0.04]">
              <span className="text-xs text-gray-500 uppercase font-semibold block">
                {t("orderRefLabel")}
              </span>
              <span className="font-mono text-xl font-bold text-[#183C32] dark:text-emerald-400">
                {orderReference}
              </span>
            </div>
            <div className="pt-4">
              <Link
                href={{ pathname: "/track-order", query: { ref: orderReference } }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-xs"
              >
                {t("trackOrderBtn")}
              </Link>
            </div>
          </>
        )}

        {effectiveStatus === "FAILED" && (
          <>
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
              {t("cancelTitle")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-sm">
              {t("cancelSubtitle")}
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/animals"
                className="px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-xs"
              >
                {t("browseCatalogBtn")}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

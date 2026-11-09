import React from "react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { applyProviderStatus } from "@/lib/services/payments/settlement";
import { prisma } from "@/lib/db/client";
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; o?: string }>;
}

export default async function CheckoutReturnPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ref, o } = await searchParams;
  const orderRef = ref || o;

  const isEn = locale === "en";

  if (!orderRef) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <XCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          {isEn ? "Invalid Reference" : "Référence de commande manquante"}
        </h1>
        <Link href="/animals" className="inline-block px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm">
          {isEn ? "Back to Catalogue" : "Retour au catalogue"}
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
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 border border-black/[0.06] shadow-sm text-center space-y-6">
        {effectiveStatus === "SUCCESSFUL" && (
          <>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {isEn ? "Payment Successfully Confirmed!" : "Paiement validé avec succès !"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
              {isEn
                ? "Your adoption reservation is official. Our European concierge and veterinary teams are preparing the official health dossier and transit schedule."
                : "Votre réservation est confirmée. Nos équipes vétérinaires et concierges initient le contrôle sanitaire et la planification du transport."}
            </p>
            <div className="inline-block bg-[#F8F6F0] dark:bg-zinc-800 px-6 py-3 rounded-2xl border border-black/[0.04]">
              <span className="text-xs text-gray-500 uppercase font-semibold block">
                {isEn ? "Order Reference" : "Référence de votre commande"}
              </span>
              <span className="font-mono text-xl font-bold text-[#183C32] dark:text-emerald-400">
                {orderReference}
              </span>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={{ pathname: "/track-order", query: { ref: orderReference } }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-sm shadow-md"
              >
                <span>{isEn ? "Track Order Milestones" : "Suivre l'acheminement en direct"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}

        {(effectiveStatus === "PENDING" || effectiveStatus === "PROCESSING") && (
          <>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-10 w-10" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {isEn ? "Payment Processing" : "Règlement en cours de traitement"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              {isEn
                ? "GeniusPay is clearing the transaction with your financial institution. As soon as clearance is confirmed, you will receive an official confirmation email."
                : "La transaction est en cours de validation auprès de l'établissement bancaire. Un email de confirmation vous sera transmis dès validation définitive."}
            </p>
            <div className="pt-4">
              <Link
                href={{ pathname: "/track-order", query: { ref: orderReference } }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm"
              >
                <span>{isEn ? "View Order Tracking" : "Consulter le suivi de commande"}</span>
              </Link>
            </div>
          </>
        )}

        {(effectiveStatus === "FAILED" || effectiveStatus === "CANCELLED" || effectiveStatus === "EXPIRED") && (
          <>
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {isEn ? "Payment Was Not Completed" : "Le paiement n'a pas pu aboutir"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              {isEn
                ? "The transaction was declined, cancelled, or expired. The temporary reservation hold has been released."
                : "La transaction a été interrompue ou refusée par l'émetteur. La réservation temporaire a été libérée."}
            </p>
            <div className="pt-4">
              <Link
                href="/animals"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm"
              >
                {isEn ? "Return to Catalogue" : "Retourner au catalogue"}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

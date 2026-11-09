import React from "react";
import type { Metadata } from "next";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { confirmNewsletterSubscription } from "@/lib/services/newsletter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "fr" ? "Confirmation d'inscription | Pawelium" : "Newsletter Confirmation | Pawelium",
    robots: { index: false, follow: false },
  };
}

export default async function NewsletterConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;

  let isSuccess = false;
  let confirmedEmail = "";

  if (token) {
    const res = await confirmNewsletterSubscription(token);
    if (res.success && res.email) {
      isSuccess = true;
      confirmedEmail = res.email;
    }
  }

  const isFr = locale === "fr";

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-sm space-y-6">
        {isSuccess ? (
          <>
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black font-heading text-text-premium">
                {isFr ? "Inscription confirmée !" : "Subscription Confirmed!"}
              </h1>
              <p className="text-sm text-text-premium/70 leading-relaxed max-w-md mx-auto">
                {isFr
                  ? `Votre adresse e-mail (${confirmedEmail}) a bien été vérifiée. Vous recevrez désormais notre sélection privée d'animaux d'exception.`
                  : `Your email address (${confirmedEmail}) has been successfully confirmed. You will now receive our curated private animal selections.`}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black font-heading text-text-premium">
                {isFr ? "Lien invalide ou expiré" : "Invalid or Expired Link"}
              </h1>
              <p className="text-sm text-text-premium/70 leading-relaxed max-w-md mx-auto">
                {isFr
                  ? "Ce lien de confirmation n'est plus valide. Veuillez vous réinscrire depuis notre page d'accueil si nécessaire."
                  : "This confirmation link is invalid or has expired. Please subscribe again from our homepage if needed."}
              </p>
            </div>
          </>
        )}

        <div className="pt-4">
          <Link
            href="/animals"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isFr ? "Découvrir nos animaux" : "Explore Animals"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

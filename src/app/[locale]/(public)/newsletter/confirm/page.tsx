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
    title: (await getTranslations({ locale, namespace: "PublicPages" }))("newsletter.metaTitle"),
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

  const tp = await getTranslations({ locale, namespace: "PublicPages" });

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
                {tp("newsletter.confirmedTitle")}
              </h1>
              <p className="text-sm text-text-premium/70 leading-relaxed max-w-md mx-auto">
                {tp("newsletter.confirmedBody", { email: confirmedEmail ?? "" })}
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
                {tp("newsletter.invalidTitle")}
              </h1>
              <p className="text-sm text-text-premium/70 leading-relaxed max-w-md mx-auto">
                {tp("newsletter.invalidBody")}
              </p>
            </div>
          </>
        )}

        <div className="pt-4">
          <Link
            href="/animals"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{tp("newsletter.explore")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

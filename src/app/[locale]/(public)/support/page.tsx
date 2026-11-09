import React from "react";
import { setRequestLocale } from "next-intl/server";
import SupportFormClient from "./SupportFormClient";
import { Headphones, ShieldCheck, Mail, MessageSquare } from "lucide-react";
import { siteConfig } from "@/data/site";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SupportPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#183C32]/10 text-[#183C32] text-xs font-bold uppercase tracking-wider">
          <Headphones className="h-3.5 w-3.5" />
          {isEn ? "Pawelium Concierge Support" : "Service Clientèle & Conciergerie"}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
          {isEn ? "How can we assist you?" : "Comment pouvons-nous vous aider ?"}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          {isEn
            ? "Submit a support ticket regarding an adoption, veterinary documentation, or transport schedule."
            : "Transmettez votre demande relative à une adoption, un dossier sanitaire ou le protocole de transport."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Support Ticket Form */}
        <div className="md:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm">
          <SupportFormClient locale={locale} />
        </div>

        {/* Sidebar Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-[#F8F6F0] dark:bg-zinc-800 rounded-3xl p-6 border border-black/[0.04] space-y-4">
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
              {isEn ? "Direct Concierge" : "Assistance Dédiée"}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {isEn
                ? "Our advisors are available Monday to Saturday to answer any questions regarding our companions and breeding standards."
                : "Nos conseillers sont disponibles du lundi au samedi pour vous guider dans l'accueil de votre compagnon."}
            </p>
            <div className="pt-2 border-t border-black/[0.06] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <Mail className="h-4 w-4 text-[#B69A65]" />
                <span>contact@pawelium.fyi</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <MessageSquare className="h-4 w-4" />
                <span>+33 6 41 32 53 28</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { WifiOff, MessageCircle, Mail, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function OfflinePage() {
  const { language } = useApp();

  const handleReconnect = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@caniprestige.eu";

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-8 flex flex-col justify-center min-h-[70vh]">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
        <WifiOff className="h-10 w-10" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          {language === "en" ? "You Are Offline" : "Vous êtes Hors Ligne"}
        </h1>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          {language === "en"
            ? "We are unable to reach CaniPrestige right now. Please check your connection and try again."
            : "Nous ne parvenons pas à joindre CaniPrestige pour le moment. Vérifiez votre connexion et réessayez."}
        </p>
      </div>

      <div className="bg-white dark:bg-black/10 rounded-3xl p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm text-left space-y-4">
        <p className="text-xs font-extrabold text-text-premium/50 uppercase tracking-wider">
          {language === "en" ? "Contact us directly" : "Contactez-nous directement"}
        </p>
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-extrabold text-xs text-text-premium/50 uppercase block">WhatsApp</span>
            <span className="font-semibold text-sm text-text-premium">
              {language === "en" ? "Contact via WhatsApp" : "Via WhatsApp"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary shrink-0" />
          <div>
            <span className="font-extrabold text-xs text-text-premium/50 uppercase block">Email</span>
            <span className="font-semibold text-sm text-text-premium">{email}</span>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={handleReconnect}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          {language === "en" ? "Try Reconnecting" : "Réessayer la connexion"}
        </button>
      </div>
    </div>
  );
}

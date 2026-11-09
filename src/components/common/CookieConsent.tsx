"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

export default function CookieConsent() {
  const t = useTranslations("Cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("pwl_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("pwl_cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("pwl_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label={t("ariaLabel")}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#183C32] text-white p-6 rounded-3xl shadow-2xl border border-[#B69A65]/30 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start space-x-3.5">
        <ShieldCheck className="w-5 h-5 text-[#B69A65] shrink-0 mt-0.5" />
        <div className="space-y-2 text-xs">
          <p className="font-semibold text-sm font-serif">
            {t("title")}
          </p>
          <p className="text-white/80 leading-relaxed text-[11px]">
            {t("description")}
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={handleAccept}
              className="bg-[#B69A65] hover:bg-[#a38854] text-[#183C32] font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t("acceptAll")}
            </button>
            <button
              onClick={handleDecline}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t("essentialOnly")}
            </button>
            <Link
              href="/politique-de-confidentialite"
              className="text-white/70 hover:text-white underline text-[11px]"
            >
              {t("privacyPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

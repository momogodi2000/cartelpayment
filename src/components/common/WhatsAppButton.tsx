"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  href: string;
}

export function WhatsAppButton({ href }: Props) {
  const t = useTranslations("Common");
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDismissed) setIsVisible(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible) return null;

  const label = t("whatsappButton");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-full shadow-2xl shadow-emerald-600/30 transition-all duration-300 scale-100 hover:scale-[1.05] active:scale-95 font-bold text-sm"
      >
        <span className="relative flex h-5 w-5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
          <MessageCircle className="relative h-5 w-5 fill-white text-emerald-600" />
        </span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap hidden sm:inline-block">
          {label}
        </span>
        <span className="sm:hidden">{t("whatsappChatShort")}</span>
      </a>

      <button
        onClick={handleDismiss}
        className="h-8 w-8 rounded-full bg-white/95 hover:bg-white text-text-premium/50 hover:text-text-premium flex items-center justify-center border border-black/[0.08] shadow-md hover:scale-105 transition-all"
        aria-label={t("whatsappButtonShort")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default WhatsAppButton;

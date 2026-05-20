"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  phone?: string;
  customText?: string;
}

export default function WhatsAppButton({ phone, customText }: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const targetPhone = phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const defaultText = customText || "Hello! I visited your website and would like to ask some questions about your breeding methods and available birds.";
  const whatsappUrl = getWhatsAppLink(targetPhone, defaultText);

  useEffect(() => {
    // Show the button after 2.5 seconds to draw soft visual attention
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Floating CTA Message Bubble */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 scale-100 hover:scale-[1.05] active:scale-95 font-bold text-sm tracking-wide"
      >
        <span className="relative flex h-5 w-5">
          {/* Pulsate micro-animation effect */}
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <MessageCircle className="relative h-5 w-5 fill-white text-emerald-600" />
        </span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap hidden sm:inline-block">
          Chat With Nursery
        </span>
        <span className="sm:hidden">Chat</span>
      </a>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="h-8 w-8 rounded-full bg-white/95 hover:bg-white text-text-premium/50 hover:text-text-premium flex items-center justify-center border border-black/[0.08] shadow-md hover:scale-105 transition-all"
        aria-label="Dismiss chat widget"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

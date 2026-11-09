'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const locale = useLocale();
  const isEn = locale === 'en';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('pwl_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pwl_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('pwl_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label={isEn ? 'Cookie Consent' : 'Consentement aux cookies'}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#183C32] text-white p-5 rounded-2xl shadow-2xl border border-[#B69A65]/30 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-[#B69A65] shrink-0 mt-0.5" />
        <div className="space-y-2 text-xs">
          <p className="font-semibold text-sm font-serif">
            {isEn ? 'Respecting Your Privacy (GDPR)' : 'Protection des Données & Vie Privée (RGPD)'}
          </p>
          <p className="text-white/80 leading-relaxed">
            {isEn
              ? 'We use essential cookies to maintain secure sessions, track orders, and ensure seamless card checkout. No marketing trackers are loaded without your consent.'
              : 'Nous utilisons des cookies essentiels pour sécuriser les sessions de commande, le suivi et les paiements bancaires. Aucun traceur publicitaire n\'est activé sans votre accord.'}
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={handleAccept}
              className="bg-[#B69A65] hover:bg-[#a38854] text-[#183C32] font-bold px-4 py-1.5 rounded-lg text-xs transition-colors"
            >
              {isEn ? 'Accept All' : 'Tout Accepter'}
            </button>
            <button
              onClick={handleDecline}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              {isEn ? 'Essential Only' : 'Essentiels Uniquement'}
            </button>
            <Link
              href="/politique-de-confidentialite"
              className="text-white/70 hover:text-white underline text-[11px]"
            >
              {isEn ? 'Privacy Policy' : 'En savoir plus'}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

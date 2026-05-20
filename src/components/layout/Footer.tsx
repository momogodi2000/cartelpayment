"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Award, ChevronRight } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";
import NewsletterForm from "@/components/common/NewsletterForm";

export default function Footer() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const defaultText = language === "en"
    ? "Hello! I visited your website and would like to ask some questions about your breeding methods."
    : "Bonjour ! J'ai visité votre site web et j'aimerais poser des questions sur vos méthodes d'élevage.";
  const whatsappUrl = getWhatsAppLink(phone, defaultText);

  const breedingStandards = language === "en" ? [
    "100% Closed-Banded & Microchipped",
    "DNA Sexing & Diagnostic Clearances",
    "Socialized Nursery Hand-Raising",
    "Lifelong Breeder Support & Guides",
    "Legal Veterinary CITES Documentation",
  ] : [
    "Bague Fermée & Puce Électronique 100%",
    "Sexage ADN & Bilans Vétérinaires",
    "Élevage à la Main & Socialisation Active",
    "Suivi & Conseils d'Élevage à Vie",
    "Documents Vétérinaires & Agréments CITES",
  ];

  void breedingStandards;

  return (
    <footer className="bg-text-premium text-white/90 pt-16 pb-8 mt-auto border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/[0.08]">
          {/* Column 1: Breeder Info & Licensing */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white border border-white/10 flex items-center justify-center p-1 shadow-sm">
                <Image src="/logo.png" alt="AraHaven Logo" width={32} height={32} className="h-full w-full object-contain" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                ARA<span className="text-accent">HAVEN</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              {t("footer.desc")}
            </p>
            <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-3 py-2 rounded-lg border border-accent/20 w-fit">
              <Award className="h-4 w-4 shrink-0" />
              <span>{t("hero.badge")}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-5">
              {t("footer.links")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: t("nav.home") },
                { href: "/catalog", label: t("nav.catalog") },
                { href: "/gallery", label: t("nav.gallery") },
                { href: "/about", label: t("nav.about") },
                { href: "/blog", label: t("nav.blog") },
                { href: "/contact", label: t("nav.contact") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-sm text-white/70 hover:text-white flex items-center gap-1 transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Newsletter Signup */}
          <div className="space-y-4">
            <NewsletterForm />
          </div>

          {/* Column 4: Contact details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-5">
              {language === "en" ? "Contact & Location" : "Contact & Volière"}
            </h3>
            <p className="text-sm text-white/70">
              {language === "en"
                ? "Speak directly with our expert caretakers. We discuss shipping, care requirements, and reservations."
                : "Échangez directement avec nos soigneurs. Nous discutons du transport, des soins et des réservations."}
            </p>
            <div className="space-y-3 text-sm text-white/70">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-white transition-colors group"
              >
                <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span>{language === "en" ? "WhatsApp Contact" : "Contact WhatsApp"}</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{t("contact.locationVal")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>nursery@arahaven.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>
            {language === "en"
              ? `© ${new Date().getFullYear()} AraHaven Aviary. All rights reserved. Captive-bred legal birds only.`
              : `© ${new Date().getFullYear()} Élevage AraHaven. Tous droits réservés. Oiseaux nés en captivité légaux uniquement.`}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/offline" className="hover:underline">
              {language === "en" ? "PWA Offline Contacts" : "Contacts Hors-Ligne PWA"}
            </Link>
            <Link href="/admin/login" className="hover:underline text-white/30 hover:text-white">
              {t("nav.admin")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

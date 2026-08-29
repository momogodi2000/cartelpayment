import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Heart, Mail, MapPin, Award } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const OWNER_NAME = "Théodore de Parin";
const ADDRESS = "77 Boulevard Saint-Jacques, 75014 Paris, France";
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@pawelite.eu";
const EXPERIENCE = "6 ans d'expérience";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "33600000000";
const cleanPhone = whatsappNumber.replace(/\D/g, "");
const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
  "Bonjour ! Je souhaite en savoir plus sur vos chiens disponibles."
)}`;

const navLinks: { href: string; labelFr: string }[] = [
  { href: "/catalogue", labelFr: "Notre Catalogue" },
  { href: "/a-propos", labelFr: "À Propos" },
  { href: "/sante-vaccination", labelFr: "Santé & Vaccination" },
  { href: "/livraison-transport", labelFr: "Transport & Livraison" },
  { href: "/faq", labelFr: "FAQ" },
  { href: "/contact", labelFr: "Contact" },
];

const legalLinks: { href: string; labelFr: string }[] = [
  { href: "/mentions-legales", labelFr: "Mentions Légales" },
  { href: "/politique-de-confidentialite", labelFr: "Politique de Confidentialité" },
];

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Footer — always rendered on a deep-forest-green background (#1F3A2E).
 * All colors are explicit white/cream tokens so they never invert in dark mode.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto"
      style={{ backgroundColor: "#1F3A2E" }}
    >
      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* ── Col 1 · Brand ─────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="PawElite logo"
              width={40}
              height={40}
              className="rounded-full object-cover shrink-0"
            />
            <div>
              <h2 className="text-xl font-black font-heading text-white leading-none">
                PawElite
              </h2>
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mt-0.5">
                L&apos;Excellence Canine Européenne
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm leading-relaxed text-white/70 max-w-xs">
            Sélection premium de chiens et chiots de race issus d&apos;élevages
            européens responsables.
          </p>

          {/* Experience badge */}
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Award className="h-4 w-4 text-amber-400 shrink-0" />
            {EXPERIENCE}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-xs text-white/60">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{ADDRESS}</span>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Contacter via WhatsApp
          </a>
        </div>

        {/* ── Col 2 · Navigation ────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Navigation
          </h3>
          <ul className="space-y-2">
            {navLinks.map(({ href, labelFr }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {labelFr}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 3 · Légal & coordonnées ──────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Informations
          </h3>

          {/* Owner */}
          <p className="text-sm font-semibold text-white/90">{OWNER_NAME}</p>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-white/70">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>77 Bd Saint-Jacques, 75014 Paris</span>
          </div>

          {/* Email */}
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
            {EMAIL}
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
            WhatsApp — Contact Direct
          </a>

          {/* Legal links (desktop) */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            {legalLinks.map(({ href, labelFr }) => (
              <div key={href}>
                <Link
                  href={href}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  {labelFr}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 flex items-center gap-1">
            © {currentYear} PawElite. Tous droits réservés. Fait avec{" "}
            <Heart className="h-3 w-3 text-rose-400 inline" /> pour les
            amoureux des chiens.
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map(({ href, labelFr }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {labelFr}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

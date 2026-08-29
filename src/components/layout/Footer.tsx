import React from "react";
import Link from "next/link";
import { MessageSquare, Heart, Mail } from "lucide-react";

const footerLinks = {
  main: [
    { href: "/catalogue", labelFr: "Nos Chiens", labelEn: "Our Dogs" },
    { href: "/a-propos", labelFr: "Notre Histoire", labelEn: "Our Story" },
    { href: "/faq", labelFr: "FAQ", labelEn: "FAQ" },
    { href: "/contact", labelFr: "Contact", labelEn: "Contact" },
  ],
  legal: [
    { href: "/mentions-legales", labelFr: "Mentions Légales", labelEn: "Legal Notice" },
    { href: "/confidentialite", labelFr: "Confidentialité", labelEn: "Privacy" },
  ],
};

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "33600000000";
const cleanPhone = whatsappNumber.replace(/\D/g, "");
const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Bonjour ! Je souhaite en savoir plus sur vos chiens disponibles.")}`;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-text-premium text-white/80 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black font-heading text-white">PawElite</h2>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mt-0.5">
              L'Excellence Canine Européenne
            </p>
          </div>
          <p className="text-sm leading-relaxed text-white/60 max-w-xs">
            Sélection premium de chiens et chiots de race issus d'élevages européens responsables.
          </p>
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

        {/* Navigation */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Navigation</h3>
          <ul className="space-y-2">
            {footerLinks.main.map(({ href, labelFr }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {labelFr}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Contact</h3>
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
              WhatsApp — Contact Direct
            </a>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@pawelite.eu"}`}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4 text-primary shrink-0" />
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@pawelite.eu"}
            </a>
          </div>

          <div className="pt-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/40 leading-relaxed">
              <strong className="text-white/60">Démonstration :</strong> Ce site présente du contenu illustratif. Les données seront mises à jour avec les informations réelles de l'éleveur.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 flex items-center gap-1">
            © {currentYear} PawElite. Tous droits réservés. Fait avec{" "}
            <Heart className="h-3 w-3 text-accent inline" /> pour les amoureux des chiens.
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map(({ href, labelFr }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
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

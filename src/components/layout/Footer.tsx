import React from "react";
import Image from "next/image";
import { MessageSquare, Heart, Mail, MapPin, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { siteConfig, getWhatsAppLink } from "@/data/site";

/**
 * Footer — always rendered on a deep-forest-green background (#1F3A2E).
 * All colours are explicit white/cream tokens so they never invert in dark mode.
 */
export default function Footer() {
  const t = useTranslations("Footer");
  const tc = useTranslations("Common");
  const tl = useTranslations("PublicPages.labels");
  const currentYear = new Date().getFullYear();

  const whatsappUrl = getWhatsAppLink(tc("whatsappGeneralMessage"));
  const email = siteConfig.email;
  const address = siteConfig.ownerAddress;

  const navLinks = [
    { href: "/animals", label: t("catalog") },
    { href: "/track-order", label: t("tracking") },
    { href: "/support", label: t("support") },
    { href: "/a-propos", label: t("about") },
    { href: "/devenir-partenaire", label: t("partner") },
    { href: "/sante-vaccination", label: t("health") },
    { href: "/livraison-transport", label: t("delivery") },
    { href: "/faq", label: t("faq") },
    { href: "/contact", label: t("contact") },
  ] as const;

  const legalLinks = [
    { href: "/conditions-generales-de-vente", label: t("terms") },
    { href: "/bien-etre-animal", label: t("welfare") },
    { href: "/mentions-legales", label: t("legal") },
    { href: "/politique-de-confidentialite", label: t("privacy") },
  ] as const;

  return (
    <footer className="mt-auto" style={{ backgroundColor: "#1F3A2E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Col 1 · Brand */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt={tl("logoAlt")} width={40} height={40} className="rounded-full object-cover shrink-0" />
            <div>
              <h2 className="text-xl font-black font-heading text-white leading-none">pawelium</h2>
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mt-0.5">{t("tagline")}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-white/70 max-w-xs">{t("description")}</p>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <Award className="h-4 w-4 text-amber-400 shrink-0" />
            {t("experience")}
          </div>

          <div className="flex items-start gap-2 text-xs text-white/60">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            {t("whatsapp")}
          </a>
        </div>

        {/* Col 2 · Navigation */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{t("navTitle")}</h3>
          <ul className="space-y-2">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 · Info & legal */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{t("infoTitle")}</h3>

          <p className="text-sm font-semibold text-white/90">{siteConfig.ownerName}</p>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
            {email}
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
            {t("whatsappDirect")}
          </a>

          <div className="pt-2 border-t border-white/10 space-y-2">
            {legalLinks.map(({ href, label }) => (
              <div key={href}>
                <Link href={href} className="text-xs text-white/50 hover:text-white/80 transition-colors">
                  {label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 flex items-center gap-1">
            © {currentYear} pawelium. {t("rights")} {t("madeWith")}
            <Heart className="h-3 w-3 text-rose-400 inline" />
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

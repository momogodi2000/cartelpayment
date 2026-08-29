import React from "react";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { getServerTranslation } from "@/lib/serverTranslations";
import { getWhatsAppLink } from "@/data/site";

export const revalidate = 86400;

export async function generateMetadata() {
  return {
    title: "Contact | PawElite — Sélection Canine Européenne",
    description:
      "Contactez PawElite via WhatsApp pour toute question sur nos chiens et chiots de race disponibles en Europe.",
  };
}

export default async function ContactPage() {
  const { locale } = await getServerTranslation();
  const whatsappMessage = locale === "en"
    ? "Hello! I visited PawElite and would like to ask some questions about your available dogs."
    : "Bonjour ! J'ai visite PawElite et j'aimerais poser des questions sur vos chiens disponibles.";
  const whatsappUrl = getWhatsAppLink(whatsappMessage);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@pawelite.eu";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {locale === "fr" ? "Contactez-Nous" : "Contact Us"}
        </h1>
        <p className="text-text-premium/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {locale === "fr"
            ? "La façon la plus rapide de nous contacter est via WhatsApp. Nous répondons généralement dans les 2 heures."
            : "The fastest way to reach us is via WhatsApp. We typically respond within 2 hours."}
        </p>
        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
      </div>

      {/* Primary CTA — WhatsApp */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-center space-y-6 shadow-2xl shadow-emerald-600/25">
        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
          <MessageCircle className="h-8 w-8 fill-white text-emerald-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">WhatsApp</h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            {locale === "fr"
              ? "Envoyez-nous un message directement. Un interlocuteur vous répondra rapidement."
              : "Send us a message directly. Someone will reply quickly."}
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-emerald-700 font-extrabold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <MessageCircle className="h-5 w-5" />
          {locale === "fr" ? "Ouvrir WhatsApp" : "Open WhatsApp"}
        </a>
      </div>

      {/* Secondary contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: Mail,
            titleFr: "Email",
            titleEn: "Email",
            valueFr: email,
            valueEn: email,
            href: `mailto:${email}`,
          },
          {
            icon: Clock,
            titleFr: "Disponibilité",
            titleEn: "Availability",
            valueFr: "Lun–Sam, 9h–19h",
            valueEn: "Mon–Sat, 9am–7pm",
            href: null,
          },
          {
            icon: MapPin,
            titleFr: "Zone de service",
            titleEn: "Service area",
            valueFr: "Europe",
            valueEn: "Europe",
            href: null,
          },
        ].map(({ icon: Icon, titleFr, titleEn, valueFr, valueEn, href }) => (
          <div key={titleFr} className="p-6 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 space-y-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-extrabold text-text-premium">{locale === "en" ? titleEn : titleFr}</h3>
            {href ? (
              <a href={href} className="text-sm text-primary hover:text-primary-hover font-semibold">
                {locale === "en" ? valueEn : valueFr}
              </a>
            ) : (
              <p className="text-sm text-text-premium/60">{locale === "en" ? valueEn : valueFr}</p>
            )}
          </div>
        ))}
      </div>

      {/* FAQ link */}
      <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
        <p className="text-sm text-text-premium/70">
          {locale === "fr"
            ? "Avant de nous contacter, consultez peut-être notre FAQ qui répond aux questions les plus fréquentes."
            : "Before contacting us, check our FAQ which answers the most common questions."}
        </p>
        <a href="/faq" className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
          {locale === "fr" ? "Consulter la FAQ →" : "View FAQ →"}
        </a>
      </div>
    </div>
  );
}

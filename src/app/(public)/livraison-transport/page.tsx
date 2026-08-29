import React from "react";
import { getServerTranslation } from "@/lib/serverTranslations";
import { getWhatsAppLink } from "@/data/site";
import { Truck, MapPin, FileCheck, Shield, Info, CheckCircle2, MessageCircle, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison & Transport | PawElite — Remise en Main Propre & Transport UE",
  description:
    "Modalités de remise en main propre et de transport encadré pour votre chiot. Conformité Règlement (UE) 576/2013, passeport européen, bien-être animal.",
};

export const revalidate = 86400;

export default async function LivraisonTransportPage() {
  const { locale } = await getServerTranslation();
  const whatsappUrl = getWhatsAppLink(
    locale === "en"
      ? "Hello! I have a question about transport and delivery options for a puppy."
      : "Bonjour ! J'ai une question sur les modalités de transport et de remise pour un chiot."
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest">
          <Truck className="h-4 w-4" />
          {locale === "fr" ? "Livraison & Transport" : "Delivery & Transport"}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {locale === "fr" ? "Remise & Transport de Votre Chiot" : "Puppy Handover & Transport"}
        </h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {locale === "fr"
            ? "Nous privilégions le bien-être animal à chaque étape. Nos modalités de remise sont conformes au Règlement (UE) n° 576/2013 et aux standards européens de protection animale."
            : "We prioritise animal welfare at every step. Our handover procedures comply with EU Regulation 576/2013 and European animal protection standards."}
        </p>
        <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full" />
      </div>

      {/* Option A — Remise en main propre */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black font-heading text-text-premium flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          {locale === "fr" ? "Option Recommandée — Remise en Main Propre" : "Recommended Option — Direct Handover"}
        </h2>
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-4">
          <p className="text-sm text-text-premium/80 leading-relaxed">
            {locale === "fr"
              ? "La remise en main propre est notre approche privilégiée. Elle permet de rencontrer l'éleveur, de voir le cadre de vie du chiot, et de bénéficier d'un accompagnement personnalisé lors de la première rencontre avec votre nouveau compagnon."
              : "Direct handover is our preferred approach. It allows you to meet the breeder, see the puppy's living environment, and benefit from personalised guidance during the first meeting with your new companion."}
          </p>
          <ul className="space-y-2">
            {[
              locale === "fr" ? "Rencontre avec l'éleveur et visite de l'élevage" : "Meeting the breeder and visiting the breeding facility",
              locale === "fr" ? "Remise du passeport européen, carnet de santé et contrat de vente" : "Handover of European passport, health record and sales contract",
              locale === "fr" ? "Conseils personnalisés sur l'alimentation, l'éducation et les soins" : "Personalised advice on nutrition, training and care",
              locale === "fr" ? "Point de remise possible à Paris (77 Bd Saint-Jacques, 75014) sur rendez-vous" : "Handover point available in Paris (77 Bd Saint-Jacques, 75014) by appointment",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-premium/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Option B — Transport encadré */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black font-heading text-text-premium flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          {locale === "fr" ? "Option B — Transport Encadré Intra-UE" : "Option B — Supervised Intra-EU Transport"}
        </h2>
        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-4">
          <p className="text-sm text-text-premium/80 leading-relaxed">
            {locale === "fr"
              ? "Un transport encadré peut être organisé pour les acheteurs situés en dehors de la région parisienne ou dans un autre pays de l'UE. Le transport s'effectue toujours dans le respect des normes de bien-être animal."
              : "Supervised transport can be arranged for buyers located outside the Paris region or in another EU country. Transport always takes place in compliance with animal welfare standards."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Shield,
                titleFr: "Transport Conforme UE",
                titleEn: "EU-Compliant Transport",
                descFr: "Règlement (UE) n° 576/2013 respecté : puce électronique, passeport européen valide, vaccination antirabique avec délai de 21 jours respecté.",
                descEn: "EU Regulation 576/2013 complied with: microchip, valid European passport, rabies vaccination with 21-day period respected.",
              },
              {
                icon: FileCheck,
                titleFr: "Documentation Complète",
                titleEn: "Complete Documentation",
                descFr: "Certificat sanitaire (valable 10 jours), passeport européen, contrat de vente et garanties sanitaires remis avant le départ.",
                descEn: "Health certificate (valid 10 days), European passport, sales contract and health guarantees provided before departure.",
              },
              {
                icon: Info,
                titleFr: "Bien-être Prioritaire",
                titleEn: "Welfare Priority",
                descFr: "Transport uniquement pour les chiots âgés de plus de 8 semaines. Caisse de transport adaptée, eau disponible, durée limitée.",
                descEn: "Transport only for puppies over 8 weeks old. Appropriate transport crate, water available, limited duration.",
              },
              {
                icon: AlertTriangle,
                titleFr: "Conditions d'Application",
                titleEn: "Conditions of Application",
                descFr: "Maximum 5 animaux par mouvement non commercial (sauf exceptions documentées pour compétitions ou expositions).",
                descEn: "Maximum 5 animals per non-commercial movement (except documented exceptions for competitions or shows).",
              },
            ].map(({ icon: Icon, titleFr, titleEn, descFr, descEn }) => (
              <div key={titleFr} className="p-4 rounded-xl bg-white dark:bg-black/20 border border-blue-100 dark:border-blue-900/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-sm text-text-premium">{locale === "fr" ? titleFr : titleEn}</span>
                </div>
                <p className="text-xs text-text-premium/70 leading-relaxed">{locale === "fr" ? descFr : descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-text-premium text-sm mb-2">
              {locale === "fr" ? "Rappel Réglementaire Important" : "Important Regulatory Reminder"}
            </h3>
            <p className="text-xs text-text-premium/70 leading-relaxed">
              {locale === "fr"
                ? "Conformément au Règlement (UE) n° 576/2013, tout mouvement non commercial d'animal de compagnie vers ou depuis un autre État membre doit être accompagné d'un passeport pour animal de compagnie valide, d'une puce électronique et, pour les déplacements hors Irlande/Finlande/Malte/Norvège, d'une vaccination antirabique valide."
                : "In accordance with EU Regulation 576/2013, any non-commercial movement of a pet to or from another Member State must be accompanied by a valid pet passport, electronic chip and, for travel outside Ireland/Finland/Malta/Norway, a valid rabies vaccination."}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-5">
        <h2 className="text-2xl font-black font-heading text-text-premium">
          {locale === "fr" ? "Organiser la Remise de Votre Chiot" : "Arrange Your Puppy Handover"}
        </h2>
        <p className="text-text-premium/60 text-sm max-w-lg mx-auto">
          {locale === "fr"
            ? "Contactez Théodore de Parin directement par WhatsApp pour organiser les modalités de remise adaptées à votre situation."
            : "Contact Théodore de Parin directly via WhatsApp to arrange handover terms suited to your situation."}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
        >
          <MessageCircle className="h-4 w-4" />
          {locale === "fr" ? "Contacter via WhatsApp" : "Contact via WhatsApp"}
        </a>
      </div>
    </div>
  );
}

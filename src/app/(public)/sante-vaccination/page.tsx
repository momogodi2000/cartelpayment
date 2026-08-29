import React from "react";
import { getServerTranslation } from "@/lib/serverTranslations";
import { getWhatsAppLink } from "@/data/site";
import { Syringe, Shield, FileCheck, AlertTriangle, Info, CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Santé & Vaccination | CaniPrestige — Protocole Officiel WSAVA",
  description:
    "Protocole vaccinal officiel WSAVA, puce électronique ISO, passeport européen et réglementation UE 576/2013. Toutes les garanties sanitaires pour votre chiot.",
};

export const revalidate = 86400;

export default async function SanteVaccinationPage() {
  const { locale } = await getServerTranslation();
  const whatsappUrl = getWhatsAppLink(
    locale === "en"
      ? "Hello! I have a question about vaccination requirements and health guarantees."
      : "Bonjour ! J'ai une question sur les exigences de vaccination et les garanties sanitaires."
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
          <Syringe className="h-4 w-4" />
          {locale === "fr" ? "Santé & Vaccination" : "Health & Vaccination"}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {locale === "fr" ? "Protocole Sanitaire & Vaccination" : "Health Protocol & Vaccination"}
        </h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {locale === "fr"
            ? "Tous nos chiots suivent le protocole vaccinal officiel WSAVA et sont conformes au Règlement (UE) n° 576/2013 pour les mouvements intra-européens."
            : "All our puppies follow the official WSAVA vaccination protocol and comply with EU Regulation 576/2013 for intra-European movements."}
        </p>
        <div className="h-1 w-16 bg-emerald-600 mx-auto rounded-full" />
      </div>

      {/* EU Regulation 576/2013 */}
      <section className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <FileCheck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-heading text-text-premium">
              {locale === "fr" ? "Réglementation UE — Règlement n° 576/2013" : "EU Regulation — Regulation 576/2013"}
            </h2>
            <p className="text-text-premium/60 text-sm mt-1">
              {locale === "fr" ? "Source officielle : EUR-Lex, applicable dans toute l'Union Européenne" : "Official source: EUR-Lex, applicable across the entire European Union"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Shield,
              titleFr: "Puce Électronique Obligatoire",
              titleEn: "Mandatory Microchip",
              contentFr: "Norme ISO 11784/11785. Tout chien doit être identifié par transpondeur électronique (puce sous-cutanée) avant ou au moment du premier vaccin antirabique.",
              contentEn: "ISO 11784/11785 standard. Every dog must be identified by electronic transponder (subcutaneous chip) before or at the time of the first rabies vaccine.",
              color: "blue",
            },
            {
              icon: Syringe,
              titleFr: "Vaccination Antirabique",
              titleEn: "Rabies Vaccination",
              contentFr: "Obligatoire à partir de 12 semaines. Un délai de 21 jours doit être respecté entre la vaccination et tout mouvement transfrontalier dans l'UE.",
              contentEn: "Mandatory from 12 weeks. A 21-day period must elapse between vaccination and any cross-border movement within the EU.",
              color: "emerald",
            },
            {
              icon: FileCheck,
              titleFr: "Passeport Européen",
              titleEn: "European Pet Passport",
              contentFr: "Document officiel délivré par un vétérinaire habilité, contenant toutes les informations d'identification et les antécédents de vaccination.",
              contentEn: "Official document issued by an authorised veterinarian, containing all identification information and vaccination history.",
              color: "amber",
            },
            {
              icon: Info,
              titleFr: "Certificat Sanitaire",
              titleEn: "Health Certificate",
              contentFr: "Valable 10 jours pour un mouvement intra-UE non commercial. Maximum 5 animaux par propriétaire sauf exceptions documentées (compétitions, concours).",
              contentEn: "Valid for 10 days for non-commercial intra-EU movement. Maximum 5 animals per owner except documented exceptions (competitions, shows).",
              color: "purple",
            },
          ].map(({ icon: Icon, titleFr, titleEn, contentFr, contentEn, color }) => (
            <div key={titleFr} className={`p-5 rounded-2xl border bg-${color}-50 dark:bg-${color}-950/20 border-${color}-100 dark:border-${color}-900/40`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-5 w-5 text-${color}-700 dark:text-${color}-400`} />
                <h3 className="font-extrabold text-sm text-text-premium">{locale === "fr" ? titleFr : titleEn}</h3>
              </div>
              <p className="text-xs text-text-premium/70 leading-relaxed">{locale === "fr" ? contentFr : contentEn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WSAVA Vaccination Protocol */}
      <section className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            <Syringe className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-heading text-text-premium">
              {locale === "fr" ? "Protocole Vaccinal WSAVA" : "WSAVA Vaccination Protocol"}
            </h2>
            <p className="text-text-premium/60 text-sm mt-1">
              {locale === "fr"
                ? "Lignes directrices de la World Small Animal Veterinary Association — standard de référence mondial"
                : "World Small Animal Veterinary Association guidelines — global reference standard"}
            </p>
          </div>
        </div>

        {/* Core vaccines */}
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-4">
          <h3 className="font-extrabold text-text-premium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            {locale === "fr" ? "Vaccins Core (Obligatoires)" : "Core Vaccines (Mandatory)"}
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white dark:bg-black/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="font-bold text-sm text-text-premium mb-1">
                DHPPi — {locale === "fr" ? "Maladie de Carré, Hépatite, Parvovirose, Parainfluenza" : "Distemper, Hepatitis, Parvovirus, Parainfluenza"}
              </div>
              <ul className="text-xs text-text-premium/70 space-y-1 list-disc list-inside">
                <li>{locale === "fr" ? "1ère injection : entre 6 et 8 semaines" : "1st injection: between 6 and 8 weeks"}</li>
                <li>{locale === "fr" ? "2ème injection : 2 à 4 semaines après la 1ère" : "2nd injection: 2 to 4 weeks after the 1st"}</li>
                <li>{locale === "fr" ? "3ème injection : à 16 semaines si nécessaire" : "3rd injection: at 16 weeks if needed"}</li>
                <li>{locale === "fr" ? "Rappel à 1 an, puis tous les 3 ans" : "Booster at 1 year, then every 3 years"}</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-black/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="font-bold text-sm text-text-premium mb-1">
                {locale === "fr" ? "Rage — Obligatoire pour tout mouvement transfrontalier UE" : "Rabies — Mandatory for any cross-border EU movement"}
              </div>
              <ul className="text-xs text-text-premium/70 space-y-1 list-disc list-inside">
                <li>{locale === "fr" ? "À partir de 12 semaines en une seule dose" : "From 12 weeks in a single dose"}</li>
                <li>{locale === "fr" ? "Délai de 21 jours avant mouvement transfrontalier" : "21-day waiting period before cross-border movement"}</li>
                <li>{locale === "fr" ? "Rappel à 1 an, puis selon durée d'immunité du vaccin (souvent 3 ans)" : "Booster at 1 year, then according to vaccine immunity duration (often 3 years)"}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Non-core vaccines */}
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-4">
          <h3 className="font-extrabold text-text-premium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {locale === "fr" ? "Vaccins Non-Core (Fortement Recommandés en Europe)" : "Non-Core Vaccines (Strongly Recommended in Europe)"}
          </h3>
          <div className="p-4 rounded-xl bg-white dark:bg-black/20 border border-amber-100 dark:border-amber-900/30">
            <div className="font-bold text-sm text-text-premium mb-1">
              {locale === "fr" ? "Leptospirose — Risque élevé en Europe" : "Leptospirosis — High risk in Europe"}
            </div>
            <ul className="text-xs text-text-premium/70 space-y-1 list-disc list-inside">
              <li>{locale === "fr" ? "Schéma initial : 2 injections à 3-4 semaines d'intervalle" : "Initial schedule: 2 injections 3-4 weeks apart"}</li>
              <li>{locale === "fr" ? "Rappel annuel obligatoire (immunité de courte durée)" : "Annual booster required (short-duration immunity)"}</li>
              <li>{locale === "fr" ? "Fortement recommandée dans les régions humides et zones rurales" : "Strongly recommended in humid regions and rural areas"}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pedigree & FCI */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black font-heading text-text-premium flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          {locale === "fr" ? "Pedigree & Identification Officielle" : "Pedigree & Official Identification"}
        </h2>
        <div className="p-6 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { country: "France", registry: "LOF — Livre des Origines Françaises", body: "Société Centrale Canine (SCC) — membre fondateur de la FCI" },
              { country: "Allemagne", registry: "VDH — Verband für das Deutsche Hundewesen", body: "Affilié FCI, registre officiel allemand" },
              { country: "Belgique", registry: "LOSH — Livre des Origines Saint-Hubert", body: "Union Royale Cynologique Saint-Hubert" },
              { country: "Pays-Bas", registry: "NHSB — Nederlands Hondenstamboek", body: "Raad van Beheer op Kynologisch Gebied" },
            ].map(({ country, registry, body }) => (
              <div key={country} className="p-4 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]">
                <div className="font-extrabold text-sm text-text-premium">{country}</div>
                <div className="text-xs font-semibold text-primary mt-1">{registry}</div>
                <div className="text-xs text-text-premium/50 mt-0.5">{body}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-text-premium/70 leading-relaxed">
              <span className="font-bold text-text-premium">FCI — Fédération Cynologique Internationale :</span>{" "}
              {locale === "fr"
                ? "Fondée en 1911, basée à Thuin (Belgique). Organisme international reconnaissant 354 races officielles réparties en 10 groupes. Le LOF français est l'un de ses membres fondateurs."
                : "Founded in 1911, based in Thuin (Belgium). International body recognising 354 official breeds grouped into 10 categories. The French LOF is one of its founding members."}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-5">
        <h2 className="text-2xl font-black font-heading text-text-premium">
          {locale === "fr" ? "Des Questions sur la Santé de Votre Futur Chiot ?" : "Questions About Your Future Puppy's Health?"}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" />
            {locale === "fr" ? "Contacter via WhatsApp" : "Contact via WhatsApp"}
          </a>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-text-premium text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02] hover:bg-text-premium/90"
          >
            {locale === "fr" ? "Voir Nos Chiots" : "See Our Puppies"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

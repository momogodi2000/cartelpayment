import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | PawElite",
  description: "Politique de protection des données personnelles du site PawElite — RGPD, collecte des données, droits des utilisateurs.",
};

export const revalidate = 86400;

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black font-heading text-text-premium">Politique de Confidentialité</h1>
        <div className="h-1 w-16 bg-primary rounded-full" />
        <p className="text-text-premium/60 text-sm">Dernière mise à jour : Août 2026 — Conforme au Règlement (UE) 2016/679 (RGPD)</p>
      </div>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">1. Responsable du Traitement</h2>
        <div className="text-sm text-text-premium/70 space-y-1">
          <p><strong className="text-text-premium">Responsable :</strong> Persin Thibaut</p>
          <p><strong className="text-text-premium">Adresse :</strong> 77 Boulevard Saint-Jacques, 75014 Paris, France</p>
          <p><strong className="text-text-premium">E-mail :</strong> persinthibaut@gmail.com</p>
        </div>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">2. Données Collectées</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          PawElite est un site vitrine statique. Nous ne collectons pas de données personnelles via des formulaires intégrés. La seule interaction directe se fait via WhatsApp (application tierce soumise à la politique de confidentialité de WhatsApp/Meta) ou par e-mail (persinthibaut@gmail.com).
        </p>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Les informations que vous nous communiquez volontairement (nom, question, coordonnées) via WhatsApp ou e-mail sont utilisées uniquement pour répondre à votre demande. Elles ne sont ni partagées avec des tiers, ni utilisées à des fins commerciales.
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">3. Données Techniques (Analytics & Cookies)</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Ce site utilise des cookies techniques strictement nécessaires au fonctionnement (préférence de langue, thème). Ces cookies ne nécessitent pas de consentement au titre de l'article 82 de la loi Informatique et Libertés.
        </p>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Nous n'utilisons pas de cookies publicitaires, de tracking croisé, ni d'outils d'analyse comportementale de type Google Analytics ou Meta Pixel.
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">4. Base Légale et Durée de Conservation</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          La base légale du traitement est l'intérêt légitime (réponse aux demandes de contact). Les échanges via WhatsApp ou e-mail sont conservés le temps nécessaire au traitement de votre demande, et au maximum 3 ans à compter du dernier contact.
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">5. Vos Droits (RGPD — Art. 15 à 22)</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed mb-3">
          Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
        </p>
        <ul className="space-y-2">
          {[
            "Droit d'accès — connaître les données que nous détenons vous concernant",
            "Droit de rectification — corriger des données inexactes",
            "Droit à l'effacement — demander la suppression de vos données",
            "Droit à la limitation du traitement",
            "Droit à la portabilité des données",
            "Droit d'opposition au traitement",
          ].map((right) => (
            <li key={right} className="flex items-start gap-2 text-sm text-text-premium/70">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {right}
            </li>
          ))}
        </ul>
        <p className="text-sm text-text-premium/70 leading-relaxed mt-3">
          Pour exercer ces droits, contactez-nous à persinthibaut@gmail.com. En cas de litige, vous pouvez saisir la CNIL (www.cnil.fr).
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">6. Sécurité</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Le site est servi en HTTPS. Aucune donnée sensible n'est stockée dans le navigateur. Les échanges WhatsApp bénéficient du chiffrement de bout en bout fourni par WhatsApp/Meta.
        </p>
      </section>
    </div>
  );
}

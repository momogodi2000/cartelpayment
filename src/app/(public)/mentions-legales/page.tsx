import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales | PawElite",
  description: "Mentions légales du site PawElite — Informations légales, éditeur du site, hébergeur et conditions d'utilisation.",
};

export const revalidate = 86400;

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black font-heading text-text-premium">Mentions Légales</h1>
        <div className="h-1 w-16 bg-primary rounded-full" />
        <p className="text-text-premium/60 text-sm">Dernière mise à jour : Août 2026</p>
      </div>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">1. Éditeur du Site</h2>
        <div className="text-sm text-text-premium/70 space-y-1 leading-relaxed">
          <p><strong className="text-text-premium">Nom :</strong> Persin Thibaut</p>
          <p><strong className="text-text-premium">Activité :</strong> Sélection et présentation de chiens et chiots de race — activité non commerciale de mise en relation</p>
          <p><strong className="text-text-premium">Adresse :</strong> 77 Boulevard Saint-Jacques, 75014 Paris, France</p>
          <p><strong className="text-text-premium">E-mail :</strong> persinthibaut@gmail.com</p>
          <p><strong className="text-text-premium">Site Web :</strong> www.pawelite.eu</p>
          <p><strong className="text-text-premium">Expérience :</strong> 6 ans d'expérience dans la sélection canine européenne</p>
        </div>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">2. Hébergement</h2>
        <div className="text-sm text-text-premium/70 space-y-1 leading-relaxed">
          <p><strong className="text-text-premium">Hébergeur :</strong> Netlify, Inc.</p>
          <p><strong className="text-text-premium">Adresse :</strong> 512 Second Street, Suite 200, San Francisco, CA 94107, États-Unis</p>
          <p><strong className="text-text-premium">Site Web :</strong> www.netlify.com</p>
        </div>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">3. Propriété Intellectuelle</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          L'ensemble du contenu de ce site (textes, images, structure, mise en page) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation ou diffusion, totale ou partielle, est interdite sans autorisation préalable écrite de Persin Thibaut.
        </p>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Les photographies illustrant les chiens et races sont issues de Unsplash (licence libre) ou fournies directement par les éleveurs partenaires et restent leur propriété respective.
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">4. Responsabilité</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          PawElite est un site vitrine de mise en relation. Les informations présentées sur les chiens (prix, disponibilité, caractéristiques) sont fournies par les éleveurs partenaires. Persin Thibaut s'efforce d'en garantir l'exactitude mais ne peut être tenu responsable d'éventuelles inexactitudes. Tout achat ou transaction se fait directement entre l'acheteur et l'éleveur.
        </p>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Les prix affichés sont indicatifs et peuvent évoluer. La disponibilité des animaux n'est garantie qu'au moment de la prise de contact directe avec l'éleveur.
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">5. Réglementation sur les Chiens Dangereux</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Conformément à l'article L.211-12 du Code rural et à l'arrêté du 27 avril 1999, certaines races de chiens sont soumises à une réglementation spécifique en France. Si le catalogue comprend des races de 1ère ou 2ème catégorie, les acheteurs seront informés des obligations légales : permis de détention, assurance responsabilité civile et déclaration en mairie. PawElite s'engage à informer systématiquement les acquéreurs potentiels de ces obligations avant toute mise en relation.
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">6. Droit Applicable</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Le présent site est soumis au droit français. Tout litige relatif à l'utilisation de ce site sera soumis à la compétence exclusive des tribunaux français.
        </p>
      </section>

      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-xl font-extrabold text-text-premium">7. Contact</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          Pour toute question relative aux présentes mentions légales, vous pouvez contacter Persin Thibaut à l'adresse : persinthibaut@gmail.com ou au 77 Boulevard Saint-Jacques, 75014 Paris, France.
        </p>
      </section>
    </div>
  );
}

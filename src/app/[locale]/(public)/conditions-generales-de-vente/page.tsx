import React from 'react';
import type { Metadata } from 'next';
import { getLocale, setRequestLocale } from 'next-intl/server';
import { ShieldCheck, FileText, CreditCard, Truck, AlertTriangle, Scale, Lock } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn
      ? 'Terms of Sale, Cancellation & Payment Policy | Pawelium Europe'
      : 'Conditions Générales de Vente, Annulation & Paiement | Pawelium Europe',
    description: isEn
      ? 'Official contractual terms for purchasing purebred European pets on Pawelium. Full payment policy, GeniusPay card settlement, transport guarantees and welfare compliance.'
      : 'Conditions contractuelles officielles pour l\'acquisition d\'animaux de race en Europe sur Pawelium. Modalités de paiement intégral, transport agréé et garanties légales.',
  };
}

export default async function TermsOfSalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#EDE7DC] p-8 sm:p-12">
        {/* Header */}
        <div className="border-b border-[#EDE7DC] pb-6 mb-8 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold">
            {isEn ? 'Contractual Documentation' : 'Cadre Contractuel Officiel'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183C32] mt-2">
            {isEn ? 'Terms of Sale & Payment Policy' : 'Conditions Générales de Vente & Paiement'}
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            {isEn
              ? 'Applicable to all European transactions conducted on pawelium.fyi — Last updated: November 2026'
              : 'Applicable à toutes les transactions européennes conclues sur pawelium.fyi — Dernière mise à jour : Novembre 2026'}
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-[#183C32] flex items-center space-x-2">
              <Scale className="w-5 h-5 text-[#B69A65]" />
              <span>{isEn ? '1. Purpose & Legal Scope' : '1. Objet & Champ d\'Application'}</span>
            </h2>
            <p>
              {isEn
                ? 'These Terms of Sale govern the purchase and reservation of purebred companion animals (dogs, puppies, cats, and kittens) presented on the Pawelium European marketplace. By initiating checkout and settling payment, the customer enters into a binding European purchase agreement ensuring compliance with EU Regulation 576/2013 and national veterinary health standards.'
                : 'Les présentes Conditions Générales de Vente régissent l\'acquisition et la réservation d\'animaux de compagnie pure race (chiens, chiots, chats et chatons) sélectionnés sur la plateforme européenne Pawelium. La validation de la commande et son paiement intégral emportent adhésion pleine et entière aux présentes dispositions conformes au Règlement européen (UE) 576/2013.'}
            </p>
          </section>

          {/* Section 2: Full Payment & Pricing */}
          <section className="space-y-3 bg-[#F8F6F0] p-6 rounded-xl border border-[#EDE7DC]">
            <h2 className="text-lg font-serif font-bold text-[#183C32] flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#183C32]" />
              <span>{isEn ? '2. Full Payment Only Policy (No Split Deposits)' : '2. Règle du Paiement Intégral (Aucun Acompte Partiel)'}</span>
            </h2>
            <p>
              {isEn
                ? 'Pawelium strictly enforces a 100% full-payment model at checkout. Orders must be paid in full in EUR (€) via supported European bank cards (Visa, Mastercard). We do not accept partial deposits, installment payments, or deferred cash settlements upon delivery. The total payable explicitly includes the animal purchase price, European certified transport charges (€150.00 flat rate), and all applicable taxes (TTC).'
                : 'Pawelium applique une politique stricte de paiement intégral à 100 % lors du passage en caisse. Aucune commande ne peut être scindée en acomptes ou paiements échelonnés. Le montant total facturé en euros (EUR) comprend expressément le prix de l\'animal, le forfait de transport agréé (€150,00 TTC) et l\'ensemble des taxes applicables.'}
            </p>
          </section>

          {/* Section 3: Concurrency & Temporary Hold */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-[#183C32] flex items-center space-x-2">
              <Lock className="w-5 h-5 text-[#B69A65]" />
              <span>{isEn ? '3. Concurrency-Safe Inventory & 15-Minute Hold' : '3. Réservation Concurrentielle & Blocage Temporaire'}</span>
            </h2>
            <p>
              {isEn
                ? 'Because every animal is an individual living being with a unique identification microchip, an animal can only be acquired by one customer at a time. When a customer initiates checkout, an automated database lock places the animal in HELD status for 15 minutes. If checkout is completed successfully, the status becomes SOLD. If payment is declined or the session expires, the hold is safely released back to AVAILABLE.'
                : 'Chaque animal étant un être vivant unique doté d\'une traçabilité individuelle (puce ISO), il ne peut être attribué simultanément à deux acquéreurs. Dès l\'initiation de la commande, le statut passe automatiquement en HELD (réservé temporairement) pour 15 minutes. Après confirmation du paiement bancaire, l\'animal est définitivement marqué VENDU (SOLD).'}
            </p>
          </section>

          {/* Section 4: GeniusPay & Stripe Gateway Security */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-[#183C32] flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{isEn ? '4. Payment Security & Provider Gateway' : '4. Sécurité des Paiements Bancaires & Passerelle'}</span>
            </h2>
            <p>
              {isEn
                ? 'Online card payments are processed securely through the GeniusPay merchant orchestration API and its integrated Paynet Stripe Card Gateway. Transactions require Strong Customer Authentication (3D Secure / SCA) according to the European Payment Services Directive (PSD2). Pawelium never stores raw card details on its servers.'
                : 'Les paiements par carte bancaire sont orchestrés via l\'API marchande GeniusPay et sa passerelle intégrée Paynet Stripe. Toutes les transactions sont protégées par le protocole d\'authentification forte 3D Secure / SCA conformément à la directive européenne DSP2.'}
            </p>
          </section>

          {/* Section 5: Delivery & Transport */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-[#183C32] flex items-center space-x-2">
              <Truck className="w-5 h-5 text-[#183C32]" />
              <span>{isEn ? '5. European Climate-Controlled Transport' : '5. Transport Agréé Climatiseur Dédié'}</span>
            </h2>
            <p>
              {isEn
                ? 'All animal movements are coordinated through licensed pet transport operators equipped with temperature-regulated vehicles, fresh hydration systems, and qualified animal handlers. Delivery appointments are confirmed with the customer 48 hours in advance, subject to final pre-departure veterinary endorsement.'
                : 'Le transport des animaux s\'effectue exclusivement via des véhicules climatisés homologués Type 2 (longue durée), assurant une hydratation permanente et supervisés par des convoyeurs animaliers agréés. Le rendez-vous de livraison est coordonné 48 heures au préalable avec le destinataire.'}
            </p>
          </section>

          {/* Section 6: Health Guarantees, Passport & Cancellation */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-[#183C32] flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#B69A65]" />
              <span>{isEn ? '6. Veterinary Passport, Guarantees & Cancellation' : '6. Passeport Vétérinaire, Garanties & Annulation'}</span>
            </h2>
            <p>
              {isEn
                ? 'Each companion arrives with an official European Pet Passport, ISO 11784/11785 microchip certificate, up-to-date core vaccinations (DHPPi/RCP + Rabies where applicable), and statutory health guarantees against redhibitory defects. In the event of an authorized pre-transport cancellation or veterinary disqualification, refunds are processed via the original payment card.'
                : 'Chaque compagnon est remis avec son Passeport Européen officiel, son certificat d\'identification par puce électronique ISO, ses vaccins à jour et les garanties légales contre les vices rédhibitoires. En cas d\'annulation légitime avant transport validée par notre service vétérinaire, le remboursement est opéré directement sur la carte de paiement d\'origine.'}
            </p>
          </section>
        </div>

        {/* Footer shortcuts */}
        <div className="mt-12 pt-6 border-t border-[#EDE7DC] flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/catalogue" className="text-xs font-semibold text-[#183C32] hover:underline">
            {isEn ? '← Back to Marketplace Catalogue' : '← Retour au Catalogue des Animaux'}
          </Link>
          <Link
            href="/support"
            className="bg-[#183C32] hover:bg-[#122e26] text-white px-5 py-2 rounded-lg text-xs font-medium transition-all"
          >
            {isEn ? 'Have Questions? Contact Concierge' : 'Une Question ? Contacter la Conciergerie'}
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import { getLocale, setRequestLocale } from 'next-intl/server';
import { HeartHandshake, ShieldCheck, CheckCircle2, Award, Stethoscope, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn
      ? 'Animal Welfare & Ethical Breeding Charter | Pawelium Europe'
      : 'Charte Éthique & Bien-Être Animal | Pawelium Europe',
    description: isEn
      ? 'Pawelium’s European Animal Welfare Charter: Strict ethical breeder audits, zero-tolerance puppy farm policy, certified socialization and veterinary health monitoring.'
      : 'La Charte de Bien-Être Animal Pawelium : sélection rigoureuse d\'éleveurs familiaux, zéro tolérance pour les usines à chiots, sociabilisation et suivi vétérinaire strict.',
  };
}

export default async function AnimalWelfarePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';

  const pillars = [
    {
      icon: Award,
      title: isEn ? 'Certified European Pedigree' : 'Pedigree Européen Certifié',
      desc: isEn
        ? 'All listings adhere to official national kennel and feline clubs (LOF in France, LOOF for cats, FCI partner associations). Lineages are documented and verifiable.'
        : 'Tous nos animaux sont inscrits ou certifiés au LOF, LOOF ou registres membres de la FCI. La traçabilité généalogique des parents est vérifiable.',
    },
    {
      icon: Stethoscope,
      title: isEn ? 'Official Veterinary Supervision' : 'Supervision Vétérinaire Rigoureuse',
      desc: isEn
        ? 'Mandatory multi-point health check, European pet passport, ISO microchip implantation, and comprehensive core vaccinations prior to departure.'
        : 'Examen de santé complet, délivrance du passeport européen, puce électronique ISO 11784/11785 et primovaccinations conformes aux protocoles WSAVA.',
    },
    {
      icon: Home,
      title: isEn ? 'Family-Raised & Socialized' : 'Élevage Familial & Sociabilisation',
      desc: isEn
        ? 'Puppies and kittens grow up in home environments with human interaction, sensory enrichment, and daily care — never industrial breeding facilities.'
        : 'Nos chiots et chatons grandissent au sein de foyers attentifs, au contact d\'enfants et d\'autres animaux, garantissant un tempérament équilibré.',
    },
    {
      icon: ShieldCheck,
      title: isEn ? 'Minimum Legal Age Compliance' : 'Respect de l\'Âge Légal de Sevrage',
      desc: isEn
        ? 'No animal leaves their mother before reaching the statutory age of at least 8 to 10 weeks, ensuring biological and psychological weaning.'
        : 'Aucun animal ne quitte sa fratrie avant l\'âge légal minimal de 8 à 10 semaines, assurant un sevrage alimentaire et affectif complet.',
    },
  ];

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#183C32]/10 text-[#183C32] text-xs font-bold uppercase tracking-wider mb-3">
            <HeartHandshake className="w-4 h-4 text-[#B69A65]" />
            <span>{isEn ? 'Ethical European Commitment' : 'Engagement Éthique Européen'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183C32] font-bold">
            {isEn ? 'Animal Welfare & Quality Charter' : 'Charte du Bien-Être Animal & d\'Éthique'}
          </h1>
          <p className="text-gray-600 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Pawelium was founded to put animal health, dignity, and European breeding transparency first.'
              : 'Pawelium a été fondé sur des principes stricts de respect, de bientraitance et d\'exigence sanitaire.'}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#EDE7DC] shadow-sm hover:border-[#183C32]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#183C32]/10 text-[#183C32] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#B69A65]" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#202823] mb-2">{p.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Deep commitments */}
        <div className="bg-white rounded-2xl border border-[#EDE7DC] shadow-sm p-8 sm:p-10 space-y-6">
          <h2 className="text-2xl font-serif text-[#183C32] font-bold">
            {isEn ? 'Our Zero-Tolerance Breeder Audits' : 'Nos Critères d\'Audit & de Sélection'}
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>{isEn ? 'Physical Inspection:' : 'Inspection sur site :'}</strong>{' '}
                {isEn
                  ? 'We vet breeder facilities, sanitation protocols, maternal rest cycles, and open living spaces.'
                  : 'Vérification de la propreté des installations, du respect des périodes de repos des reproductrices et de l\'espace de vie.'}
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>{isEn ? 'Genetic Health Screening:' : 'Tests génétiques & dépistages :'}</strong>{' '}
                {isEn
                  ? 'Breed-specific DNA screenings (e.g., HCM/PKD in Maine Coons, Hip/Elbow dysplasia in Golden Retrievers) are required for breeding pairs.'
                  : 'Dépistages ADN des tares héréditaires (HCM/PKD chez les chats de race, dysplasie chez les grands chiens) exigés pour les reproducteurs.'}
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>{isEn ? 'Post-Adoption Assistance:' : 'Accompagnement post-adoption :'}</strong>{' '}
                {isEn
                  ? 'Lifetime guidance and nutritional transition advice provided to every adoptive family across Europe.'
                  : 'Conseils personnalisés de transition alimentaire, éducation bienveillante et suivi d\'adaptation garantis à vie.'}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EDE7DC] flex justify-between items-center">
            <Link href="/catalogue" className="text-xs font-bold text-[#183C32] hover:underline">
              {isEn ? 'Browse Verified European Companions →' : 'Découvrir nos animaux sélectionnés →'}
            </Link>
            <Link
              href="/checkout"
              className="bg-[#183C32] hover:bg-[#122e26] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all"
            >
              {isEn ? 'Direct Checkout' : 'Passer Commande'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

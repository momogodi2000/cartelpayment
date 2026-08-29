import React from "react";
import { getServerTranslation } from "@/lib/serverTranslations";
import { getWhatsAppLink } from "@/data/site";
import {
  ShieldCheck,
  Heart,
  FileText,
  MessageCircle,
  Award,
  MapPin,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À Propos | PawElite — Théodore de Parin",
  description:
    "Découvrez l'histoire de PawElite, fondée par Théodore de Parin, 6 ans d'expérience dans la sélection canine européenne. Basé à Paris.",
};

export const revalidate = 86400;

export default async function AboutPage() {
  const { locale } = await getServerTranslation();
  const whatsappUrl = getWhatsAppLink(
    locale === "en"
      ? "Hello! I would like to learn more about Théodore de Parin and PawElite."
      : "Bonjour ! Je souhaite en savoir plus sur Théodore de Parin et PawElite."
  );

  const values = [
    {
      icon: ShieldCheck,
      titleFr: "Sélection Rigoureuse",
      titleEn: "Rigorous Selection",
      descFr:
        "Chaque chien présenté est sélectionné selon des critères stricts de santé, de tempérament et de lignée FCI/LOF.",
      descEn:
        "Every dog presented is selected according to strict FCI/LOF health, temperament and lineage criteria.",
    },
    {
      icon: Heart,
      titleFr: "Bien-être Animal",
      titleEn: "Animal Welfare",
      descFr:
        "Nos partenaires éleveurs respectent les standards européens de bien-être animal et les directives WSAVA.",
      descEn:
        "Our partner breeders comply with European animal welfare standards and WSAVA guidelines.",
    },
    {
      icon: FileText,
      titleFr: "Transparence Totale",
      titleEn: "Full Transparency",
      descFr:
        "Toutes les informations — santé, pedigree, vaccination, lignée — sont présentées clairement et sans ambiguïté.",
      descEn:
        "All information — health, pedigree, vaccination, lineage — is presented clearly and unambiguously.",
    },
    {
      icon: MessageCircle,
      titleFr: "Accompagnement Personnalisé",
      titleEn: "Personalised Support",
      descFr:
        "Contact direct par WhatsApp pour répondre à toutes vos questions, avant et après l'acquisition.",
      descEn:
        "Direct WhatsApp contact to answer all your questions, before and after the acquisition.",
    },
  ];

  const timeline = [
    {
      year: "2018",
      labelFr: "Création de PawElite",
      labelEn: "PawElite Founded",
      descFr: "Lancement de l'activité de sélection canine à Paris, avec une première sélection de Golden Retrievers et Bergers Allemands.",
      descEn: "Launch of canine selection activity in Paris, with an initial selection of Golden Retrievers and German Shepherds.",
    },
    {
      year: "2020",
      labelFr: "Réseau Européen",
      labelEn: "European Network",
      descFr: "Extension du réseau à des éleveurs partenaires en Belgique, Allemagne et Pays-Bas. Première collaboration avec des éleveurs certifiés FCI.",
      descEn: "Network extension to partner breeders in Belgium, Germany and the Netherlands. First collaboration with FCI-certified breeders.",
    },
    {
      year: "2022",
      labelFr: "Certification & Expertise",
      labelEn: "Certification & Expertise",
      descFr: "Approfondissement de l'expertise en santé canine et protocoles vaccinaux WSAVA. Partenariats renforcés avec des vétérinaires européens.",
      descEn: "Deepening expertise in canine health and WSAVA vaccination protocols. Strengthened partnerships with European veterinarians.",
    },
    {
      year: "2024",
      labelFr: "Plateforme Digitale",
      labelEn: "Digital Platform",
      descFr: "Lancement de PawElite.eu, vitrine digitale premium pour présenter les meilleurs chiots de race de notre réseau européen.",
      descEn: "Launch of PawElite.eu, a premium digital showcase to present the finest purebred puppies from our European network.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-widest">
          <Award className="h-4 w-4" />
          {locale === "fr" ? "Notre Histoire" : "Our Story"}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {locale === "fr"
            ? "Passion Canine & Excellence Européenne"
            : "Canine Passion & European Excellence"}
        </h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed">
          {locale === "fr"
            ? "PawElite est née de la passion de Théodore de Parin pour les chiens de race. Fort de 6 ans d'expérience, il met en relation des familles avec les meilleurs éleveurs certifiés d'Europe."
            : "PawElite was born from Théodore de Parin's passion for purebred dogs. With 6 years of experience, he connects families with the finest certified breeders in Europe."}
        </p>
        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
      </div>

      {/* Founder Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Star className="h-3.5 w-3.5" />
            {locale === "fr" ? "Fondateur & Expert Canin" : "Founder & Canine Expert"}
          </div>
          <h2 className="text-3xl font-black font-heading text-text-premium">
            Théodore de Parin
          </h2>
          <div className="space-y-3 text-sm text-text-premium/70 leading-relaxed">
            <p>
              {locale === "fr"
                ? "Passionné de caniculture depuis l'enfance, Théodore a fondé PawElite en 2018 avec un objectif simple : aider les familles à trouver leur compagnon idéal auprès d'éleveurs sérieux et certifiés."
                : "Passionate about canine breeding since childhood, Théodore founded PawElite in 2018 with a simple goal: helping families find their ideal companion with serious, certified breeders."}
            </p>
            <p>
              {locale === "fr"
                ? "Son réseau couvre aujourd'hui cinq pays européens (France, Belgique, Allemagne, Pays-Bas, Espagne) et intègre exclusivement des élevages affiliés à la FCI ou à ses registres nationaux membres (LOF, VDH, LOSH...)."
                : "His network now covers five European countries (France, Belgium, Germany, the Netherlands, Spain) and exclusively includes breeding facilities affiliated with the FCI or its national member registries (LOF, VDH, LOSH...)."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-extrabold text-text-premium text-sm">6 ans</span>
              </div>
              <p className="text-xs text-text-premium/60">{locale === "fr" ? "D'expérience dans la sélection canine" : "Experience in canine selection"}</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-premium border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-extrabold text-text-premium text-sm">Paris</span>
              </div>
              <p className="text-xs text-text-premium/60">77 Bd Saint-Jacques, 75014</p>
            </div>
          </div>
        </div>

        <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-primary/5 border border-primary/10">
          <Image
            src="/logo.jpg"
            alt="PawElite — Théodore de Parin"
            fill
            className="object-contain p-12"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium">
            {locale === "fr" ? "Notre Parcours" : "Our Journey"}
          </h2>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
        </div>
        <div className="space-y-6 relative before:absolute before:left-[2.25rem] before:top-0 before:h-full before:w-0.5 before:bg-primary/20">
          {timeline.map(({ year, labelFr, labelEn, descFr, descEn }) => (
            <div key={year} className="flex gap-6 items-start pl-2">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
                <span className="text-xs font-extrabold text-primary">{year}</span>
              </div>
              <div className="pt-3 space-y-1">
                <h3 className="font-extrabold text-text-premium">{locale === "fr" ? labelFr : labelEn}</h3>
                <p className="text-sm text-text-premium/60 leading-relaxed">{locale === "fr" ? descFr : descEn}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-text-premium">
            {locale === "fr" ? "Nos Valeurs" : "Our Values"}
          </h2>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map(({ icon: Icon, titleFr, titleEn, descFr, descEn }) => (
            <div
              key={titleFr}
              className="p-7 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 space-y-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-extrabold text-text-premium">
                {locale === "en" ? titleEn : titleFr}
              </h3>
              <p className="text-sm text-text-premium/60 leading-relaxed">
                {locale === "en" ? descEn : descFr}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6 p-10 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/10">
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-text-premium">
          {locale === "fr" ? "Parlons de Votre Projet" : "Let's Talk About Your Project"}
        </h2>
        <p className="text-text-premium/60 text-sm leading-relaxed max-w-lg mx-auto">
          {locale === "fr"
            ? "Contactez Théodore directement par WhatsApp. Il vous accompagnera dans votre recherche du compagnon idéal."
            : "Contact Théodore directly via WhatsApp. He will guide you in finding your ideal companion."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" />
            {locale === "fr" ? "Contacter Théodore" : "Contact Théodore"}
          </a>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-primary text-primary font-extrabold text-sm transition-all hover:bg-primary hover:text-white hover:scale-[1.02]"
          >
            {locale === "fr" ? "Voir le Catalogue" : "View Catalogue"}
          </Link>
        </div>
      </div>
    </div>
  );
}

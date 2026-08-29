import React from "react";
import { ShieldCheck, Heart, FileText, MessageCircle, Award, MapPin } from "lucide-react";
import { getServerTranslation } from "@/lib/serverTranslations";
import { getWhatsAppLink } from "@/data/site";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 86400;

export async function generateMetadata() {
  return {
    title: "Notre Histoire | PawElite — Sélection Canine Européenne",
    description:
      "Découvrez l'histoire de PawElite, notre engagement pour la sélection canine responsable et le bien-être animal en Europe.",
  };
}

export default async function AboutPage() {
  const { locale } = await getServerTranslation();
  const whatsappUrl = getWhatsAppLink(
    locale === "en"
      ? "Hello! I would like to learn more about PawElite and your dog selection process."
      : "Bonjour ! Je souhaite en savoir plus sur PawElite et votre processus de sélection canine."
  );

  const values = [
    { icon: ShieldCheck, titleFr: "Sélection Rigoureuse", titleEn: "Rigorous Selection", descFr: "Chaque chien que nous présentons est sélectionné selon des critères stricts de santé, de tempérament et de lignée.", descEn: "Every dog we present is selected according to strict criteria of health, temperament and lineage." },
    { icon: Heart, titleFr: "Bien-être Animal", titleEn: "Animal Welfare", descFr: "Nos partenaires éleveurs s'engagent à respecter les standards européens de bien-être animal.", descEn: "Our partner breeders commit to European animal welfare standards." },
    { icon: FileText, titleFr: "Transparence Totale", titleEn: "Full Transparency", descFr: "Nous présentons clairement toutes les informations disponibles : santé, pedigree, historique.", descEn: "We clearly present all available information: health, pedigree, history." },
    { icon: MessageCircle, titleFr: "Accompagnement WhatsApp", titleEn: "WhatsApp Support", descFr: "Un contact direct et réactif par WhatsApp pour répondre à toutes vos questions, même après l'acquisition.", descEn: "Direct, responsive WhatsApp contact to answer all your questions, even after acquisition." },
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
          {locale === "fr" ? "Passion Canine & Excellence Européenne" : "Canine Passion & European Excellence"}
        </h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed">
          {locale === "fr"
            ? "PawElite est née d'une passion profonde pour les chiens de race et d'un engagement ferme pour l'éthique canine. Nous mettons en relation des familles avec des éleveurs responsables à travers l'Europe."
            : "PawElite was born from a deep passion for purebred dogs and a firm commitment to canine ethics. We connect families with responsible breeders across Europe."}
        </p>
        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
      </div>

      {/* Mission Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-black font-heading text-text-premium">
            {locale === "fr" ? "Notre Mission" : "Our Mission"}
          </h2>
          <p className="text-text-premium/70 leading-relaxed">
            {locale === "fr"
              ? "Nous croyons que chaque famille mérite de trouver le compagnon idéal dans les meilleures conditions de confiance et de transparence. Notre rôle est de présenter des chiens et chiots de race avec toutes les informations nécessaires pour prendre une décision éclairée."
              : "We believe every family deserves to find their ideal companion with full trust and transparency. Our role is to present purebred dogs and puppies with all the information needed to make an informed decision."}
          </p>
          <p className="text-text-premium/70 leading-relaxed">
            {locale === "fr"
              ? "Nous ne présentons jamais de données inexactes. Si une information n'est pas disponible, nous le disons clairement. La confiance de nos clients est notre bien le plus précieux."
              : "We never present inaccurate data. If information is not available, we say so clearly. Our clients' trust is our most precious asset."}
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            {locale === "fr" ? "Découvrir Nos Chiens" : "Discover Our Dogs"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden bg-primary/5 border border-primary/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <Heart className="h-16 w-16 text-primary/30 mx-auto" />
              <p className="text-text-premium/50 text-sm font-medium">
                {locale === "fr" ? "Photo à venir — Images réelles de l'équipe" : "Photo coming soon — Real team images"}
              </p>
            </div>
          </div>
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
            <div key={titleFr} className="p-7 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-black/10 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-extrabold text-text-premium">{locale === "en" ? titleEn : titleFr}</h3>
              <p className="text-sm text-text-premium/60 leading-relaxed">{locale === "en" ? descEn : descFr}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6 p-10 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/10">
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-text-premium">
          {locale === "fr" ? "Des Questions ? Parlons-en." : "Questions? Let's Talk."}
        </h2>
        <p className="text-text-premium/60 text-sm leading-relaxed max-w-lg mx-auto">
          {locale === "fr"
            ? "Notre équipe est disponible via WhatsApp pour répondre à toutes vos questions sur nos chiens, notre processus et nos partenaires éleveurs."
            : "Our team is available via WhatsApp to answer all your questions about our dogs, our process and our breeder partners."}
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

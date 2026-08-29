import React from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { getServerTranslation } from "@/lib/serverTranslations";
import { getWhatsAppLink } from "@/data/site";
import { faqs } from "@/data/faq";

export const revalidate = 86400;

export async function generateMetadata() {
  return {
    title: "FAQ — Questions Fréquentes | CaniPrestige",
    description:
      "Toutes les réponses à vos questions sur nos chiens de race, notre processus d'acquisition et nos partenaires éleveurs européens.",
  };
}

export default async function FaqPage() {
  const { locale } = await getServerTranslation();
  const whatsappUrl = getWhatsAppLink(
    locale === "en"
      ? "Hello! I have a question about CaniPrestige dogs."
      : "Bonjour ! J'ai une question concernant les chiens de CaniPrestige."
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": locale === "en" ? faq.questionEn : faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": locale === "en" ? faq.answerEn : faq.answer,
              },
            })),
          }),
        }}
      />

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {locale === "fr" ? "Questions Fréquentes" : "Frequently Asked Questions"}
        </h1>
        <p className="text-text-premium/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {locale === "fr"
            ? "Retrouvez les réponses aux questions les plus courantes sur nos chiens de race et notre processus."
            : "Find answers to the most common questions about our purebred dogs and our process."}
        </p>
        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={faq.id}
            className="group p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-black/10 hover:shadow-sm transition-all duration-300 cursor-pointer open:border-primary/20 open:shadow-sm"
          >
            <summary className="flex items-start gap-3 list-none font-extrabold text-sm sm:text-base text-text-premium group-open:text-primary transition-colors cursor-pointer">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="flex-grow">{locale === "en" ? faq.questionEn : faq.question}</span>
              <span className="text-primary/60 ml-auto shrink-0 text-sm font-bold">+</span>
            </summary>
            <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed pl-8 mt-3">
              {locale === "en" ? faq.answerEn : faq.answer}
            </p>
          </details>
        ))}
      </div>

      {/* Still have questions CTA */}
      <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/10 space-y-5">
        <h2 className="text-2xl font-black font-heading text-text-premium">
          {locale === "fr" ? "Votre question n'est pas listée ?" : "Your question not listed?"}
        </h2>
        <p className="text-text-premium/60 text-sm">
          {locale === "fr"
            ? "Contactez-nous directement via WhatsApp. Nous répondons dans les 2 heures."
            : "Contact us directly via WhatsApp. We respond within 2 hours."}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
        >
          <MessageCircle className="h-4 w-4" />
          {locale === "fr" ? "Poser ma Question sur WhatsApp" : "Ask via WhatsApp"}
        </a>
      </div>
    </div>
  );
}

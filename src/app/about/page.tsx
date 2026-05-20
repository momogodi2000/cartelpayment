import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Heart, CheckCircle2, ShieldCheck, FileText, ChevronRight } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

export default function AboutPage() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const contactLink = getWhatsAppLink(phone, "Hello! I am reading your About page and would like to learn more about your breeding stock.");

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-premium tracking-tight">
          About AraHaven Aviary
        </h1>
        <p className="text-text-premium/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Dedicated to preservation, ethical breeding, and raising hand-tamed exotic birds that bring lifelong companionship and joy.
        </p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full mt-4" />
      </section>

      {/* Two-Column Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-premium tracking-tight">
            Our Mission & Legal Commitment
          </h2>
          <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
            At AraHaven, we operate one of Latin America&apos;s leading closed-loop captive-breeding sanctuaries. We are dedicated to reducing illegal wild-catching by offering birds raised in home environments with meticulous care.
          </p>
          <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
            Every parrot hatched in our nursery receives a solid status validation: closed-band identification, dynamic microchips, and extensive DNA disease testing before arriving to their families.
          </p>

          <div className="space-y-3">
            {[
              "CITES Appendix I & II Captive-Bred Compliance",
              "Registered under Ministry of Environmental Affairs (Latin America)",
              "Strict Closed-Banded identification protocols",
              "Comprehensive quarantine and veterinary audit routines",
            ].map((license, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-text-premium/80 font-semibold">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <span>{license}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-xl border border-black/[0.08] bg-bg-premium">
          <Image
            src="https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80"
            alt="Hand taming macaw"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Nursery Standards */}
      <section className="bg-white py-16 sm:py-20 border-y border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-xl border border-black/[0.08] bg-bg-premium">
            <Image
              src="https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&w=800&q=80"
              alt="Baby cockatoos in warm nursery"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-premium tracking-tight">
              Our Nursery & Raising Methodology
            </h2>
            <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
              Socialization begins from day one. Our incubator room maintains automated temperature controls tailored to hatching requirements. Chicks are syringe-fed with high-nutrition formulas, establishing trust in human hands.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Heart className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm text-text-premium">Social Socialization</h4>
                <p className="text-xs text-text-premium/60 leading-relaxed">
                  Introduced to household environments, vacuum sounds, children, and friendly handlers to promote confidence.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm text-text-premium">Recall Readiness</h4>
                <p className="text-xs text-text-premium/60 leading-relaxed">
                  Basic clicker training, step-up prompts, and harness orientation to set them up for companion learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vet Standards / CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="bg-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/10 space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-premium tracking-tight">
            Avian Health Guarantee & Panel Clearances
          </h2>
          <p className="text-sm sm:text-base text-text-premium/70 max-w-2xl mx-auto leading-relaxed">
            All babies are sold with negative polymerase chain reaction (PCR) tests for: Psittacine Beak and Feather Disease (PBFD), Avian Polyomavirus (APV), and Psittacosis (Chlamydia psittaci). We support and honor a 7-day veterinary checkup window.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors duration-300"
            >
              See Available Parrots <ChevronRight className="h-4 w-4" />
            </Link>
            <a
              href={contactLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-black/[0.01] text-text-premium font-bold px-6 py-3 rounded-xl border border-black/[0.08] shadow-sm transition-colors"
            >
              Ask Breeder via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

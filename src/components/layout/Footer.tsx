import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Award, CheckCircle2, ChevronRight } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

export default function Footer() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const defaultText = "Hello! I visited your website and would like to ask some questions about your breeding methods.";
  const whatsappUrl = getWhatsAppLink(phone, defaultText);

  return (
    <footer className="bg-text-premium text-white/90 pt-16 pb-8 mt-auto border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/[0.08]">
          {/* Column 1: Breeder Info & Licensing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white text-lg">
                🦜
              </span>
              <span className="font-extrabold text-lg tracking-tight text-white">
                ARA<span className="text-accent">HAVEN</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Premium certified exotic bird breeder based in Latin America. We specialize in ethically breeding, hand-taming, and raising rare macaws, cockatoos, and amazon parrots.
            </p>
            <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-3 py-2 rounded-lg border border-accent/20 w-fit">
              <Award className="h-4 w-4 shrink-0" />
              <span>CITES Certified Breeder No. LA-882-EX</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-5">
              Quick Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home Showcase" },
                { href: "/catalog", label: "Parrot Catalog" },
                { href: "/gallery", label: "Media Gallery" },
                { href: "/about", label: "Breeder Credentials" },
                { href: "/blog", label: "Care & Health Blog" },
                { href: "/contact", label: "Contact Form" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-sm text-white/70 hover:text-white flex items-center gap-1 transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Standards / Values */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-5">
              Breeding Excellence
            </h3>
            <ul className="space-y-3">
              {[
                "100% Closed-Banded & Microchipped",
                "DNA Sexing & Diagnostic Clearances",
                "Socialized Nursery Hand-Raising",
                "Lifelong Breeder Support & Guides",
                "Legal Veterinary CITES Documentation",
              ].map((value, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-5">
              Contact & Location
            </h3>
            <p className="text-sm text-white/70">
              Speak directly with our expert caretakers. We discuss shipping, care requirements, and reservations.
            </p>
            <div className="space-y-3 text-sm text-white/70">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-white transition-colors group"
              >
                <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span>WhatsApp Contact</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>San José, Costa Rica (Latin America)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>nursery@arahaven.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>
            &copy; {new Date().getFullYear()} AraHaven Aviary. All rights reserved. Captive-bred legal birds only.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/offline" className="hover:underline">
              PWA Offline Contacts
            </Link>
            <Link href="/admin/login" className="hover:underline text-white/30 hover:text-white">
              CMS Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

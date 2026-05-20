"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageSquare, ShieldAlert } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Breeder" },
  { href: "/blog", label: "Care Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const defaultText = "Hello! I visited your website and would like to ask some questions about your breeding methods and available birds.";
  const whatsappUrl = getWhatsAppLink(phone, defaultText);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-bg-premium/90 backdrop-blur-md shadow-md border-b border-black/[0.05] py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              🦜
            </span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-text-premium block group-hover:text-primary transition-colors duration-300">
                ARA<span className="text-accent">HAVEN</span>
              </span>
              <span className="text-[10px] text-primary font-bold tracking-widest uppercase block -mt-1">
                Exotic Aviary
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-semibold text-sm transition-colors duration-300 ${
                  isActive(link.href)
                    ? "text-primary font-bold"
                    : "text-text-premium/70 hover:text-primary"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-[-6px] left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* WhatsApp CTA Action */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquare className="h-4 w-4" />
              Inquire on WhatsApp
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-text-premium/70 hover:text-primary hover:bg-black/[0.02] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Glassmorphism overlay) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bg-premium/95 backdrop-blur-lg shadow-xl border-b border-black/[0.08] transition-all duration-300 animate-in fade-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-text-premium/70 hover:bg-black/[0.02] hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-black/[0.05] px-4">
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/10 transition-all"
              >
                <MessageSquare className="h-5 w-5" />
                Inquire on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

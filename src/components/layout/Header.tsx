"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, MessageSquare, Globe, Sun, Moon, Palette, ShoppingBag } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/common/CartDrawer";

export default function Header() {
  const { language, theme, toggleLanguage, toggleTheme } = useApp();
  const { t } = useTranslation(language);
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const defaultText = language === "en" 
    ? "Hello! I visited your website and would like to ask some questions about your breeding methods and available birds."
    : "Bonjour ! J'ai visité votre site web et j'aimerais poser des questions sur vos méthodes d'élevage et les oiseaux disponibles.";
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
    if (isOpen) {
      setTimeout(() => setIsOpen(false), 0);
    }
  }, [pathname, isOpen]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/about", label: t("nav.about") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center p-1.5 shadow-sm shadow-primary/5 group-hover:scale-105 transition-transform duration-300">
                <Image src="/logo.png" alt="AraHaven Logo" width={32} height={32} className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-text-premium block group-hover:text-primary transition-colors duration-300">
                  ARA<span className="text-accent">HAVEN</span>
                </span>
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase block -mt-1">
                  {language === "en" ? "Exotic Aviary" : "Élevage Exotique"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
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

            {/* Desktop Controls & CTA */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-xl hover:bg-black/[0.03] transition-all flex items-center gap-1.5 text-xs font-bold text-text-premium/80 border border-black/[0.06]"
                title={language === "en" ? "Switch to French" : "Passer en Français"}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language === "en" ? "EN" : "FR"}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-black/[0.03] transition-all flex items-center gap-1.5 text-xs font-bold text-text-premium/80 border border-black/[0.06]"
                title="Toggle Color Theme"
              >
                {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                {theme === "dark" && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                {theme === "exotic" && <Palette className="h-3.5 w-3.5 text-pink-500" />}
                <span className="capitalize text-[10px] hidden lg:inline">
                  {theme === "light" && t("theme.light")}
                  {theme === "dark" && t("theme.dark")}
                  {theme === "exotic" && t("theme.exotic")}
                </span>
              </button>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 rounded-xl hover:bg-black/[0.03] transition-all flex items-center justify-center text-text-premium/80 border border-black/[0.06] relative"
                title={t("cart.title")}
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-bg-premium shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Inquire CTA */}
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="h-4 w-4" />
                {language === "en" ? "WhatsApp Desk" : "Bureau WhatsApp"}
              </Link>
            </div>

            {/* Mobile Controls & Burger Menu */}
            <div className="flex md:hidden items-center gap-2">
              {/* Language Selector (Mobile) */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-black/[0.03] text-xs font-bold text-text-premium/80 border border-black/[0.06] flex items-center gap-1"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language === "en" ? "EN" : "FR"}</span>
              </button>

              {/* Theme Selector (Mobile) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-black/[0.03] text-text-premium/80 border border-black/[0.06]"
              >
                {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                {theme === "dark" && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                {theme === "exotic" && <Palette className="h-3.5 w-3.5 text-pink-500" />}
              </button>

              {/* Cart Toggle (Mobile) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-lg hover:bg-black/[0.03] text-text-premium/80 border border-black/[0.06] relative"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-bg-premium shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Menu Toggle */}
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

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-bg-premium/95 backdrop-blur-lg shadow-xl border-b border-black/[0.08] transition-all duration-300 animate-in fade-in slide-in-from-top-5">
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map((link) => (
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
                  {language === "en" ? "Consult WhatsApp" : "Consulter via WhatsApp"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

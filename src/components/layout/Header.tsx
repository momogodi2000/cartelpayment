"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  MessageSquare,
  Sun,
  Moon,
  Palette,
  ChevronDown,
  Info,
  HelpCircle,
  Phone,
  Handshake,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { getWhatsAppLink } from "@/data/site";
import { useApp } from "@/context/AppContext";
import LocaleSwitcher from "@/components/common/LocaleSwitcher";

export default function Header() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Common");
  const tTheme = useTranslations("Theme");
  const { theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const discoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const whatsappUrl = getWhatsAppLink(tc("whatsappGeneralMessage"));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setIsDiscoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/animals", label: t("catalog") },
    { href: "/track-order", label: "Track Order" },
    { href: "/support", label: "Support" },
    { href: "/a-propos", label: t("about") },
    { href: "/devenir-partenaire", label: t("partner") },
    { href: "/faq", label: t("faq") },
    { href: "/contact", label: t("contact") },
  ] as const;

  const discoverLinks = [
    { href: "/a-propos", icon: Info, label: t("about"), desc: t("aboutDesc") },
    { href: "/sante-vaccination", icon: HelpCircle, label: t("healthLabel"), desc: t("healthDesc") },
    { href: "/livraison-transport", icon: Phone, label: t("deliveryLabel"), desc: t("deliveryDesc") },
    { href: "/devenir-partenaire", icon: Handshake, label: t("partnerLabel"), desc: t("partnerDesc") },
    { href: "/faq", icon: HelpCircle, label: t("faq"), desc: t("faqDesc") },
    { href: "/contact", icon: Phone, label: t("contact"), desc: t("contactDesc") },
  ] as const;

  const themeIcon =
    theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : <Palette className="h-4 w-4" />;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-black/90 backdrop-blur-xl shadow-sm border-b border-black/[0.04] dark:border-white/[0.04]"
          : "bg-bg-premium/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <Image src="/logo.jpg" alt="pawelium Logo" fill sizes="40px" className="object-cover" priority />
            </div>
            <div>
              <span className="text-lg font-black font-heading text-text-premium group-hover:text-primary transition-colors">
                pawelium
              </span>
              <p className="text-[9px] font-semibold text-text-premium/50 uppercase tracking-widest leading-none">
                {t("brandSubtitle")}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/"
                  ? "text-primary bg-primary/8"
                  : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              }`}
            >
              {t("home")}
            </Link>

            <Link
              href="/animals"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith("/animals") || pathname.startsWith("/animaux")
                  ? "text-primary bg-primary/8"
                  : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              }`}
            >
              {t("catalog")}
            </Link>

            <Link
              href="/track-order"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith("/track-order")
                  ? "text-primary bg-primary/8"
                  : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              }`}
            >
              Track Order
            </Link>

            <Link
              href="/support"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith("/support")
                  ? "text-primary bg-primary/8"
                  : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              }`}
            >
              Support
            </Link>

            <Link
              href="/devenir-partenaire"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith("/devenir-partenaire")
                  ? "text-primary bg-primary/8"
                  : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              }`}
            >
              {t("partner")}
            </Link>

            {/* Discover Dropdown */}
            <div ref={discoverRef} className="relative">
              <button
                onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-text-premium/70 hover:text-text-premium hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
              >
                {t("discover")}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDiscoverOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isDiscoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-black/90 rounded-2xl shadow-xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden"
                  >
                    {discoverLinks.map(({ href, icon: Icon, label, desc }) => (
                      <Link key={href} href={href} className="flex items-start gap-3 p-4 hover:bg-primary/5 transition-colors">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-premium">{label}</p>
                          <p className="text-xs text-text-premium/60">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </a>

            {mounted && <LocaleSwitcher />}

            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-text-premium/70 transition-colors"
                title={tTheme(theme)}
                aria-label={tTheme(theme)}
              >
                {themeIcon}
              </button>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] text-text-premium/70 hover:text-text-premium transition-colors"
              aria-label={isOpen ? t("closeMenu") : t("openMenu")}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-black/[0.04] dark:border-white/[0.04] bg-white/98 dark:bg-black/95 backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === href
                      ? "text-primary bg-primary/8"
                      : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.03]"
                  }`}
                >
                  {label}
                </Link>
              ))}

              <div className="pt-3 flex items-center gap-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                {mounted && (
                  <>
                    <LocaleSwitcher
                      variant="full"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/[0.06] text-xs font-bold text-text-premium/70 hover:bg-black/[0.03] transition-colors"
                    />
                    <button
                      onClick={toggleTheme}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/[0.06] text-xs font-bold text-text-premium/70 hover:bg-black/[0.03] transition-colors"
                    >
                      {themeIcon}
                      {tTheme(theme)}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

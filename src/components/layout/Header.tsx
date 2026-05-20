"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  MessageSquare,
  Globe,
  Sun,
  Moon,
  Palette,
  ShoppingBag,
  ChevronDown,
  Image as ImageIcon,
  Info,
  BookOpen,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/common/CartDrawer";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export default function Header() {
  const { language, theme, toggleLanguage, toggleTheme } = useApp();
  const { t } = useTranslation(language);
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const discoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const defaultText = t("home.whatsappMessage");
  const whatsappUrl = getWhatsAppLink(phone, defaultText);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdminLoggedIn(getCookie("auth_logged_in") === "true");
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change (setTimeout keeps setState out of the effect body)
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // Close discover dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setIsDiscoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isDiscoverActive =
    isActive("/gallery") || isActive("/about") || isActive("/blog");

  // Dropdown sub-items for "Discover"
  const discoverLinks = [
    {
      href: "/gallery",
      label: t("nav.gallery"),
      icon: ImageIcon,
      desc: t("nav.discoverGalleryDesc"),
    },
    {
      href: "/about",
      label: t("nav.about"),
      icon: Info,
      desc: t("nav.discoverAboutDesc"),
    },
    {
      href: "/blog",
      label: t("nav.blog"),
      icon: BookOpen,
      desc: t("nav.discoverBlogDesc"),
    },
  ];

  // Primary standalone nav links
  const primaryLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled || isOpen
            ? "bg-bg-premium/92 backdrop-blur-lg shadow-md border-b border-black/[0.06] dark:border-white/[0.06] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="h-10 w-10 rounded-xl bg-white border border-black/[0.07] flex items-center justify-center p-1.5 shadow-sm shadow-primary/5 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="AraHaven Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="block">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-text-premium block group-hover:text-primary transition-colors duration-300">
                  ARA<span className="text-accent">HAVEN</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-primary font-bold tracking-widest uppercase block -mt-1 hidden sm:block">
                  {t("nav.brandSubtitle")}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Standalone primary links */}
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-primary font-bold bg-primary/5"
                      : "text-text-premium/70 hover:text-primary hover:bg-black/[0.03]"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-4 bg-primary rounded-full" />
                  )}
                </Link>
              ))}

              {/* Discover Dropdown */}
              <div className="relative" ref={discoverRef}>
                <button
                  onClick={() => setIsDiscoverOpen((p) => !p)}
                  onMouseEnter={() => setIsDiscoverOpen(true)}
                  aria-haspopup="true"
                  aria-expanded={isDiscoverOpen}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isDiscoverActive
                      ? "text-primary font-bold bg-primary/5"
                      : "text-text-premium/70 hover:text-primary hover:bg-black/[0.03]"
                  }`}
                >
                  {t("nav.discover")}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isDiscoverOpen ? "rotate-180" : ""
                    }`}
                  />
                  {isDiscoverActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-4 bg-primary rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {isDiscoverOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      onMouseLeave={() => setIsDiscoverOpen(false)}
                      className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-black/[0.07] bg-bg-premium shadow-xl shadow-black/[0.08] overflow-hidden z-50 [data-theme=dark]:border-white/[0.08]"
                      style={{ backgroundColor: "hsl(var(--bg-premium))" }}
                    >
                      <div className="p-2">
                        {discoverLinks.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsDiscoverOpen(false)}
                              className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 group/item ${
                                isActive(item.href)
                                  ? "bg-primary/8 text-primary"
                                  : "hover:bg-black/[0.03] text-text-premium"
                              }`}
                            >
                              <div
                                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  isActive(item.href)
                                    ? "bg-primary/15 text-primary"
                                    : "bg-black/[0.04] text-text-premium/60 group-hover/item:bg-primary/10 group-hover/item:text-primary"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p
                                  className={`font-bold text-sm ${
                                    isActive(item.href) ? "text-primary" : "text-text-premium"
                                  }`}
                                >
                                  {item.label}
                                </p>
                                <p className="text-[11px] text-text-premium/55 leading-tight mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Desktop Right Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-xl hover:bg-black/[0.04] transition-all flex items-center gap-1.5 text-xs font-bold text-text-premium/80 border border-black/[0.07]"
                title={language === "en" ? "Switch to French" : "Passer en francais"}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language === "en" ? "EN" : "FR"}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-black/[0.04] transition-all flex items-center gap-1.5 text-xs font-bold text-text-premium/80 border border-black/[0.07]"
                title="Toggle Color Theme"
              >
                {mounted ? (
                  <>
                    {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                    {theme === "dark" && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                    {theme === "exotic" && <Palette className="h-3.5 w-3.5 text-pink-500" />}
                    <span className="capitalize text-[10px] hidden lg:inline">
                      {theme === "light" && t("theme.light")}
                      {theme === "dark" && t("theme.dark")}
                      {theme === "exotic" && t("theme.exotic")}
                    </span>
                  </>
                ) : (
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                )}
              </button>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 rounded-xl hover:bg-black/[0.04] transition-all flex items-center justify-center text-text-premium/80 border border-black/[0.07] relative"
                title={t("cart.title") as string}
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-bg-premium shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Login / Dashboard Link */}
              <Link
                href={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/[0.08] hover:bg-black/[0.03] text-text-premium font-extrabold text-xs transition-all tracking-tight"
              >
                {isAdminLoggedIn ? (
                  <>
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    {t("nav.adminDashboard")}
                  </>
                ) : (
                  <>
                    <LogIn className="h-3.5 w-3.5" />
                    {t("nav.login")}
                  </>
                )}
              </Link>

              {/* WhatsApp CTA */}
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden lg:inline">
                  {t("nav.whatsappDesk")}
                </span>
                <span className="lg:hidden">WhatsApp</span>
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
              {/* Cart (Mobile) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-lg hover:bg-black/[0.04] text-text-premium/80 border border-black/[0.07] relative"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-bg-premium shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Burger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-text-premium/70 hover:text-primary hover:bg-black/[0.03] transition-colors focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
              style={{ backgroundColor: "hsl(var(--bg-premium))" }}
            >
              <div className="border-t border-black/[0.06] px-4 pt-3 pb-6 space-y-1">
                {/* Preferences Section (Mobile) */}
                <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-black/[0.06] dark:border-white/[0.06] mb-3">
                  <span className="text-[10px] font-bold text-text-premium/50 uppercase tracking-wider">
                    {language === "en" ? "Preferences" : "Préférences"}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Language Toggle (Mobile) */}
                    <button
                      onClick={toggleLanguage}
                      className="p-2 rounded-xl hover:bg-black/[0.04] transition-all flex items-center gap-1.5 text-xs font-bold text-text-premium/80 border border-black/[0.07] dark:border-white/[0.07]"
                      title={language === "en" ? "Switch to French" : "Passer en français"}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>{language === "en" ? "EN" : "FR"}</span>
                    </button>

                    {/* Theme Toggle (Mobile) */}
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-xl hover:bg-black/[0.04] transition-all flex items-center gap-1.5 text-xs font-bold text-text-premium/80 border border-black/[0.07] dark:border-white/[0.07]"
                      title="Toggle Color Theme"
                    >
                      {mounted ? (
                        <>
                          {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                          {theme === "dark" && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                          {theme === "exotic" && <Palette className="h-3.5 w-3.5 text-pink-500" />}
                          <span className="capitalize text-[10px]">
                            {theme === "light" && t("theme.light")}
                            {theme === "dark" && t("theme.dark")}
                            {theme === "exotic" && t("theme.exotic")}
                          </span>
                        </>
                      ) : (
                        <div className="h-3.5 w-3.5 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary links */}
                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-text-premium/70 hover:bg-black/[0.03] hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Discover section with inline sub-links */}
                <div className="pt-1">
                  <p className="text-[10px] uppercase tracking-widest font-extrabold text-text-premium/40 px-4 py-2">
                    {t("nav.discover")}
                  </p>
                  {discoverLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                          isActive(item.href)
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-text-premium/70 hover:bg-black/[0.03] hover:text-primary"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Divider + Auth/WhatsApp */}
                <div className="pt-3 border-t border-black/[0.06] space-y-2">
                  <Link
                    href={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-black/[0.08] text-text-premium font-extrabold text-sm transition-all"
                  >
                    {isAdminLoggedIn ? (
                      <>
                        <LayoutDashboard className="h-4 w-4" />
                        {t("nav.adminDashboard")}
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        {t("nav.login")}
                      </>
                    )}
                  </Link>
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/10 transition-all"
                  >
                    <MessageSquare className="h-5 w-5" />
                    {t("nav.whatsappConsultation")}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

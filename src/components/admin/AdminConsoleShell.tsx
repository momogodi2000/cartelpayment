"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  PawPrint,
  Boxes,
  BookOpen,
  Building2,
  Clock,
  ShoppingBag,
  CreditCard,
  PlayCircle,
  RotateCcw,
  Truck,
  Users,
  Star,
  Headphones,
  FileText,
  Languages,
  Globe,
  Mail,
  BarChart3,
  ShieldCheck,
  Settings,
  UserCheck,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { actionAdminLogout } from "@/app/actions/admin";
import { setAdminLocaleCookie } from "@/lib/client/admin-locale";

type Category = "operations" | "commerce" | "relations" | "platform" | "security";

const NAV: Array<{ key: string; href: string; icon: React.ComponentType<{ className?: string }>; category: Category }> = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, category: "operations" },
  { key: "animals", href: "/admin/animals", icon: PawPrint, category: "operations" },
  { key: "inventory", href: "/admin/inventory", icon: Boxes, category: "operations" },
  { key: "breeds", href: "/admin/breeds", icon: BookOpen, category: "operations" },
  { key: "breeders", href: "/admin/breeders", icon: Building2, category: "operations" },
  { key: "reservations", href: "/admin/reservations", icon: Clock, category: "operations" },
  { key: "orders", href: "/admin/orders", icon: ShoppingBag, category: "commerce" },
  { key: "payments", href: "/admin/payments", icon: CreditCard, category: "commerce" },
  { key: "testPayment", href: "/admin/test-payment", icon: PlayCircle, category: "commerce" },
  { key: "refunds", href: "/admin/refunds", icon: RotateCcw, category: "commerce" },
  { key: "deliveries", href: "/admin/deliveries", icon: Truck, category: "commerce" },
  { key: "customers", href: "/admin/customers", icon: Users, category: "relations" },
  { key: "reviews", href: "/admin/reviews", icon: Star, category: "relations" },
  { key: "support", href: "/admin/support", icon: Headphones, category: "relations" },
  { key: "content", href: "/admin/content", icon: FileText, category: "platform" },
  { key: "translations", href: "/admin/translations", icon: Languages, category: "platform" },
  { key: "seo", href: "/admin/seo", icon: Globe, category: "platform" },
  { key: "newsletter", href: "/admin/newsletter", icon: Mail, category: "platform" },
  { key: "analytics", href: "/admin/analytics", icon: BarChart3, category: "platform" },
  { key: "audit", href: "/admin/audit", icon: ShieldCheck, category: "security" },
  { key: "settings", href: "/admin/settings", icon: Settings, category: "security" },
  { key: "account", href: "/admin/account", icon: UserCheck, category: "security" },
];

const CATEGORIES: Category[] = ["operations", "commerce", "relations", "platform", "security"];

export default function AdminConsoleShell({
  admin,
  children,
}: {
  admin: { id: string; name: string; email: string };
  children: React.ReactNode;
}) {
  const t = useTranslations("AdminShell");
  const locale = useLocale();
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // Theme is only known on the client (set pre-paint by the root layout script).
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const switchLocale = () => {
    const next = locale === "fr" ? "en" : "fr";
    setAdminLocaleCookie(next);
    router.refresh();
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("pawelium_theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const utilityButtons = (
    <>
      <button
        type="button"
        onClick={switchLocale}
        lang={locale === "fr" ? "en" : "fr"}
        aria-label={locale === "fr" ? t("switchToEnglish") : t("switchToFrench")}
        className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-bold text-[#E9D9B5] hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B69A65]"
      >
        {locale === "fr" ? "EN" : "FR"}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? t("themeLight") : t("themeDark")}
        className="rounded-lg bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B69A65]"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      </button>
    </>
  );

  return (
    <div className="min-h-screen lg:flex bg-[#F4F2EC] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold">
        {t("skipToContent")}
      </a>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-[#183C32] px-4 py-3 text-white">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Pawelium" width={32} height={32} className="rounded-lg bg-white/95 p-0.5" />
          <span className="font-serif text-lg font-bold">Pawelium</span>
        </Link>
        <div className="flex items-center gap-2">
          {utilityButtons}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-sidebar"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#183C32] text-white transition-transform duration-200 motion-reduce:transition-none lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Pawelium" width={40} height={40} className="rounded-xl bg-white/95 p-1" />
            <span>
              <span className="block font-serif text-xl font-bold leading-tight">Pawelium</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B69A65]">{t("brandTag")}</span>
            </span>
          </Link>
          <span className="rounded bg-[#B69A65] px-2 py-0.5 text-[10px] font-bold text-[#202823]">{t("role")}</span>
        </div>

        <nav aria-label={t("mainNav")} className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">{t(`categories.${cat}`)}</p>
              <ul className="space-y-0.5">
                {NAV.filter((n) => n.category === cat).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B69A65] ${
                          active ? "bg-white/15 font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#B69A65]" : "text-white/60"}`} aria-hidden="true" />
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 bg-black/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{admin.name}</p>
              <p className="truncate text-xs text-white/60">{admin.email}</p>
            </div>
            <div className="hidden items-center gap-1.5 lg:flex">{utilityButtons}</div>
          </div>
          <form action={actionAdminLogout}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t("signOut")}
            </button>
          </form>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-hidden="true" />}

      <div className="min-w-0 flex-1">
        <main id="admin-main" className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

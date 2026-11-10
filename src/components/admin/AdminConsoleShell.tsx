"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  BookOpen,
  Building2,
  Clock,
  ShoppingBag,
  CreditCard,
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
  Shield,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import { actionAdminLogout } from "@/app/actions/admin";

interface AdminUserProps {
  id: string;
  name: string;
  email: string;
}

interface AdminConsoleShellProps {
  admin: AdminUserProps;
  locale: string;
  children: React.ReactNode;
}

interface NavItem {
  labelEn: string;
  labelFr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryEn: string;
  categoryFr: string;
}

const NAV_ITEMS: NavItem[] = [
  // Core Operations
  { labelEn: "Overview", labelFr: "Tableau de Bord", href: "/admin", icon: LayoutDashboard, categoryEn: "Operations", categoryFr: "Opérations" },
  { labelEn: "Animals & Inventory", labelFr: "Animaux & Inventaire", href: "/admin/animals", icon: PawPrint, categoryEn: "Operations", categoryFr: "Opérations" },
  { labelEn: "Breeds Registry", labelFr: "Registre des Races", href: "/admin/breeds", icon: BookOpen, categoryEn: "Operations", categoryFr: "Opérations" },
  { labelEn: "Breeders & Partners", labelFr: "Éleveurs Partenaires", href: "/admin/breeders", icon: Building2, categoryEn: "Operations", categoryFr: "Opérations" },
  { labelEn: "Reservations & Holds", labelFr: "Réservations Actives", href: "/admin/reservations", icon: Clock, categoryEn: "Operations", categoryFr: "Opérations" },

  // Commerce & Financials
  { labelEn: "Adoption Orders", labelFr: "Commandes d'Adoption", href: "/admin/orders", icon: ShoppingBag, categoryEn: "Commerce", categoryFr: "Commerce" },
  { labelEn: "Payments & Webhooks", labelFr: "Paiements & Webhooks", href: "/admin/payments", icon: CreditCard, categoryEn: "Commerce", categoryFr: "Commerce" },
  { labelEn: "Test Payment Suite", labelFr: "Test Paiement 0,90 €", href: "/admin/test-payment", icon: PlayCircle, categoryEn: "Commerce", categoryFr: "Commerce" },
  { labelEn: "Manual Refunds", labelFr: "Remboursements", href: "/admin/refunds", icon: RotateCcw, categoryEn: "Commerce", categoryFr: "Commerce" },
  { labelEn: "VIP Deliveries", labelFr: "Livraisons Sécurisées", href: "/admin/deliveries", icon: Truck, categoryEn: "Commerce", categoryFr: "Commerce" },

  // Adopters & Trust
  { labelEn: "Customers & GDPR", labelFr: "Clients & RGPD", href: "/admin/customers", icon: Users, categoryEn: "Relations", categoryFr: "Relations" },
  { labelEn: "Reviews Moderation", labelFr: "Modération des Avis", href: "/admin/reviews", icon: Star, categoryEn: "Relations", categoryFr: "Relations" },
  { labelEn: "Support Tickets", labelFr: "Tickets Support", href: "/admin/support", icon: Headphones, categoryEn: "Relations", categoryFr: "Relations" },

  // Marketing & System
  { labelEn: "Content Blocks", labelFr: "Gestion de Contenu", href: "/admin/content", icon: FileText, categoryEn: "Platform", categoryFr: "Plateforme" },
  { labelEn: "Translations Parity", labelFr: "Santé Traductions", href: "/admin/translations", icon: Languages, categoryEn: "Platform", categoryFr: "Plateforme" },
  { labelEn: "SEO & OpenGraph", labelFr: "SEO & Métadonnées", href: "/admin/seo", icon: Globe, categoryEn: "Platform", categoryFr: "Plateforme" },
  { labelEn: "Newsletter List", labelFr: "Abonnés Newsletter", href: "/admin/newsletter", icon: Mail, categoryEn: "Platform", categoryFr: "Plateforme" },
  { labelEn: "Analytics & KPIs", labelFr: "Analytique & Revenus", href: "/admin/analytics", icon: BarChart3, categoryEn: "Platform", categoryFr: "Plateforme" },
  { labelEn: "Audit Ledger", labelFr: "Journal d'Audit", href: "/admin/audit", icon: ShieldCheck, categoryEn: "Security", categoryFr: "Sécurité" },
  { labelEn: "Settings & Gateways", labelFr: "Paramètres Système", href: "/admin/settings", icon: Settings, categoryEn: "Security", categoryFr: "Sécurité" },
  { labelEn: "Account & MFA", labelFr: "Compte & Sécurité", href: "/admin/account", icon: UserCheck, categoryEn: "Security", categoryFr: "Sécurité" },
];

export default function AdminConsoleShell({
  admin,
  locale,
  children,
}: AdminConsoleShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const isFr = locale === "fr";

  // Safely sync theme after mount to avoid server/client hydration mismatch
  React.useEffect(() => {
    try {
      const activeTheme = document.documentElement.getAttribute("data-theme");
      if (activeTheme === "dark" || activeTheme === "light") {
        setCurrentTheme(activeTheme);
      }
    } catch {}
  }, []);

  // Switch locale cookie
  const switchLocale = (newLocale: "en" | "fr") => {
    document.cookie = `pw_admin_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  // Toggle dark/light theme
  const toggleTheme = () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    localStorage.setItem("pawelium_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Group nav items by category
  const categories = Array.from(
    new Set(NAV_ITEMS.map((item) => (isFr ? item.categoryFr : item.categoryEn)))
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#183C32] text-white border-b border-emerald-950 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#B69A65] text-zinc-950 flex items-center justify-center font-bold font-serif text-sm">
            P
          </div>
          <div>
            <h1 className="font-serif font-bold text-base leading-tight">Pawelium</h1>
            <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-extrabold block">
              SUPER_ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchLocale(isFr ? "en" : "fr")}
            className="px-2 py-1 text-xs font-mono font-bold rounded bg-white/10 hover:bg-white/20 text-[#B69A65]"
          >
            {isFr ? "EN" : "FR"}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#183C32] text-white flex flex-col shrink-0 border-r border-emerald-950/80 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B69A65] to-[#8C7343] text-zinc-950 flex items-center justify-center font-serif font-extrabold text-lg shadow-inner">
              P
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#B69A65] font-extrabold block">
                European Concierge
              </span>
              <h1 className="font-serif text-xl font-bold tracking-tight">
                Pawelium <span className="text-emerald-400 text-xs">2.0</span>
              </h1>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#B69A65] text-zinc-950 shadow-sm">
            SUPER_ADMIN
          </span>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900">
          {categories.map((category) => {
            const items = NAV_ITEMS.filter((item) =>
              isFr ? item.categoryFr === category : item.categoryEn === category
            );

            return (
              <div key={category} className="space-y-1">
                <h3 className="px-3 text-[10px] font-extrabold tracking-widest uppercase text-emerald-400/70 font-mono">
                  {category}
                </h3>
                <div className="space-y-0.5 mt-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-white/15 text-white font-bold shadow-sm ring-1 ring-white/10"
                            : "text-zinc-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? "text-[#B69A65]" : "text-emerald-400/80"
                            }`}
                          />
                          <span>{isFr ? item.labelFr : item.labelEn}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="h-3 w-3 text-[#B69A65]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Admin Profile & Actions */}
        <div className="p-4 border-t border-emerald-900/50 bg-black/15">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="truncate max-w-[170px]">
              <p className="text-xs font-bold text-white truncate">{admin.name}</p>
              <p className="text-[10px] text-emerald-300/80 truncate font-mono">
                {admin.email}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => switchLocale(isFr ? "en" : "fr")}
                className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-white/10 hover:bg-white/20 text-[#B69A65]"
                title="Switch Admin Language"
              >
                {isFr ? "EN" : "FR"}
              </button>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white"
                title="Toggle Theme"
              >
                {currentTheme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <form action={actionAdminLogout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/50 hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isFr ? "Déconnexion Sécurisée" : "Secure Sign Out"}</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

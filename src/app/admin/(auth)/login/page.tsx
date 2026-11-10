import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { resolveAdminLocale } from "@/i18n/locale";
import AdminLoginForm from "./AdminLoginForm";
import { Shield, ArrowLeft, Lock } from "lucide-react";

// Load translations for auth
import enAuth from "@/i18n/locales/en/admin/auth.json";
import frAuth from "@/i18n/locales/fr/admin/auth.json";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  let alreadySignedIn = false;

  try {
    await requireSuperAdmin();
    alreadySignedIn = true;
  } catch {
    alreadySignedIn = false;
  }

  // Check session outside any try/catch so redirect exception is handled by Next.js
  if (alreadySignedIn) {
    redirect("/admin");
  }

  const locale = await resolveAdminLocale();
  const t = locale === "fr" ? frAuth : enAuth;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0D1F1A]">
      {/* Editorial Left Hero Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#183C32] overflow-hidden p-12 flex-col justify-between border-r border-emerald-950/80">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#B69A65]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#B69A65_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

        {/* Brand Crest */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B69A65] to-[#8C7343] p-0.5 shadow-xl flex items-center justify-center">
            <div className="w-full h-full bg-[#183C32] rounded-[14px] flex items-center justify-center">
              <span className="font-serif font-extrabold text-[#B69A65] text-xl">P</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#B69A65] font-extrabold block">
              European Concierge
            </span>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              Pawelium
            </h1>
          </div>
        </div>

        {/* Editorial Text Block */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Shield className="h-3.5 w-3.5 text-[#B69A65]" />
            <span>{t.portalBadge}</span>
          </div>
          <h2 className="font-serif text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
            High-Integrity Pet Registry & Concierge Administration
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Strict single-admin architecture protecting pedigree verifications, international veterinary clearance protocols, and reserved European adoptions.
          </p>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-400/80 border-t border-emerald-900/60 pt-6">
          <span>Pawelium v2.0 Platform</span>
          <span className="font-mono text-[11px]">SUPER_ADMIN Authorized Only</span>
        </div>
      </div>

      {/* Form Right Panel (Ivory / Clean Card) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-7">
          {/* Mobile Brand Emblem */}
          <div className="lg:hidden text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#183C32] flex items-center justify-center shadow-md">
              <span className="font-serif font-extrabold text-[#B69A65] text-2xl">P</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183C32]/8 text-[#183C32] text-[10px] font-extrabold uppercase tracking-widest">
              <Shield className="h-3 w-3 text-[#B69A65]" />
              <span>{t.portalBadge}</span>
            </div>
          </div>

          <div className="text-left space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {t.portalTitle}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t.portalSubtitle}
            </p>
          </div>

          {/* Form */}
          <AdminLoginForm t={t} locale={locale} />

          {/* Footer Info */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-[#183C32] dark:hover:text-emerald-400 font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t.returnMarketplace}</span>
            </Link>
            <Link
              href="/admin/forgot-password"
              className="text-zinc-500 hover:text-[#183C32] dark:hover:text-emerald-400 font-semibold transition-colors"
            >
              {t.forgotPassword}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

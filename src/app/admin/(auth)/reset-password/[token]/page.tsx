import React from "react";
import Link from "next/link";
import { resolveAdminLocale } from "@/i18n/locale";
import { Lock, ArrowLeft } from "lucide-react";
import ResetPasswordForm from "./ResetPasswordForm";

import enAuth from "@/i18n/locales/en/admin/auth.json";
import frAuth from "@/i18n/locales/fr/admin/auth.json";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminResetPasswordPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await resolveAdminLocale();
  const t = locale === "fr" ? frAuth : enAuth;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#0D1F1A]">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#183C32] text-[#B69A65] flex items-center justify-center shadow-md">
          <Lock className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t.resetTitle}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t.resetSubtitle}
          </p>
        </div>

        <ResetPasswordForm
          token={token}
          newPasswordLabel={t.newPasswordLabel}
          confirmPasswordLabel={t.confirmPasswordLabel}
          savePassword={t.savePassword}
          passwordUpdated={t.passwordUpdated}
        />

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-[#183C32] dark:hover:text-emerald-400 font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useActionState, useEffect, startTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ShieldAlert, KeyRound, ArrowLeft } from "lucide-react";
import { loginAdmin } from "@/actions/auth";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

interface FormState {
  success: boolean;
  message: string;
}

const initialState: FormState = {
  success: false,
  message: "",
};

function LoginForm() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to dashboard on successful authentication
  useEffect(() => {
    if (state.success) {
      const redirectTo = searchParams.get("from") || "/admin/dashboard";
      const timer = setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.success, router, searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bg-premium to-bg-premium px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to main home */}
      <div className="mb-6 w-full max-w-md text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.back")}
        </Link>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-black/15 border border-black/[0.06] dark:border-white/[0.08] shadow-2xl rounded-3xl p-8 sm:p-10 space-y-8 glass relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-accent/10 blur-xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-white border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center p-2 mx-auto shadow-md shadow-primary/5 hover:scale-105 transition-transform duration-300">
            <Image src="/logo.png" alt="AraHaven Logo" width={48} height={48} className="h-full w-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold font-heading text-text-premium leading-none tracking-tight">
              {t("auth.title")}
            </h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
              {t("auth.subtitle")}
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {state.message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold border flex items-center gap-3 ${
              state.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800/30 dark:text-red-400"
            }`}
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
            <span>{state.message}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-text-premium/60 tracking-wider">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/45" />
              <input
                name="email"
                type="email"
                required
                placeholder="admin@arahaven.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[hsl(var(--input-border))] bg-[hsl(var(--input-bg))] text-[hsl(var(--input-text))] placeholder-[hsl(var(--input-placeholder))] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-text-premium/60 tracking-wider">
              {t("auth.password")}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/45" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[hsl(var(--input-border))] bg-[hsl(var(--input-bg))] text-[hsl(var(--input-text))] placeholder-[hsl(var(--input-placeholder))] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || state.success}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-extrabold text-sm transition-all shadow-md shadow-primary/10 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            {isPending ? t("auth.loading") : state.success ? t("auth.redirecting") : t("auth.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bg-premium to-bg-premium">
          <div className="max-w-md w-full bg-white dark:bg-black/15 rounded-3xl p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-xl text-center text-sm font-semibold text-text-premium/50 animate-pulse glass">
            Loading login portal...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

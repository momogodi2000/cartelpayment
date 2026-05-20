"use client";

import React, { useActionState, useEffect, startTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ShieldAlert, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { loginAdmin } from "@/actions/auth";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

interface FormState {
  success: boolean;
  message: string;
}

const initialState: FormState = { success: false, message: "" };

function LoginForm() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (state.success) {
      const redirectTo = searchParams.get("from") || "/admin/dashboard";
      router.replace(redirectTo);
      router.refresh();
    }
  }, [state.success, router, searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => { formAction(formData); });
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-8 py-12 md:py-20">
      <div className="mb-6 w-full max-w-md text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-text-premium/40 hover:text-primary transition-all duration-200 hover:-translate-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.back")}
        </Link>
      </div>

      <div className="max-w-md w-full bg-white/70 dark:bg-black/20 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl rounded-[2.5rem] p-8 sm:p-10 space-y-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-accent/10 blur-xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-white dark:bg-black/35 border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center p-2 mx-auto shadow-md shadow-primary/5 hover:scale-105 transition-transform duration-300">
            <Image src="/logo.png" alt="AraHaven Logo" width={48} height={48} className="h-full w-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-heading text-text-premium leading-none tracking-tight">
              {t("auth.title")}
            </h1>
            <p className="text-[9px] text-primary font-bold uppercase tracking-widest">
              {t("auth.subtitle")}
            </p>
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 dark:border-primary/20 text-xs text-text-premium/75 leading-relaxed font-semibold">
          <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span>
            This is a secured administrative portal. Session credentials are encrypted via cryptographically signed JWT. Unauthorized access attempts are monitored and logged with IP trace.
          </span>
        </div>

        {/* Feedback Alert */}
        {state.message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 ${
              state.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            }`}
          >
            {state.success
              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              : <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
            }
            <span>{state.message}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-text-premium/50 tracking-wider">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/40" />
              <input
                name="email"
                type="email"
                required
                placeholder="admin@arahaven.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-black/25 text-text-premium placeholder-text-premium/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black uppercase text-text-premium/50 tracking-wider">
                {t("auth.password")}
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-[10px] font-extrabold text-primary hover:text-primary-hover transition-colors"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/40" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-black/25 text-text-premium placeholder-text-premium/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || state.success}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-extrabold text-sm transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            {isPending ? t("auth.loading") : state.success ? t("auth.redirecting") : t("auth.submit")}
          </button>
        </form>

        {/* Feature list */}
        <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] grid grid-cols-3 gap-2 text-center">
          {["JWT Secured", "Rate Limited", "HTTPS Only"].map((item) => (
            <div key={item} className="text-[9px] font-black text-text-premium/30 uppercase tracking-widest">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-black/[0.06] shadow-xl text-center text-sm font-semibold text-text-premium/50 animate-pulse">
            Loading login portal...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

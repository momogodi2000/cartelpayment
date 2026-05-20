"use client";

import React, { useActionState, startTransition, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/actions/auth";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

interface FormState {
  success: boolean;
  message: string;
}

const initialState: FormState = { success: false, message: "" };

function ResetPasswordForm() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => router.push("/admin/login"), 2500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  if (!token) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-8 py-12 md:py-20">
        <div className="max-w-md w-full bg-white/70 dark:bg-black/20 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl rounded-[2.5rem] p-8 sm:p-10 text-center space-y-6">
          <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black font-heading text-text-premium">Invalid Link</h2>
            <p className="text-xs text-text-premium/55 leading-relaxed font-semibold">{t("auth.invalidToken")}</p>
          </div>
          <Link
            href="/admin/forgot-password"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    startTransition(() => { formAction(formData); });
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-8 py-12 md:py-20">
      <div className="mb-6 w-full max-w-md text-left">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-text-premium/40 hover:text-primary transition-all duration-200 hover:-translate-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToLogin")}
        </Link>
      </div>

      <div className="max-w-md w-full bg-white/70 dark:bg-black/20 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl rounded-[2.5rem] p-8 sm:p-10 space-y-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-accent/10 blur-xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-heading text-text-premium leading-none tracking-tight">
              {t("auth.resetPassword")}
            </h1>
            <p className="text-xs text-text-premium/55 leading-relaxed max-w-xs mx-auto font-semibold">
              {t("auth.resetPasswordDesc")}
            </p>
          </div>
        </div>

        {/* Success State */}
        {state.success ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">Password Updated</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed font-semibold">{state.message}</p>
              </div>
            </div>
            <p className="text-center text-xs text-text-premium/40 animate-pulse font-bold">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            {/* Error alert */}
            {state.message && (
              <div className="p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{state.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-text-premium/50 tracking-wider">
                  {t("auth.newPassword")}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/40" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-black/25 text-text-premium placeholder-text-premium/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-premium/40 hover:text-text-premium/70 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-text-premium/50 tracking-wider">
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/40" />
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Repeat password"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-black/25 text-text-premium placeholder-text-premium/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-premium/40 hover:text-text-premium/70 transition-colors"
                    aria-label="Toggle confirm visibility"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Requirements hint */}
              <div className="flex flex-wrap gap-2 pt-1">
                {["8+ characters", "Mixed case", "Special chars"].map((req) => (
                  <span key={req} className="text-[8px] font-black uppercase tracking-wider text-text-premium/40 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] px-2.5 py-1 rounded-lg">
                    {req}
                  </span>
                ))}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-extrabold text-sm transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                {isPending ? t("auth.savingPassword") : t("auth.savePassword")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border animate-pulse text-center text-sm text-text-premium/40">
          Loading...
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

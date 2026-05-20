"use client";

import React, { useActionState, startTransition, Suspense } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { requestPasswordReset } from "@/actions/auth";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

interface FormState {
  success: boolean;
  message: string;
}

const initialState: FormState = { success: false, message: "" };

function ForgotPasswordForm() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-heading text-text-premium leading-none tracking-tight">
              {t("auth.forgotPassword")}
            </h1>
            <p className="text-xs text-text-premium/55 leading-relaxed max-w-xs mx-auto font-semibold">
              {t("auth.forgotPasswordDesc")}
            </p>
          </div>
        </div>

        {/* Success State */}
        {state.success ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-emerald-505/10 border border-emerald-500/20 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">Email Sent</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed font-semibold">{state.message}</p>
              </div>
            </div>
            <p className="text-center text-xs text-text-premium/50 font-bold">
              Did not receive it? Check your spam folder or{" "}
              <button
                onClick={() => window.location.reload()}
                className="text-primary font-black hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {state.message && (
              <div className="p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{state.message}</span>
              </div>
            )}

            {/* Form */}
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

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-extrabold text-sm transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Send className="h-4 w-4" />
                {isPending ? t("auth.sendingReset") : t("auth.sendReset")}
              </button>
            </form>

            <div className="flex items-center gap-3 text-xs text-text-premium/30">
              <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
              <span className="font-bold uppercase text-[9px] tracking-widest">or</span>
              <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
            </div>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-sm font-extrabold text-primary hover:text-primary-hover transition-colors"
              >
                Return to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border animate-pulse text-center text-sm text-text-premium/40">
          Loading...
        </div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}

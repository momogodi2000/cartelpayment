"use client";

import React, { useActionState, useEffect, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldAlert, KeyRound } from "lucide-react";
import { loginAdmin } from "@/actions/auth";

interface FormState {
  success: boolean;
  message: string;
}

const initialState: FormState = {
  success: false,
  message: "",
};

export default function AdminLoginPage() {
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
    <div className="min-h-[80vh] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bg-premium to-bg-premium px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-black/[0.06] shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl mx-auto shadow-md shadow-primary/20">
            🔐
          </span>
          <h1 className="text-2xl font-extrabold text-text-premium tracking-tight">
            AraHaven CMS Portal
          </h1>
          <p className="text-xs text-text-premium/50 uppercase tracking-widest font-bold">
            Administrative Access
          </p>
        </div>

        {/* Feedback Alert */}
        {state.message && (
          <div
            className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              state.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase text-text-premium/60 tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/40" />
              <input
                name="email"
                type="email"
                required
                placeholder="admin@exoticbirds.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm bg-bg-premium/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase text-text-premium/60 tracking-wider">
              Secure Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/40" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm bg-bg-premium/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || state.success}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold transition-all shadow-md shadow-primary/15"
          >
            <Lock className="h-4 w-4" />
            {isPending ? "Verifying Credentials..." : state.success ? "Redirecting..." : "Login to CMS"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { actionAdminLogin } from "@/app/actions/admin";
import {
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  Globe,
} from "lucide-react";

interface AdminLoginFormProps {
  t: {
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    totpLabel: string;
    totpPlaceholder: string;
    totpDescription: string;
    submitLogin: string;
    submitting: string;
    capsLockWarning: string;
    showPassword: string;
    hidePassword: string;
    invalidCredentials: string;
    invalidTotp: string;
    accountLocked: string;
  };
  locale: string;
}

export default function AdminLoginForm({ t, locale }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [showTotp, setShowTotp] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFr = locale === "fr";

  const switchLocale = (newLocale: "en" | "fr") => {
    document.cookie = `pw_admin_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    if (totpCode) formData.append("totpCode", totpCode.trim());

    try {
      const res = await actionAdminLogin(formData);
      if (res.success) {
        window.location.href = "/admin";
      } else if (res.requiresMFA) {
        setShowTotp(true);
        setLoading(false);
      } else {
        setError(res.error || t.invalidCredentials);
        setLoading(false);
      }
    } catch {
      setError(t.invalidCredentials);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Language switcher bar */}
      <div className="flex items-center justify-end gap-1.5 text-xs text-zinc-500">
        <Globe className="h-3.5 w-3.5 text-[#B69A65]" />
        <button
          type="button"
          onClick={() => switchLocale("en")}
          className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold transition-colors ${
            !isFr
              ? "bg-[#183C32] text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          EN
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => switchLocale("fr")}
          className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold transition-colors ${
            isFr
              ? "bg-[#183C32] text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          FR
        </button>
      </div>

      {/* Error alert region */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800/40"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Caps lock warning */}
      {capsLockActive && (
        <div
          role="status"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-medium border border-amber-200 dark:border-amber-800/40"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span>{t.capsLockWarning}</span>
        </div>
      )}

      {/* Email input */}
      <div>
        <label
          htmlFor="admin-email"
          className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {t.emailLabel}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
            placeholder={t.emailPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#183C32] focus:border-[#183C32] transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password input */}
      <div>
        <label
          htmlFor="admin-password"
          className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {t.passwordLabel}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            disabled={loading}
            autoComplete="current-password"
            placeholder={t.passwordPlaceholder}
            className="w-full pl-10 pr-11 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#183C32] focus:border-[#183C32] transition-all disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-pressed={showPassword}
            aria-label={showPassword ? t.hidePassword : t.showPassword}
            className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Two-Factor progressive disclosure */}
      {showTotp && (
        <div className="p-4 rounded-2xl bg-[#183C32]/5 dark:bg-emerald-950/20 border border-[#183C32]/20 dark:border-emerald-800/30 space-y-2">
          <label
            htmlFor="admin-totp"
            className="block text-xs font-bold text-[#183C32] dark:text-emerald-300 flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4 text-[#B69A65]" />
            <span>{t.totpLabel}</span>
          </label>
          <input
            id="admin-totp"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.trim())}
            autoFocus
            autoComplete="one-time-code"
            placeholder={t.totpPlaceholder}
            className="w-full px-4 py-2.5 rounded-xl border border-[#183C32]/30 dark:border-emerald-700/50 bg-white dark:bg-zinc-800 text-sm text-center font-mono tracking-widest text-[#183C32] dark:text-emerald-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
            {t.totpDescription}
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#183C32] hover:bg-[#122E26] text-white font-bold text-sm shadow-lg shadow-[#183C32]/20 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#B69A65]" />
        ) : null}
        <span>{loading ? t.submitting : t.submitLogin}</span>
      </button>
    </form>
  );
}

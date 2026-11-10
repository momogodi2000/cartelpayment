"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { actionAdminLogin } from "@/app/actions/admin";

type LoginState = {
  step: "credentials" | "mfa";
  errorCode?: "INVALID_CREDENTIALS" | "RATE_LIMITED" | "INVALID_CODE" | "NETWORK";
  email: string;
};

const inputClass =
  "w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-[15px] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#183C32] focus:border-[#183C32] disabled:opacity-60";

export default function AdminLoginForm() {
  const t = useTranslations("AdminAuth");
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const totpRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    async (prev, formData) => {
      try {
        const res = await actionAdminLogin(formData);
        if (res.success) {
          window.location.assign("/admin");
          return prev;
        }
        const email = String(formData.get("email") || "");
        if (res.requiresMFA) return { step: "mfa", errorCode: res.errorCode, email };
        return { step: "credentials", errorCode: res.errorCode ?? "INVALID_CREDENTIALS", email };
      } catch {
        return { ...prev, errorCode: "NETWORK" };
      }
    },
    { step: "credentials", email: "" }
  );

  useEffect(() => {
    if (state.step === "mfa") totpRef.current?.focus();
  }, [state.step]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <motion.form
      action={formAction}
      noValidate={false}
      className="space-y-5"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      aria-busy={pending}
    >
      <div aria-live="polite">
        {state.errorCode && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            {t(`errors.${state.errorCode}`)}
          </p>
        )}
      </div>

      {state.step === "mfa" ? (
        <>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
        </>
      ) : (
      <div className="space-y-5">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
            {t("emailLabel")}
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              onKeyUp={onKey}
              onKeyDown={onKey}
              className={`${inputClass} pr-12`}
              aria-describedby={capsLock ? "caps-warning" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183C32] dark:hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          {capsLock && (
            <p id="caps-warning" className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              {t("capsLock")}
            </p>
          )}
        </div>
      </div>
      )}

      {state.step === "mfa" && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 font-semibold text-[#183C32] dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            {t("totpTitle")}
          </p>
          <label htmlFor="admin-totp" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {t("totpLabel")}
          </label>
          <input
            ref={totpRef}
            id="admin-totp"
            name="totpCode"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            required
            maxLength={11}
            disabled={pending}
            aria-describedby="totp-help"
            className={`${inputClass} font-mono tracking-[0.3em] text-center text-lg`}
          />
          <p id="totp-help" className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("totpHelp")}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#183C32] px-4 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#12302A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B69A65] disabled:opacity-70"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {pending ? t("submitting") : state.step === "mfa" ? t("verify") : t("submit")}
      </button>

      {state.step === "mfa" && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          {t("useAnotherAccount")}
        </button>
      )}
    </motion.form>
  );
}

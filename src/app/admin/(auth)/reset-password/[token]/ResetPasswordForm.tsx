"use client";

import React, { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { actionAdminResetPassword } from "@/app/actions/admin";

type ResetState = { done: boolean; errorCode?: string };

const inputClass =
  "w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#183C32]";

export default function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("AdminAuth");
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    async (_prev, formData) => {
      const pwd = String(formData.get("newPassword") || "");
      if (pwd.length < 12) return { done: false, errorCode: "TOO_SHORT" };
      if (pwd !== String(formData.get("confirmPassword") || "")) return { done: false, errorCode: "MISMATCH" };
      try {
        const res = await actionAdminResetPassword(formData);
        return res.success ? { done: true } : { done: false, errorCode: res.errorCode || "GENERIC" };
      } catch {
        return { done: false, errorCode: "GENERIC" };
      }
    },
    { done: false }
  );

  if (state.done) {
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {t("passwordUpdated")}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" aria-busy={pending}>
      <input type="hidden" name="token" value={token} />
      {state.errorCode && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          {t(`passwordErrors.${state.errorCode}`)}
        </p>
      )}
      <div>
        <label htmlFor="reset-new" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
          {t("newPasswordLabel")}
        </label>
        <input id="reset-new" name="newPassword" type="password" autoComplete="new-password" minLength={12} required disabled={pending} className={inputClass} />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
          {t("confirmPasswordLabel")}
        </label>
        <input id="reset-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required disabled={pending} className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#183C32] px-4 py-3.5 font-semibold text-white hover:bg-[#12302A] disabled:opacity-70"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {pending ? t("saving") : t("savePassword")}
      </button>
    </form>
  );
}

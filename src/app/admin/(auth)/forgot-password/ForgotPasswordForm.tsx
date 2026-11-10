"use client";

import React, { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { actionAdminForgotPassword } from "@/app/actions/admin";

export default function ForgotPasswordForm() {
  const t = useTranslations("AdminAuth");
  const [sent, formAction, pending] = useActionState<boolean, FormData>(async (_prev, formData) => {
    await actionAdminForgotPassword(formData).catch(() => undefined);
    return true; // Always the same confirmation (no account disclosure).
  }, false);

  if (sent) {
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {t("resetSentTitle")}
        </p>
        <p className="mt-1">{t("resetSent")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" aria-busy={pending}>
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
          {t("emailLabel")}
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#183C32]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#183C32] px-4 py-3.5 font-semibold text-white hover:bg-[#12302A] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B69A65]"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {pending ? t("sending") : t("sendResetLink")}
      </button>
    </form>
  );
}

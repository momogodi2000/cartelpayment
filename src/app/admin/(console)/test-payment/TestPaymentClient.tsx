"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, ExternalLink, RotateCcw, RefreshCw } from "lucide-react";
import { actionStartTestPayment, actionResetTestDogStatus, actionRefreshTestPayment } from "@/app/actions/admin";

function TestPaymentClient({ locale, disabled }: { locale: string; disabled: boolean }) {
  const t = useTranslations("AdminTestPayment");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resetting, startReset] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await actionStartTestPayment(formData);
      if (res.success) {
        setCheckoutUrl(res.checkoutUrl);
        setNotice(t("sessionReady"));
        window.open(res.checkoutUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(t(`errors.${res.errorCode}`));
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-5">
      <h2 className="font-bold text-sm text-zinc-900 dark:text-white">{t("startTitle")}</h2>

      {error && (
        <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </p>
      )}
      {notice && (
        <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-2">
          <p>{notice}</p>
          {checkoutUrl && (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline">
              {t("openCheckout")} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="tp-phone" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            {t("phoneLabel")}
          </label>
          <input
            id="tp-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input name="authorize" type="checkbox" required className="mt-1" />
          <span>{t("authorizeLabel")}</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={disabled || pending}
            aria-busy={pending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#183C32] text-white text-sm font-bold disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {pending ? t("starting") : t("startButton")}
          </button>
          <button
            type="button"
            disabled={resetting}
            onClick={() =>
              startReset(async () => {
                setError(null);
                await actionResetTestDogStatus();
                setCheckoutUrl(null);
                setNotice(t("resetDone"));
                router.refresh();
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {resetting ? t("resetting") : t("resetButton")}
          </button>
        </div>
      </form>
    </div>
  );
}

export function RefreshTestPayment({ orderRef, label }: { orderRef: string; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await actionRefreshTestPayment(orderRef);
          router.refresh();
        })
      }
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} aria-hidden="true" />
      {label}
    </button>
  );
}

export default TestPaymentClient;

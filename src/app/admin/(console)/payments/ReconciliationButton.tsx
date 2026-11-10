"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { actionReconcilePayments } from "@/app/actions/admin";

export default function ReconciliationButton() {
  const t = useTranslations("AdminPayments");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            const res = await actionReconcilePayments();
            const r = res.report;
            setResult(
              t("reconcileResult", { evaluated: r.evaluated, settled: r.settled, terminal: r.terminal, open: r.stillOpen, errors: r.errors.length })
            );
            router.refresh();
          })
        }
        className="inline-flex items-center gap-2 rounded-xl bg-[#183C32] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12302A] disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden="true" />
        {pending ? t("reconciling") : t("reconcileButton")}
      </button>
      {result && (
        <p role="status" className="text-xs text-zinc-600 dark:text-zinc-300">
          {result}
        </p>
      )}
    </div>
  );
}

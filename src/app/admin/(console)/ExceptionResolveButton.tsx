"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { actionResolveException } from "@/app/actions/admin";

export default function ExceptionResolveButton({ exceptionId }: { exceptionId: string }) {
  const t = useTranslations("AdminPayments");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
        <Check className="h-4 w-4" aria-hidden="true" /> {t("exceptionResolved")}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const notes = window.prompt(t("exceptionNotes"));
        if (!notes || !notes.trim()) return;
        start(async () => {
          await actionResolveException(exceptionId, notes.trim());
          setDone(true);
          router.refresh();
        });
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {t("exceptionResolve")}
    </button>
  );
}

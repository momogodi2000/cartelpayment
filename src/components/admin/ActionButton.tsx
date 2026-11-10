"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ActionResult = { success?: boolean; errorCode?: string } | void | unknown;

/**
 * Runs a (bound) server action from a server-rendered admin page. Labels and error messages
 * are passed in already translated, so the client bundle needs no translation namespace.
 * With `promptText`, the entered value is passed as the action's last argument.
 */
export default function ActionButton({
  action,
  label,
  pendingLabel,
  confirmText,
  promptText,
  errors = {},
  fallbackError,
  className = "inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-semibold hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
  icon,
}: {
  action: (value: string) => Promise<ActionResult>;
  label: string;
  pendingLabel?: string;
  confirmText?: string;
  promptText?: string;
  errors?: Record<string, string>;
  fallbackError: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    let value: string | undefined;
    if (promptText) {
      const v = window.prompt(promptText);
      if (!v || !v.trim()) return;
      value = v.trim();
    } else if (confirmText && !window.confirm(confirmText)) {
      return;
    }
    setError(null);
    start(async () => {
      try {
        const res = (await (value === undefined ? (action as () => Promise<ActionResult>)() : action(value))) as { success?: boolean; errorCode?: string } | undefined;
        if (res && res.success === false) setError((res.errorCode && errors[res.errorCode]) || fallbackError);
        router.refresh();
      } catch {
        setError(fallbackError);
      }
    });
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={pending} aria-busy={pending} className={className}>
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : icon}
        {pending && pendingLabel ? pendingLabel : label}
      </button>
      {error && (
        <span role="alert" className="max-w-xs text-[11px] text-red-700">
          {error}
        </span>
      )}
    </span>
  );
}

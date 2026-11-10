"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Generic SUPER_ADMIN form around a server action. Field markup is rendered by the server
 * page (children); messages arrive pre-translated.
 */
export default function AdminForm({
  action,
  submitLabel,
  savingLabel,
  savedText,
  errors = {},
  fallbackError,
  resetOnSuccess = false,
  className = "space-y-4",
  children,
}: {
  action: (fd: FormData) => Promise<{ success?: boolean; errorCode?: string } | unknown>;
  submitLabel: string;
  savingLabel: string;
  savedText?: string;
  errors?: Record<string, string>;
  fallbackError: string;
  resetOnSuccess?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [state, setState] = useState<{ ok?: boolean; error?: string }>({});

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setState({});
        start(async () => {
          try {
            const res = (await action(fd)) as { success?: boolean; errorCode?: string } | undefined;
            if (res && res.success === false) {
              setState({ error: (res.errorCode && errors[res.errorCode]) || fallbackError });
            } else {
              setState({ ok: true });
              if (resetOnSuccess) ref.current?.reset();
              router.refresh();
            }
          } catch {
            setState({ error: fallbackError });
          }
        });
      }}
    >
      <div aria-live="polite">
        {state.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
        {state.ok && savedText && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{savedText}</p>}
      </div>
      {children}
      <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#183C32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12302A] disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {pending ? savingLabel : submitLabel}
      </button>
    </form>
  );
}

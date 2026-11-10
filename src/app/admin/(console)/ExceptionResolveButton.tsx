"use client";

import React, { useState } from "react";
import { actionResolveException } from "@/app/actions/admin";
import { Check, Loader2 } from "lucide-react";

export default function ExceptionResolveButton({ exceptionId }: { exceptionId: string }) {
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);

  const handleResolve = async () => {
    const notes = prompt("Enter resolution notes (e.g. 'Refund initiated via provider dashboard' or 'Authorized replacement'):");
    if (!notes) return;

    setLoading(true);
    await actionResolveException(exceptionId, notes);
    setLoading(false);
    setResolved(true);
  };

  if (resolved) {
    return (
      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
        <Check className="h-4 w-4" /> Resolved
      </span>
    );
  }

  return (
    <button
      onClick={handleResolve}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-colors shrink-0 flex items-center gap-1 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      <span>Resolve Exception</span>
    </button>
  );
}

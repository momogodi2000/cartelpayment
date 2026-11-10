"use client";

import React, { useState } from "react";
import { actionReconcilePayments } from "@/app/actions/admin";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReconciliationButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleReconcile = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await actionReconcilePayments();
      if (res.success && res.report) {
        setResult(
          `Evaluated ${res.report.evaluatedCount}: ${res.report.settledCount} settled, ${res.report.expiredCount} expired/abandoned.`
        );
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={handleReconcile}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#183C32] text-white text-xs font-bold shadow-sm hover:bg-[#122E26] transition-colors disabled:opacity-60 cursor-pointer"
      >
        <RefreshCw className={`h-3.5 w-3.5 text-[#B69A65] ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Reconciling against Providers..." : "Reconcile Unsettled Transactions"}</span>
      </button>

      {result && (
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
          {result}
        </span>
      )}
    </div>
  );
}

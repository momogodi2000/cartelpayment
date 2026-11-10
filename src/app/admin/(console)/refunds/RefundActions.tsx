"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionProcessRefund } from "@/app/actions/admin";
import { Check, Loader2 } from "lucide-react";

export default function RefundActions({
  refundId,
  status,
}: {
  refundId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm("Confirm manual processing of this refund?")) return;
    setLoading(true);
    try {
      await actionProcessRefund(refundId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (status === "COMPLETED") {
    return (
      <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
        <Check className="h-3.5 w-3.5" />
        Resolved
      </span>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      Mark Processed
    </button>
  );
}

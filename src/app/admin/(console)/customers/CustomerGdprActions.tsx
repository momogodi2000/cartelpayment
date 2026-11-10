"use client";

import React, { useState } from "react";
import { actionAnonymizeCustomer } from "@/app/actions/admin";
import { Download, Trash2, Loader2 } from "lucide-react";

interface Props {
  customerId: string;
  isAnonymized: boolean;
}

export default function CustomerGdprActions({ customerId, isAnonymized }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    window.open(`/api/admin/customers/${customerId}/export`, "_blank");
  };

  const handleAnonymize = async () => {
    if (!confirm("Are you sure you want to permanently anonymize this customer record under GDPR Right to Erasure? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    await actionAnonymizeCustomer(customerId);
    setLoading(false);
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold flex items-center gap-1"
        title="Export JSON records"
      >
        <Download className="h-3 w-3" />
        <span>Export</span>
      </button>

      {!isAnonymized && (
        <button
          onClick={handleAnonymize}
          disabled={loading}
          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
          title="Anonymize personal data"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          <span>Anonymize</span>
        </button>
      )}
    </div>
  );
}

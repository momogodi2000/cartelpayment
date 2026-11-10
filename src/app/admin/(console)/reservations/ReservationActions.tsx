"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionForceReleaseReservation } from "@/app/actions/admin";
import { Unlock, Loader2 } from "lucide-react";

export default function ReservationActions({
  reservationId,
  isHoldActive,
}: {
  reservationId: string;
  isHoldActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleForceRelease = async () => {
    if (!confirm("Are you sure you want to force-release this hold? The animal will immediately return to AVAILABLE status.")) {
      return;
    }
    setLoading(true);
    try {
      await actionForceReleaseReservation(reservationId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!isHoldActive) {
    return <span className="text-[11px] text-zinc-400">—</span>;
  }

  return (
    <button
      onClick={handleForceRelease}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
      title="Force Release Hold"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Unlock className="h-3 w-3" />
      )}
      Release Hold
    </button>
  );
}

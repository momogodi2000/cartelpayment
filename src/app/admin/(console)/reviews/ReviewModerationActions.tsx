"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionModerateReview } from "@/app/actions/admin";
import { Check, X, Loader2 } from "lucide-react";

export default function ReviewModerationActions({
  reviewId,
  currentStatus,
}: {
  reviewId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleModerate = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      await actionModerateReview(reviewId, status);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />;
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {currentStatus !== "APPROVED" && (
        <button
          onClick={() => handleModerate("APPROVED")}
          className="p-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          title="Approve Review"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => handleModerate("REJECTED")}
          className="p-1 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          title="Reject Review"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

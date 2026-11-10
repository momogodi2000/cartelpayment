"use client";

import React, { useState } from "react";
import { actionResetTestDogStatus } from "@/app/actions/admin";
import { startCheckout } from "@/app/actions/checkout";
import { Loader2, ShieldCheck, PlayCircle, RotateCcw, ExternalLink } from "lucide-react";

interface Props {
  testDogId: string;
  testDogStatus: string;
}

export default function TestPaymentClient({ testDogId, testDogStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleStartTest = async () => {
    setLoading(true);
    setError(null);
    setCheckoutUrl(null);

    const formData = new FormData();
    formData.append("animalId", testDogId);
    formData.append("name", "Super Admin Test Verification");
    formData.append("email", "admin@pawelium.fyi");
    formData.append("phone", "+33600000000");
    formData.append("street", "1 Administration Way");
    formData.append("city", "Paris");
    formData.append("postalCode", "75001");
    formData.append("country", "France");
    formData.append("deliveryMethod", "standard");
    formData.append("termsAccepted", "true");
    formData.append("locale", "en");

    try {
      const res = await startCheckout(formData);
      if (res.success && res.checkoutUrl) {
        setCheckoutUrl(res.checkoutUrl);
        window.open(res.checkoutUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(res.error || "Failed to initialize test payment session.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setError(null);
    try {
      await actionResetTestDogStatus();
      setCheckoutUrl(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {checkoutUrl && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>Card Checkout Session Generated Successfully!</span>
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            A secure EUR checkout window has been opened. If blocked by a popup blocker, click below:
          </p>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-xs underline text-[#183C32] dark:text-emerald-200 hover:text-black"
          >
            <span>Open Provider Checkout URL ({checkoutUrl.slice(0, 45)}...)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={handleStartTest}
          disabled={loading || testDogStatus !== "AVAILABLE"}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#183C32] text-white text-xs font-bold shadow-md hover:bg-[#122E26] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#B69A65]" />
          ) : (
            <PlayCircle className="h-4 w-4 text-[#B69A65]" />
          )}
          <span>
            {loading ? "Generating €0.90 Card Session..." : "Initialize €0.90 Test Transaction"}
          </span>
        </button>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {resetting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          <span>Reset Test Dog to Available</span>
        </button>
      </div>
    </div>
  );
}

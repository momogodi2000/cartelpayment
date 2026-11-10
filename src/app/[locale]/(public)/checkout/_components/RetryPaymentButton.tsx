"use client";

import { useState, useTransition } from "react";
import { retryCheckoutPayment } from "@/app/actions/checkout";

export default function RetryPaymentButton({
  orderRef,
  signature,
  locale,
  label,
}: {
  orderRef: string;
  signature: string;
  locale: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await retryCheckoutPayment(orderRef, signature, locale);
            if (res.success && res.checkoutUrl) window.location.assign(res.checkoutUrl);
            else setError(res.error || null);
          })
        }
        className="inline-flex px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-sm disabled:opacity-60"
      >
        {label}
      </button>
      {error && (
        <p role="alert" className="text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

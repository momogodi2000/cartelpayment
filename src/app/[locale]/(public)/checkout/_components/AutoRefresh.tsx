"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the server status view periodically while a payment is still being confirmed. */
export default function AutoRefresh({ intervalMs = 6000, maxRuns = 20 }: { intervalMs?: number; maxRuns?: number }) {
  const router = useRouter();
  useEffect(() => {
    let runs = 0;
    const id = window.setInterval(() => {
      runs += 1;
      if (runs > maxRuns) {
        window.clearInterval(id);
        return;
      }
      router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs, maxRuns]);
  return null;
}

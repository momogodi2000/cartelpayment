"use client";

import React from "react";
import { Download } from "lucide-react";

interface SubscriberItem {
  id: string;
  email: string;
  locale: string;
  status: string;
  createdAt: string | Date;
}

export default function NewsletterCsvExport({ subscribers }: { subscribers: SubscriberItem[] }) {
  const exportCsv = () => {
    const headers = ["ID", "Email", "Locale", "Status", "SubscribedAt"];
    const rows = subscribers.map((s) => [
      s.id,
      s.email,
      s.locale,
      s.status,
      new Date(s.createdAt).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pawelium_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportCsv}
      disabled={subscribers.length === 0}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}

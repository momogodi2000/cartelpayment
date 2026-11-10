/**
 * Small shared building blocks for SUPER_ADMIN console pages (server-component friendly).
 */
import React from "react";
import Link from "next/link";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>{children}</section>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">{children}</p>;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger" | "info"; children: React.ReactNode }) {
  const cls = {
    neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

export function DataTable({ columns, children }: { columns: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full bg-white text-left text-sm dark:bg-zinc-950">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          <tr>
            {columns.map((c, i) => (
              <th key={i} scope="col" className="whitespace-nowrap px-4 py-2.5 font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 align-top ${className}`}>{children}</td>;
}

export function Pagination({ page, pages, href, labels }: { page: number; pages: number; href: (p: number) => string; labels: { previous: string; next: string; pageOf: string } }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label={labels.pageOf} className="flex items-center justify-between text-sm">
      {page > 1 ? <Link className="rounded-lg border px-3 py-1.5 dark:border-zinc-700" href={href(page - 1)}>{labels.previous}</Link> : <span />}
      <span className="text-zinc-500">{labels.pageOf}</span>
      {page < pages ? <Link className="rounded-lg border px-3 py-1.5 dark:border-zinc-700" href={href(page + 1)}>{labels.next}</Link> : <span />}
    </nav>
  );
}

export const fieldClass = "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800";
export const primaryButton = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#183C32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12302A] disabled:opacity-60";
export const secondaryButton = "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800";

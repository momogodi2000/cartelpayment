import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  Bird,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  LogOut,
  MailWarning,
  Send,
  Settings,
  ArrowRight,
  Plus,
  PenLine,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
} from "lucide-react";
import prisma from "@/lib/db";
import { getServerTranslation } from "@/lib/serverTranslations";
import { verifyToken } from "@/lib/auth";

export const revalidate = 0;

async function getDashboardData() {
  try {
    const [
      totalParrots,
      availableParrots,
      reservedParrots,
      soldParrots,
      totalBlogs,
      unreadMessages,
      totalMessages,
      categoryRows,
    ] = await Promise.all([
      prisma.parrot.count(),
      prisma.parrot.count({ where: { status: "AVAILABLE" } }),
      prisma.parrot.count({ where: { status: "RESERVED" } }),
      prisma.parrot.count({ where: { status: "SOLD" } }),
      prisma.blogPost.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.contactMessage.count(),
      prisma.$queryRaw<{ category: string; cnt: bigint }[]>`
        SELECT category, COUNT(*) AS cnt
        FROM "Parrot"
        GROUP BY category
        ORDER BY cnt DESC
        LIMIT 6
      `,
    ]);
    return {
      totalParrots,
      availableParrots,
      reservedParrots,
      soldParrots,
      totalBlogs,
      unreadMessages,
      totalMessages,
      categories: categoryRows.map((r) => ({
        label: r.category,
        count: Number(r.cnt),
      })),
    };
  } catch {
    return {
      totalParrots: 0, availableParrots: 0, reservedParrots: 0, soldParrots: 0,
      totalBlogs: 0, unreadMessages: 0, totalMessages: 0, categories: [],
    };
  }
}

function DonutChart({
  available, reserved, sold, total,
}: {
  available: number; reserved: number; sold: number; total: number;
}) {
  if (total === 0) return null;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const avail = (available / total) * circ;
  const res = (reserved / total) * circ;
  const soldArc = (sold / total) * circ;
  const gap = 0;
  const offset = 0;
  const segments = [
    { arc: avail, color: "#059669", offset },
    { arc: res, color: "#d97706", offset: offset + avail + gap },
    { arc: soldArc, color: "#dc2626", offset: offset + avail + gap + res + gap },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="16" className="stroke-gray-200 dark:stroke-slate-700" />
        {segments.map((seg, i) =>
          seg.arc > 0 ? (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${seg.arc} ${circ - seg.arc}`}
              strokeDashoffset={-seg.offset}
            />
          ) : null
        )}
        {/* counter-rotate the label back upright via SVG transform attribute */}
        <text
          x="50" y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="800"
          fill="currentColor"
          className="text-text-premium"
          transform="rotate(90, 50, 50)"
        >
          {total}
        </text>
      </svg>
      <div className="flex items-center gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-600 inline-block" /> Reserved</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" /> Sold</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const name = label.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-text-premium/70 w-32 shrink-0 truncate">{name}</span>
      <svg className="flex-1 h-2" viewBox="0 0 100 8" preserveAspectRatio="none">
        <rect x="0" y="0" width="100" height="8" rx="4" className="fill-black/[0.06] dark:fill-white/[0.08]" />
        {pct > 0 && <rect x="0" y="0" width={pct} height="8" rx="4" fill="hsl(var(--primary))" />}
      </svg>
      <span className="text-xs font-extrabold text-text-premium/60 w-5 text-right">{count}</span>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  const { locale } = await getServerTranslation();
  const isFr = locale === "fr";
  const pick = (en: string, fr: string) => (isFr ? fr : en);

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? await verifyToken(token) : null;

  const handleLogout = async () => {
    "use server";
    const store = await cookies();
    store.delete("auth_token");
    store.delete("auth_logged_in");
    redirect("/admin/login");
  };

  const maxCategory = Math.max(...data.categories.map((c) => c.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Welcome Banner ── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 sm:p-8 text-white relative overflow-hidden">
        {/* decorative highlight — Tailwind radial via bg-[radial-gradient] */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,white_0%,transparent_60%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-semibold mb-1">
              {new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              {pick("Welcome back", "Bienvenue")}{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
            <p className="text-white/65 text-sm mt-1">
              {pick("Aviary & Content Management System", "Système de gestion de l'élevage")}
            </p>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {pick("Sign Out", "Déconnexion")}
            </button>
          </form>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: pick("Available", "Disponibles"),
            value: data.availableParrots,
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            border: "border-emerald-200/60 dark:border-emerald-800/30",
            pct: data.totalParrots > 0 ? Math.round((data.availableParrots / data.totalParrots) * 100) : 0,
            barFill: "#10b981",
          },
          {
            label: pick("Reserved", "Réservés"),
            value: data.reservedParrots,
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40",
            border: "border-amber-200/60 dark:border-amber-800/30",
            pct: data.totalParrots > 0 ? Math.round((data.reservedParrots / data.totalParrots) * 100) : 0,
            barFill: "#f59e0b",
          },
          {
            label: pick("Sold", "Vendus"),
            value: data.soldParrots,
            icon: XCircle,
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-950/40",
            border: "border-red-200/60 dark:border-red-800/30",
            pct: data.totalParrots > 0 ? Math.round((data.soldParrots / data.totalParrots) * 100) : 0,
            barFill: "#ef4444",
          },
          {
            label: pick("Unread Messages", "Messages Non Lus"),
            value: data.unreadMessages,
            icon: MailWarning,
            color: data.unreadMessages > 0 ? "text-violet-600 dark:text-violet-400" : "text-text-premium/40",
            bg: data.unreadMessages > 0 ? "bg-violet-50 dark:bg-violet-950/40" : "bg-slate-50 dark:bg-slate-900/40",
            border: data.unreadMessages > 0 ? "border-violet-200/60 dark:border-violet-800/30" : "border-slate-200/60 dark:border-slate-700/30",
            pct: data.totalMessages > 0 ? Math.round((data.unreadMessages / data.totalMessages) * 100) : 0,
            barFill: data.unreadMessages > 0 ? "#8b5cf6" : "#cbd5e1",
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl border ${card.border} ${card.bg} relative overflow-hidden`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`h-9 w-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                </div>
                <span className={`text-xs font-extrabold ${card.color}`}>{card.pct}%</span>
              </div>
              <div className={`text-3xl font-black ${card.color} leading-none`}>{card.value}</div>
              <div className="text-xs text-text-premium/50 font-semibold mt-1">{card.label}</div>
              <svg className="mt-3 w-full h-1.5" viewBox="0 0 100 6" preserveAspectRatio="none">
                <rect x="0" y="0" width="100" height="6" rx="3" className="fill-gray-200 dark:fill-slate-700" />
                {card.pct > 0 && (
                  <rect x="0" y="0" width={card.pct} height="6" rx="3" fill={card.barFill} />
                )}
              </svg>
            </div>
          );
        })}
      </section>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-[hsl(var(--card-bg))] border border-[hsl(var(--card-border))] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-text-premium">
                {pick("Status Overview", "Vue d'ensemble des statuts")}
              </h2>
              <p className="text-xs text-text-premium/45 font-medium">
                {data.totalParrots} {pick("total birds in aviary", "oiseaux au total")}
              </p>
            </div>
          </div>
          <DonutChart
            available={data.availableParrots}
            reserved={data.reservedParrots}
            sold={data.soldParrots}
            total={data.totalParrots}
          />
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: pick("Available", "Dispo"), value: data.availableParrots, color: "text-emerald-600" },
              { label: pick("Reserved", "Réservé"), value: data.reservedParrots, color: "text-amber-600" },
              { label: pick("Sold", "Vendu"), value: data.soldParrots, color: "text-red-600" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-text-premium/50 font-bold uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-[hsl(var(--card-bg))] border border-[hsl(var(--card-border))] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Bird className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-text-premium">
                {pick("Birds by Category", "Oiseaux par catégorie")}
              </h2>
              <p className="text-xs text-text-premium/45 font-medium">
                {pick("Species distribution", "Répartition des espèces")}
              </p>
            </div>
          </div>
          <div className="space-y-3.5">
            {data.categories.length > 0
              ? data.categories.map((cat) => (
                  <CategoryBar key={cat.label} label={cat.label} count={cat.count} max={maxCategory} />
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-black/[0.04] animate-pulse" />
                ))
            }
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <section>
        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-text-premium/40 mb-3 flex items-center gap-2">
          <Zap className="h-3 w-3" />
          {pick("Quick Actions", "Actions Rapides")}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/dashboard/parrots"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <Plus className="h-3.5 w-3.5" />
            {pick("Add Parrot", "Ajouter un perroquet")}
          </Link>
          <Link
            href="/admin/dashboard/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-text-premium font-bold text-xs hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all"
          >
            <PenLine className="h-3.5 w-3.5" />
            {pick("Write Article", "Écrire un article")}
          </Link>
          <Link
            href="/admin/dashboard/messages"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-xs transition-all ${
              data.unreadMessages > 0
                ? "border-violet-200 dark:border-violet-800/40 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/60"
                : "border-black/[0.08] dark:border-white/[0.08] text-text-premium hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {pick("Messages", "Messages")}
            {data.unreadMessages > 0 && (
              <span className="bg-violet-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                {data.unreadMessages}
              </span>
            )}
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-text-premium font-bold text-xs hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all"
          >
            <Users className="h-3.5 w-3.5" />
            {pick("View Public Site", "Voir le site public")}
          </Link>
        </div>
      </section>

      {/* ── Blog Summary Strip ── */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/15 text-sm text-text-premium/80 font-semibold">
        <FileText className="h-5 w-5 text-primary shrink-0" />
        <span>
          <span className="font-extrabold text-primary">{data.totalBlogs}</span>{" "}
          {pick(
            `blog ${data.totalBlogs === 1 ? "article" : "articles"} published.`,
            `article${data.totalBlogs > 1 ? "s" : ""} publié${data.totalBlogs > 1 ? "s" : ""}.`
          )}
        </span>
        <Link
          href="/admin/dashboard/blog"
          className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
        >
          {pick("Manage", "Gérer")} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── Module Grid ── */}
      <section>
        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-text-premium/40 mb-5">
          {pick("Content Modules", "Modules de Contenu")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { href: "/admin/dashboard/parrots", title: pick("Parrots Directory", "Annuaire des Perroquets"), desc: pick("Manage species, prices, status, and images.", "Gérer espèces, prix, statuts et images."), icon: Bird, accent: "emerald" },
            { href: "/admin/dashboard/blog", title: pick("Blog Management", "Gestion du Blog"), desc: pick("Write SEO articles and manage care guides.", "Rédiger articles SEO et guides de soins."), icon: FileText, accent: "blue" },
            { href: "/admin/dashboard/gallery", title: pick("Gallery Items", "Galerie Médias"), desc: pick("Manage farm photography and nursery videos.", "Gérer photos et vidéos de la nurserie."), icon: ImageIcon, accent: "violet" },
            { href: "/admin/dashboard/messages", title: pick("Inquiry Messages", "Messages de Contact"), desc: pick("Review client submissions and mark as read.", "Consulter les messages et les marquer lus."), icon: MessageSquare, accent: "amber", badge: data.unreadMessages },
            { href: "/admin/dashboard/newsletter", title: pick("Newsletter", "Newsletter"), desc: pick("Manage subscribers and send campaigns.", "Gérer les abonnés et diffuser des campagnes."), icon: Send, accent: "sky" },
            { href: "/admin/dashboard/settings", title: pick("Settings & Logs", "Paramètres & Journaux"), desc: pick("Configure system properties and audit trails.", "Configurer les propriétés et journaux d'audit."), icon: Settings, accent: "slate" },
          ].map((item, idx) => {
            const Icon = item.icon;
            const accentClasses: Record<string, string> = {
              emerald: "text-emerald-700 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/35 dark:border-emerald-800/40 dark:group-hover:bg-emerald-900/45",
              blue: "text-blue-700 bg-blue-50 border-blue-100 group-hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-950/35 dark:border-blue-800/40 dark:group-hover:bg-blue-900/45",
              violet: "text-violet-700 bg-violet-50 border-violet-100 group-hover:bg-violet-100 dark:text-violet-300 dark:bg-violet-950/35 dark:border-violet-800/40 dark:group-hover:bg-violet-900/45",
              amber: "text-amber-700 bg-amber-50 border-amber-100 group-hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/35 dark:border-amber-800/40 dark:group-hover:bg-amber-900/45",
              sky: "text-sky-700 bg-sky-50 border-sky-100 group-hover:bg-sky-100 dark:text-sky-300 dark:bg-sky-950/35 dark:border-sky-800/40 dark:group-hover:bg-sky-900/45",
              slate: "text-slate-700 bg-slate-50 border-slate-100 group-hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-900/70 dark:border-slate-700/60 dark:group-hover:bg-slate-800/80",
            };
            return (
              <Link
                key={idx}
                href={item.href}
                className="group flex gap-4 bg-[hsl(var(--card-bg))] p-5 rounded-2xl border border-[hsl(var(--card-border))] hover:border-primary/25 hover:shadow-md transition-all duration-200 relative"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${accentClasses[item.accent]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1 pr-6 min-w-0">
                  <h3 className="font-extrabold text-sm text-text-premium group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-premium/50 leading-relaxed">{item.desc}</p>
                </div>
                <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/20 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-4 right-4 h-6 w-6 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

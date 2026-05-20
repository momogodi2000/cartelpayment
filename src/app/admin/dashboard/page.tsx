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
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import prisma from "@/lib/db";

export const revalidate = 0;

async function getDashboardMetrics() {
  try {
    const totalParrots = await prisma.parrot.count();
    const availableParrots = await prisma.parrot.count({ where: { status: "AVAILABLE" } });
    const reservedParrots = await prisma.parrot.count({ where: { status: "RESERVED" } });
    const soldParrots = await prisma.parrot.count({ where: { status: "SOLD" } });
    const totalBlogs = await prisma.blogPost.count();
    const unreadMessages = await prisma.contactMessage.count({ where: { read: false } });

    return {
      totalParrots,
      availableParrots,
      reservedParrots,
      soldParrots,
      totalBlogs,
      unreadMessages,
    };
  } catch (error) {
    console.error("Error loading dashboard metrics:", error);
    return {
      totalParrots: 0,
      availableParrots: 0,
      reservedParrots: 0,
      soldParrots: 0,
      totalBlogs: 0,
      unreadMessages: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  const handleLogout = async () => {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("auth_logged_in");
    redirect("/admin/login");
  };

  const statCards = [
    {
      label: "Available Parrots",
      labelFr: "Perroquets Disponibles",
      value: metrics.availableParrots,
      sub: `Total listings: ${metrics.totalParrots}`,
      subFr: `Total annonces : ${metrics.totalParrots}`,
      color: "text-emerald-600",
      bg: "bg-emerald-500/8",
      border: "border-emerald-200/60 dark:border-emerald-800/30",
    },
    {
      label: "Reserved Birds",
      labelFr: "Oiseaux Réservés",
      value: metrics.reservedParrots,
      sub: "Pending transport details",
      subFr: "Détails transport en attente",
      color: "text-amber-600",
      bg: "bg-amber-500/8",
      border: "border-amber-200/60 dark:border-amber-800/30",
    },
    {
      label: "Sold Birds",
      labelFr: "Oiseaux Vendus",
      value: metrics.soldParrots,
      sub: "Successful transitions",
      subFr: "Transitions réussies",
      color: "text-blue-600",
      bg: "bg-blue-500/8",
      border: "border-blue-200/60 dark:border-blue-800/30",
    },
    {
      label: "Unread Inquiries",
      labelFr: "Demandes Non Lues",
      value: metrics.unreadMessages,
      sub: "Requires attention",
      subFr: "Nécessite attention",
      color: metrics.unreadMessages > 0 ? "text-amber-600" : "text-text-premium/40",
      bg: "bg-slate-500/5",
      border: "border-slate-200/60 dark:border-slate-700/30",
      hasAlert: metrics.unreadMessages > 0,
    },
  ];

  const navItems = [
    {
      href: "/admin/dashboard/parrots",
      title: "Parrots Directory",
      titleFr: "Annuaire des Perroquets",
      description:
        "Create, view, modify specifications, prices, and update bird statuses (Available, Reserved, Sold).",
      descFr: "Créer, voir, modifier les spécifications, prix et statuts des oiseaux.",
      icon: Bird,
      accent: "emerald",
    },
    {
      href: "/admin/dashboard/blog",
      title: "Blog Management",
      titleFr: "Gestion du Blog",
      description:
        "Write SEO articles, manage care guidelines, define excerpt details, and publish/unpublish posts.",
      descFr: "Rédiger des articles SEO, gérer les guides de soins et publier/dépublier.",
      icon: FileText,
      accent: "blue",
    },
    {
      href: "/admin/dashboard/gallery",
      title: "Gallery Items",
      titleFr: "Galerie Médias",
      description:
        "Manage farm photography, nursery videos, categorize items, and arrange sorting orders.",
      descFr: "Gérer les photos, vidéos de la nurserie et organiser les tris.",
      icon: ImageIcon,
      accent: "violet",
    },
    {
      href: "/admin/dashboard/messages",
      title: "Inquiry Messages",
      titleFr: "Messages de Contact",
      description: `Review client contact details, read email submissions, and mark messages as read.`,
      descFr: "Consulter les coordonnées clients et marquer les messages comme lus.",
      icon: MessageSquare,
      accent: "amber",
      badge: metrics.unreadMessages,
    },
    {
      href: "/admin/dashboard/newsletter",
      title: "Newsletter & Campaigns",
      titleFr: "Newsletter & Campagnes",
      description:
        "Manage subscriber list, design email template updates, and broadcast marketing campaigns.",
      descFr: "Gérer les abonnés et diffuser des campagnes marketing.",
      icon: Send,
      accent: "sky",
    },
    {
      href: "/admin/dashboard/settings",
      title: "Settings & Audit Logs",
      titleFr: "Paramètres & Journaux",
      description:
        "Configure system properties like contact email or WhatsApp, and inspect administrative audit trails.",
      descFr: "Configurer les propriétés système et inspecter les journaux d'audit.",
      icon: Settings,
      accent: "slate",
    },
  ];

  const accentMap: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-950/25 border border-violet-100 dark:border-violet-800/30 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/25 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30",
    sky: "text-sky-600 bg-sky-50 dark:bg-sky-950/25 border border-sky-100 dark:border-sky-800/30 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30",
    slate: "text-slate-600 bg-slate-50 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-700/30 group-hover:bg-slate-100 dark:group-hover:bg-slate-700/30",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-premium tracking-tight">
              Breeder Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-premium/50 font-semibold uppercase tracking-wider pl-12">
            Aviary &amp; Content Management
          </p>
        </div>
        <form action={handleLogout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>

      {/* ── Stat Cards ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`relative p-5 sm:p-6 rounded-2xl border ${card.border} ${card.bg} shadow-sm text-left overflow-hidden`}
          >
            <span className="text-[10px] text-text-premium/50 uppercase font-black tracking-widest block">
              {card.label}
            </span>
            <span className={`text-3xl font-black ${card.color} block mt-1`}>
              {card.value}
            </span>
            <span className="text-xs text-text-premium/50 font-bold block mt-0.5">
              {card.sub}
            </span>
            {card.hasAlert && (
              <MailWarning className="absolute right-4 bottom-4 h-10 w-10 text-amber-500/15 pointer-events-none" />
            )}
          </div>
        ))}
      </section>

      {/* ── Blog stat bonus card ── */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/15 text-sm text-text-premium/80 font-semibold">
        <FileText className="h-5 w-5 text-primary shrink-0" />
        <span>
          <span className="font-extrabold text-primary">{metrics.totalBlogs}</span>{" "}
          blog {metrics.totalBlogs === 1 ? "article" : "articles"} published in the Care Blog.
        </span>
        <Link
          href="/admin/dashboard/blog"
          className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
        >
          Manage <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── Directory Management Grid ── */}
      <section>
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-text-premium/45 mb-5">
          Content Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="group flex gap-4 sm:gap-5 bg-white dark:bg-white/[0.04] p-5 sm:p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-primary/25 dark:hover:border-primary/25 hover:shadow-md transition-all duration-300 text-left relative"
              >
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${accentMap[item.accent]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 pr-6 min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-text-premium group-hover:text-primary transition-colors flex items-center gap-2 flex-wrap">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-premium/55 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/20 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-4 right-4 h-6 w-6 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-bounce shadow-sm">
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

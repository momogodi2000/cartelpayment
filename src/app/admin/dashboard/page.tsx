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
  Layers,
  HelpCircle,
  MailWarning
} from "lucide-react";
import prisma from "@/lib/db";
import { logoutAdmin } from "@/actions/auth";

export const revalidate = 0; // Always fetch live counts

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

  // Define Server Action inline or pass it to form action
  const handleLogout = async () => {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    redirect("/admin/login");
  };

  const navItems = [
    {
      href: "/admin/dashboard/parrots",
      title: "Parrots Directory",
      description: "Create, view, modify specifications, prices, and update bird statuses (Available, Reserved, Sold).",
      icon: Bird,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      href: "/admin/dashboard/blog",
      title: "Blog Management",
      description: "Write SEO articles, manage care guidelines, define excerpt details, and publish/unpublish posts.",
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      href: "/admin/dashboard/gallery",
      title: "Gallery Items",
      description: "Manage farm photography, nursery videos, categorize items, and arrange sorting orders.",
      icon: ImageIcon,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      href: "/admin/dashboard/messages",
      title: "Inquiry Messages",
      description: `Review client contact details, read email submissions, check phone numbers, and mark messages as read.`,
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      badge: metrics.unreadMessages,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-black/[0.04] pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
            Breeder Dashboard
          </h1>
          <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider">
            Aviary & Content Management
          </p>
        </div>
        <form action={handleLogout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all shadow-sm"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </form>
      </div>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/[0.04] shadow-sm text-left">
          <span className="text-[10px] text-text-premium/40 uppercase font-extrabold tracking-widest block">
            Available Parrots
          </span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-1">
            {metrics.availableParrots}
          </span>
          <span className="text-xs text-text-premium/50 font-semibold block mt-0.5">
            Total listings: {metrics.totalParrots}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.04] shadow-sm text-left">
          <span className="text-[10px] text-text-premium/40 uppercase font-extrabold tracking-widest block">
            Reserved Birds
          </span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-1">
            {metrics.reservedParrots}
          </span>
          <span className="text-xs text-text-premium/50 font-semibold block mt-0.5">
            Pending transport details
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.04] shadow-sm text-left">
          <span className="text-[10px] text-text-premium/40 uppercase font-extrabold tracking-widest block">
            Sold Birds
          </span>
          <span className="text-3xl font-extrabold text-red-600 block mt-1">
            {metrics.soldParrots}
          </span>
          <span className="text-xs text-text-premium/50 font-semibold block mt-0.5">
            Successful transitions
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.04] shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] text-text-premium/40 uppercase font-extrabold tracking-widest block">
            Unread Inquiries
          </span>
          <span className={`text-3xl font-extrabold block mt-1 ${metrics.unreadMessages > 0 ? "text-amber-600 font-extrabold" : "text-text-premium/40"}`}>
            {metrics.unreadMessages}
          </span>
          <span className="text-xs text-text-premium/50 font-semibold block mt-0.5">
            Requires attention
          </span>
          {metrics.unreadMessages > 0 && (
            <MailWarning className="absolute right-4 bottom-4 h-12 w-12 text-amber-500/10 pointer-events-none" />
          )}
        </div>
      </section>

      {/* Directory Management Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="group flex gap-5 bg-white p-6 rounded-3xl border border-black/[0.05] hover:border-primary/20 hover:shadow-md transition-all duration-300 text-left relative"
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-103 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1.5 pr-8">
                <h3 className="font-extrabold text-base text-text-premium group-hover:text-primary transition-colors flex items-center gap-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-premium/60 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Unread Message Indicator Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-6 right-6 h-6 w-6 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-bounce">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

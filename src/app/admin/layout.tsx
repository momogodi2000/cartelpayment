import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Bird, ExternalLink, LogOut, ShieldCheck, Activity, Thermometer, Database } from "lucide-react";
import { verifyToken } from "@/lib/auth";

async function handleLogout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_logged_in");
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? await verifyToken(token) : null;

  // Auth pages (login, forgot-password, reset-password) — split-screen shell
  if (!user) {
    return (
      <div className="min-h-screen flex lg:flex-row flex-col bg-bg-premium text-text-premium font-sans relative overflow-hidden">
        {/* Left Panel: Aviary Telemetry & Brand Showcase (Desktop Only) */}
        <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden border-r border-black/[0.05] dark:border-white/[0.05] bg-gradient-to-br from-primary/5 via-bg-premium to-accent/5">
          {/* Watermark and Glow background overlays */}
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('/images/hero/hyacinth_macaw.png')` }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--primary-glow-stops))] from-primary/10 via-transparent to-transparent pointer-events-none opacity-60" />
          
          {/* Top Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white border border-black/[0.07] flex items-center justify-center p-1.5 shadow-sm shadow-primary/5">
              <Image src="/logo.png" alt="AraHaven Logo" width={32} height={32} className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-text-premium block">
                ARA<span className="text-accent">HAVEN</span>
              </span>
              <span className="text-[9px] text-primary font-bold tracking-widest uppercase block -mt-1">
                EXOTIC AVIARY
              </span>
            </div>
          </div>

          {/* Middle: Brand Core Message */}
          <div className="relative z-10 space-y-6 my-auto max-w-lg">
            <span className="text-[10px] tracking-widest font-black uppercase text-primary bg-primary/10 border border-primary/15 px-3 py-1 rounded-full w-fit block">
              SECURE ADMIN GATEWAY
            </span>
            <h2 className="text-3xl xl:text-4xl font-black font-heading leading-tight tracking-tight text-text-premium">
              Ethical breeding management, CITES legal tracing, and premium avian care.
            </h2>
            <p className="text-xs xl:text-sm text-text-premium/70 leading-relaxed font-semibold">
              Access the administrative core to manage exotic aviary records, respond to client inquiries, track pathogen screenings, and direct legal closed-loop shipping manifests.
            </p>
          </div>

          {/* Bottom: Diagnostics Panel */}
          <div className="relative z-10 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-black/[0.07] dark:border-white/[0.07] p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-text-premium/50 tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" /> Aviary Telemetry & Diagnostics
              </span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Sync Active
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-1">
              {[
                { label: "Nursery Temp", val: "37.5 °C", desc: "Optimal Range", icon: Thermometer },
                { label: "Hatch Rate", val: "96.8%", desc: "Incubators Online", icon: Bird },
                { label: "CITES Status", val: "Compliant", desc: "Appendix I & II", icon: ShieldCheck },
                { label: "System Health", val: "100%", desc: "Encrypted Node", icon: Database },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-1 text-text-premium/45">
                    <stat.icon className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <span className="text-sm font-black text-text-premium block">{stat.val}</span>
                  <span className="text-[8px] text-text-premium/40 block leading-none font-semibold">{stat.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Auth Forms Container */}
        <div className="flex flex-col flex-1 min-h-screen relative overflow-y-auto">
          {/* Mobile Background Watermark */}
          <div className="absolute inset-0 lg:hidden bg-cover bg-center opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('/images/hero/hyacinth_macaw.png')` }} />
          <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-primary/5 via-bg-premium to-bg-premium pointer-events-none" />
          
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </div>
      </div>
    );
  }

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--bg-premium))]">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-black/[0.07] dark:border-white/[0.07] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm flex items-center px-4 sm:px-6 gap-4">
        {/* Brand */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="AraHaven" width={24} height={24} className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-sm tracking-tight text-text-premium">
              ARA<span className="text-accent">HAVEN</span>
            </span>
            <span className="block text-[9px] text-primary font-bold tracking-widest uppercase -mt-0.5">
              Admin Panel
            </span>
          </div>
        </Link>

        {/* Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {[
            { href: "/admin/dashboard", label: "Overview" },
            { href: "/admin/dashboard/parrots", label: "Parrots" },
            { href: "/admin/dashboard/blog", label: "Blog" },
            { href: "/admin/dashboard/messages", label: "Messages" },
            { href: "/admin/dashboard/settings", label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-premium/60 hover:text-primary hover:bg-primary/5 transition-all duration-150"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {/* View Public Site */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-text-premium/60 dark:text-white/50 hover:text-primary hover:border-primary/30 transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Site
          </Link>

          {/* User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/15">
            <div className="h-6 w-6 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-text-premium/70 max-w-[140px] truncate">
              {user.email}
            </span>
            <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider hidden lg:block">
              {user.role}
            </span>
          </div>

          {/* Sign Out */}
          <form action={handleLogout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-all cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow">{children}</main>

      {/* Admin Footer */}
      <footer className="border-t border-black/[0.05] dark:border-white/[0.05] py-3 px-6 flex items-center justify-between text-[10px] text-text-premium/30 font-semibold">
        <span className="flex items-center gap-1.5">
          <Bird className="h-3 w-3" /> AraHaven Admin Panel
        </span>
        <span>© {new Date().getFullYear()} AraHaven Exotic Aviary</span>
      </footer>
    </div>
  );
}

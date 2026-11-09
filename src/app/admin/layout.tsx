import React from "react";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import {
  LayoutDashboard,
  PawPrint,
  ShoppingBag,
  CreditCard,
  Users,
  Headphones,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { actionAdminLogout } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Let the login page render independently
  let admin = null;

  try {
    const auth = await requireSuperAdmin();
    admin = auth.admin;
  } catch {
    // Unauthenticated: if accessing child pages, the individual layout / page enforces redirect
  }

  // If no active admin session, render public slot for login
  if (!admin) {
    return (
      <html lang="en">
        <body className="bg-zinc-50 min-h-screen text-zinc-900 antialiased font-sans">
          {children}
        </body>
      </html>
    );
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Animals & Inventory", href: "/admin/animals", icon: PawPrint },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Payments & Webhooks", href: "/admin/payments", icon: CreditCard },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Support Tickets", href: "/admin/support", icon: Headphones },
    { label: "Audit Logs", href: "/admin/audit", icon: ShieldCheck },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <html lang="en">
      <body className="bg-zinc-100 min-h-screen text-zinc-900 antialiased font-sans flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#183C32] text-white flex flex-col shrink-0 border-r border-emerald-950">
          <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#B69A65] font-extrabold block">
                European Concierge
              </span>
              <h1 className="font-serif text-2xl font-bold tracking-tight">
                Pawelium <span className="text-emerald-400 text-sm">2.0</span>
              </h1>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B69A65] text-zinc-950">
              SUPER_ADMIN
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="h-4 w-4 text-[#B69A65]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-emerald-900/50">
            <div className="mb-3">
              <p className="text-xs font-bold text-white truncate">{admin.name}</p>
              <p className="text-[11px] text-emerald-300 truncate">{admin.email}</p>
            </div>
            <form action={actionAdminLogout}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/50 hover:text-red-200 text-xs font-bold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto max-h-screen">
          <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <span>Pawelium European Administration</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">Live Mode Protected</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Authorized Session Active
              </span>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

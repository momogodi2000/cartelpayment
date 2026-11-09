import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import AdminLoginForm from "./AdminLoginForm";
import { Shield, Lock, ArrowLeft, KeyRound, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  try {
    await requireSuperAdmin();
    redirect("/admin");
  } catch {
    // Expected when unauthenticated
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0D1F1A] overflow-hidden selection:bg-[#B69A65]/30">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#183C32] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#B69A65] rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#B69A65_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-[#B69A65]/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] space-y-7">
        
        {/* Header / Brand identity */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-[#B69A65]/30 shadow-lg bg-[#183C32]">
            <Image
              src="/logo.png"
              alt="Pawelium Official Emblem"
              fill
              sizes="64px"
              className="object-cover p-0.5"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183C32]/8 border border-[#183C32]/15 text-[#183C32] text-[10px] font-extrabold uppercase tracking-widest">
            <Shield className="h-3 w-3 text-[#B69A65]" />
            <span>SUPER_ADMIN Authorized Portal</span>
          </div>

          <h1 className="font-serif text-3xl font-extrabold text-[#183C32] tracking-tight">
            Pawelium Admin
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            European purebred registry, order clearing & concierge control center.
          </p>
        </div>

        {/* Login form with interactive states */}
        <AdminLoginForm />

        {/* Footer info & return link */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-[#183C32] font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Marketplace</span>
          </Link>
          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Lock className="h-3 w-3 text-[#B69A65]" />
            <span>256-Bit Encrypted</span>
          </span>
        </div>
      </div>
    </div>
  );
}

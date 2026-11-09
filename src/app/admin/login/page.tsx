import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import AdminLoginForm from "./AdminLoginForm";
import { ShieldCheck, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  try {
    await requireSuperAdmin();
    redirect("/admin");
  } catch {
    // Expected when unauthenticated
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#183C32] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="h-7 w-7 text-[#B69A65]" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#B69A65]">
            Strict Access Control
          </span>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">
            Super Admin Portal
          </h1>
          <p className="text-xs text-zinc-500">
            Authenticate to manage the Pawelium European Pet Marketplace.
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}

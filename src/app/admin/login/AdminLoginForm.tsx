"use client";

import React, { useState } from "react";
import { actionAdminLogin } from "@/app/actions/admin";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showTotp, setShowTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (totpCode) formData.append("totpCode", totpCode);

    try {
      const res = await actionAdminLogin(formData);
      if (res.success) {
        window.location.href = "/admin";
      } else if (res.requiresMFA) {
        setShowTotp(true);
        setLoading(false);
      } else {
        setError(res.error || "Authentication failed.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">
          Super Admin Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@pawelium.fyi"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">
          Master Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••••"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
        </div>
      </div>

      {showTotp && (
        <div>
          <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Two-Factor Authentication Code (or Recovery Code)
          </label>
          <input
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.trim())}
            placeholder="6-digit code or XXXXX-XXXXX"
            className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#183C32] hover:bg-[#183C32]/90 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        <span>{showTotp ? "Verify & Enter Dashboard" : "Sign In to Admin"}</span>
      </button>

      <p className="text-[11px] text-center text-zinc-400">
        Account locks automatically after 5 consecutive failed attempts.
      </p>
    </form>
  );
}

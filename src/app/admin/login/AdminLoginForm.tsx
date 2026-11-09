"use client";

import React, { useState } from "react";
import { actionAdminLogin } from "@/app/actions/admin";
import { Loader2, Mail, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1.5">
          Super Admin Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            placeholder="admin@pawelium.fyi"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183C32] focus:border-[#183C32] transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1.5">
          Master Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full pl-10 pr-11 py-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183C32] focus:border-[#183C32] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showTotp && (
        <div className="p-4 rounded-2xl bg-[#183C32]/5 border border-[#183C32]/20 space-y-2 animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-[#183C32] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#B69A65]" />
            <span>Two-Factor Authentication Code (or Recovery Key)</span>
          </label>
          <input
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.trim())}
            autoFocus
            autoComplete="one-time-code"
            placeholder="6-digit TOTP or XXXXX-XXXXX"
            className="w-full px-4 py-2.5 rounded-xl border border-[#183C32]/30 bg-white text-sm text-center font-mono tracking-widest text-[#183C32] font-bold focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden group flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#183C32] hover:bg-[#122E26] text-white font-bold text-sm shadow-lg shadow-[#183C32]/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#B69A65]" />
        ) : null}
        <span>{showTotp ? "Verify Credentials & Enter" : "Sign In to Admin"}</span>
      </button>

      <p className="text-[11px] text-center text-zinc-400 font-medium">
        Strict single-admin policy: account auto-locks after 5 failed attempts.
      </p>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionAdminResetPassword } from "@/app/actions/admin";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ResetPasswordFormProps {
  token: string;
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  savePassword: string;
  passwordUpdated: string;
}

export default function ResetPasswordForm({
  token,
  newPasswordLabel,
  confirmPasswordLabel,
  savePassword,
  passwordUpdated,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("token", token);
    formData.append("newPassword", newPassword);

    try {
      const res = await actionAdminResetPassword(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } else {
        setError(res.error || "Reset failed.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Success</span>
        </div>
        <p className="leading-relaxed">{passwordUpdated}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800/40"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="new-password"
          className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {newPasswordLabel}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#183C32] focus:border-[#183C32] transition-all disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {confirmPasswordLabel}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#183C32] focus:border-[#183C32] transition-all disabled:opacity-60"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#183C32] hover:bg-[#122E26] text-white font-bold text-sm shadow-lg shadow-[#183C32]/20 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#B69A65]" /> : null}
        <span>{savePassword}</span>
      </button>
    </form>
  );
}

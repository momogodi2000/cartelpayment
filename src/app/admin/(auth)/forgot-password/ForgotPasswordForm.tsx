"use client";

import React, { useState } from "react";
import { actionAdminForgotPassword } from "@/app/actions/admin";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

interface ForgotPasswordFormProps {
  emailLabel: string;
  emailPlaceholder: string;
  sendResetLink: string;
  resetSentMessage: string;
}

export default function ForgotPasswordForm({
  emailLabel,
  emailPlaceholder,
  sendResetLink,
  resetSentMessage,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email.trim().toLowerCase());

    try {
      await actionAdminForgotPassword(formData);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Reset Request Dispatched</span>
        </div>
        <p className="leading-relaxed">{resetSentMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="forgot-email"
          className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {emailLabel}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder={emailPlaceholder}
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
        <span>{sendResetLink}</span>
      </button>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import { actionRequestTrackingOTP, actionVerifyTrackingOTP, actionLogoutTracking } from "@/app/actions/tracking";
import { Loader2, KeyRound, Mail, Hash, ShieldCheck, Truck, CheckCircle2, Clock, FileText } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Props {
  initialRef?: string;
  locale: string;
  authenticatedOrder?: any;
}

export default function TrackOrderClient({ initialRef, locale, authenticatedOrder }: Props) {
  const t = useTranslations("Tracking");
  const [step, setStep] = useState<"request" | "verify">(initialRef ? "verify" : "request");
  const [orderRef, setOrderRef] = useState(initialRef || "");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await actionRequestTrackingOTP(orderRef, email);
      setFeedback(res.message || t("genericOtpNotice"));
      setStep("verify");
    } catch {
      setFeedback(t("genericOtpNotice"));
      setStep("verify");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await actionVerifyTrackingOTP(orderRef, email, code);
    if (res.success) {
      window.location.reload();
    } else {
      setError(res.error || "Code invalid");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await actionLogoutTracking();
    window.location.reload();
  };

  if (authenticatedOrder) {
    const o = authenticatedOrder;
    const animal = o.item?.animal;
    const breedName = locale === "fr" ? animal?.breed?.nameFr : animal?.breed?.nameEn;

    const stages = [
      { key: "PAID", label: t("timelineStep1Title"), done: true },
      {
        key: "DOCUMENTATION_REVIEW",
        label: t("timelineStep2Title"),
        done: ["DOCUMENTATION_REVIEW", "PREPARING", "TRANSPORT_SCHEDULED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(o.status),
      },
      {
        key: "IN_TRANSIT",
        label: t("timelineStep3Title"),
        done: ["IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(o.status),
      },
      {
        key: "DELIVERED",
        label: t("timelineStep4Title"),
        done: ["DELIVERED", "COMPLETED"].includes(o.status),
      },
    ];

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-black/[0.06] dark:border-zinc-800 shadow-sm">
          <div>
            <span className="text-xs uppercase font-bold text-[#B69A65]">
              {t("title")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t("orderHeader")} #{o.reference}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {o.customer.name} ({o.customer.email})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 text-xs font-bold rounded-2xl border border-black/[0.1] dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {t("logoutBtn")}
          </button>
        </div>

        {/* Animal Snapshot */}
        {animal && (
          <div className="flex gap-6 items-center bg-[#F8F6F0] dark:bg-zinc-800/60 p-6 sm:p-8 rounded-3xl border border-black/[0.04] dark:border-zinc-700">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white shrink-0 border border-black/[0.06]">
              <Image
                src={animal.images?.[0]?.url || "/images/chien/golden-retriever-1.jpeg"}
                alt={animal.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B69A65]">
                {breedName}
              </span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {animal.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {animal.city}, {animal.country}
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-black/[0.06] dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
            {t("timelineTitle")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {stages.map((stage, idx) => (
              <div key={idx} className="relative flex md:flex-col items-center md:items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    stage.done
                      ? "bg-[#183C32] text-white shadow-md shadow-[#183C32]/20"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-400"
                  }`}
                >
                  {stage.done ? <CheckCircle2 className="w-5 h-5 text-[#B69A65]" /> : idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {stage.label}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {stage.done ? "Completed" : "In Queue"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-black/[0.06] dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#B69A65]" />
            <span>{t("documentsTitle")}</span>
          </h3>

          {animal?.documents?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {animal.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex justify-between items-center p-4 rounded-2xl bg-[#F8F6F0] dark:bg-zinc-800 border border-black/[0.04] dark:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#B69A65]" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {doc.title}
                    </span>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#183C32] dark:text-emerald-400 hover:underline"
                  >
                    {t("downloadBtn")}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("noDocumentsNotice")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-[#183C32]/10 text-[#183C32] rounded-3xl flex items-center justify-center mx-auto">
          <KeyRound className="h-8 w-8 text-[#B69A65]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t("subtitle")}
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-black/[0.06] dark:border-zinc-800 shadow-sm space-y-6">
        {feedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            {feedback}
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t("orderRefLabel")} *
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value.toUpperCase())}
                  required
                  placeholder={t("orderRefPlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t("emailLabel")} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("emailPlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-sm hover:bg-[#183C32]/90 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{loading ? t("requestingBtn") : t("requestCodeBtn")}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t("otpLabel")} *
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                required
                maxLength={6}
                placeholder={t("otpPlaceholder")}
                className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-2xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#183C32]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#183C32] text-white font-bold text-sm hover:bg-[#183C32]/90 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{loading ? t("verifyingBtn") : t("verifyBtn")}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← {t("orderRefLabel")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

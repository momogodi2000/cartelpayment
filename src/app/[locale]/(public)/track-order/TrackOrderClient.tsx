"use client";

import React, { useState } from "react";
import { actionRequestTrackingOTP, actionVerifyTrackingOTP, actionLogoutTracking } from "@/app/actions/tracking";
import { Loader2, KeyRound, Mail, Hash, ShieldCheck, Truck, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";

interface Props {
  initialRef?: string;
  locale: string;
  authenticatedOrder?: any;
}

export default function TrackOrderClient({ initialRef, locale, authenticatedOrder }: Props) {
  const isEn = locale === "en";
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
      setFeedback(res.message);
      setStep("verify");
    } catch {
      setFeedback("If an order matches these details, a code was sent.");
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
      setError(res.error || "Code invalide");
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

    const stages = [
      { key: "PAID", label: isEn ? "Payment Confirmed" : "Paiement Validé", done: true },
      {
        key: "DOCUMENTATION_REVIEW",
        label: isEn ? "Veterinary & Passport Review" : "Contrôle Vétérinaire & Passeport",
        done: ["DOCUMENTATION_REVIEW", "PREPARING", "TRANSPORT_SCHEDULED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(o.status),
      },
      {
        key: "PREPARING",
        label: isEn ? "Preparation for Transport" : "Préparation du Compagnon",
        done: ["PREPARING", "TRANSPORT_SCHEDULED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(o.status),
      },
      {
        key: "TRANSPORT_SCHEDULED",
        label: isEn ? "Authorized Courier Scheduled" : "Transporteur Agréé Planifié",
        done: ["TRANSPORT_SCHEDULED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(o.status),
      },
      {
        key: "IN_TRANSIT",
        label: isEn ? "In Transit Direct to Home" : "En cours d'acheminement direct",
        done: ["IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(o.status),
      },
      {
        key: "DELIVERED",
        label: isEn ? "Delivered & Handover" : "Livraison & Remise en main propre",
        done: ["DELIVERED", "COMPLETED"].includes(o.status),
      },
    ];

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/[0.06] shadow-sm">
          <div>
            <span className="text-xs uppercase font-bold text-[#B69A65]">
              {isEn ? "Order Tracking Portal" : "Espace de Suivi Officiel"}
            </span>
            <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
              {isEn ? "Order" : "Commande"} #{o.reference}
            </h2>
            <p className="text-xs text-gray-500">
              {isEn ? "Adopter:" : "Adoptant :"} {o.customer.name} ({o.customer.email})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-black/[0.1] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {isEn ? "Sign Out" : "Se déconnecter"}
          </button>
        </div>

        {/* Animal Snapshot */}
        {animal && (
          <div className="flex gap-4 items-center bg-[#F8F6F0] dark:bg-zinc-800/50 p-6 rounded-3xl border border-black/[0.04]">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white shrink-0">
              <Image
                src={animal.images[0]?.url || "/images/chien/golden-retriever-1.jpeg"}
                alt={animal.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#B69A65]">
                {animal.breed?.nameEn || "Breed"}
              </span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {animal.name}
              </h3>
              <p className="text-xs text-gray-500">
                {isEn ? "Microchip:" : "Puce électronique :"} {animal.microchip || "ISO certifiée"}
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? "Adoption Milestones & Progress" : "Étapes du Protocole d'Adoption"}
          </h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800">
            {stages.map((stage, idx) => (
              <div key={idx} className="relative flex items-center gap-4">
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    stage.done ? "bg-[#183C32]" : "bg-gray-200 dark:bg-zinc-700 text-gray-400"
                  }`}
                >
                  {stage.done ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      stage.done
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {stage.label}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          {o.delivery && (
            <div className="pt-6 border-t border-black/[0.06] space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <p>
                <strong>{isEn ? "Carrier:" : "Transporteur :"}</strong> {o.delivery.carrier || "Pawelium Pet Logistics"}
              </p>
              {o.delivery.notes && (
                <p>
                  <strong>{isEn ? "Logistics notes:" : "Consignes :"}</strong> {o.delivery.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not authenticated: render OTP request or verify
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#183C32]/10 text-[#183C32] rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound className="h-6 w-6 text-[#183C32]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
          {isEn ? "Access Your Order Tracking" : "Accéder à votre suivi"}
        </h2>
        <p className="text-xs text-gray-500">
          {isEn
            ? "Enter your order reference (PW-...) and email to receive a secure access code."
            : "Renseignez votre référence (PW-...) et votre email pour recevoir un code d'accès confidentiel."}
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          {feedback}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "Order Reference" : "Numéro de commande"}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value.toUpperCase())}
                placeholder="PW-ABC123XYZ0"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32] font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "Email Address" : "Adresse email utilisée lors de la commande"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="claire@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#183C32] text-white font-bold text-sm hover:bg-[#183C32]/90 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{isEn ? "Send Verification Code" : "Envoyer le code d'accès"}</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "Enter 6-digit Code" : "Code de vérification (6 chiffres)"}
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
              className="w-full px-4 py-3 rounded-xl border border-black/[0.1] text-center text-2xl font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#183C32] text-white font-bold text-sm hover:bg-[#183C32]/90 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{isEn ? "Verify & Access Tracking" : "Valider et ouvrir le suivi"}</span>
          </button>

          <button
            type="button"
            onClick={() => setStep("request")}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-900 pt-2"
          >
            {isEn ? "Change reference or email" : "Modifier la référence ou l'email"}
          </button>
        </form>
      )}
    </div>
  );
}

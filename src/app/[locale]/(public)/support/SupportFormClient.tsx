"use client";

import React, { useState } from "react";
import { actionCreateSupportTicket } from "@/app/actions/support";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/routing";

interface Props {
  locale: string;
}

export default function SupportFormClient({ locale }: Props) {
  const isEn = locale === "en";
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ ticketRef: string; accessToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("locale", locale);

    const res = await actionCreateSupportTicket(formData);
    setLoading(false);

    if (res.success && res.ticketRef && res.accessToken) {
      setCreatedResult({ ticketRef: res.ticketRef, accessToken: res.accessToken });
    } else {
      setError(res.error || "Une erreur est survenue lors de l'enregistrement de votre demande.");
    }
  };

  if (createdResult) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
          {isEn ? "Support Request Submitted!" : "Demande enregistrée avec succès !"}
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          {isEn
            ? "Your ticket has been forwarded to our support team. A private access link has also been emailed to you."
            : "Votre demande a été transmise à notre service dédié. Un lien de consultation confidentiel vous a été envoyé par email."}
        </p>
        <div className="inline-block bg-[#F8F6F0] dark:bg-zinc-800 px-6 py-3 rounded-2xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            {isEn ? "Ticket Reference" : "Numéro de ticket"}
          </span>
          <span className="font-mono text-lg font-bold text-[#183C32] dark:text-emerald-400">
            {createdResult.ticketRef}
          </span>
        </div>
        <div className="pt-2">
          <Link
            href={{ pathname: "/support/ticket/[token]", params: { token: createdResult.accessToken } }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183C32] text-white font-bold text-xs"
          >
            {isEn ? "Open Discussion Thread" : "Accéder à l'échange"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? "Your Full Name" : "Votre nom complet"} *
          </label>
          <input
            name="name"
            required
            placeholder="Arthur Pendelton"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? "Your Email" : "Votre adresse email"} *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="arthur@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? "Category" : "Objet principal"} *
          </label>
          <select
            name="category"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32] bg-white"
          >
            <option value="GENERAL">{isEn ? "General Question" : "Renseignement général"}</option>
            <option value="ORDER">{isEn ? "Adoption Order" : "Commande / Adoption"}</option>
            <option value="TRANSPORT">{isEn ? "Transport Logistics" : "Livraison & Acheminement"}</option>
            <option value="HEALTH">{isEn ? "Health & Vaccines" : "Santé & Documents Vétérinaires"}</option>
            <option value="BREEDER">{isEn ? "Breeder Partnership" : "Élevage & Partenariat"}</option>
            <option value="OTHER">{isEn ? "Other" : "Autre demande"}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? "Order Reference (optional)" : "Numéro de commande (optionnel)"}
          </label>
          <input
            name="orderRef"
            placeholder="PW-XXXXXXXXXX"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32] font-mono uppercase"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
          {isEn ? "Subject" : "Sujet"} *
        </label>
        <input
          name="subject"
          required
          placeholder={isEn ? "Question regarding delivery schedule..." : "Question sur l'horaire de livraison..."}
          className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
          {isEn ? "Message Description" : "Votre message détaillé"} *
        </label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder={isEn ? "Provide all relevant details..." : "Précisez votre demande..."}
          className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#183C32] text-white font-bold text-sm hover:bg-[#183C32]/90 shadow-md transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        <span>{isEn ? "Submit Support Request" : "Transmettre ma demande"}</span>
      </button>
    </form>
  );
}

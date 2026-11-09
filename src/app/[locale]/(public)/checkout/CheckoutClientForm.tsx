"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { startCheckout } from "@/app/actions/checkout";
import { Loader2, Lock, ShieldCheck, Check } from "lucide-react";
import { Link } from "@/i18n/routing";

const formSchema = z.object({
  name: z.string().min(2, "Nom complet requis / Full name required"),
  email: z.string().email("Adresse email valide requise / Valid email required"),
  phone: z.string().min(8, "Numéro de téléphone valide requis / Valid phone number required"),
  street: z.string().min(3, "Adresse postale requise / Street address required"),
  city: z.string().min(2, "Ville requise / City required"),
  postalCode: z.string().min(2, "Code postal requis / Postal code required"),
  country: z.string().min(2, "Pays requis / Country required"),
  deliveryMethod: z.enum(["standard", "express", "vip"]),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales / You must accept terms",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  animalId: string;
  locale: string;
}

export default function CheckoutClientForm({ animalId, locale }: Props) {
  const isEn = locale === "en";
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
      country: "France",
      deliveryMethod: "standard",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("animalId", animalId);
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("street", data.street);
    formData.append("city", data.city);
    formData.append("postalCode", data.postalCode);
    formData.append("country", data.country);
    formData.append("deliveryMethod", data.deliveryMethod);
    formData.append("termsAccepted", data.termsAccepted ? "true" : "false");
    formData.append("locale", locale);

    try {
      const result = await startCheckout(formData);
      if (result.success && result.checkoutUrl) {
        // Redirect to GeniusPay hosted checkout
        window.location.assign(result.checkoutUrl);
      } else {
        setServerError(result.error || "Une erreur est survenue lors de l'initiation du paiement.");
        setSubmitting(false);
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Erreur réseau.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
          {serverError}
        </div>
      )}

      {/* Customer Info */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white border-b border-black/[0.06] pb-2">
          {isEn ? "1. Adopter Identity" : "1. Identité de l'adoptant"}
        </h3>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? "Full Name" : "Nom et prénom complets"} *
          </label>
          <input
            {...register("name")}
            placeholder="Claire Dupont"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "Email Address" : "Adresse email"} *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="claire@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "Phone (with country code)" : "Téléphone (avec indicatif)"} *
            </label>
            <input
              {...register("phone")}
              placeholder="+33 6 12 34 56 78"
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="space-y-4 pt-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white border-b border-black/[0.06] pb-2">
          {isEn ? "2. Delivery Destination" : "2. Adresse de livraison & transport"}
        </h3>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? "Street Address" : "Adresse postale"} *
          </label>
          <input
            {...register("street")}
            placeholder="12 rue de la Paix"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
          {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street.message}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "City" : "Ville"} *
            </label>
            <input
              {...register("city")}
              placeholder="Paris"
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>}
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "Postal Code" : "Code postal"} *
            </label>
            <input
              {...register("postalCode")}
              placeholder="75002"
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.postalCode && (
              <p className="text-red-600 text-xs mt-1">{errors.postalCode.message}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? "Country" : "Pays"} *
            </label>
            <select
              {...register("country")}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32] bg-white"
            >
              <option value="France">France</option>
              <option value="Belgium">Belgique / Belgium</option>
              <option value="Switzerland">Suisse / Switzerland</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Germany">Allemagne / Germany</option>
              <option value="Spain">Espagne / Spain</option>
              <option value="Italy">Italie / Italy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Acceptance */}
      <div className="pt-4 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("termsAccepted")}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#183C32] focus:ring-[#183C32]"
          />
          <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {isEn ? (
              <>
                I acknowledge and accept the{" "}
                <Link href="/conditions-generales-de-vente" target="_blank" className="underline font-bold text-[#183C32]">
                  Terms and Conditions of Sale
                </Link>{" "}
                and the{" "}
                <Link href="/politique-de-confidentialite" target="_blank" className="underline font-bold text-[#183C32]">
                  Privacy Policy
                </Link>
                . I understand this initiates an official veterinary preparation protocol.
              </>
            ) : (
              <>
                Je reconnais avoir pris connaissance et j&apos;accepte sans réserve les{" "}
                <Link href="/conditions-generales-de-vente" target="_blank" className="underline font-bold text-[#183C32]">
                  Conditions Générales de Vente
                </Link>{" "}
                et la{" "}
                <Link href="/politique-de-confidentialite" target="_blank" className="underline font-bold text-[#183C32]">
                  Politique de Confidentialité
                </Link>
                . Je comprends que cet acte engage le protocole sanitaire vétérinaire officiel.
              </>
            )}
          </span>
        </label>
        {errors.termsAccepted && (
          <p className="text-red-600 text-xs">{errors.termsAccepted.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#183C32] hover:bg-[#183C32]/90 text-white font-bold text-base shadow-lg shadow-[#183C32]/10 transition-all disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{isEn ? "Initializing Secure Checkout..." : "Initialisation du paiement sécurisé..."}</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 text-[#B69A65]" />
            <span>{isEn ? "Proceed to Secure Payment (GeniusPay)" : "Valider et régler en ligne (GeniusPay)"}</span>
          </>
        )}
      </button>

      <p className="text-[11px] text-center text-gray-400">
        {isEn
          ? "Encrypted SSL transaction powered by GeniusPay merchant gateway. Real-time hold placed."
          : "Transaction chiffrée SSL assurée par la passerelle agréée GeniusPay. Réservation instantanée."}
      </p>
    </form>
  );
}

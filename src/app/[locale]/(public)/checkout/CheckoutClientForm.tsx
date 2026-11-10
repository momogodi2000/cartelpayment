"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { startCheckout } from "@/app/actions/checkout";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface Props {
  animalId: string;
  locale: string;
}

export default function CheckoutClientForm({ animalId, locale }: Props) {
  const t = useTranslations("Checkout");
  const tl = useTranslations("PublicPages.labels");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, t("fullName")),
    email: z.string().email(t("email")),
    phone: z.string().min(8, t("phone")),
    street: z.string().min(3, t("street")),
    city: z.string().min(2, t("city")),
    postalCode: z.string().min(2, t("postalCode")),
    country: z.string().min(2, t("country")),
    deliveryMethod: z.enum(["standard", "express", "vip"]),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: t("termsError"),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

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
        window.location.assign(result.checkoutUrl);
      } else {
        setServerError(result.error || t("termsError"));
        setSubmitting(false);
      }
    } catch {
      setServerError(t("errorNetwork"));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
          {serverError}
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-zinc-800 pb-2">
          {t("contactSection")}
        </h3>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {t("fullName")} *
          </label>
          <input
            {...register("name")}
            placeholder={t("fullNamePlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t("email")} *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t("phone")} *
            </label>
            <input
              {...register("phone")}
              placeholder={t("phonePlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="space-y-4 pt-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-zinc-800 pb-2">
          {t("deliverySection")}
        </h3>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {t("street")} *
          </label>
          <input
            {...register("street")}
            placeholder={t("streetPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
          />
          {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street.message}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t("city")} *
            </label>
            <input
              {...register("city")}
              placeholder={t("cityPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>}
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t("postalCode")} *
            </label>
            <input
              {...register("postalCode")}
              placeholder={t("postalCodePlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
            {errors.postalCode && (
              <p className="text-red-600 text-xs mt-1">{errors.postalCode.message}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t("country")} *
            </label>
            <select
              {...register("country")}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.1] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32] bg-white"
            >
              <option value="France">{t("countryFrance")}</option>
              <option value="Belgium">{t("countryBelgium")}</option>
              <option value="Switzerland">{t("countrySwitzerland")}</option>
              <option value="Luxembourg">{t("countryLuxembourg")}</option>
              <option value="Germany">{t("countryGermany")}</option>
              <option value="Spain">{t("countrySpain")}</option>
              <option value="Italy">{t("countryItaly")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transport Method */}
      <div className="space-y-4 pt-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-zinc-800 pb-2">
          {t("deliveryMethodSection")}
        </h3>

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-4 rounded-2xl border border-black/[0.06] dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer hover:border-[#183C32]">
            <input
              type="radio"
              value="standard"
              {...register("deliveryMethod")}
              className="h-4 w-4 text-[#183C32] focus:ring-[#183C32]"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {t("standardDelivery")}
            </span>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-2xl border border-black/[0.06] dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer hover:border-[#183C32]">
            <input
              type="radio"
              value="express"
              {...register("deliveryMethod")}
              className="h-4 w-4 text-[#183C32] focus:ring-[#183C32]"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {t("expressDelivery")}
            </span>
          </label>
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
            {t("termsCheckbox")}{" "}
            <Link href="/conditions-generales-de-vente" target="_blank" className="underline font-bold text-[#183C32] dark:text-emerald-400">
              {tl("termsLink")}
            </Link>{" "}
            {tl("and")}{" "}
            <Link href="/politique-de-confidentialite" target="_blank" className="underline font-bold text-[#183C32] dark:text-emerald-400">
              {tl("privacyLink")}
            </Link>
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
        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#183C32] hover:bg-[#183C32]/90 text-white font-bold text-base shadow-lg shadow-[#183C32]/10 transition-all disabled:opacity-50 cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("processingButton")}</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 text-[#B69A65]" />
            <span>{t("submitButton")}</span>
          </>
        )}
      </button>

      <p className="text-[11px] text-center text-gray-400">
        {t("secureBadge")}
      </p>
    </form>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { startCheckout, quoteCheckout } from "@/app/actions/checkout";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/domain/money";

interface Quote {
  eurCents: number;
  xofAmount: number;
  rate: string;
}

interface Props {
  animalId: string;
  locale: string;
  /** Server-computed EUR -> XOF quote, or null when the rate is unavailable. */
  initialQuote: Quote | null;
  /** True while the active card gateway charges XOF: disclosure + authorization are mandatory. */
  requiresXof: boolean;
}

export default function CheckoutClientForm({ animalId, locale, initialQuote, requiresXof }: Props) {
  const t = useTranslations("Checkout");
  const tl = useTranslations("PublicPages.labels");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(initialQuote);

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
    xofConsent: z.boolean().refine((val) => !requiresXof || val === true, {
      message: t("xofConsentError"),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    resetField,
    watch,
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
      xofConsent: false,
    },
  });

  // The order total depends on the delivery country and method: re-quote whenever either changes so the
  // amount the customer authorizes is always the one the server will charge.
  const country = watch("country");
  const deliveryMethod = watch("deliveryMethod");
  const [quoting, setQuoting] = useState(false);
  const firstQuote = useRef(true);
  useEffect(() => {
    if (!requiresXof) return;
    if (firstQuote.current) {
      firstQuote.current = false;
      if (country === "France" && deliveryMethod === "standard") return; // server-rendered quote already matches
    }
    let cancelled = false;
    setQuoting(true);
    quoteCheckout(animalId, country, deliveryMethod)
      .then((res) => {
        if (cancelled) return;
        setQuote(res.status === "ok" ? res.quote : null);
        resetField("xofConsent", { defaultValue: false });
        setServerError(null);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [animalId, country, deliveryMethod, requiresXof, resetField]);

  const onSubmit = async (data: FormValues) => {
    if (requiresXof && (!quote || quoting)) return;
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
    if (quote) {
      formData.append("xofConsent", data.xofConsent ? "true" : "false");
      formData.append("expectedXofAmount", String(quote.xofAmount));
    }
    formData.append("locale", locale);

    try {
      const result = await startCheckout(formData);
      if (result.success && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
      } else {
        // The server amount differs from what was shown: show the new one and require re-authorization.
        if (result.errorCode === "QUOTE_CHANGED" && result.quote) {
          setQuote(result.quote);
          resetField("xofConsent", { defaultValue: false });
        }
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

      {/* Actual charge disclosure: the provider processes this payment in XOF. */}
      {requiresXof && (
      <div className="pt-4 space-y-3">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-zinc-800 pb-2">
          {t("xofTitle")}
        </h3>
        {quote ? (
          <>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{t("xofExplain")}</p>
            <dl className="rounded-2xl bg-[#F8F6F0] dark:bg-zinc-800 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-300">{t("xofOrderAmount")}</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{formatMoney(quote.eurCents, "EUR", locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-300">{t("xofChargedAmount")}</dt>
                <dd className="font-bold text-gray-900 dark:text-white" data-testid="xof-amount">
                  {formatMoney(quote.xofAmount, "XOF", locale)}
                </dd>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{t("xofRate", { rate: quote.rate })}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{t("xofBankNote")}</p>
            </dl>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("xofConsent")}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#183C32] focus:ring-[#183C32]"
              />
              <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {t("xofConsent", { amount: formatMoney(quote.xofAmount, "XOF", locale) })}
              </span>
            </label>
            {errors.xofConsent && <p className="text-red-600 text-xs">{errors.xofConsent.message}</p>}
          </>
        ) : (
          <p className="text-xs font-semibold text-red-600">{t("xofUnavailable")}</p>
        )}
      </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || quoting || (requiresXof && !quote)}
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

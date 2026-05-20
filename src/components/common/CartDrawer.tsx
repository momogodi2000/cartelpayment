"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";
import { X, Trash2, ShoppingBag, ArrowRight, Check, Send, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processCheckout } from "@/app/actions/checkout";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const { language } = useApp();
  const { t } = useTranslation(language);

  const [step, setStep] = useState<"cart" | "form" | "success">("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
    preferredContact: "WHATSAPP" as "EMAIL" | "WHATSAPP" | "PHONE",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parrotIds = cart.map((item) => item.id);

    try {
      const res = await processCheckout({
        ...form,
        parrotIds,
      });

      if (res.success && res.whatsappText) {
        setStep("success");
        clearCart();
        // Redirect to WhatsApp
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
        const encodedText = encodeURIComponent(res.whatsappText);
        setTimeout(() => {
          window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, "_blank");
        }, 1500);
      } else {
        setError(res.error || "An unexpected error occurred.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to submit inquiry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-premium shadow-2xl z-50 flex flex-col border-l border-black/[0.06]"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-extrabold text-lg tracking-tight text-text-premium">
                  {t("cart.title")}
                </h2>
                <span className="bg-primary/10 text-primary font-bold text-xs px-2.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-black/[0.04] text-text-premium/60 hover:text-text-premium transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-grow overflow-y-auto p-6">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Cart Items */}
              {step === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                      <div className="h-16 w-16 rounded-full bg-black/[0.02] border border-dashed border-black/[0.08] flex items-center justify-center text-text-premium/30">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-semibold text-text-premium/60">
                        {t("cart.empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-black/[0.04] shadow-sm relative group"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-16 w-16 rounded-xl object-cover border border-black/[0.04]"
                          />
                          <div className="flex-grow min-w-0">
                            <h4 className="font-extrabold text-sm text-text-premium truncate">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                              {item.species}
                            </p>
                            <p className="text-xs font-bold text-accent mt-1">
                              ${item.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-lg text-text-premium/40 hover:text-red-500 hover:bg-red-50 transition-all absolute right-3 top-1/2 -translate-y-1/2 md:opacity-0 group-hover:opacity-100"
                            title={t("cart.remove")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Form */}
              {step === "form" && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
                  <p className="text-xs text-text-premium/70 leading-relaxed mb-4">
                    {t("checkout.description")}
                  </p>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-premium/60 uppercase tracking-wider block">
                      {t("checkout.name")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none bg-white text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-premium/60 uppercase tracking-wider block">
                      {t("checkout.email")} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none bg-white text-sm"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-premium/60 uppercase tracking-wider block">
                      {t("checkout.phone")} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none bg-white text-sm"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-premium/60 uppercase tracking-wider block">
                      {t("checkout.country")} *
                    </label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={form.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none bg-white text-sm"
                      placeholder="e.g. United States"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-premium/60 uppercase tracking-wider block">
                      {t("checkout.contact")} *
                    </label>
                    <select
                      name="preferredContact"
                      value={form.preferredContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none bg-white text-sm"
                    >
                      <option value="WHATSAPP">WhatsApp Message</option>
                      <option value="EMAIL">E-mail Response</option>
                      <option value="PHONE">Direct Voice Call</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-premium/60 uppercase tracking-wider block">
                      {t("checkout.message")}
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={form.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none bg-white text-sm resize-none"
                      placeholder="Ask about health reports, DNA tests, or specific transport requests..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center justify-center gap-2 mt-6 shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      t("checkout.loading")
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> {t("checkout.submit")}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="w-full py-3 text-xs text-text-premium/60 hover:text-text-premium font-semibold transition-colors"
                  >
                    Back to Review
                  </button>
                </form>
              )}

              {/* Step 3: Success */}
              {step === "success" && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="font-extrabold text-lg text-text-premium">
                    {t("checkout.success")}
                  </h3>
                  <p className="text-sm text-text-premium/60 max-w-xs leading-relaxed">
                    Your inquiry has been successfully registered. We are now preparing your customized files and opening WhatsApp to finalize breeding terms.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {step === "cart" && cart.length > 0 && (
              <div className="p-6 border-t border-black/[0.06] bg-black/[0.01] space-y-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-text-premium/60">{t("cart.subtotal")}</span>
                  <span className="text-lg font-extrabold text-accent">
                    ${cartTotal.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setStep("form")}
                  className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{t("cart.checkout")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from "react";
import { useCart, CartItem } from "@/context/CartContext";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";
import { ShoppingBag, Check } from "lucide-react";

interface AddToCartButtonProps {
  item: CartItem;
  status: string;
}

export default function AddToCartButton({ item, status }: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart();
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [added, setAdded] = useState(false);

  const inCart = isInCart(item.id);
  const isAvailable = status === "AVAILABLE";

  const handleAdd = () => {
    if (!isAvailable || inCart) return;
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!isAvailable) {
    return (
      <button
        disabled
        className="w-full sm:w-auto flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 bg-black/[0.04] text-text-premium/35 font-bold px-8 py-3.5 rounded-xl border border-black/[0.04] cursor-not-allowed text-sm"
      >
        {status === "RESERVED"
          ? (language === "en" ? "Reserved" : "Réservé")
          : (language === "en" ? "Sold" : "Vendu")}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={inCart}
      className={`w-full sm:w-auto flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-xl text-sm shadow-sm transition-all duration-300 ${
        inCart
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
          : "bg-primary hover:bg-primary-hover text-white hover:scale-[1.01] active:scale-[0.99]"
      }`}
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{t("cart.alreadyIn")}</span>
        </>
      ) : added ? (
        <>
          <Check className="h-4 w-4" />
          <span>{language === "en" ? "Added!" : "Ajouté !"}</span>
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          <span>{t("cart.add")}</span>
        </>
      )}
    </button>
  );
}

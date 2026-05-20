"use client";

import React, { useActionState, startTransition, useRef, useEffect } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface FormState {
  success: boolean;
  message: string;
}

const initialState: FormState = {
  success: false,
  message: "",
};

export default function NewsletterForm() {
  const { language } = useApp();
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
          {language === "en" ? "Aviary Newsletter" : "Lettre d'Information"}
        </h4>
        <p className="text-xs text-white/50 leading-relaxed mt-2">
          {language === "en"
            ? "Subscribe to receive announcements of new hatchlings, DNA results, and hand-raising progress guides."
            : "Inscrivez-vous pour recevoir les annonces d'oisillons, les résultats ADN et nos guides d'élevage."}
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="email"
              name="email"
              required
              placeholder={language === "en" ? "Enter your email" : "Votre adresse email"}
              className="w-full bg-white/[0.06] border border-white/10 hover:border-white/20 focus:border-primary focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-white/40 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {language === "en" ? "Join" : "S'inscrire"}
                </span>
              </>
            )}
          </button>
        </div>

        {state.message && (
          <div
            className={`p-3 rounded-lg text-[10px] font-semibold border ${
              state.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1.5"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {state.success && <CheckCircle className="h-3.5 w-3.5 shrink-0" />}
            <span>{state.message}</span>
          </div>
        )}
      </form>
    </div>
  );
}

"use client";

import React, { useActionState, startTransition } from "react";
import { Phone, Mail, MapPin, Send, MessageSquare, Award, Clock } from "lucide-react";
import { submitContactMessage } from "@/actions/messages";
import Honeypot from "@/components/common/Honeypot";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface FormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]> | null;
}

const initialState: FormState = {
  success: false,
  message: "",
  errors: null,
};

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50688888888";
  const generalWhatsapp = getWhatsAppLink(
    phone,
    "Hello! I visited your website and would like to ask some questions about your breeding methods."
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-text-premium tracking-tight">
          Contact AraHaven Aviary
        </h1>
        <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
          Have questions about species care, nursery reservations, or transport logistics? Write to our caretakers or chat with us instantly on WhatsApp.
        </p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-text-premium">Direct Contacts</h2>
            <p className="text-xs sm:text-sm text-text-premium/70 leading-relaxed">
              We respond promptly to inquiries. For immediate assistance regarding available birds, WhatsApp is the fastest method.
            </p>

            <div className="space-y-4">
              <a
                href={generalWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/70 transition-colors group"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-5 w-5 fill-white text-emerald-600" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-emerald-800 block">WhatsApp Chat</span>
                  <span className="text-xs text-emerald-600">Instant breeder response</span>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-premium/50 border border-black/[0.03]">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-text-premium block">San José, Costa Rica</span>
                  <span className="text-xs text-text-premium/60">Latin America Breeding Sanctuary</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-premium/50 border border-black/[0.03]">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-text-premium block">nursery@arahaven.com</span>
                  <span className="text-xs text-text-premium/60">For files & documentation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours & Certifications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-extrabold text-sm text-text-premium">Nursery Hours</span>
            </div>
            <p className="text-xs text-text-premium/70 pl-8 leading-relaxed">
              Monday – Saturday: 8:00 AM – 6:00 PM (GMT-6)<br />
              Sunday: Emergency calls & reservations only.
            </p>
            <div className="pt-2 border-t border-black/[0.04] flex items-center gap-3">
              <Award className="h-5 w-5 text-accent" />
              <span className="text-xs font-bold text-accent">CITES License: No. LA-882-EX</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-6"
          >
            <h2 className="text-xl font-extrabold text-text-premium">Send a Message</h2>
            <p className="text-xs sm:text-sm text-text-premium/70">
              Submit your questions, and our veterinary and transport support team will contact you.
            </p>

            {/* Anti-Spam Bot Honeypot */}
            <Honeypot />

            {/* Success / Error Messages */}
            {state.message && (
              <div
                className={`p-4 rounded-2xl text-sm font-semibold border ${
                  state.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {state.message}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-bold uppercase text-text-premium/70 tracking-wider">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
              {state.errors?.name && (
                <p className="text-xs text-red-600 font-bold">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-bold uppercase text-text-premium/70 tracking-wider">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
                {state.errors?.email && (
                  <p className="text-xs text-red-600 font-bold">{state.errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="block text-xs font-bold uppercase text-text-premium/70 tracking-wider">
                  Phone Number (with Country Code) *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
                {state.errors?.phone && (
                  <p className="text-xs text-red-600 font-bold">{state.errors.phone[0]}</p>
                )}
              </div>
            </div>

            {/* Parrot Reference */}
            <div className="space-y-1">
              <label
                htmlFor="parrotReference"
                className="block text-xs font-bold uppercase text-text-premium/70 tracking-wider"
              >
                Parrot Reference (Optional)
              </label>
              <input
                id="parrotReference"
                name="parrotReference"
                type="text"
                placeholder="e.g. Scarlet Macaw Baby"
                className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
              {state.errors?.parrotReference && (
                <p className="text-xs text-red-600 font-bold">{state.errors.parrotReference[0]}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label htmlFor="message" className="block text-xs font-bold uppercase text-text-premium/70 tracking-wider">
                Your Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Write your questions here..."
                className="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm resize-none"
              />
              {state.errors?.message && (
                <p className="text-xs text-red-600 font-bold">{state.errors.message[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold transition-all shadow-md shadow-primary/10 duration-200"
            >
              <Send className="h-4 w-4" />
              {isPending ? "Submitting Message..." : "Submit Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

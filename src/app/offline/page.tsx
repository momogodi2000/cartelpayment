"use client";

import React from "react";
import { WifiOff, Phone, Mail, MapPin, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleReconnect = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-8 flex flex-col justify-center min-h-[70vh]">
      {/* Icon */}
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
        <WifiOff className="h-10 w-10" />
      </div>

      {/* Info */}
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          You Are Offline
        </h1>
        <p className="text-sm text-text-premium/70 leading-relaxed">
          We are unable to reach the AraHaven servers right now. However, you can still view our emergency caretaker contacts below. We are here to help!
        </p>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm text-left space-y-4">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary shrink-0" />
          <div>
            <span className="font-extrabold text-xs text-text-premium/50 uppercase block">Phone / WhatsApp</span>
            <span className="font-semibold text-sm text-text-premium">+506 8888-8888</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary shrink-0" />
          <div>
            <span className="font-extrabold text-xs text-text-premium/50 uppercase block">Direct Email</span>
            <span className="font-semibold text-sm text-text-premium">nursery@arahaven.com</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <div>
            <span className="font-extrabold text-xs text-text-premium/50 uppercase block">Location</span>
            <span className="font-semibold text-sm text-text-premium">San José, Costa Rica</span>
          </div>
        </div>
      </div>

      {/* Reconnect button */}
      <div>
        <button
          onClick={handleReconnect}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Try Reconnecting
        </button>
      </div>
    </div>
  );
}

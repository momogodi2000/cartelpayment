"use client";

import React, { useState } from "react";
import { actionUpdateOrderStatus, actionRecordManualPayment } from "@/app/actions/admin";
import { ALLOWED_TRANSITIONS } from "@/lib/domain/order-state";
import { OrderStatus } from "@prisma/client";
import { Eye, CheckCircle2, AlertTriangle, Loader2, X } from "lucide-react";

interface Props {
  order: any;
}

export default function OrderActionModal({ order }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"details" | "status" | "manual_payment">("details");
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [transitionReason, setTransitionReason] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedNext = ALLOWED_TRANSITIONS[order.status as OrderStatus] || [];

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("orderId", order.id);
    formData.append("status", newStatus);
    formData.append("reason", transitionReason);

    try {
      await actionUpdateOrderStatus(formData);
      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to update order status.");
      setLoading(false);
    }
  };

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("orderId", order.id);
    formData.append("bankReference", bankRef);
    formData.append("justification", justification);

    try {
      await actionRecordManualPayment(formData);
      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to record manual payment.");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center gap-1 transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>Manage</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {order.reference}
                </span>
                <h3 className="font-serif text-2xl font-bold text-zinc-900 mt-1">
                  Order Management
                </h3>
                <p className="text-xs text-zinc-500">
                  Current Status: <strong className="text-zinc-900">{order.status}</strong>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-200 pb-2 text-xs font-bold">
              <button
                onClick={() => setTab("details")}
                className={`px-3 py-1.5 rounded-lg ${tab === "details" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}
              >
                Details & History
              </button>
              <button
                onClick={() => setTab("status")}
                className={`px-3 py-1.5 rounded-lg ${tab === "status" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}
              >
                Transition Status
              </button>
              {order.status !== "PAID" && (
                <button
                  onClick={() => setTab("manual_payment")}
                  className={`px-3 py-1.5 rounded-lg ${tab === "manual_payment" ? "bg-emerald-900 text-white" : "text-emerald-700 hover:bg-emerald-50"}`}
                >
                  Record Manual Payment
                </button>
              )}
            </div>

            {tab === "details" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <div>
                    <span className="text-zinc-400 block font-semibold">Adopter Details</span>
                    <p className="font-bold text-zinc-800">{order.customer.name}</p>
                    <p className="text-zinc-600">{order.customer.email}</p>
                    <p className="text-zinc-600">{order.customer.phone}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-semibold">Animal Companion</span>
                    <p className="font-bold text-zinc-800">{order.item?.animalName}</p>
                    <p className="text-zinc-600">Breed: {order.item?.breedName}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 mb-2">Order Status History</h4>
                  <div className="space-y-2 border border-zinc-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                    {order.statusHistory.map((h: any) => (
                      <div key={h.id} className="flex justify-between text-[11px] border-b border-zinc-100 pb-1">
                        <div>
                          <span className="font-bold">{h.toStatus}</span>
                          {h.reason && <span className="text-zinc-500"> — {h.reason}</span>}
                        </div>
                        <span className="text-zinc-400">{new Date(h.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "status" && (
              <form onSubmit={handleStatusTransition} className="space-y-4 text-xs">
                <p className="text-zinc-500">
                  Super Admin transition enforcement. Transitioning to PAID directly is strictly prohibited (use verified payment webhooks or the manual payment authorization tab).
                </p>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Select Next Valid State</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white"
                  >
                    <option value="">Choose allowed next state...</option>
                    {allowedNext
                      .filter((s) => s !== "PAID")
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Reason / Notes</label>
                  <input
                    value={transitionReason}
                    onChange={(e) => setTransitionReason(e.target.value)}
                    placeholder="e.g. Health certificate signed and approved"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !newStatus}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Confirm State Transition"}
                </button>
              </form>
            )}

            {tab === "manual_payment" && (
              <form onSubmit={handleManualPayment} className="space-y-4 text-xs">
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                  <strong>Authorized Manual Clearance Protocol:</strong>
                  <br />
                  This action marks the animal as SOLD, converts the active reservation, sets order status to PAID, and queues the customer confirmation email. It is permanently logged in the immutable audit trail.
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Bank Transfer Reference / Wire Confirmation ID *
                  </label>
                  <input
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. WIRE-BNP-20261109-094"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Detailed Written Justification (minimum 10 characters) *
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                    placeholder="Explain transaction origin, account confirmation date, and clearance verification..."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || bankRef.length < 3 || justification.length < 10}
                  className="w-full py-2.5 rounded-xl bg-[#183C32] text-white font-bold hover:bg-[#183C32]/90 disabled:opacity-50"
                >
                  {loading ? "Recording Transaction..." : "Authorize Documented Manual Payment"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

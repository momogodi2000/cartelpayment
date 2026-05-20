"use client";

import React, { useState } from "react";
import { MailOpen, Trash2, Calendar, Phone, ArrowLeft, MessageSquare, ShoppingBag, Globe } from "lucide-react";
import Link from "next/link";
import { markMessageAsRead, deleteMessage } from "@/actions/messages";
import { updateInquiryStatus, deleteInquiry } from "@/actions/inquiries";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  parrotReference: string | null;
  read: boolean;
  createdAt: Date | string;
}

interface CartInquiryItem {
  id: string;
  parrot: {
    id: string;
    name: string;
    species: string;
    price: number;
    slug: string;
  };
}

interface CartInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  preferredContact: string;
  status: InquiryStatus;
  createdAt: Date | string;
  items: CartInquiryItem[];
}

type InquiryStatus = "PENDING" | "COMPLETED" | "ARCHIVED";

interface MessagesClientProps {
  initialMessages: Message[];
  initialInquiries: CartInquiry[];
}

export default function MessagesClient({ initialMessages, initialInquiries }: MessagesClientProps) {
  const [activeTab, setActiveTab] = useState<"inquiries" | "messages">("inquiries");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inquiries, setInquiries] = useState<CartInquiry[]>(initialInquiries);

  // Filters
  const [msgFilter, setMsgFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [inqFilter, setInqFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "ARCHIVED">("ALL");

  // General Message actions
  const handleMarkAsRead = async (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
    const res = await markMessageAsRead(id);
    if (!res.success) {
      alert("Failed to update status. Reverting...");
      setMessages(initialMessages);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const previous = [...messages];
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    const res = await deleteMessage(id);
    if (!res.success) {
      alert("Failed to delete. Reverting...");
      setMessages(previous);
    }
  };

  // Cart Inquiry actions
  const handleUpdateInquiryStatus = async (id: string, status: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
    const res = await updateInquiryStatus(id, status);
    if (!res.success) {
      alert("Failed to update status. Reverting...");
      setInquiries(initialInquiries);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation inquiry? This will NOT release the parrot lock automatically unless manual status changes are performed.")) return;
    const previous = [...inquiries];
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    const res = await deleteInquiry(id);
    if (!res.success) {
      alert("Failed to delete inquiry. Reverting...");
      setInquiries(previous);
    }
  };

  // Filters execution
  const filteredMessages = messages.filter((msg) => {
    if (msgFilter === "UNREAD") return !msg.read;
    if (msgFilter === "READ") return msg.read;
    return true;
  });

  const filteredInquiries = inquiries.filter((inq) => {
    if (inqFilter === "PENDING") return inq.status === "PENDING";
    if (inqFilter === "COMPLETED") return inq.status === "COMPLETED";
    if (inqFilter === "ARCHIVED") return inq.status === "ARCHIVED";
    return true;
  });

  const unreadMessagesCount = messages.filter((m) => !m.read).length;
  const pendingInquiriesCount = inquiries.filter((i) => i.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Tab Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.04] pb-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/50 hover:text-primary transition-colors text-left"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-black/[0.02] p-1.5 rounded-xl border border-black/[0.04]">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "inquiries"
                ? "bg-white text-primary shadow-sm"
                : "text-text-premium/60 hover:text-text-premium"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Reservations</span>
            {pendingInquiriesCount > 0 && (
              <span className="bg-primary text-white text-[9px] font-extrabold h-4.5 w-4.5 rounded-full flex items-center justify-center">
                {pendingInquiriesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "messages"
                ? "bg-white text-primary shadow-sm"
                : "text-text-premium/60 hover:text-text-premium"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>General Inbox</span>
            {unreadMessagesCount > 0 && (
              <span className="bg-primary text-white text-[9px] font-extrabold h-4.5 w-4.5 rounded-full flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Filters per Tab */}
      <div className="flex items-center justify-end">
        {activeTab === "messages" ? (
          <div className="flex items-center gap-2">
            {(["ALL", "UNREAD", "READ"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setMsgFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  msgFilter === opt
                    ? "bg-primary text-white"
                    : "bg-white border border-black/[0.05] text-text-premium/60 hover:bg-black/[0.01]"
                }`}
              >
                {opt === "ALL" ? "All Messages" : opt === "UNREAD" ? "Unread" : "Archived"}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {(["ALL", "PENDING", "COMPLETED", "ARCHIVED"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setInqFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inqFilter === opt
                    ? "bg-primary text-white"
                    : "bg-white border border-black/[0.05] text-text-premium/60 hover:bg-black/[0.01]"
                }`}
              >
                {opt === "ALL" ? "All Statuses" : opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content Rendering */}
      {activeTab === "inquiries" ? (
        /* Reservation Inquiries list */
        filteredInquiries.length === 0 ? (
          <div className="text-center py-20 bg-white border border-black/[0.06] rounded-3xl shadow-sm">
            <p className="text-text-premium/50 text-sm font-semibold">No reservation inquiries found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInquiries.map((inq) => {
              const totalAmount = inq.items.reduce((sum, item) => sum + Number(item.parrot.price), 0);
              return (
                <div
                  key={inq.id}
                  className={`p-6 rounded-3xl border transition-all bg-white text-left flex flex-col gap-5 ${
                    inq.status === "PENDING" ? "border-primary shadow-sm bg-primary/[0.005]" : "border-black/[0.05]"
                  }`}
                >
                  {/* Inquiry Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-black/[0.04] pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-extrabold text-base text-text-premium">{inq.name}</span>
                        <span className="text-xs text-text-premium/50 font-semibold">{inq.email}</span>
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-black/[0.03] text-text-premium/60 border border-black/[0.05] flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {inq.country}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-text-premium/50 font-semibold mt-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{inq.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(inq.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-primary font-bold">
                          Contact by: {inq.preferredContact}
                        </div>
                      </div>
                    </div>

                    {/* Status update Actions */}
                    <div className="flex items-center gap-2 self-end md:self-start">
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as InquiryStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                          inq.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : inq.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-all"
                        title="Delete inquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Reserved Birds Details */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-premium/50 uppercase font-extrabold tracking-widest block">
                      Reserved Exotic Companions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {inq.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-black/[0.01] border border-black/[0.03] flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-extrabold text-text-premium">{item.parrot.name}</p>
                            <p className="text-[10px] text-text-premium/50 italic">{item.parrot.species}</p>
                          </div>
                          <span className="font-bold text-accent">${item.parrot.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Message & Total */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/[0.01] p-4 rounded-2xl border border-black/[0.03] mt-2">
                    <div className="text-xs text-text-premium/70 max-w-xl">
                      <span className="font-bold block mb-1">Message:</span>
                      <p className="italic leading-relaxed">&quot;{inq.message || "No special requests provided."}&quot;</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] uppercase font-bold text-text-premium/40 block">Inquiry Value</span>
                      <span className="text-lg font-extrabold text-primary">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* General Inbox List */
        filteredMessages.length === 0 ? (
          <div className="text-center py-20 bg-white border border-black/[0.06] rounded-3xl shadow-sm">
            <p className="text-text-premium/50 text-sm font-semibold">No general contact messages found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 rounded-3xl border transition-all bg-white text-left flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                  !msg.read ? "border-primary shadow-sm bg-primary/[0.005]" : "border-black/[0.05]"
                }`}
              >
                {/* Message Content */}
                <div className="space-y-3 flex-grow max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-extrabold text-base text-text-premium">{msg.name}</span>
                    <span className="text-xs text-text-premium/50 font-semibold">{msg.email}</span>
                    {msg.parrotReference && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        Ref: {msg.parrotReference}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-text-premium/80 leading-relaxed whitespace-pre-line">
                    {msg.message}
                  </p>

                  {/* Sub Metadata */}
                  <div className="flex flex-wrap gap-4 text-xs text-text-premium/50 font-semibold pt-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{msg.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkAsRead(msg.id)}
                      className="p-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 text-primary transition-all"
                      title="Mark as Read"
                    >
                      <MailOpen className="h-4.5 w-4.5" />
                    </button>
                  )}
                  {msg.read && (
                    <span className="text-xs text-emerald-600 font-bold border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                      Read
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-all"
                    title="Delete message"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

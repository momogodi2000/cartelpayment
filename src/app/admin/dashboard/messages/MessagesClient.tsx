"use client";

import React, { useState } from "react";
import { Mail, MailOpen, Trash2, Calendar, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { markMessageAsRead, deleteMessage } from "@/actions/messages";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  parrotReference: string | null;
  read: boolean;
  createdAt: Date | any;
}

interface MessagesClientProps {
  initialMessages: Message[];
}

export default function MessagesClient({ initialMessages }: MessagesClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );

    const res = await markMessageAsRead(id);
    if (!res.success) {
      alert("Failed to update status. Reverting...");
      // Revert if error
      setMessages(initialMessages);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    // Optimistic UI update
    const previous = [...messages];
    setMessages((prev) => prev.filter((msg) => msg.id !== id));

    const res = await deleteMessage(id);
    if (!res.success) {
      alert("Failed to delete. Reverting...");
      setMessages(previous);
    }
  };

  const filtered = messages.filter((msg) => {
    if (filter === "UNREAD") return !msg.read;
    if (filter === "READ") return msg.read;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to CMS
        </Link>
        <div className="flex items-center gap-2">
          {(["ALL", "UNREAD", "READ"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                filter === opt
                  ? "bg-primary text-white"
                  : "bg-white border border-black/[0.05] hover:bg-black/[0.01] text-text-premium/70"
              }`}
            >
              {opt === "ALL" ? "All Inbox" : opt === "UNREAD" ? "Unread" : "Archived"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-black/[0.06] rounded-3xl shadow-sm">
          <p className="text-text-premium/50 text-sm font-semibold">No messages found in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
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
                  onClick={() => handleDelete(msg.id)}
                  className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-all"
                  title="Delete message"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

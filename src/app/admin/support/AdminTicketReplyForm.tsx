"use client";

import React, { useState } from "react";
import { actionAdminReplyTicket } from "@/app/actions/admin";
import { Send, Lock, Loader2 } from "lucide-react";

export default function AdminTicketReplyForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("ticketId", ticketId);
    formData.append("body", body);
    formData.append("isInternalNote", isInternalNote ? "true" : "false");

    await actionAdminReplyTicket(formData);
    setBody("");
    setLoading(false);
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-4 text-xs font-bold">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="replyType"
            checked={!isInternalNote}
            onChange={() => setIsInternalNote(false)}
            className="text-[#183C32]"
          />
          <span>Reply to Customer</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer text-amber-800">
          <input
            type="radio"
            name="replyType"
            checked={isInternalNote}
            onChange={() => setIsInternalNote(true)}
            className="text-amber-600"
          />
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Internal Confidential Note
          </span>
        </label>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={
          isInternalNote
            ? "Record internal notes, transporter updates, or private staff comments..."
            : "Write a response to the customer..."
        }
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
          isInternalNote
            ? "border-amber-300 bg-amber-50/50 focus:ring-amber-500"
            : "border-zinc-300 focus:ring-[#183C32]"
        }`}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
            isInternalNote ? "bg-amber-700 hover:bg-amber-800" : "bg-[#183C32] hover:bg-[#183C32]/90"
          }`}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          <span>{isInternalNote ? "Save Internal Note" : "Send Customer Reply"}</span>
        </button>
      </div>
    </form>
  );
}

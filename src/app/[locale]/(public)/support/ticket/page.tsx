'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Shield,
  ArrowLeft,
} from 'lucide-react';

function SupportTicketDetailContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('token') || '';

  const [ticketRef, setTicketRef] = useState(initialRef);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchTicket = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/support/ticket?ref=${encodeURIComponent(ref.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ticket not found.');
      }

      setTicket(data.ticket);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchTicket(initialRef);
    }
  }, [initialRef]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticket) return;

    setReplying(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ticket.secureToken,
          message: replyMessage.trim(),
          senderName: ticket.customerName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit response.');
      }

      setTicket(data.ticket);
      setReplyMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error submitting reply: ${msg}`);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/support"
            className="inline-flex items-center space-x-1.5 text-xs text-[#183C32] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Support Overview</span>
          </Link>
        </div>

        {!ticket ? (
          <div className="bg-white p-8 rounded-xl border border-[#EDE7DC] shadow-sm max-w-md mx-auto">
            <h2 className="text-xl font-serif text-[#183C32] mb-1">Support Ticket Lookup</h2>
            <p className="text-xs text-gray-500 mb-6">Enter your ticket reference (e.g. TCK-84920)</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchTicket(ticketRef);
              }}
              className="space-y-4"
            >
              <div>
                <input
                  type="text"
                  required
                  placeholder="TCK-12345"
                  value={ticketRef}
                  onChange={(e) => setTicketRef(e.target.value.toUpperCase())}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:ring-1 focus:ring-[#183C32] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#183C32] hover:bg-[#122e26] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Find Ticket Conversation'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#EDE7DC] shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[#183C32] bg-[#F8F6F0] px-2.5 py-1 rounded border border-[#EDE7DC]">
                    {ticket.ticketReference}
                  </span>
                  <h1 className="text-xl font-serif text-[#202823] font-bold mt-2">{ticket.subject}</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Category: <strong>{ticket.category}</strong>
                    {ticket.orderReference && <span> · Order: <strong>{ticket.orderReference}</strong></span>}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                      ticket.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ticket.status === 'WAITING_FOR_CUSTOMER'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    Status: {ticket.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4 my-6">
                {ticket.messages?.map((msg: any) => {
                  const isAdmin = msg.senderType === 'ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-[#183C32]/5 border border-[#183C32]/10 ml-4 sm:ml-8'
                          : 'bg-gray-50 border border-gray-100 mr-4 sm:mr-8'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-xs flex items-center space-x-1.5 text-gray-800">
                          {isAdmin ? (
                            <>
                              <Shield className="w-3.5 h-3.5 text-[#183C32]" />
                              <span className="text-[#183C32]">Pawelium Concierge Support</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3.5 h-3.5 text-gray-500" />
                              <span>{msg.senderName}</span>
                            </>
                          )}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="pt-4 border-t space-y-3">
                <label className="block text-xs font-medium text-gray-700">Add a Response</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type your response here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#183C32] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={replying || !replyMessage.trim()}
                  className="bg-[#183C32] hover:bg-[#122e26] text-white px-5 py-2.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#B69A65]" />
                  <span>{replying ? 'Sending...' : 'Send Response'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupportTicketDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F0] py-20 text-center font-serif text-[#183C32]">
          Loading conversation thread...
        </div>
      }
    >
      <SupportTicketDetailContent />
    </Suspense>
  );
}

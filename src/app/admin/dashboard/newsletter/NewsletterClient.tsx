"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, Plus, CheckCircle, Trash2, ToggleLeft, ToggleRight, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toggleSubscriberStatus, deleteSubscriber } from "@/actions/newsletter";
import { createCampaign, deleteCampaign, sendCampaign } from "@/actions/campaigns";

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt: Date | string;
}

interface CampaignRecipient {
  id: string;
  email: string;
  status: string;
}

interface Campaign {
  id: string;
  title: string;
  subject: string;
  body: string;
  status: string;
  createdAt: Date | string;
  sentAt: Date | string | null;
  recipients?: CampaignRecipient[];
}

interface NewsletterClientProps {
  initialSubscribers: Subscriber[];
  initialCampaigns: Campaign[];
}

export default function NewsletterClient({ initialSubscribers, initialCampaigns }: NewsletterClientProps) {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  // Campaign Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actions
  const handleToggleActive = async (id: string) => {
    setSubscribers((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, active: !sub.active } : sub))
    );
    const res = await toggleSubscriberStatus(id);
    if (!res.success) {
      alert("Failed to change status. Reverting...");
      setSubscribers(initialSubscribers);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    const previous = [...subscribers];
    setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
    const res = await deleteSubscriber(id);
    if (!res.success) {
      alert("Failed to delete subscriber. Reverting...");
      setSubscribers(previous);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createCampaign({ title, subject, body });
    if (res.success && res.campaign) {
      setCampaigns([res.campaign as any, ...campaigns]);
      setTitle("");
      setSubject("");
      setBody("");
      setShowCreateModal(false);
    } else {
      setError(res.error || "Failed to create campaign");
    }
    setLoading(false);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    const previous = [...campaigns];
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    const res = await deleteCampaign(id);
    if (!res.success) {
      alert("Failed to delete campaign. Reverting...");
      setCampaigns(previous);
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to send this campaign now? This will immediately broadcast emails to ALL active subscribers!")) return;
    setLoading(true);
    const res = await sendCampaign(id);
    if (res.success) {
      alert("Campaign broadcast finished! Reloading updates...");
      window.location.reload();
    } else {
      alert(res.error || "Failed to send campaign");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Back & Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.04] pb-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/50 hover:text-primary transition-colors text-left"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 bg-black/[0.02] p-1.5 rounded-xl border border-black/[0.04]">
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "subscribers"
                ? "bg-white text-primary shadow-sm"
                : "text-text-premium/60 hover:text-text-premium"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Active Subscribers</span>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {subscribers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "campaigns"
                ? "bg-white text-primary shadow-sm"
                : "text-text-premium/60 hover:text-text-premium"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Broadcast Campaigns</span>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {campaigns.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {activeTab === "subscribers" ? (
        /* Subscribers list view */
        <div className="bg-white border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-black/[0.04] flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-text-premium">Subscribers Database</h3>
          </div>
          {subscribers.length === 0 ? (
            <div className="text-center py-20 text-text-premium/45 font-semibold text-sm">
              No newsletter subscribers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-black/[0.01] border-b border-black/[0.04]">
                    <th className="px-6 py-3 font-extrabold text-text-premium/50 uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-3 font-extrabold text-text-premium/50 uppercase tracking-wider">Subscribed On</th>
                    <th className="px-6 py-3 font-extrabold text-text-premium/50 uppercase tracking-wider">Active Status</th>
                    <th className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-black/[0.03] hover:bg-black/[0.005] transition-colors">
                      <td className="px-6 py-4 font-bold text-text-premium">{sub.email}</td>
                      <td className="px-6 py-4 text-text-premium/60 font-semibold">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(sub.id)}
                          className={`inline-flex items-center gap-1.5 font-bold transition-all px-2.5 py-1 rounded-lg border ${
                            sub.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {sub.active ? (
                            <>
                              <ToggleRight className="h-4.5 w-4.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4.5 w-4.5 text-red-400" />
                              <span>Paused</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                          title="Delete subscriber"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Campaigns management view */
        <div className="space-y-6">
          {/* Create Campaign Controls */}
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-text-premium">Previous Broadcasts</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Draft New Campaign
            </button>
          </div>

          {/* Campaigns Lists */}
          {campaigns.length === 0 ? (
            <div className="text-center py-20 bg-white border border-black/[0.06] rounded-3xl shadow-sm">
              <p className="text-text-premium/50 text-sm font-semibold">No email campaigns created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => {
                const recipientsList = c.recipients || [];
                const sentCount = recipientsList.filter((r) => r.status === "SENT").length;
                const failedCount = recipientsList.filter((r) => r.status === "FAILED").length;
                return (
                  <div
                    key={c.id}
                    className="p-6 rounded-3xl border border-black/[0.05] bg-white text-left flex flex-col md:flex-row justify-between gap-6 hover:shadow-sm transition-all"
                  >
                    <div className="space-y-3 flex-grow max-w-3xl">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-text-premium">{c.title}</span>
                          <span
                            className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                              c.status === "SENT"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-premium/50 font-semibold mt-1">
                          Subject: <span className="text-text-premium/80 font-bold">{c.subject}</span>
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-black/[0.01] border border-black/[0.03] text-xs text-text-premium/70 leading-relaxed font-mono overflow-y-auto max-h-32">
                        {c.body}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-premium/50">
                        <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                        {c.sentAt && <span>Sent: {new Date(c.sentAt).toLocaleString()}</span>}
                        {c.status === "SENT" && (
                          <div className="flex gap-2">
                            <span className="text-emerald-600">Sent: {sentCount}</span>
                            {failedCount > 0 && <span className="text-red-500">Failed: {failedCount}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 self-end md:self-center">
                      {c.status === "DRAFT" && (
                        <button
                          onClick={() => handleSendCampaign(c.id)}
                          disabled={loading}
                          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" /> Broadcast Now
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(c.id)}
                        className="p-2.5 rounded-xl border border-red-100 hover:bg-red-50 text-red-600 transition-all"
                        title="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-black/[0.05] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-black/[0.04] pb-4">
              <h2 className="text-lg font-extrabold text-text-premium">Draft Newsletter Campaign</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-premium/50 hover:text-text-premium font-bold text-xs"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-premium/60 uppercase tracking-wider block">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. May Hatchlings Announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-sm bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-premium/60 uppercase tracking-wider block">Email Subject line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rare DNA-Certified Parrot Hatchlings Now Available!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-sm bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-premium/60 uppercase tracking-wider block">Email HTML Body</label>
                <textarea
                  required
                  rows={8}
                  placeholder="<p>Dear customer,</p><p>We have incredible news! Four new baby Hyacinth Macaws have just graduated from hand-raising nursery...</p>"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-xs bg-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-colors mt-6 flex items-center justify-center gap-2"
              >
                {loading ? "Drafting..." : "Create Campaign Draft"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

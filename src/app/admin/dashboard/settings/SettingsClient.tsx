"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, ShieldCheck, Clock, Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { updateSiteSetting } from "@/actions/settings";

interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: Date | string;
}

interface SettingsClientProps {
  initialSettings: SiteSetting[];
  initialLogs: AuditLog[];
}

export default function SettingsClient({ initialSettings, initialLogs }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "logs">("settings");
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const record: Record<string, string> = {
      site_name: "AraHaven Aviary",
      maintenance_mode: "false",
      whatsapp_number: "50688888888",
      contact_email: "nursery@arahaven.com",
      site_url: "http://localhost:3000",
    };
    initialSettings.forEach((item) => {
      record[item.key] = item.value;
    });
    return record;
  });

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Audit Logs Filter
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);

  const handleSaveSetting = async (key: string) => {
    setSavingKey(key);
    setSuccessMsg(null);
    const value = settings[key];
    const res = await updateSiteSetting(key, value);
    if (res.success) {
      setSuccessMsg(`Setting '${key}' updated successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      alert(res.error || `Failed to save setting '${key}'`);
    }
    setSavingKey(null);
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.userEmail.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Back and Tab Header */}
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
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-white text-primary shadow-sm"
                : "text-text-premium/60 hover:text-text-premium"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Site Configuration</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "logs"
                ? "bg-white text-primary shadow-sm"
                : "text-text-premium/60 hover:text-text-premium"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {logs.length}
            </span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold text-left">
          {successMsg}
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === "settings" ? (
        /* Site Configuration Editor Forms */
        <div className="bg-white border border-black/[0.05] rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 text-left">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-text-premium">Global Configurations</h3>
            <p className="text-xs text-text-premium/60 leading-relaxed">
              These settings control global features on the frontend and the WhatsApp redirect targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Site Name */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-premium/70 uppercase tracking-wider block">Site Brand Title</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => handleInputChange("site_name", e.target.value)}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-xs bg-white text-text-premium"
                />
                <button
                  onClick={() => handleSaveSetting("site_name")}
                  disabled={savingKey === "site_name"}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Save Setting"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Support/Breeder Contact Email */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-premium/70 uppercase tracking-wider block">Official Contact E-mail</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-xs bg-white text-text-premium"
                />
                <button
                  onClick={() => handleSaveSetting("contact_email")}
                  disabled={savingKey === "contact_email"}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Save Setting"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Official WhatsApp Number */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-premium/70 uppercase tracking-wider block">Official WhatsApp Number (No spacing)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-xs bg-white text-text-premium"
                  placeholder="e.g. 50688888888"
                />
                <button
                  onClick={() => handleSaveSetting("whatsapp_number")}
                  disabled={savingKey === "whatsapp_number"}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Save Setting"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-text-premium/40">Used directly to generate WhatsApp click-to-chat links.</p>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-premium/70 uppercase tracking-wider block">Aviary URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.site_url}
                  onChange={(e) => handleInputChange("site_url", e.target.value)}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-xs bg-white text-text-premium"
                />
                <button
                  onClick={() => handleSaveSetting("site_url")}
                  disabled={savingKey === "site_url"}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Save Setting"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Maintenance Mode Dropdown */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-premium/70 uppercase tracking-wider block">Maintenance Mode</label>
              <div className="flex gap-2">
                <select
                  value={settings.maintenance_mode}
                  onChange={(e) => handleInputChange("maintenance_mode", e.target.value)}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-xs bg-white text-text-premium"
                >
                  <option value="false">Disabled (Site Live)</option>
                  <option value="true">Enabled (Offline/Maintenance)</option>
                </select>
                <button
                  onClick={() => handleSaveSetting("maintenance_mode")}
                  disabled={savingKey === "maintenance_mode"}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Save Setting"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Searchable Admin Audit Logs View */
        <div className="space-y-4 text-left">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-black/[0.04] shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/45" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-black/[0.08] focus:border-primary focus:outline-none text-xs bg-white"
              />
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl border border-black/[0.06] hover:bg-black/[0.01] text-xs font-bold flex items-center gap-1.5 transition-colors self-end sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh List
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-20 text-text-premium/50 text-sm font-semibold">
                No matching audit logs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-black/[0.01] border-b border-black/[0.04]">
                      <th className="px-6 py-3 font-extrabold text-text-premium/50 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 font-extrabold text-text-premium/50 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 font-extrabold text-text-premium/50 uppercase tracking-wider">Action Event</th>
                      <th className="px-6 py-3 font-extrabold text-text-premium/50 uppercase tracking-wider">Operation Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-black/[0.03] hover:bg-black/[0.005] transition-colors">
                        <td className="px-6 py-4 text-text-premium/60 font-semibold whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-text-premium">{log.userId}</p>
                          <p className="text-[10px] text-text-premium/50">{log.userEmail}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] text-[10px] font-bold text-text-premium/70 border border-black/[0.05]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-text-premium/70 break-all max-w-sm">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

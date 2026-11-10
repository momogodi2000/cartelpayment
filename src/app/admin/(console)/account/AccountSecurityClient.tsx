"use client";

import React, { useState } from "react";
import {
  actionAdminChangePassword,
  actionAdminConfirmMFA,
  actionAdminDisableMFA,
  actionAdminRevokeSession,
} from "@/app/actions/admin";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Trash2,
  Lock,
  Copy,
  Check,
} from "lucide-react";

interface SessionItem {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

interface Props {
  admin: {
    id: string;
    name: string;
    email: string;
    totpEnabled: boolean;
    passwordChangedAt: string;
  };
  sessions: SessionItem[];
  qrSvg: string | null;
  mfaSetupData: {
    secret: string;
    otpauthUrl: string;
    recoveryCodes: string[];
  } | null;
}

export default function AccountSecurityClient({
  admin,
  sessions,
  qrSvg,
  mfaSetupData,
}: Props) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // MFA verification state
  const [totpInput, setTotpInput] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // MFA disable state
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  // Session revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);

    if (newPassword.length < 12) {
      setPwdError("New password must be at least 12 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }

    setPwdLoading(true);
    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);

    try {
      const res = await actionAdminChangePassword(formData);
      if (res.success) {
        setPwdSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdError(res.error || "Failed to update password.");
      }
    } catch {
      setPwdError("An unexpected error occurred.");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleMFAConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaSetupData) return;
    setMfaError(null);
    setMfaLoading(true);

    const formData = new FormData();
    formData.append("totpCode", totpInput);
    formData.append("secret", mfaSetupData.secret);
    formData.append("recoveryCodes", JSON.stringify(mfaSetupData.recoveryCodes));

    try {
      const res = await actionAdminConfirmMFA(formData);
      if (res.success) {
        setMfaSuccess(true);
        window.location.reload();
      } else {
        setMfaError(res.error || "Failed to verify TOTP code.");
      }
    } catch {
      setMfaError("An unexpected error occurred.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMFADisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError(null);
    setDisableLoading(true);

    const formData = new FormData();
    formData.append("password", disablePassword);

    try {
      const res = await actionAdminDisableMFA(formData);
      if (res.success) {
        window.location.reload();
      } else {
        setDisableError(res.error || "Failed to disable MFA.");
      }
    } catch {
      setDisableError("An unexpected error occurred.");
    } finally {
      setDisableLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await actionAdminRevokeSession(sessionId);
      window.location.reload();
    } finally {
      setRevokingId(null);
    }
  };

  const copyRecoveryCodes = () => {
    if (mfaSetupData?.recoveryCodes) {
      navigator.clipboard.writeText(mfaSetupData.recoveryCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Change Master Password */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#183C32] dark:text-emerald-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
              Change Master Password
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Last modified: {admin.passwordChangedAt}
            </p>
          </div>
        </div>

        {pwdSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Master password updated successfully.</span>
          </div>
        )}

        {pwdError && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={pwdLoading}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              New Password (min 12 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={pwdLoading}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={pwdLoading}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#183C32]"
            />
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#183C32] hover:bg-[#122E26] text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
          >
            {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin text-[#B69A65]" /> : null}
            <span>Update Master Password</span>
          </button>
        </form>
      </div>

      {/* 2. Multi-Factor Authentication (TOTP) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                admin.totpEnabled
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
              }`}
            >
              {admin.totpEnabled ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                Two-Factor Authentication
              </h2>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                  admin.totpEnabled
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {admin.totpEnabled ? "MFA Protected" : "MFA Disabled (Action Required)"}
              </span>
            </div>
          </div>
        </div>

        {admin.totpEnabled ? (
          /* MFA is enabled: show disable form */
          <div className="space-y-4 pt-2">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Your account is secured with a TOTP authenticator app. An anti-replay mechanism ensures codes cannot be reused.
            </p>

            <form onSubmit={handleMFADisable} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                To disable MFA, confirm your Master Password:
              </label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                disabled={disableLoading}
                placeholder="Master Password"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />

              {disableError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  {disableError}
                </p>
              )}

              <button
                type="submit"
                disabled={disableLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors disabled:opacity-60"
              >
                {disableLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Disable Two-Factor Authentication</span>
              </button>
            </form>
          </div>
        ) : (
          /* MFA is disabled: show QR code and enrolment flow */
          <div className="space-y-5">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Scan this QR code with Google Authenticator, 1Password, or Authy, then enter the 6-digit confirmation code below.
            </p>

            {qrSvg && (
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <div
                  className="w-36 h-36 bg-white p-2 rounded-xl shadow-sm shrink-0 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-zinc-800 dark:text-zinc-200">
                    Manual Secret Key:
                  </div>
                  <code className="block p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px] text-[#183C32] dark:text-emerald-300 font-bold break-all select-all">
                    {mfaSetupData?.secret}
                  </code>
                  <p className="text-[11px] text-zinc-400">
                    Keep your emergency recovery codes stored offline.
                  </p>
                </div>
              </div>
            )}

            {/* Emergency Recovery Codes */}
            {mfaSetupData?.recoveryCodes && (
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Emergency Recovery Codes
                  </span>
                  <button
                    type="button"
                    onClick={copyRecoveryCodes}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 dark:text-amber-300"
                  >
                    {copiedCodes ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCodes ? "Copied" : "Copy All"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-amber-950 dark:text-amber-100">
                  {mfaSetupData.recoveryCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 text-center font-bold border border-amber-200/50"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleMFAConfirm} className="space-y-3">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Verification Code from Authenticator:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value.trim())}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={mfaLoading}
                  className="w-40 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center font-mono font-bold tracking-widest text-[#183C32] dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-[#183C32]"
                />
                <button
                  type="submit"
                  disabled={mfaLoading || totpInput.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#183C32] hover:bg-[#122E26] text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
                >
                  {mfaLoading ? <Loader2 className="h-4 w-4 animate-spin text-[#B69A65]" /> : null}
                  <span>Verify & Activate MFA</span>
                </button>
              </div>

              {mfaError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  {mfaError}
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      {/* 3. Active Sessions Ledger */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#183C32] dark:text-emerald-400">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
              Active & Recent Admin Sessions
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Revoking a session immediately invalidates its authentication token across all devices.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 uppercase font-bold text-zinc-500 tracking-wider border-y border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Browser / Device</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {sessions.map((s) => {
                const isRevoked = Boolean(s.revokedAt);

                return (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                      {s.ip}
                    </td>
                    <td className="py-3 px-4 font-sans text-zinc-600 dark:text-zinc-300 max-w-xs truncate" title={s.userAgent}>
                      {s.userAgent}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-sans">{s.createdAt}</td>
                    <td className="py-3 px-4 text-zinc-500 font-sans">{s.lastSeenAt}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isRevoked
                            ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}
                      >
                        {isRevoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isRevoked && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(s.id)}
                          disabled={revokingId === s.id}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60 text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          {revokingId === s.id ? "Revoking..." : "Revoke"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

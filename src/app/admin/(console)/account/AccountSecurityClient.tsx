"use client";

import React, { useActionState, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, ShieldCheck, ShieldAlert, Monitor, Copy, Check } from "lucide-react";
import {
  actionAdminChangePassword,
  actionAdminStartMFA,
  actionAdminConfirmMFA,
  actionAdminDisableMFA,
  actionAdminRevokeSession,
} from "@/app/actions/admin";

interface SessionRow {
  id: string;
  device: string | null;
  ip: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  state: "active" | "revoked" | "expired";
  isCurrent: boolean;
}

const input =
  "w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]";
const primary =
  "inline-flex items-center gap-2 rounded-xl bg-[#183C32] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12302A] disabled:opacity-60";
const card = "rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4";

function Feedback({ kind, children }: { kind: "error" | "ok"; children: React.ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl border p-3 text-sm ${
        kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {children}
    </p>
  );
}

export default function AccountSecurityClient({
  totpEnabled,
  passwordChangedAt,
  sessions,
}: {
  totpEnabled: boolean;
  passwordChangedAt: string | null;
  sessions: SessionRow[];
}) {
  const t = useTranslations("AdminAccount");
  const router = useRouter();

  // ---- Password -------------------------------------------------------------------------
  const [pwd, pwdAction, pwdPending] = useActionState<{ ok?: boolean; code?: string }, FormData>(async (_p, fd) => {
    const next = String(fd.get("newPassword") || "");
    if (next.length < 12) return { code: "TOO_SHORT" };
    if (next !== String(fd.get("confirmPassword") || "")) return { code: "MISMATCH" };
    const res = await actionAdminChangePassword(fd);
    if (res.success) {
      router.refresh();
      return { ok: true };
    }
    return { code: res.errorCode || "GENERIC" };
  }, {});

  // ---- MFA --------------------------------------------------------------------------------
  const [setup, setSetup] = useState<{ secret: string; qrSvg: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [starting, startSetup] = useTransition();
  const [mfa, mfaAction, mfaPending] = useActionState<{ code?: string }, FormData>(async (_p, fd) => {
    const res = await actionAdminConfirmMFA(fd);
    if (res.success && res.recoveryCodes) {
      setCodes(res.recoveryCodes);
      setSetup(null);
      return {};
    }
    return { code: res.errorCode || "INVALID_CODE" };
  }, {});
  const [disable, disableAction, disablePending] = useActionState<{ code?: string }, FormData>(async (_p, fd) => {
    const res = await actionAdminDisableMFA(fd);
    if (res.success) {
      router.refresh();
      return {};
    }
    return { code: res.errorCode || "WRONG_PASSWORD" };
  }, {});

  // ---- Sessions ---------------------------------------------------------------------------
  const [revoking, startRevoke] = useTransition();

  return (
    <div className="space-y-6">
      {/* Password */}
      <section className={card} aria-labelledby="pwd-title">
        <h2 id="pwd-title" className="flex items-center gap-2 font-serif text-xl font-bold">
          <KeyRound className="h-5 w-5 text-[#B69A65]" aria-hidden="true" />
          {t("passwordSection")}
        </h2>
        <p className="text-sm text-zinc-500">{passwordChangedAt ? t("passwordLastChanged", { date: passwordChangedAt }) : t("passwordNever")}</p>
        {pwd.ok && <Feedback kind="ok">{t("passwordSaved")}</Feedback>}
        {pwd.code && <Feedback kind="error">{t(`passwordErrors.${pwd.code}`)}</Feedback>}
        <form action={pwdAction} className="grid gap-3 sm:max-w-md">
          <label className="text-sm font-semibold" htmlFor="cur-pwd">{t("currentPassword")}</label>
          <input id="cur-pwd" name="currentPassword" type="password" autoComplete="current-password" required className={input} />
          <label className="text-sm font-semibold" htmlFor="new-pwd">{t("newPassword")}</label>
          <input id="new-pwd" name="newPassword" type="password" autoComplete="new-password" minLength={12} required className={input} />
          <label className="text-sm font-semibold" htmlFor="conf-pwd">{t("confirmPassword")}</label>
          <input id="conf-pwd" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required className={input} />
          <div>
            <button type="submit" disabled={pwdPending} className={primary}>
              {pwdPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {pwdPending ? t("saving") : t("savePassword")}
            </button>
          </div>
        </form>
      </section>

      {/* MFA */}
      <section className={card} aria-labelledby="mfa-title">
        <h2 id="mfa-title" className="flex items-center gap-2 font-serif text-xl font-bold">
          {totpEnabled ? <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" /> : <ShieldAlert className="h-5 w-5 text-amber-600" aria-hidden="true" />}
          {t("mfaSection")}
        </h2>

        {codes ? (
          <div className="space-y-3">
            <p className="font-semibold">{t("mfaRecoveryTitle")}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("mfaRecoveryBody")}</p>
            <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
              {codes.map((c) => (
                <li key={c} className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5">{c}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(codes.join("\n")).then(() => setCopied(true));
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? t("mfaCopied") : t("mfaCopy")}
              </button>
              <button type="button" onClick={() => { setCodes(null); router.refresh(); }} className={primary}>
                {t("mfaDone")}
              </button>
            </div>
          </div>
        ) : totpEnabled ? (
          <>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{t("mfaEnabled")}</p>
            {disable.code && <Feedback kind="error">{t(`passwordErrors.${disable.code}`)}</Feedback>}
            <form action={disableAction} className="grid gap-2 sm:max-w-md">
              <label htmlFor="mfa-disable" className="text-sm font-semibold">{t("mfaDisableLabel")}</label>
              <input id="mfa-disable" name="password" type="password" autoComplete="current-password" required className={input} />
              <div>
                <button type="submit" disabled={disablePending} className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                  {disablePending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {t("mfaDisable")}
                </button>
              </div>
            </form>
          </>
        ) : setup ? (
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-2" dangerouslySetInnerHTML={{ __html: setup.qrSvg }} aria-label={t("mfaScan")} role="img" />
            <div className="space-y-3">
              <p className="text-sm">{t("mfaScan")}</p>
              <p className="text-xs text-zinc-500">{t("mfaSecretLabel")}</p>
              <code className="block break-all rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 font-mono text-sm">{setup.secret}</code>
              {mfa.code && <Feedback kind="error">{t(`mfaErrors.${mfa.code}`)}</Feedback>}
              <form action={mfaAction} className="grid gap-2 sm:max-w-xs">
                <label htmlFor="mfa-code" className="text-sm font-semibold">{t("mfaCodeLabel")}</label>
                <input id="mfa-code" name="totpCode" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required className={`${input} font-mono tracking-[0.3em] text-center`} />
                <div>
                  <button type="submit" disabled={mfaPending} className={primary}>
                    {mfaPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {t("mfaConfirm")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-amber-800 dark:text-amber-300">{t("mfaDisabled")}</p>
            <button
              type="button"
              disabled={starting}
              onClick={() => startSetup(async () => setSetup(await actionAdminStartMFA()))}
              className={primary}
            >
              {starting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {starting ? t("mfaStarting") : t("mfaStart")}
            </button>
          </>
        )}
      </section>

      {/* Sessions */}
      <section className={card} aria-labelledby="sess-title">
        <h2 id="sess-title" className="flex items-center gap-2 font-serif text-xl font-bold">
          <Monitor className="h-5 w-5 text-[#B69A65]" aria-hidden="true" />
          {t("sessionsSection")}
        </h2>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">{s.device || t("unknownDevice")}</p>
                <p className="text-xs text-zinc-500">
                  {s.ip ? `${s.ip} · ` : ""}
                  {t("sessionCreated")}: {s.createdAt} · {t("sessionLastSeen")}: {s.lastSeenAt} · {t("sessionExpires")}: {s.expiresAt}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    s.isCurrent
                      ? "bg-[#183C32] text-white"
                      : s.state === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {s.isCurrent ? t("sessionCurrent") : s.state === "active" ? t("sessionActive") : s.state === "revoked" ? t("sessionRevoked") : t("sessionExpired")}
                </span>
                {s.state === "active" && !s.isCurrent && (
                  <button
                    type="button"
                    disabled={revoking}
                    onClick={() => startRevoke(async () => { await actionAdminRevokeSession(s.id); router.refresh(); })}
                    className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-semibold hover:bg-zinc-50 disabled:opacity-60"
                  >
                    {t("sessionRevoke")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * src/lib/services/admin-auth.ts
 *
 * SUPER_ADMIN authentication. Exactly one administrative role exists; an AdminUser row
 * IS a SUPER_ADMIN. There are no roles, permissions or staff accounts.
 *
 * Sessions: opaque 32-byte token in an httpOnly cookie (absolute lifetime 7 days), only
 * its SHA-256 hash is stored. Idle expiry (8 h) is enforced and slid server-side in the
 * database, so validating a session never needs to write a cookie — which makes
 * `requireSuperAdmin()` safe to call from Server Components, layouts, Server Actions and
 * Route Handlers alike.
 */

import { cookies } from "next/headers";
import { AdminStatus, ActorType } from "@prisma/client";
import { prisma } from "../db/client";
import { verifyPassword, hashPassword } from "../security/password";
import { generateToken, hashToken, timingSafeCompare } from "../security/tokens";
import { encrypt, decrypt } from "../security/encryption";
import { generateBase32Secret, verifyTOTPWithStep, generateRecoveryCodes } from "../security/totp";
import { checkRateLimit } from "../security/rate-limit";
import { logAudit } from "./audit";
import { queueEmail } from "./email/outbox";
import { getEnv } from "../env";

export const ADMIN_ROLE = "SUPER_ADMIN";
export const ADMIN_COOKIE_NAME = "__Host-pw_admin";
export const ADMIN_COOKIE_FALLBACK = "pw_admin"; // non-HTTPS localhost development
const MFA_PENDING_COOKIE = "pw_admin_mfa_pending";

const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const ABSOLUTE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const SLIDE_THROTTLE_MS = 5 * 60 * 1000;
const LOCK_THRESHOLD = 5;
const LOCK_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;

export function getAdminCookieName(): string {
  return process.env.NODE_ENV === "production" ? ADMIN_COOKIE_NAME : ADMIN_COOKIE_FALLBACK;
}

export class AdminUnauthorizedError extends Error {
  constructor(message = "Unauthorized: SUPER_ADMIN session required.") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

export type AdminLoginErrorCode = "INVALID_CREDENTIALS" | "RATE_LIMITED" | "INVALID_CODE";

export interface AdminAuthResult {
  success: boolean;
  requiresMFA?: boolean;
  errorCode?: AdminLoginErrorCode;
}

async function readSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(getAdminCookieName())?.value || null;
}

/**
 * Read-only session lookup. Returns null when there is no valid SUPER_ADMIN session.
 * Never writes cookies (safe during rendering).
 */
export async function getSuperAdmin() {
  const token = await readSessionToken();
  if (!token) return null;

  const now = new Date();
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });
  if (!session || session.revokedAt || session.expiresAt <= now) return null;
  if (session.createdAt.getTime() + ABSOLUTE_LIFETIME_MS <= now.getTime()) return null;
  if (session.admin.status !== AdminStatus.ACTIVE) return null;

  // Slide the idle expiry in the database (throttled; no cookie write needed).
  if (now.getTime() - session.lastSeenAt.getTime() > SLIDE_THROTTLE_MS) {
    const absoluteEnd = session.createdAt.getTime() + ABSOLUTE_LIFETIME_MS;
    const nextExpiry = new Date(Math.min(now.getTime() + IDLE_TIMEOUT_MS, absoluteEnd));
    await prisma.adminSession
      .update({ where: { id: session.id }, data: { lastSeenAt: now, expiresAt: nextExpiry } })
      .catch(() => undefined);
  }

  return { admin: session.admin, session, role: ADMIN_ROLE };
}

/**
 * Authorization guard for every administrative Server Component, Server Action and
 * Route Handler. Throws AdminUnauthorizedError when no valid session exists.
 */
export async function requireSuperAdmin() {
  const auth = await getSuperAdmin();
  if (!auth) throw new AdminUnauthorizedError();
  return auth;
}

/** True when `sessionId` is the session of the current request. */
export async function isCurrentSession(sessionId: string): Promise<boolean> {
  const auth = await getSuperAdmin();
  return auth?.session.id === sessionId;
}

async function registerFailure(adminId: string, failedLogins: number, ip: string, reason: string) {
  const next = failedLogins + 1;
  const shouldLock = next >= LOCK_THRESHOLD;
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { failedLogins: shouldLock ? 0 : next, lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MS) : undefined },
  });
  await logAudit({
    actorType: ActorType.ADMIN,
    adminId,
    action: "ADMIN_LOGIN_FAILED",
    entity: "AdminUser",
    entityId: adminId,
    ip,
    diff: { reason, locked: shouldLock },
  });
}

function consumeRecoveryCode(storedJson: string | null, candidate: string): { matched: boolean; remaining: string[] } {
  let stored: string[] = [];
  try {
    stored = storedJson ? JSON.parse(storedJson) : [];
  } catch {
    stored = [];
  }
  const candidateHash = hashToken(candidate.trim().toUpperCase());
  let matchIndex = -1;
  // Constant-time comparison against every stored hash (no early exit).
  stored.forEach((h, i) => {
    if (timingSafeCompare(h, candidateHash) && matchIndex === -1) matchIndex = i;
  });
  if (matchIndex === -1) return { matched: false, remaining: stored };
  return { matched: true, remaining: stored.filter((_, i) => i !== matchIndex) };
}

/**
 * SUPER_ADMIN login. Rate limited per IP and per email, generic errors (no account or
 * lockout disclosure), lockout after repeated password/TOTP failures, TOTP anti-replay.
 */
export async function adminLogin(
  email: string,
  password: string,
  totpCode?: string,
  ip = "unknown",
  userAgent?: string
): Promise<AdminAuthResult> {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const now = new Date();

  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit(`admin_login_ip:${ip}`, 20, 900),
    checkRateLimit(`admin_login_email:${normalizedEmail}`, 10, 900),
  ]);
  if (!ipLimit.success || !emailLimit.success) return { success: false, errorCode: "RATE_LIMITED" };

  const admin = normalizedEmail ? await prisma.adminUser.findUnique({ where: { email: normalizedEmail } }) : null;
  const passwordOk = admin ? await verifyPassword(String(password || ""), admin.passwordHash) : false;

  // Locked, suspended, unknown or wrong password: one identical generic answer.
  const locked = Boolean(admin?.lockedUntil && admin.lockedUntil > now);
  if (!admin || admin.status !== AdminStatus.ACTIVE || locked || !passwordOk) {
    if (admin && !locked && !passwordOk) await registerFailure(admin.id, admin.failedLogins, ip, "invalid_password");
    return { success: false, errorCode: "INVALID_CREDENTIALS" };
  }

  if (admin.totpEnabled && admin.totpSecretEnc) {
    if (!totpCode) return { success: false, requiresMFA: true };

    const totp = verifyTOTPWithStep(totpCode.trim(), decrypt(admin.totpSecretEnc), admin.lastTotpStep);
    if (totp.valid && totp.step !== undefined) {
      await prisma.adminUser.update({ where: { id: admin.id }, data: { lastTotpStep: totp.step } });
    } else {
      const recovery = consumeRecoveryCode(admin.recoveryCodesHash, totpCode);
      if (!recovery.matched) {
        await registerFailure(admin.id, admin.failedLogins, ip, "invalid_totp");
        return { success: false, requiresMFA: true, errorCode: "INVALID_CODE" };
      }
      await prisma.adminUser.update({ where: { id: admin.id }, data: { recoveryCodesHash: JSON.stringify(recovery.remaining) } });
      await logAudit({ actorType: ActorType.ADMIN, adminId: admin.id, action: "ADMIN_RECOVERY_CODE_USED", entity: "AdminUser", entityId: admin.id, ip, diff: { remaining: recovery.remaining.length } });
    }
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { failedLogins: 0, lockedUntil: null } });

  const rawToken = generateToken(32);
  const session = await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(rawToken),
      adminId: admin.id,
      ip,
      userAgent: userAgent?.slice(0, 300),
      expiresAt: new Date(now.getTime() + IDLE_TIMEOUT_MS),
      lastSeenAt: now,
    },
  });

  const store = await cookies();
  store.set(getAdminCookieName(), rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(ABSOLUTE_LIFETIME_MS / 1000),
  });

  await logAudit({ actorType: ActorType.ADMIN, adminId: admin.id, action: "ADMIN_LOGIN_SUCCESS", entity: "AdminSession", entityId: session.id, ip, diff: { userAgent: userAgent?.slice(0, 120) } });
  return { success: true };
}

export async function adminLogout(): Promise<void> {
  const token = await readSessionToken();
  if (token) {
    await prisma.adminSession.updateMany({ where: { tokenHash: hashToken(token) }, data: { revokedAt: new Date() } });
  }
  const store = await cookies();
  store.delete(getAdminCookieName());
  store.delete(MFA_PENDING_COOKIE);
}

/** Always returns success (no account disclosure). */
export async function adminForgotPassword(email: string, ip = "unknown"): Promise<{ success: true }> {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const limit = await checkRateLimit(`admin_forgot:${ip}`, 5, 3600);
  if (!limit.success || !normalizedEmail) return { success: true };

  const admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
  if (!admin || admin.status !== AdminStatus.ACTIVE) return { success: true };

  await prisma.adminPasswordReset.updateMany({ where: { adminId: admin.id, usedAt: null }, data: { usedAt: new Date() } });
  const rawToken = generateToken(32);
  const reset = await prisma.adminPasswordReset.create({
    data: { tokenHash: hashToken(rawToken), adminId: admin.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
  });

  const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  await queueEmail({
    idempotencyKey: `admin_pwd_reset:${reset.id}`,
    template: "admin_password_reset",
    locale: "en",
    toEmail: admin.email,
    payload: { name: admin.name, resetUrl: `${siteUrl}/admin/reset-password/${rawToken}` },
  });
  await logAudit({ actorType: ActorType.ADMIN, adminId: admin.id, action: "ADMIN_PASSWORD_RESET_REQUESTED", entity: "AdminPasswordReset", entityId: reset.id, ip });
  return { success: true };
}

export type PasswordErrorCode = "TOO_SHORT" | "INVALID_TOKEN" | "WRONG_PASSWORD" | "NOT_FOUND";

export async function adminResetPassword(token: string, newPassword: string, ip = "unknown"): Promise<{ success: boolean; errorCode?: PasswordErrorCode }> {
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) return { success: false, errorCode: "TOO_SHORT" };
  const now = new Date();
  const reset = await prisma.adminPasswordReset.findUnique({ where: { tokenHash: hashToken(String(token || "").trim()) } });
  if (!reset || reset.usedAt || reset.expiresAt < now) return { success: false, errorCode: "INVALID_TOKEN" };

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: reset.adminId },
      data: { passwordHash, passwordChangedAt: now, failedLogins: 0, lockedUntil: null, mustChangePassword: false },
    }),
    prisma.adminPasswordReset.update({ where: { id: reset.id }, data: { usedAt: now } }),
    prisma.adminSession.updateMany({ where: { adminId: reset.adminId, revokedAt: null }, data: { revokedAt: now } }),
  ]);
  await logAudit({ actorType: ActorType.ADMIN, adminId: reset.adminId, action: "ADMIN_PASSWORD_RESET_COMPLETED", entity: "AdminUser", entityId: reset.adminId, ip });
  return { success: true };
}

/** Password change; revokes every other session and clears the first-login flag. */
export async function adminChangePassword(
  adminId: string,
  currentSessionId: string,
  currentPassword: string,
  newPassword: string,
  ip = "unknown"
): Promise<{ success: boolean; errorCode?: PasswordErrorCode }> {
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) return { success: false, errorCode: "TOO_SHORT" };
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) return { success: false, errorCode: "NOT_FOUND" };
  if (!(await verifyPassword(currentPassword, admin.passwordHash))) return { success: false, errorCode: "WRONG_PASSWORD" };

  const now = new Date();
  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: adminId }, data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: now, mustChangePassword: false } }),
    prisma.adminSession.updateMany({ where: { adminId, revokedAt: null, id: { not: currentSessionId } }, data: { revokedAt: now } }),
  ]);
  await logAudit({ actorType: ActorType.ADMIN, adminId, action: "ADMIN_PASSWORD_CHANGED", entity: "AdminUser", entityId: adminId, ip });
  return { success: true };
}

// ---- MFA (TOTP) enrolment ------------------------------------------------------------------
// The pending secret never round-trips through the browser in clear: it is kept in an
// encrypted, httpOnly, short-lived cookie set by the Server Action that starts enrolment.

interface PendingMfa {
  adminId: string;
  secret: string;
  exp: number;
}

export async function adminStartMfaEnrolment(adminId: string): Promise<{ secret: string; otpauthUrl: string }> {
  const admin = await prisma.adminUser.findUniqueOrThrow({ where: { id: adminId } });
  const secret = generateBase32Secret(20);
  const pending: PendingMfa = { adminId, secret, exp: Date.now() + 10 * 60 * 1000 };
  const store = await cookies();
  store.set(MFA_PENDING_COOKIE, encrypt(JSON.stringify(pending)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: 600,
  });
  const otpauthUrl = `otpauth://totp/Pawelium:${encodeURIComponent(admin.email)}?secret=${secret}&issuer=Pawelium&algorithm=SHA1&digits=6&period=30`;
  return { secret, otpauthUrl };
}

export async function adminConfirmMfaEnrolment(
  adminId: string,
  totpCode: string
): Promise<{ success: boolean; recoveryCodes?: string[]; errorCode?: "EXPIRED" | "INVALID_CODE" }> {
  const store = await cookies();
  const raw = store.get(MFA_PENDING_COOKIE)?.value;
  let pending: PendingMfa | null = null;
  try {
    pending = raw ? (JSON.parse(decrypt(raw)) as PendingMfa) : null;
  } catch {
    pending = null;
  }
  if (!pending || pending.adminId !== adminId || pending.exp < Date.now()) return { success: false, errorCode: "EXPIRED" };

  const result = verifyTOTPWithStep(String(totpCode || "").trim(), pending.secret, null);
  if (!result.valid) return { success: false, errorCode: "INVALID_CODE" };

  const recoveryCodes = generateRecoveryCodes(8);
  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      totpEnabled: true,
      totpSecretEnc: encrypt(pending.secret),
      recoveryCodesHash: JSON.stringify(recoveryCodes.map((c) => hashToken(c.trim().toUpperCase()))),
      lastTotpStep: result.step,
    },
  });
  store.delete(MFA_PENDING_COOKIE);
  await logAudit({ actorType: ActorType.ADMIN, adminId, action: "ADMIN_MFA_ENABLED", entity: "AdminUser", entityId: adminId });
  // Shown once to the administrator; only hashes are stored.
  return { success: true, recoveryCodes };
}

export async function adminDisableMFA(adminId: string, password: string): Promise<{ success: boolean; errorCode?: PasswordErrorCode }> {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) return { success: false, errorCode: "NOT_FOUND" };
  if (!(await verifyPassword(password, admin.passwordHash))) return { success: false, errorCode: "WRONG_PASSWORD" };
  await prisma.adminUser.update({ where: { id: adminId }, data: { totpEnabled: false, totpSecretEnc: null, recoveryCodesHash: null, lastTotpStep: null } });
  await logAudit({ actorType: ActorType.ADMIN, adminId, action: "ADMIN_MFA_DISABLED", entity: "AdminUser", entityId: adminId });
  return { success: true };
}

export async function adminListSessions(adminId: string) {
  return prisma.adminSession.findMany({ where: { adminId }, orderBy: { createdAt: "desc" }, take: 20 });
}

export async function adminRevokeSession(sessionId: string, currentAdminId: string): Promise<void> {
  await prisma.adminSession.updateMany({ where: { id: sessionId, adminId: currentAdminId }, data: { revokedAt: new Date() } });
  await logAudit({ actorType: ActorType.ADMIN, adminId: currentAdminId, action: "ADMIN_SESSION_REVOKED", entity: "AdminSession", entityId: sessionId });
}

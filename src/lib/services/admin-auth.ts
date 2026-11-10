import { cookies } from "next/headers";
import { AdminStatus, ActorType } from "@prisma/client";
import { prisma } from "../db/client";
import { verifyPassword, hashPassword } from "../security/password";
import { generateToken, hashToken } from "../security/tokens";
import { encrypt, decrypt } from "../security/encryption";
import {
  generateBase32Secret,
  verifyTOTPWithStep,
  generateRecoveryCodes,
} from "../security/totp";
import { checkRateLimit } from "../security/rate-limit";
import { logAudit } from "./audit";
import { queueEmail } from "./email/outbox";
import { getEnv } from "../env";

export const ADMIN_ROLE = "SUPER_ADMIN";
export const ADMIN_COOKIE_NAME = "__Host-pw_admin";
export const ADMIN_COOKIE_FALLBACK = "pw_admin"; // fallback for non-https localhost dev

function getCookieName(): string {
  return process.env.NODE_ENV === "production" ? ADMIN_COOKIE_NAME : ADMIN_COOKIE_FALLBACK;
}

export interface AdminAuthResult {
  success: boolean;
  requiresMFA?: boolean;
  tempToken?: string;
  error?: string;
}

/**
 * Super Admin login with rate limiting, brute-force lockout, and anti-replay TOTP.
 */
export async function adminLogin(
  email: string,
  password: string,
  totpCode?: string,
  ip?: string,
  userAgent?: string
): Promise<AdminAuthResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date();

  // 1. IP rate limiting (15 attempts per 15 minutes)
  const clientIp = ip || "127.0.0.1";
  const ipLimit = await checkRateLimit(`admin_login_ip:${clientIp}`, 15, 900);
  if (!ipLimit.success) {
    return {
      success: false,
      error: "Too many login attempts. Please retry later.",
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  // Generic failure if admin not found or suspended (no account existence leakage)
  if (!admin || admin.status === AdminStatus.SUSPENDED) {
    return { success: false, error: "Invalid email or password." };
  }

  // Generic lockout check (no account existence leakage)
  if (admin.lockedUntil && admin.lockedUntil > now) {
    return {
      success: false,
      error: "Too many failed attempts. Account temporarily locked.",
    };
  }

  // 2. Validate Password
  const isPasswordValid = await verifyPassword(password, admin.passwordHash);

  if (!isPasswordValid) {
    const failedLogins = admin.failedLogins + 1;
    const shouldLock = failedLogins >= 5;
    const lockedUntil = shouldLock ? new Date(now.getTime() + 15 * 60 * 1000) : null;

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLogins,
        lockedUntil,
      },
    });

    await logAudit({
      actorType: ActorType.ADMIN,
      adminId: admin.id,
      action: "ADMIN_LOGIN_FAILED",
      entity: "AdminUser",
      entityId: admin.id,
      ip: clientIp,
      diff: { failedLogins, locked: shouldLock, reason: "invalid_password" },
    });

    return { success: false, error: "Invalid email or password." };
  }

  // 3. MFA verification if enabled
  if (admin.totpEnabled && admin.totpSecretEnc) {
    if (!totpCode) {
      return { success: false, requiresMFA: true };
    }

    const decryptedSecret = decrypt(admin.totpSecretEnc);
    const totpResult = verifyTOTPWithStep(
      totpCode.trim(),
      decryptedSecret,
      admin.lastTotpStep
    );

    let passedMFA = false;
    let newStep: bigint | null = null;

    if (totpResult.valid && totpResult.step !== undefined) {
      passedMFA = true;
      newStep = totpResult.step;
    } else if (admin.recoveryCodesHash) {
      // Check emergency recovery codes
      const storedCodes: string[] = JSON.parse(admin.recoveryCodesHash);
      const codeHash = hashToken(totpCode.trim().toUpperCase());
      const codeIndex = storedCodes.indexOf(codeHash);

      if (codeIndex !== -1) {
        storedCodes.splice(codeIndex, 1);
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { recoveryCodesHash: JSON.stringify(storedCodes) },
        });
        passedMFA = true;
      }
    }

    if (!passedMFA) {
      // TOTP failures count toward lockout!
      const failedLogins = admin.failedLogins + 1;
      const shouldLock = failedLogins >= 5;
      const lockedUntil = shouldLock ? new Date(now.getTime() + 15 * 60 * 1000) : null;

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLogins,
          lockedUntil,
        },
      });

      await logAudit({
        actorType: ActorType.ADMIN,
        adminId: admin.id,
        action: "ADMIN_LOGIN_FAILED_MFA",
        entity: "AdminUser",
        entityId: admin.id,
        ip: clientIp,
        diff: { failedLogins, locked: shouldLock, reason: "invalid_totp" },
      });

      return { success: false, error: "Invalid authentication code." };
    }

    // Anti-replay: record the used TOTP time-step
    if (newStep !== null) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastTotpStep: newStep },
      });
    }
  }

  // Reset failed logins upon successful login
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      failedLogins: 0,
      lockedUntil: null,
    },
  });

  // Create session (8h idle expiry, 7d absolute expiry)
  const rawToken = generateToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours

  await prisma.adminSession.create({
    data: {
      tokenHash,
      adminId: admin.id,
      ip: clientIp,
      userAgent,
      expiresAt,
    },
  });

  // Set secure cookie
  const cookieStore = await cookies();
  cookieStore.set(getCookieName(), rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });

  await logAudit({
    actorType: ActorType.ADMIN,
    adminId: admin.id,
    action: "ADMIN_LOGIN_SUCCESS",
    entity: "AdminSession",
    entityId: admin.id,
    ip: clientIp,
    diff: { userAgent },
  });

  return { success: true };
}

/**
 * Super Admin authorization guard for App Router layouts, Server Actions, and Route Handlers.
 */
export async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    throw new Error("Unauthorized: Super Admin session required.");
  }

  const tokenHash = hashToken(token);
  const now = new Date();

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { admin: true },
  });

  if (!session || session.revokedAt || session.expiresAt < now) {
    throw new Error("Unauthorized: Super Admin session invalid or expired.");
  }

  if (session.admin.status !== AdminStatus.ACTIVE) {
    throw new Error("Unauthorized: Account suspended.");
  }

  // Refresh idle expiration (extend 8 hours, up to max 7 days from creation)
  const maxLifetime = new Date(session.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextIdleExpiry = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const updatedExpiry = nextIdleExpiry < maxLifetime ? nextIdleExpiry : maxLifetime;

  // Awaited sliding session update on both DB and cookie
  await prisma.adminSession.update({
    where: { id: session.id },
    data: {
      lastSeenAt: now,
      expiresAt: updatedExpiry,
    },
  });

  cookieStore.set(getCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: updatedExpiry,
  });

  return {
    admin: session.admin,
    session,
    role: ADMIN_ROLE,
  };
}

/**
 * Logs out the active admin session.
 */
export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await prisma.adminSession.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  cookieStore.delete(getCookieName());
}

/**
 * Dispatches a password reset email to a registered Super Admin.
 */
export async function adminForgotPassword(email: string, ip?: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  // Always return generic confirmation
  const genericMessage = "If that email exists in our registry, a reset link has been dispatched.";

  if (!admin || admin.status === AdminStatus.SUSPENDED) {
    return { success: true, message: genericMessage };
  }

  // Invalidate previous unconsumed reset tokens
  await prisma.adminPasswordReset.updateMany({
    where: { adminId: admin.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = generateToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.adminPasswordReset.create({
    data: {
      tokenHash,
      adminId: admin.id,
      expiresAt,
    },
  });

  const env = getEnv();
  const resetUrl = `${env.NEXT_PUBLIC_SITE_URL}/admin/reset-password/${rawToken}`;

  await queueEmail({
    idempotencyKey: `pwd_reset_${rawToken}`,
    template: "admin_password_reset",
    locale: "en",
    toEmail: admin.email,
    payload: {
      name: admin.name,
      resetUrl,
    },
  });

  await logAudit({
    actorType: ActorType.ADMIN,
    adminId: admin.id,
    action: "ADMIN_PASSWORD_RESET_REQUESTED",
    entity: "AdminPasswordReset",
    entityId: admin.id,
    ip: ip || "127.0.0.1",
  });

  return { success: true, message: genericMessage };
}

/**
 * Consumes a password reset token and sets a new master password.
 */
export async function adminResetPassword(
  token: string,
  newPassword: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 12) {
    return { success: false, error: "Password must be at least 12 characters long." };
  }

  const tokenHash = hashToken(token.trim());
  const now = new Date();

  const resetRecord = await prisma.adminPasswordReset.findUnique({
    where: { tokenHash },
    include: { admin: true },
  });

  if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < now) {
    return { success: false, error: "Invalid or expired reset token." };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.adminUser.update({
    where: { id: resetRecord.adminId },
    data: {
      passwordHash,
      passwordChangedAt: now,
      failedLogins: 0,
      lockedUntil: null,
    },
  });

  // Mark token as used
  await prisma.adminPasswordReset.update({
    where: { id: resetRecord.id },
    data: { usedAt: now },
  });

  // Revoke all existing sessions for this admin upon password reset
  await prisma.adminSession.updateMany({
    where: { adminId: resetRecord.adminId, revokedAt: null },
    data: { revokedAt: now },
  });

  await logAudit({
    actorType: ActorType.ADMIN,
    adminId: resetRecord.adminId,
    action: "ADMIN_PASSWORD_RESET_COMPLETED",
    entity: "AdminUser",
    entityId: resetRecord.adminId,
    ip: ip || "127.0.0.1",
  });

  return { success: true };
}

/**
 * Changes an authenticated admin's password.
 */
export async function adminChangePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 12) {
    return { success: false, error: "New password must be at least 12 characters long." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    return { success: false, error: "Admin account not found." };
  }

  const isCurrentValid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!isCurrentValid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  const now = new Date();

  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      passwordHash,
      passwordChangedAt: now,
    },
  });

  await logAudit({
    actorType: ActorType.ADMIN,
    adminId,
    action: "ADMIN_PASSWORD_CHANGED",
    entity: "AdminUser",
    entityId: adminId,
    ip: ip || "127.0.0.1",
  });

  return { success: true };
}

/**
 * Initiates MFA setup by generating a fresh TOTP secret and recovery codes.
 */
export async function adminEnrolMFA(adminId: string): Promise<{
  secret: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}> {
  const secret = generateBase32Secret(20);
  const recoveryCodes = generateRecoveryCodes(8);
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });

  const email = admin?.email || "admin@pawelium.fyi";
  const otpauthUrl = `otpauth://totp/Pawelium:${encodeURIComponent(email)}?secret=${secret}&issuer=Pawelium`;

  return {
    secret,
    otpauthUrl,
    recoveryCodes,
  };
}

/**
 * Confirms and activates MFA for an admin.
 */
export async function adminConfirmMFA(
  adminId: string,
  totpCode: string,
  secret: string,
  recoveryCodes: string[]
): Promise<{ success: boolean; error?: string }> {
  const result = verifyTOTPWithStep(totpCode.trim(), secret, null);
  if (!result.valid) {
    return { success: false, error: "Invalid TOTP code. Check your authenticator app time." };
  }

  const hashedCodes = recoveryCodes.map((code) => hashToken(code.trim().toUpperCase()));
  const encryptedSecret = encrypt(secret);

  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      totpEnabled: true,
      totpSecretEnc: encryptedSecret,
      recoveryCodesHash: JSON.stringify(hashedCodes),
      lastTotpStep: result.step,
    },
  });

  await logAudit({
    actorType: ActorType.ADMIN,
    adminId,
    action: "ADMIN_MFA_ENABLED",
    entity: "AdminUser",
    entityId: adminId,
  });

  return { success: true };
}

/**
 * Disables MFA for an admin after password verification.
 */
export async function adminDisableMFA(
  adminId: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    return { success: false, error: "Admin not found." };
  }

  const isValid = await verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    return { success: false, error: "Incorrect password." };
  }

  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      totpEnabled: false,
      totpSecretEnc: null,
      recoveryCodesHash: null,
    },
  });

  await logAudit({
    actorType: ActorType.ADMIN,
    adminId,
    action: "ADMIN_MFA_DISABLED",
    entity: "AdminUser",
    entityId: adminId,
  });

  return { success: true };
}

/**
 * Lists active and recent sessions for an admin.
 */
export async function adminListSessions(adminId: string) {
  return await prisma.adminSession.findMany({
    where: { adminId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

/**
 * Revokes a specific admin session.
 */
export async function adminRevokeSession(sessionId: string, currentAdminId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { id: sessionId, adminId: currentAdminId },
    data: { revokedAt: new Date() },
  });
}

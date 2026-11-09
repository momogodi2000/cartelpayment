import { cookies } from "next/headers";
import { AdminStatus, ActorType } from "@prisma/client";
import { prisma } from "../db/client";
import { verifyPassword, hashPassword } from "../security/password";
import { generateToken, hashToken } from "../security/tokens";
import { encrypt, decrypt } from "../security/encryption";
import { generateBase32Secret, verifyTOTP, generateRecoveryCodes } from "../security/totp";
import { logAudit } from "./audit";
import { queueEmail, sendEmailNotification } from "./email/outbox";
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
 * Super Admin login with brute-force lockout protection and TOTP support.
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

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!admin || admin.status === AdminStatus.SUSPENDED) {
    return { success: false, error: "Invalid credentials." };
  }

  // Lockout check: 5 failed logins within 15 minutes
  if (admin.lockedUntil && admin.lockedUntil > now) {
    const minutesLeft = Math.ceil((admin.lockedUntil.getTime() - now.getTime()) / 60000);
    return {
      success: false,
      error: `Account is temporarily locked. Please retry in ${minutesLeft} minute(s).`,
    };
  }

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
      ip,
      diff: { failedLogins, locked: shouldLock },
    });

    return { success: false, error: "Invalid credentials." };
  }

  // MFA verification if enabled
  if (admin.totpEnabled && admin.totpSecretEnc) {
    if (!totpCode) {
      return { success: false, requiresMFA: true };
    }

    const decryptedSecret = decrypt(admin.totpSecretEnc);
    const isValidTOTP = verifyTOTP(totpCode, decryptedSecret);

    if (!isValidTOTP) {
      // Check recovery codes
      let usedRecovery = false;
      if (admin.recoveryCodesHash) {
        const storedCodes: string[] = JSON.parse(admin.recoveryCodesHash);
        const codeHash = hashToken(totpCode.trim().toUpperCase());
        const codeIndex = storedCodes.indexOf(codeHash);
        if (codeIndex !== -1) {
          storedCodes.splice(codeIndex, 1);
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: { recoveryCodesHash: JSON.stringify(storedCodes) },
          });
          usedRecovery = true;
        }
      }

      if (!usedRecovery) {
        return { success: false, error: "Invalid two-factor authentication code." };
      }
    }
  }

  // Reset failed logins
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
      ip,
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
    ip,
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

  // Background refresh of lastSeenAt
  prisma.adminSession
    .update({
      where: { id: session.id },
      data: {
        lastSeenAt: now,
        expiresAt: updatedExpiry,
      },
    })
    .catch(() => {});

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
 * Revokes a specific admin session.
 */
export async function adminRevokeSession(sessionId: string, currentAdminId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { id: sessionId, adminId: currentAdminId },
    data: { revokedAt: new Date() },
  });
}

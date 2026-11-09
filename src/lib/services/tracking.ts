import crypto from "node:crypto";
import { VerificationPurpose, GuestScope } from "@prisma/client";
import { prisma } from "../db/client";
import { getEnv } from "../env";
import { queueEmail, sendEmailNotification } from "./email/outbox";
import { generateToken, hashToken } from "../security/tokens";

export const TRACKING_COOKIE_NAME = "pw_tracking_session";

function computeCodeHash(code: string, ref: string): string {
  const secret = getEnv().ENCRYPTION_KEY;
  return crypto.createHmac("sha256", secret).update(`${ref}:${code}`).digest("hex");
}

export interface RequestOTPResult {
  success: boolean;
  message: string;
}

/**
 * Initiates an OTP request for order tracking.
 * Constantly returns a generic 200 response to prevent email/order existence enumeration.
 */
export async function requestTrackingOTP(
  orderReference: string,
  email: string
): Promise<RequestOTPResult> {
  const genericResponse: RequestOTPResult = {
    success: true,
    message: "If an order matches these details, a verification code has been dispatched to your email address.",
  };

  const normalizedRef = orderReference.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  const order = await prisma.order.findUnique({
    where: { reference: normalizedRef },
    include: { customer: true },
  });

  if (!order || order.customer.email.toLowerCase() !== normalizedEmail) {
    return genericResponse;
  }

  // Check cooldown & attempts
  const now = new Date();
  const existingVerification = await prisma.guestVerification.findFirst({
    where: {
      purpose: VerificationPurpose.TRACKING,
      targetRef: normalizedRef,
      email: normalizedEmail,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingVerification) {
    // 60s cooldown check
    const diffMs = now.getTime() - existingVerification.lastSentAt.getTime();
    if (diffMs < 60 * 1000) {
      return genericResponse;
    }
    // Max attempts lockout check if not expired
    if (existingVerification.attempts >= 5 && existingVerification.expiresAt > now) {
      return genericResponse;
    }
  }

  // Generate secure 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();
  const codeHash = computeCodeHash(code, normalizedRef);
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

  await prisma.guestVerification.create({
    data: {
      purpose: VerificationPurpose.TRACKING,
      targetRef: normalizedRef,
      email: normalizedEmail,
      codeHash,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    },
  });

  // Queue OTP email
  const notifId = await queueEmail({
    idempotencyKey: `otp:tracking:${normalizedRef}:${now.getTime()}`,
    template: "tracking_otp",
    locale: order.locale,
    toEmail: normalizedEmail,
    payload: {
      code,
      orderRef: normalizedRef,
    },
  });

  sendEmailNotification(notifId).catch(console.error);

  return genericResponse;
}

export interface VerifyOTPResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
}

/**
 * Verifies the tracking OTP and generates a scoped GuestSession token (valid 30 min).
 */
export async function verifyTrackingOTP(
  orderReference: string,
  email: string,
  code: string
): Promise<VerifyOTPResult> {
  const normalizedRef = orderReference.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  const verification = await prisma.guestVerification.findFirst({
    where: {
      purpose: VerificationPurpose.TRACKING,
      targetRef: normalizedRef,
      email: normalizedEmail,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    return { success: false, error: "Invalid or expired verification code." };
  }

  if (verification.attempts >= 5) {
    return { success: false, error: "Maximum attempts exceeded. Please request a new code." };
  }

  const expectedHash = computeCodeHash(code.trim(), normalizedRef);
  const bufExpected = Buffer.from(expectedHash, "hex");
  const bufActual = Buffer.from(verification.codeHash, "hex");

  const isValid =
    bufExpected.length === bufActual.length && crypto.timingSafeEqual(bufExpected, bufActual);

  if (!isValid) {
    await prisma.guestVerification.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, error: "Invalid verification code." };
  }

  // Mark verification consumed
  await prisma.guestVerification.update({
    where: { id: verification.id },
    data: { consumedAt: now },
  });

  const order = await prisma.order.findUnique({
    where: { reference: normalizedRef },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  // Create GuestSession
  const rawSessionToken = generateToken(32);
  const tokenHash = hashToken(rawSessionToken);
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes session

  await prisma.guestSession.create({
    data: {
      tokenHash,
      scope: GuestScope.ORDER,
      targetId: order.id,
      expiresAt,
    },
  });

  return { success: true, sessionToken: rawSessionToken };
}

/**
 * Resolves order tracking data using an active GuestSession token.
 */
export async function getOrderTrackingBySession(sessionToken: string) {
  const tokenHash = hashToken(sessionToken);
  const session = await prisma.guestSession.findUnique({
    where: { tokenHash },
  });

  if (!session || session.expiresAt < new Date() || session.scope !== GuestScope.ORDER) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: session.targetId },
    include: {
      customer: true,
      item: {
        include: {
          animal: {
            include: {
              images: true,
              breed: true,
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      delivery: true,
      payments: {
        select: {
          status: true,
          method: true,
          amountCents: true,
          createdAt: true,
        },
      },
    },
  });

  return order;
}

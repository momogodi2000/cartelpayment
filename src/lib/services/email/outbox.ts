import { Prisma, EmailStatus } from "@prisma/client";
import { prisma } from "../../db/client";
import { getEnv } from "../../env";
import { renderEmail } from "./templates";

export interface QueueEmailParams {
  idempotencyKey: string;
  template: string;
  locale: string;
  toEmail: string;
  payload: Record<string, any>;
}

/**
 * Queues an email notification into the EmailNotification outbox.
 * Can participate in an ongoing Prisma transaction.
 */
export async function queueEmail(
  params: QueueEmailParams,
  tx?: Prisma.TransactionClient
): Promise<string> {
  const db = tx || prisma;

  // Upsert or insert on idempotencyKey to prevent duplicate sends
  const existing = await db.emailNotification.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
  });

  if (existing) {
    return existing.id;
  }

  const notification = await db.emailNotification.create({
    data: {
      idempotencyKey: params.idempotencyKey,
      template: params.template,
      locale: params.locale,
      toEmail: params.toEmail,
      payload: JSON.stringify(params.payload),
      status: EmailStatus.QUEUED,
    },
  });

  return notification.id;
}

/**
 * Attempts immediate delivery for a given notification ID.
 */
export async function sendEmailNotification(notificationId: string): Promise<boolean> {
  const notification = await prisma.emailNotification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.status === EmailStatus.SENT) {
    return true;
  }

  const env = getEnv();
  const apiKey = env.RESEND_API_KEY;
  const payload = JSON.parse(notification.payload);
  const rendered = renderEmail(notification.template, notification.locale, payload);

  // If no Resend API key is configured (local dev/mock), mark as SENT in dev
  if (!apiKey || apiKey.startsWith("re_sample") || apiKey.includes("placeholder")) {
    console.log(`[Email Mock] Sent to: ${notification.toEmail} | Subject: ${rendered.subject}`);
    await prisma.emailNotification.update({
      where: { id: notificationId },
      data: {
        status: EmailStatus.SENT,
        sentAt: new Date(),
        lastError: null,
      },
    });
    await prisma.emailDeliveryLog.create({
      data: {
        notificationId,
        providerId: "mock-resend-id",
        status: "DELIVERED_MOCK",
      },
    });
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: notification.toEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      await prisma.emailNotification.update({
        where: { id: notificationId },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          lastError: null,
        },
      });

      await prisma.emailDeliveryLog.create({
        data: {
          notificationId,
          providerId: data.id || null,
          status: "SENT",
        },
      });

      return true;
    } else {
      const errorMsg = data.message || `HTTP ${res.status}`;
      await prisma.emailNotification.update({
        where: { id: notificationId },
        data: {
          status: EmailStatus.FAILED,
          attempts: { increment: 1 },
          lastError: errorMsg,
          nextAttemptAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
        },
      });

      await prisma.emailDeliveryLog.create({
        data: {
          notificationId,
          status: "FAILED",
          error: errorMsg,
        },
      });

      return false;
    }
  } catch (err: any) {
    const errorMsg = err.message || "Network exception";
    await prisma.emailNotification.update({
      where: { id: notificationId },
      data: {
        status: EmailStatus.FAILED,
        attempts: { increment: 1 },
        lastError: errorMsg,
        nextAttemptAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return false;
  }
}

/**
 * Outbox retry worker (called by cron).
 */
export async function processEmailOutbox(): Promise<{ processed: number; success: number }> {
  const pending = await prisma.emailNotification.findMany({
    where: {
      status: { in: [EmailStatus.QUEUED, EmailStatus.FAILED] },
      nextAttemptAt: { lte: new Date() },
      attempts: { lt: 5 },
    },
    take: 20,
  });

  let successCount = 0;
  for (const notif of pending) {
    const ok = await sendEmailNotification(notif.id);
    if (ok) successCount++;
  }

  return { processed: pending.length, success: successCount };
}

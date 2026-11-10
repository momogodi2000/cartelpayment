"use server";

/** SUPER_ADMIN: support, reviews, content, SEO, translations overrides, newsletter, settings. */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReviewStatus, TicketPriority, TicketStatus, NewsletterStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { logAudit } from "@/lib/services/audit";
import { adminReplyTicket } from "@/lib/services/support";
import { queueEmail } from "@/lib/services/email/outbox";
import { getEnv } from "@/lib/env";
import { NAMESPACES } from "@/i18n/namespaces";

type Result = { success: true } | { success: false; errorCode: string };

export async function actionModerateReview(reviewId: string, status: "APPROVED" | "REJECTED" | "PENDING"): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const s = z.nativeEnum(ReviewStatus).parse(status);
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return { success: false, errorCode: "NOT_FOUND" };
  // Only verified purchases may be published as testimonials.
  if (s === "APPROVED" && !review.verifiedPurchase) return { success: false, errorCode: "NOT_VERIFIED_PURCHASE" };
  await prisma.review.update({ where: { id: reviewId }, data: { status: s } });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: `REVIEW_${s}`, entity: "Review", entityId: reviewId });
  revalidatePath("/admin/reviews");
  return { success: true };
}

const replySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
  isInternalNote: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

/** Public replies email the customer (outbox); internal notes never leave the admin. */
export async function actionAdminReplyTicket(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = replySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  const ticket = await prisma.supportTicket.findUnique({ where: { id: p.data.ticketId } });
  if (!ticket) return { success: false, errorCode: "NOT_FOUND" };
  const msg = await adminReplyTicket(ticket.id, admin.id, p.data.body, p.data.isInternalNote);
  if (!p.data.isInternalNote) {
    await queueEmail({
      idempotencyKey: `ticket:${ticket.id}:reply:${msg.id}`,
      template: "support_ticket_reply",
      locale: "en",
      toEmail: ticket.customerEmail,
      payload: { customerName: ticket.name, ticketRef: ticket.reference, subject: ticket.subject, siteUrl: getEnv().NEXT_PUBLIC_SITE_URL },
    });
  }
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: p.data.isInternalNote ? "TICKET_NOTE" : "TICKET_REPLY", entity: "SupportTicket", entityId: ticket.id });
  revalidatePath(`/admin/support/${ticket.id}`);
  revalidatePath("/admin/support");
  return { success: true };
}

export async function actionUpdateTicket(ticketId: string, input: { status?: string; priority?: string }): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const data = z.object({ status: z.nativeEnum(TicketStatus).optional(), priority: z.nativeEnum(TicketPriority).optional() }).safeParse(input);
  if (!data.success) return { success: false, errorCode: "VALIDATION" };
  await prisma.supportTicket.update({ where: { id: ticketId }, data: data.data });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "TICKET_UPDATE", entity: "SupportTicket", entityId: ticketId, diff: data.data });
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  return { success: true };
}

const blockSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9_.-]{2,80}$/),
  locale: z.enum(["en", "fr"]),
  title: z.string().trim().max(200).default(""),
  content: z.string().trim().min(1).max(20000),
});

export async function actionSaveContentBlock(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = blockSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  const { key, locale, title, content } = p.data;
  await prisma.contentBlock.upsert({
    where: { key_locale: { key, locale } },
    create: { key, locale, title: title || null, content },
    update: { title: title || null, content },
  });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "SAVE_CONTENT_BLOCK", entity: "ContentBlock", entityId: `${key}:${locale}` });
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function actionDeleteContentBlock(id: string): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  await prisma.contentBlock.delete({ where: { id } }).catch(() => undefined);
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "DELETE_CONTENT_BLOCK", entity: "ContentBlock", entityId: id });
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
  return { success: true };
}

const seoSchema = z.object({
  siteTitle: z.string().trim().max(70).default(""),
  siteDescription: z.string().trim().max(170).default(""),
  ogImage: z.string().trim().max(300).default(""),
});

export async function actionSaveSeo(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = seoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  await prisma.siteSetting.upsert({ where: { key: "seo_metadata" }, create: { key: "seo_metadata", value: JSON.stringify(p.data) }, update: { value: JSON.stringify(p.data) } });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "SAVE_SEO", entity: "SiteSetting", entityId: "seo_metadata" });
  revalidatePath("/admin/seo");
  revalidatePath("/", "layout");
  return { success: true };
}

// Only public-facing namespaces may be overridden (admin/auth/validation copy stays in source control).
const OVERRIDABLE = NAMESPACES.filter((n) => /^(public|marketplace|checkout|customer)\//.test(n) || n === "common");

const overrideSchema = z.object({
  locale: z.enum(["en", "fr"]),
  namespace: z.string().refine((n) => (OVERRIDABLE as readonly string[]).includes(n)),
  key: z.string().trim().regex(/^[A-Za-z0-9_.]{1,160}$/),
  value: z.string().trim().min(1).max(2000),
});

export async function actionSaveTranslationOverride(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = overrideSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  const { locale, namespace, key, value } = p.data;
  await prisma.translationOverride.upsert({
    where: { locale_namespace_key: { locale, namespace, key } },
    create: { locale, namespace, key, value, authorId: admin.id },
    update: { value, authorId: admin.id },
  });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "SAVE_TRANSLATION_OVERRIDE", entity: "TranslationOverride", entityId: `${locale}:${namespace}:${key}` });
  revalidatePath("/admin/translations");
  return { success: true };
}

export async function actionDeleteTranslationOverride(id: string): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  await prisma.translationOverride.delete({ where: { id } }).catch(() => undefined);
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "DELETE_TRANSLATION_OVERRIDE", entity: "TranslationOverride", entityId: id });
  revalidatePath("/admin/translations");
  return { success: true };
}

export async function actionSetSubscriberStatus(id: string, status: "UNSUBSCRIBED" | "DELETE"): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  if (status === "DELETE") await prisma.newsletterSubscriber.delete({ where: { id } }).catch(() => undefined);
  else await prisma.newsletterSubscriber.update({ where: { id }, data: { status: NewsletterStatus.UNSUBSCRIBED } });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: `NEWSLETTER_${status}`, entity: "NewsletterSubscriber", entityId: id });
  revalidatePath("/admin/newsletter");
  return { success: true };
}

const settingsSchema = z.object({
  concierge_phone: z.string().trim().max(40).default(""),
  business_siren: z.string().trim().max(60).default(""),
});

/** Non-secret business settings only. Secrets live in the hosting environment. */
export async function actionSaveSettings(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = settingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  for (const [key, value] of Object.entries(p.data)) {
    await prisma.siteSetting.upsert({ where: { key }, create: { key, value: JSON.stringify(value) }, update: { value: JSON.stringify(value) } });
  }
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "SAVE_SETTINGS", entity: "SiteSetting", entityId: "business", diff: p.data });
  revalidatePath("/admin/settings");
  return { success: true };
}

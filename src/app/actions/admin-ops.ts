"use server";

/** SUPER_ADMIN operations: breeds, breeders, breeder applications, deliveries. */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Species, VerificationStatus, DocStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { logAudit } from "@/lib/services/audit";
import { queueEmail } from "@/lib/services/email/outbox";
import { fromParisLocalInput } from "@/lib/format";

type Result = { success: true } | { success: false; errorCode: string };
const slugRule = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);

const breedSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  slug: slugRule,
  species: z.nativeEnum(Species),
  nameEn: z.string().trim().min(1).max(80),
  nameFr: z.string().trim().min(1).max(80),
  descriptionEn: z.string().trim().max(4000).default(""),
  descriptionFr: z.string().trim().max(4000).default(""),
});

export async function actionSaveBreed(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = breedSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  const { id, ...data } = p.data;
  const owner = await prisma.breed.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (owner && owner.id !== id) return { success: false, errorCode: "SLUG_TAKEN" };
  const breed = id ? await prisma.breed.update({ where: { id }, data }) : await prisma.breed.create({ data });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: id ? "UPDATE_BREED" : "CREATE_BREED", entity: "Breed", entityId: breed.id, diff: { slug: data.slug } });
  revalidatePath("/admin/breeds");
  return { success: true };
}

export async function actionDeleteBreed(breedId: string): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const count = await prisma.animal.count({ where: { breedId } });
  if (count > 0) return { success: false, errorCode: "BREED_IN_USE" };
  await prisma.breed.delete({ where: { id: breedId } });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "DELETE_BREED", entity: "Breed", entityId: breedId });
  revalidatePath("/admin/breeds");
  return { success: true };
}

const breederSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  slug: slugRule,
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().max(80).default(""),
  country: z.string().trim().min(2).max(60),
  contact: z.string().trim().max(200).default(""),
  descriptionEn: z.string().trim().max(4000).default(""),
  descriptionFr: z.string().trim().max(4000).default(""),
  verificationStatus: z.nativeEnum(VerificationStatus),
  documentationStatus: z.nativeEnum(DocStatus),
});

/** Verification status is an explicit SUPER_ADMIN decision — never assumed. */
export async function actionSaveBreeder(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = breederSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  const { id, ...data } = p.data;
  const owner = await prisma.breeder.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (owner && owner.id !== id) return { success: false, errorCode: "SLUG_TAKEN" };
  const breeder = id ? await prisma.breeder.update({ where: { id }, data }) : await prisma.breeder.create({ data: { ...data, isDemo: false } });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: id ? "UPDATE_BREEDER" : "CREATE_BREEDER", entity: "Breeder", entityId: breeder.id, diff: { slug: data.slug, verificationStatus: data.verificationStatus } });
  revalidatePath("/admin/breeders");
  return { success: true };
}

/** Approve (creates an UNVERIFIED breeder from the application) or reject an application. */
export async function actionDecideBreederApplication(applicationId: string, decision: "APPROVED" | "REJECTED"): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const app = await prisma.breederApplication.findUnique({ where: { id: applicationId } });
  if (!app || app.status !== "PENDING") return { success: false, errorCode: "ALREADY_DECIDED" };
  if (decision === "APPROVED") {
    const base = (app.kennelName || app.name).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "breeder";
    let slug = base;
    for (let i = 2; await prisma.breeder.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
    await prisma.breeder.create({
      data: {
        slug,
        name: app.kennelName || app.name,
        city: app.city || "",
        country: app.country || "",
        contact: [app.email, app.phone].filter(Boolean).join(" | "),
        descriptionEn: "",
        descriptionFr: "",
        verificationStatus: VerificationStatus.UNVERIFIED,
        documentationStatus: DocStatus.NONE,
      },
    });
  }
  await prisma.breederApplication.update({ where: { id: applicationId }, data: { status: decision } });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: `BREEDER_APPLICATION_${decision}`, entity: "BreederApplication", entityId: applicationId });
  revalidatePath("/admin/breeders");
  return { success: true };
}

const deliverySchema = z.object({
  orderId: z.string().uuid(),
  method: z.string().trim().min(2).max(80),
  carrier: z.string().trim().max(120).default(""),
  scheduledAt: z.string().optional().default(""),
  estimatedAt: z.string().optional().default(""),
  notes: z.string().trim().max(2000).default(""),
  delivered: z.preprocess((v) => v === "on" || v === "true", z.boolean()).default(false),
});

const toDate = (v: string) => fromParisLocalInput(v);

/** Creates or updates the delivery of a paid order; notifies the customer on scheduling/delivery. */
export async function actionSaveDelivery(formData: FormData): Promise<Result> {
  const { admin } = await requireSuperAdmin();
  const p = deliverySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return { success: false, errorCode: "VALIDATION" };
  const v = p.data;
  const order = await prisma.order.findUnique({ where: { id: v.orderId }, include: { customer: true, delivery: true } });
  if (!order) return { success: false, errorCode: "NOT_FOUND" };
  if (order.isTest) return { success: false, errorCode: "TEST_ORDER" };

  const data = {
    method: v.method,
    carrier: v.carrier || null,
    scheduledAt: toDate(v.scheduledAt),
    estimatedAt: toDate(v.estimatedAt),
    confirmedAt: v.estimatedAt ? new Date() : order.delivery?.confirmedAt ?? null,
    deliveredAt: v.delivered ? order.delivery?.deliveredAt ?? new Date() : null,
    notes: v.notes || null,
  };
  await prisma.delivery.upsert({
    where: { orderId: order.id },
    update: data,
    create: { orderId: order.id, address: order.customer.deliveryAddress || "{}", ...data },
  });

  const event = v.delivered && !order.delivery?.deliveredAt ? "delivered" : data.scheduledAt && !order.delivery?.scheduledAt ? "scheduled" : null;
  if (event) {
    await queueEmail({
      idempotencyKey: `order:${order.id}:delivery:${event}`,
      template: event === "delivered" ? "delivery_confirmed" : "transport_scheduled",
      locale: order.locale,
      toEmail: order.customer.email,
      payload: { customerName: order.customer.name, orderRef: order.reference, scheduledAt: data.scheduledAt?.toISOString() ?? null, estimatedAt: data.estimatedAt?.toISOString() ?? null, carrier: data.carrier },
    });
  }
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "SAVE_DELIVERY", entity: "Order", entityId: order.id, diff: { method: v.method, scheduledAt: v.scheduledAt, delivered: v.delivered } });
  revalidatePath("/admin/deliveries");
  return { success: true };
}

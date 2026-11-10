"use server";

/**
 * SUPER_ADMIN animal catalogue actions. Every action re-checks the admin session.
 * Inventory invariants: HELD and SOLD are owned by reservations and payments — the admin can
 * only move an animal between AVAILABLE, UNAVAILABLE and ARCHIVED, and never while it is held
 * or sold. The internal payment-test animal keeps its fixed price and stays unpublished.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AnimalStatus, Species, Gender, Size, HealthDocStatus, ImageKind, DocType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { logAudit } from "@/lib/services/audit";
import { createSignedUpload, verifyUploadedAsset, deleteAsset, isMediaConfigured, type MediaKind } from "@/lib/services/media";

const MANUAL_STATUSES = [AnimalStatus.AVAILABLE, AnimalStatus.UNAVAILABLE, AnimalStatus.ARCHIVED] as const;

const list = (v: unknown) =>
  JSON.stringify(
    String(v || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12)
  );

const animalSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  breedId: z.string().uuid(),
  species: z.nativeEnum(Species),
  gender: z.nativeEnum(Gender),
  size: z.nativeEnum(Size),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().positive().max(150).nullable()),
  coat: z.string().trim().max(80).default(""),
  color: z.string().trim().max(80).default(""),
  city: z.string().trim().max(80).default(""),
  country: z.string().trim().min(2).max(60),
  priceEuros: z.preprocess((v) => Number(String(v).replace(",", ".")), z.number().positive().max(100000)),
  status: z.enum(MANUAL_STATUSES).optional(),
  published: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  featured: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  descriptionEn: z.string().trim().max(5000).default(""),
  descriptionFr: z.string().trim().max(5000).default(""),
  temperamentEn: z.string().max(500).default(""),
  temperamentFr: z.string().max(500).default(""),
  socializationEn: z.string().trim().max(2000).default(""),
  socializationFr: z.string().trim().max(2000).default(""),
  pedigree: z.string().trim().max(300).default(""),
  microchip: z.string().trim().max(300).default(""),
  transportInfo: z.string().trim().max(1000).default(""),
  healthDocStatus: z.nativeEnum(HealthDocStatus),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(170).default(""),
});

export type AnimalActionResult = { success: true; animalId: string } | { success: false; errorCode: string; fields?: string[] };

export async function actionSaveAnimal(formData: FormData): Promise<AnimalActionResult> {
  const { admin } = await requireSuperAdmin();
  const parsed = animalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, errorCode: "VALIDATION", fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] };
  }
  const v = parsed.data;
  const data = {
    name: v.name,
    slug: v.slug,
    breedId: v.breedId,
    species: v.species,
    gender: v.gender,
    size: v.size,
    dateOfBirth: new Date(`${v.dateOfBirth}T00:00:00Z`),
    weightKg: v.weightKg,
    coat: v.coat,
    color: v.color,
    city: v.city,
    country: v.country,
    priceCents: Math.round(v.priceEuros * 100),
    currency: "EUR",
    published: v.published,
    featured: v.featured,
    descriptionEn: v.descriptionEn,
    descriptionFr: v.descriptionFr,
    temperamentEn: list(v.temperamentEn),
    temperamentFr: list(v.temperamentFr),
    socializationEn: v.socializationEn,
    socializationFr: v.socializationFr,
    pedigree: v.pedigree || null,
    microchip: v.microchip || null,
    transportInfo: v.transportInfo || null,
    healthDocStatus: v.healthDocStatus,
    seoTitle: v.seoTitle || null,
    seoDescription: v.seoDescription || null,
  };

  const slugOwner = await prisma.animal.findUnique({ where: { slug: v.slug }, select: { id: true } });
  if (slugOwner && slugOwner.id !== v.id) return { success: false, errorCode: "SLUG_TAKEN", fields: ["slug"] };

  let animalId: string;
  if (v.id) {
    const current = await prisma.animal.findUnique({ where: { id: v.id } });
    if (!current) return { success: false, errorCode: "NOT_FOUND" };
    const update: Record<string, unknown> = { ...data };
    if (current.isPaymentTest) {
      // Fixed invariants of the internal test animal.
      Object.assign(update, { priceCents: 100, currency: "EUR", published: false, featured: false });
    }
    if (v.status && v.status !== current.status) {
      if (current.status === AnimalStatus.HELD || current.status === AnimalStatus.SOLD) {
        return { success: false, errorCode: "STATUS_LOCKED", fields: ["status"] };
      }
      update.status = v.status;
    }
    await prisma.animal.update({ where: { id: v.id }, data: update });
    animalId = v.id;
    await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "UPDATE_ANIMAL", entity: "Animal", entityId: animalId, diff: { slug: v.slug, priceCents: update.priceCents, status: update.status ?? current.status, published: update.published } });
  } else {
    const created = await prisma.animal.create({ data: { ...data, status: v.status ?? AnimalStatus.AVAILABLE } });
    animalId = created.id;
    await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "CREATE_ANIMAL", entity: "Animal", entityId: animalId, diff: { slug: v.slug, priceCents: data.priceCents } });
  }

  revalidatePath("/admin/animals");
  revalidatePath("/", "layout");
  return { success: true, animalId };
}

/** Quick status change from the list (same invariants as the form). */
export async function actionSetAnimalStatus(animalId: string, status: string): Promise<{ success: boolean; errorCode?: string }> {
  const { admin } = await requireSuperAdmin();
  if (!(MANUAL_STATUSES as readonly string[]).includes(status)) return { success: false, errorCode: "STATUS_NOT_ALLOWED" };
  const res = await prisma.animal.updateMany({
    where: { id: animalId, status: { notIn: [AnimalStatus.HELD, AnimalStatus.SOLD] } },
    data: { status: status as AnimalStatus },
  });
  if (res.count !== 1) return { success: false, errorCode: "STATUS_LOCKED" };
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "UPDATE_ANIMAL_STATUS", entity: "Animal", entityId: animalId, diff: { status } });
  revalidatePath("/admin/animals");
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function actionSetAnimalPublished(animalIds: string[], published: boolean) {
  const { admin } = await requireSuperAdmin();
  const ids = z.array(z.string().uuid()).max(200).parse(animalIds);
  const res = await prisma.animal.updateMany({ where: { id: { in: ids }, isPaymentTest: false }, data: { published } });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: published ? "PUBLISH_ANIMALS" : "UNPUBLISH_ANIMALS", entity: "Animal", entityId: "batch", diff: { count: res.count } });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/animals");
  return { success: true, count: res.count };
}

/** Deletes a listing only when it has no order or reservation history; otherwise archive it. */
export async function actionDeleteAnimal(animalId: string): Promise<{ success: boolean; errorCode?: string }> {
  const { admin } = await requireSuperAdmin();
  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    include: { _count: { select: { orderItems: true, reservations: true } }, images: true, documents: true },
  });
  if (!animal) return { success: false, errorCode: "NOT_FOUND" };
  if (animal.isPaymentTest) return { success: false, errorCode: "TEST_ANIMAL_PROTECTED" };
  if (animal._count.orderItems > 0 || animal._count.reservations > 0) return { success: false, errorCode: "HAS_HISTORY" };
  await prisma.animal.delete({ where: { id: animalId } });
  for (const img of animal.images) if (img.publicId) await deleteAsset(img.kind === ImageKind.VIDEO ? "video" : "image", img.publicId);
  for (const doc of animal.documents) await deleteAsset("document", doc.storageKey.split("|")[0]);
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "DELETE_ANIMAL", entity: "Animal", entityId: animalId, diff: { slug: animal.slug } });
  revalidatePath("/admin/animals");
  return { success: true };
}

// ---- Media -----------------------------------------------------------------------------

const kindSchema = z.enum(["image", "video", "document"]);

export async function actionCreateMediaUpload(animalId: string, kind: MediaKind) {
  await requireSuperAdmin();
  if (!isMediaConfigured()) return { success: false as const, errorCode: "MEDIA_NOT_CONFIGURED" };
  const k = kindSchema.parse(kind);
  const exists = await prisma.animal.findUnique({ where: { id: animalId }, select: { id: true } });
  if (!exists) return { success: false as const, errorCode: "NOT_FOUND" };
  return { success: true as const, upload: createSignedUpload(k, animalId) };
}

const attachSchema = z.object({
  animalId: z.string().uuid(),
  kind: kindSchema,
  publicId: z.string().min(3).max(300),
  altEn: z.string().max(200).default(""),
  altFr: z.string().max(200).default(""),
  docType: z.nativeEnum(DocType).optional(),
  title: z.string().max(200).default(""),
});

export async function actionAttachAnimalMedia(input: z.input<typeof attachSchema>) {
  const { admin } = await requireSuperAdmin();
  const v = attachSchema.parse(input);
  let asset;
  try {
    asset = await verifyUploadedAsset(v.kind, v.animalId, v.publicId);
  } catch (err) {
    return { success: false as const, errorCode: (err as Error).message.startsWith("MEDIA_") ? (err as Error).message : "MEDIA_VERIFY_FAILED" };
  }

  if (v.kind === "document") {
    await prisma.animalDocument.create({
      data: { animalId: v.animalId, type: v.docType ?? DocType.OTHER, title: v.title || asset.publicId.split("/").pop() || "document", storageKey: `${asset.publicId}|${asset.format}` },
    });
  } else {
    const max = await prisma.animalImage.aggregate({ where: { animalId: v.animalId }, _max: { sortOrder: true } });
    await prisma.animalImage.create({
      data: {
        animalId: v.animalId,
        url: asset.url,
        publicId: asset.publicId,
        altEn: v.altEn || null,
        altFr: v.altFr || null,
        kind: v.kind === "video" ? ImageKind.VIDEO : ImageKind.IMAGE,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
  }
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "ATTACH_ANIMAL_MEDIA", entity: "Animal", entityId: v.animalId, diff: { kind: v.kind, publicId: v.publicId, bytes: asset.bytes } });
  revalidatePath(`/admin/animals/${v.animalId}`);
  return { success: true as const };
}

export async function actionRemoveAnimalImage(imageId: string) {
  const { admin } = await requireSuperAdmin();
  const img = await prisma.animalImage.findUnique({ where: { id: imageId } });
  if (!img) return { success: false };
  await prisma.animalImage.delete({ where: { id: imageId } });
  if (img.publicId) await deleteAsset(img.kind === ImageKind.VIDEO ? "video" : "image", img.publicId);
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "REMOVE_ANIMAL_MEDIA", entity: "Animal", entityId: img.animalId, diff: { imageId } });
  revalidatePath(`/admin/animals/${img.animalId}`);
  return { success: true };
}

export async function actionMoveAnimalImage(imageId: string, direction: "up" | "down") {
  await requireSuperAdmin();
  const img = await prisma.animalImage.findUnique({ where: { id: imageId } });
  if (!img) return { success: false };
  const neighbour = await prisma.animalImage.findFirst({
    where: { animalId: img.animalId, sortOrder: direction === "up" ? { lt: img.sortOrder } : { gt: img.sortOrder } },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return { success: true };
  await prisma.$transaction([
    prisma.animalImage.update({ where: { id: img.id }, data: { sortOrder: neighbour.sortOrder } }),
    prisma.animalImage.update({ where: { id: neighbour.id }, data: { sortOrder: img.sortOrder } }),
  ]);
  revalidatePath(`/admin/animals/${img.animalId}`);
  return { success: true };
}

export async function actionVerifyAnimalDocument(documentId: string, isPublicSummary: boolean) {
  const { admin } = await requireSuperAdmin();
  const doc = await prisma.animalDocument.update({
    where: { id: documentId },
    data: { verifiedAt: new Date(), verifiedBy: admin.email, isPublicSummary },
  });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "VERIFY_ANIMAL_DOCUMENT", entity: "AnimalDocument", entityId: documentId, diff: { isPublicSummary } });
  revalidatePath(`/admin/animals/${doc.animalId}`);
  return { success: true };
}

export async function actionRemoveAnimalDocument(documentId: string) {
  const { admin } = await requireSuperAdmin();
  const doc = await prisma.animalDocument.findUnique({ where: { id: documentId } });
  if (!doc) return { success: false };
  await prisma.animalDocument.delete({ where: { id: documentId } });
  await deleteAsset("document", doc.storageKey.split("|")[0]);
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "REMOVE_ANIMAL_DOCUMENT", entity: "AnimalDocument", entityId: documentId });
  revalidatePath(`/admin/animals/${doc.animalId}`);
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import {
  requireSuperAdmin,
  adminLogin,
  adminLogout,
  adminRevokeSession,
  adminForgotPassword,
  adminResetPassword,
  adminChangePassword,
  adminEnrolMFA,
  adminConfirmMFA,
  adminDisableMFA,
  adminListSessions,
} from "@/lib/services/admin-auth";
import { transitionOrderStatus, recordManualPayment } from "@/lib/services/orders";
import { logAudit } from "@/lib/services/audit";
import { anonymizeCustomerData } from "@/lib/services/gdpr";
import { adminReplyTicket } from "@/lib/services/support";
import {
  AnimalStatus,
  OrderStatus,
  RefundStatus,
  ExceptionStatus,
  ReservationStatus,
  Size,
  Species,
  Gender,
  VerificationStatus,
} from "@prisma/client";

export async function actionAdminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const totpCode = (formData.get("totpCode") as string) || undefined;

  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1";
  const userAgent = reqHeaders.get("user-agent") || undefined;

  return await adminLogin(email, password, totpCode, ip, userAgent);
}

export async function actionAdminLogout() {
  await adminLogout();
  redirect("/admin/login");
}

export async function actionUpdateOrderStatus(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as OrderStatus;
  const reason = (formData.get("reason") as string) || undefined;

  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  await transitionOrderStatus({
    orderId,
    toStatus: newStatus,
    actor: {
      actorType: "ADMIN",
      adminId: admin.id,
      ip,
    },
    reason,
  });

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function actionRecordManualPayment(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const orderId = formData.get("orderId") as string;
  const bankReference = formData.get("bankReference") as string;
  const justification = formData.get("justification") as string;

  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  await recordManualPayment({
    orderId,
    adminId: admin.id,
    bankReference,
    justification,
    ip,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function actionResolveException(exceptionId: string, notes: string) {
  const { admin } = await requireSuperAdmin();
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  await prisma.reconciliationException.update({
    where: { id: exceptionId },
    data: {
      status: ExceptionStatus.RESOLVED,
      notes,
    },
  });

  await logAudit({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "RESOLVE_RECONCILIATION_EXCEPTION",
    entity: "ReconciliationException",
    entityId: exceptionId,
    ip,
    diff: { notes },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function actionAdminReplyTicket(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const ticketId = formData.get("ticketId") as string;
  const body = formData.get("body") as string;
  const isInternalNote = formData.get("isInternalNote") === "true";

  await adminReplyTicket(ticketId, admin.id, body, isInternalNote);
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  return { success: true };
}

export async function actionAnonymizeCustomer(customerId: string) {
  const { admin } = await requireSuperAdmin();
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  await anonymizeCustomerData(customerId, admin.id, ip);
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function actionUpdateAnimalStatus(animalId: string, status: AnimalStatus, published: boolean) {
  const { admin } = await requireSuperAdmin();
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  const updated = await prisma.animal.update({
    where: { id: animalId },
    data: { status, published },
  });

  await logAudit({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "UPDATE_ANIMAL_STATUS",
    entity: "Animal",
    entityId: animalId,
    ip,
    diff: { status, published },
  });

  revalidatePath("/admin/animals");
  return { success: true, animal: updated };
}

export async function actionAdminForgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  return await adminForgotPassword(email, ip);
}

export async function actionAdminResetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  return await adminResetPassword(token, newPassword, ip);
}

export async function actionAdminChangePassword(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  const res = await adminChangePassword(admin.id, currentPassword, newPassword, ip);
  if (res.success) {
    revalidatePath("/admin/account");
  }
  return res;
}

export async function actionAdminEnrolMFA() {
  const { admin } = await requireSuperAdmin();
  return await adminEnrolMFA(admin.id);
}

export async function actionAdminConfirmMFA(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const totpCode = formData.get("totpCode") as string;
  const secret = formData.get("secret") as string;
  const recoveryCodesRaw = formData.get("recoveryCodes") as string;
  const recoveryCodes = JSON.parse(recoveryCodesRaw || "[]");

  const res = await adminConfirmMFA(admin.id, totpCode, secret, recoveryCodes);
  if (res.success) {
    revalidatePath("/admin/account");
  }
  return res;
}

export async function actionAdminDisableMFA(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const password = formData.get("password") as string;

  const res = await adminDisableMFA(admin.id, password);
  if (res.success) {
    revalidatePath("/admin/account");
  }
  return res;
}

export async function actionAdminRevokeSession(sessionId: string) {
  const { admin } = await requireSuperAdmin();
  await adminRevokeSession(sessionId, admin.id);
  revalidatePath("/admin/account");
  return { success: true };
}

export async function actionSaveAnimal(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const breedId = formData.get("breedId") as string;
  const species = (formData.get("species") as Species) || Species.DOG;
  const gender = (formData.get("gender") as Gender) || Gender.MALE;
  const priceCents = parseInt((formData.get("priceCents") as string) || "0", 10);
  const status = (formData.get("status") as AnimalStatus) || AnimalStatus.AVAILABLE;
  const published = formData.get("published") === "true";
  const city = (formData.get("city") as string) || "Paris";
  const country = (formData.get("country") as string) || "France";
  const descriptionEn = (formData.get("descriptionEn") as string) || "";
  const descriptionFr = (formData.get("descriptionFr") as string) || "";
  const imageUrl = formData.get("imageUrl") as string | null;

  const data = {
    name,
    slug: slug.toLowerCase().trim(),
    breedId,
    species,
    gender,
    priceCents,
    currency: "EUR",
    status,
    published,
    city,
    country,
    descriptionEn,
    descriptionFr,
    temperamentEn: "[]",
    temperamentFr: "[]",
    coat: "Standard",
    color: "Standard",
    size: (formData.get("size") as Size) || Size.MEDIUM,
    dateOfBirth: new Date("2026-01-01"),
    socializationEn: "European Concierge standard socialization",
    socializationFr: "Socialisation selon le protocole de conciergerie",
  };

  let animal;
  if (id) {
    animal = await prisma.animal.update({
      where: { id },
      data,
    });
  } else {
    animal = await prisma.animal.create({
      data,
    });
  }

  if (imageUrl && animal) {
    await prisma.animalImage.create({
      data: {
        animalId: animal.id,
        url: imageUrl,
        sortOrder: 0,
      },
    });
  }

  revalidatePath("/admin/animals");
  return { success: true, animalId: animal.id };
}

export async function actionDeleteAnimal(animalId: string) {
  await requireSuperAdmin();
  await prisma.animal.delete({
    where: { id: animalId },
  });
  revalidatePath("/admin/animals");
  return { success: true };
}

export async function actionSaveBreed(formData: FormData) {
  await requireSuperAdmin();
  const id = formData.get("id") as string | null;
  const nameEn = formData.get("nameEn") as string;
  const nameFr = formData.get("nameFr") as string;
  const slug = formData.get("slug") as string;
  const species = (formData.get("species") as Species) || Species.DOG;

  const data = {
    nameEn,
    nameFr,
    slug: slug.toLowerCase().trim(),
    species,
    descriptionEn: (formData.get("descriptionEn") as string) || "",
    descriptionFr: (formData.get("descriptionFr") as string) || "",
  };

  if (id) {
    await prisma.breed.update({ where: { id }, data });
  } else {
    await prisma.breed.create({ data });
  }

  revalidatePath("/admin/breeds");
  return { success: true };
}

export async function actionSaveBreeder(formData: FormData) {
  await requireSuperAdmin();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const contact = email && phone ? `${email} | ${phone}` : (email || phone || "concierge@pawelium.com");
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const slug = formData.get("slug") as string;

  const data = {
    name,
    contact,
    city,
    country,
    slug: slug.toLowerCase().trim(),
    verificationStatus: VerificationStatus.VERIFIED,
    descriptionEn: (formData.get("descriptionEn") as string) || "",
    descriptionFr: (formData.get("descriptionFr") as string) || "",
  };

  if (id) {
    await prisma.breeder.update({ where: { id }, data });
  } else {
    await prisma.breeder.create({ data });
  }

  revalidatePath("/admin/breeders");
  return { success: true };
}

export async function actionForceReleaseReservation(reservationId: string) {
  await requireSuperAdmin();
  const res = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (res) {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.RELEASED, releasedAt: new Date(), activeAnimalId: null },
    });

    if (res.animalId) {
      await prisma.animal.updateMany({
        where: { id: res.animalId, status: AnimalStatus.HELD },
        data: { status: AnimalStatus.AVAILABLE },
      });
    }
  }

  revalidatePath("/admin/reservations");
  return { success: true };
}

export async function actionProcessRefund(refundId: string, notes?: string) {
  const { admin } = await requireSuperAdmin();
  await prisma.refund.update({
    where: { id: refundId },
    data: {
      status: RefundStatus.COMPLETED,
      adminId: admin.id,
    },
  });

  revalidatePath("/admin/refunds");
  return { success: true };
}

export async function actionModerateReview(reviewId: string, status: "APPROVED" | "REJECTED") {
  await requireSuperAdmin();
  await prisma.review.update({
    where: { id: reviewId },
    data: { status },
  });

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function actionSaveTranslationOverride(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const locale = formData.get("locale") as string;
  const namespace = formData.get("namespace") as string;
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  await prisma.translationOverride.upsert({
    where: {
      locale_namespace_key: { locale, namespace, key },
    },
    create: {
      locale,
      namespace,
      key,
      value,
      authorId: admin.id,
    },
    update: {
      value,
      authorId: admin.id,
    },
  });

  revalidatePath("/admin/translations");
  return { success: true };
}

export async function actionSaveContentBlock(formData: FormData) {
  await requireSuperAdmin();
  const key = formData.get("key") as string;
  const locale = formData.get("locale") as string;
  const title = (formData.get("title") as string) || null;
  const content = formData.get("content") as string;

  await prisma.contentBlock.upsert({
    where: {
      key_locale: { key, locale },
    },
    create: {
      key,
      locale,
      title,
      content,
    },
    update: {
      title,
      content,
    },
  });

  revalidatePath("/admin/content");
  return { success: true };
}

export async function actionSaveSiteSetting(key: string, value: string) {
  await requireSuperAdmin();
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

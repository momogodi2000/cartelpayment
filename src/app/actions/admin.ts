"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requireSuperAdmin, adminLogin, adminLogout, adminRevokeSession } from "@/lib/services/admin-auth";
import { transitionOrderStatus, recordManualPayment } from "@/lib/services/orders";
import { logAudit } from "@/lib/services/audit";
import { anonymizeCustomerData } from "@/lib/services/gdpr";
import { adminReplyTicket } from "@/lib/services/support";
import { AnimalStatus, OrderStatus, RefundStatus, ExceptionStatus } from "@prisma/client";

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

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
  adminStartMfaEnrolment,
  adminConfirmMfaEnrolment,
  adminDisableMFA,
  adminListSessions,
} from "@/lib/services/admin-auth";
import { transitionOrderStatus, recordManualPayment } from "@/lib/services/orders";
import { logAudit } from "@/lib/services/audit";
import { anonymizeCustomerData } from "@/lib/services/gdpr";
import { adminReplyTicket } from "@/lib/services/support";
import { reconcileUnresolvedPayments } from "@/lib/services/payments/reconciliation";
import { releaseHold, acquireHold, AnimalUnavailableError } from "@/lib/services/inventory";
import { createPaymentSessionForOrder } from "@/lib/services/payments/checkout-session";
import { CardPaymentUnavailableError } from "@/lib/services/payments/payment-initialization";
import { applyProviderStatus } from "@/lib/services/payments/settlement";
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

async function requestIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function actionAdminLogin(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const totpCode = String(formData.get("totpCode") || "") || undefined;
  const userAgent = (await headers()).get("user-agent") || undefined;
  return adminLogin(email, password, totpCode, await requestIp(), userAgent);
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

  const cleanNotes = String(notes || "").trim().slice(0, 1000);
  if (!cleanNotes) throw new Error("Resolution notes are required.");
  const existing = await prisma.reconciliationException.findUniqueOrThrow({ where: { id: exceptionId } });
  await prisma.reconciliationException.update({
    where: { id: exceptionId },
    data: {
      status: ExceptionStatus.RESOLVED,
      notes: `${existing.notes ? `${existing.notes}
` : ""}[Resolved by ${admin.email} ${new Date().toISOString()}] ${cleanNotes}`.slice(0, 4000),
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


export async function actionAdminForgotPassword(formData: FormData) {
  return adminForgotPassword(String(formData.get("email") || ""), await requestIp());
}

export async function actionAdminResetPassword(formData: FormData) {
  return adminResetPassword(String(formData.get("token") || ""), String(formData.get("newPassword") || ""), await requestIp());
}

export async function actionAdminChangePassword(formData: FormData) {
  const { admin, session } = await requireSuperAdmin();
  const res = await adminChangePassword(
    admin.id,
    session.id,
    String(formData.get("currentPassword") || ""),
    String(formData.get("newPassword") || ""),
    await requestIp()
  );
  if (res.success) revalidatePath("/admin", "layout");
  return res;
}

/** Starts TOTP enrolment: the secret is kept server-side (encrypted httpOnly cookie). */
export async function actionAdminStartMFA() {
  const { admin } = await requireSuperAdmin();
  const { secret, otpauthUrl } = await adminStartMfaEnrolment(admin.id);
  const qrcode = (await import("qrcode")).default;
  const qrSvg = await qrcode.toString(otpauthUrl, { type: "svg", margin: 1, color: { dark: "#183C32", light: "#FFFFFF" } });
  return { secret, qrSvg };
}

export async function actionAdminConfirmMFA(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const res = await adminConfirmMfaEnrolment(admin.id, String(formData.get("totpCode") || ""));
  if (res.success) revalidatePath("/admin/account");
  return res;
}

export async function actionAdminDisableMFA(formData: FormData) {
  const { admin } = await requireSuperAdmin();
  const res = await adminDisableMFA(admin.id, String(formData.get("password") || ""));
  if (res.success) revalidatePath("/admin/account");
  return res;
}

export async function actionAdminRevokeSession(sessionId: string) {
  const { admin } = await requireSuperAdmin();
  await adminRevokeSession(sessionId, admin.id);
  revalidatePath("/admin/account");
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

export async function actionReconcilePayments() {
  const { admin } = await requireSuperAdmin();
  const report = await reconcileUnresolvedPayments();

  await logAudit({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "RECONCILE_PAYMENTS",
    entity: "Payment",
    entityId: "batch",
    diff: JSON.parse(JSON.stringify(report)),
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/orders");
  return { success: true, report };
}

export type TestPaymentErrorCode =
  | "NOT_AUTHORIZED"
  | "DOG_MISSING"
  | "PRICE_INVALID"
  | "UNAVAILABLE"
  | "PHONE_INVALID"
  | "PAYMENT_UNAVAILABLE"
  | "PAYMENT_REVIEW";

/**
 * SUPER_ADMIN only: creates the single controlled €1.00 EUR live card payment for the
 * internal test dog. Requires explicit authorisation; never retries automatically.
 */
export async function actionStartTestPayment(
  formData: FormData
): Promise<{ success: true; checkoutUrl: string; orderRef: string } | { success: false; errorCode: TestPaymentErrorCode }> {
  const { admin } = await requireSuperAdmin();

  if (formData.get("authorize") !== "on") return { success: false, errorCode: "NOT_AUTHORIZED" };
  const phone = String(formData.get("phone") || "").trim();
  if (!/^\+?[0-9 ]{8,20}$/.test(phone)) return { success: false, errorCode: "PHONE_INVALID" };
  const localeRaw = String(formData.get("locale") || "en");
  const locale = localeRaw === "fr" ? "fr" : "en";

  const testDogs = await prisma.animal.findMany({ where: { isPaymentTest: true } });
  if (testDogs.length !== 1) return { success: false, errorCode: "DOG_MISSING" };
  const testDog = testDogs[0];
  if (testDog.priceCents !== 100 || testDog.currency !== "EUR") return { success: false, errorCode: "PRICE_INVALID" };

  let hold;
  try {
    hold = await acquireHold({
      animalId: testDog.id,
      customer: { name: admin.name, email: admin.email, phone, country: "FR", locale },
      deliveryCountry: "FR",
      termsVersion: "internal-payment-test",
      allowPaymentTest: true,
    });
  } catch (err) {
    if (err instanceof AnimalUnavailableError) return { success: false, errorCode: "UNAVAILABLE" };
    throw err;
  }

  // Server-side assertion: the charge is exactly €1.00 EUR.
  if (!hold.isTest || hold.pricing.totalCents !== 100) {
    await releaseHold(hold.reservationId, "Test payment aborted: amount is not exactly €1.00");
    return { success: false, errorCode: "PRICE_INVALID" };
  }

  try {
    const session = await createPaymentSessionForOrder(hold.orderId);
    await logAudit({
      actorType: "ADMIN",
      adminId: admin.id,
      action: "START_TEST_PAYMENT",
      entity: "Order",
      entityId: hold.orderId,
      diff: { orderRef: hold.orderReference, amountCents: 100, currency: "EUR" },
    });
    revalidatePath("/admin/test-payment");
    return { success: true, checkoutUrl: session.checkoutUrl, orderRef: hold.orderReference };
  } catch (err) {
    await releaseHold(hold.reservationId, `Test payment initialization failed: ${(err as Error).message}`);
    revalidatePath("/admin/test-payment");
    if (err instanceof CardPaymentUnavailableError && err.reason === "RECONCILIATION_REQUIRED") {
      return { success: false, errorCode: "PAYMENT_REVIEW" };
    }
    return { success: false, errorCode: "PAYMENT_UNAVAILABLE" };
  }
}

/** SUPER_ADMIN: re-fetch the provider status of one test order (never charges). */
export async function actionRefreshTestPayment(orderRef: string) {
  const { admin } = await requireSuperAdmin();
  const order = await prisma.order.findUnique({
    where: { reference: orderRef },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order?.isTest) throw new Error("Not an internal test order.");
  const ref = order.payments[0]?.providerReference;
  const result = ref ? await applyProviderStatus(ref) : null;
  await logAudit({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "REFRESH_TEST_PAYMENT",
    entity: "Order",
    entityId: order.id,
    diff: { paymentStatus: result?.paymentStatus ?? null },
  });
  revalidatePath("/admin/test-payment");
  return { success: true, paymentStatus: result?.paymentStatus ?? null };
}

export async function actionResetTestDogStatus() {
  const { admin } = await requireSuperAdmin();
  const testDog = await prisma.animal.findFirst({
    where: { isPaymentTest: true },
  });

  if (!testDog) {
    throw new Error("Internal payment-testing dog not found.");
  }

  // Release any active reservations on the test dog
  const activeRes = await prisma.reservation.findFirst({
    where: { animalId: testDog.id, status: ReservationStatus.ACTIVE },
  });

  if (activeRes) {
    await releaseHold(activeRes.id, "Admin reset payment-test dog status");
  }

  await prisma.animal.update({
    where: { id: testDog.id },
    data: { status: AnimalStatus.AVAILABLE },
  });

  await logAudit({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "RESET_TEST_DOG",
    entity: "Animal",
    entityId: testDog.id,
    diff: { status: AnimalStatus.AVAILABLE },
  });

  revalidatePath("/admin/test-payment");
  revalidatePath("/admin/animals");
  return { success: true };
}

// ---- Card gateway administration (SUPER_ADMIN) ---------------------------------------------

const gatewayUpdateSchema = z.object({
  gatewayId: z.string().min(1),
  enabled: z.boolean().optional(),
  priority: z.number().int().min(1).max(99).optional(),
});

async function assertCardGateway(gatewayId: string) {
  const { getBaseRegistry } = await import("@/lib/services/payments/gateway-registry");
  const gw = getBaseRegistry().find((g) => g.id === gatewayId);
  if (!gw || gw.method !== "card") throw new Error("Unknown or non-card gateway.");
  return gw;
}

/** Changes priority / enabled flag of a registered CARD gateway. Identifiers cannot be edited. */
export async function actionUpdateGateway(input: { gatewayId: string; enabled?: boolean; priority?: number }) {
  const { admin } = await requireSuperAdmin();
  const parsed = gatewayUpdateSchema.parse(input);
  await assertCardGateway(parsed.gatewayId);
  const { loadGatewayOverrides, SETTING_KEY_GATEWAYS } = await import("@/lib/services/payments/gateway-registry");
  const overrides = await loadGatewayOverrides();
  overrides[parsed.gatewayId] = {
    ...overrides[parsed.gatewayId],
    ...(parsed.enabled !== undefined ? { enabled: parsed.enabled } : {}),
    ...(parsed.priority !== undefined ? { priority: parsed.priority } : {}),
  };
  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEY_GATEWAYS },
    create: { key: SETTING_KEY_GATEWAYS, value: JSON.stringify(overrides) },
    update: { value: JSON.stringify(overrides) },
  });
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "UPDATE_GATEWAY", entity: "Gateway", entityId: parsed.gatewayId, diff: parsed });
  revalidatePath("/admin/payments");
  revalidatePath("/admin/test-payment");
  return { success: true };
}

/** Declares a provider-reported outage (circuit OPEN until verified recovery). */
export async function actionMarkGatewayOutage(gatewayId: string, note: string) {
  const { admin } = await requireSuperAdmin();
  await assertCardGateway(gatewayId);
  const { markGatewayOutage } = await import("@/lib/services/payments/gateway-health");
  const cleanNote = String(note || "").trim().slice(0, 300) || "Outage declared by SUPER_ADMIN";
  await markGatewayOutage(gatewayId, cleanNote);
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "GATEWAY_OUTAGE", entity: "Gateway", entityId: gatewayId, diff: { note: cleanNote } });
  revalidatePath("/admin/payments");
  return { success: true };
}

/** Allows exactly one trial attempt on the gateway (HALF_OPEN). */
export async function actionGatewayTrial(gatewayId: string) {
  const { admin } = await requireSuperAdmin();
  await assertCardGateway(gatewayId);
  const { moveGatewayToHalfOpen } = await import("@/lib/services/payments/gateway-health");
  await moveGatewayToHalfOpen(gatewayId);
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "GATEWAY_HALF_OPEN", entity: "Gateway", entityId: gatewayId });
  revalidatePath("/admin/payments");
  return { success: true };
}

/**
 * Re-verifies a gateway identifier with GeniusPay by creating ONE unpaid €1.00 EUR session
 * (never shown to anyone, expires after 24 h). Requires explicit confirmation.
 */
export async function actionProbeGateway(gatewayId: string, confirmed: boolean) {
  const { admin } = await requireSuperAdmin();
  if (!confirmed) throw new Error("Probe requires explicit confirmation.");
  await assertCardGateway(gatewayId);
  const { probeGateway } = await import("@/lib/services/payments/probe");
  const { getEnv } = await import("@/lib/env");
  const outcome = await probeGateway(
    gatewayId,
    { name: admin.name, email: admin.email, phone: "+33100000000" },
    getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
  );
  await logAudit({ actorType: "ADMIN", adminId: admin.id, action: "GATEWAY_PROBE", entity: "Gateway", entityId: gatewayId, diff: JSON.parse(JSON.stringify(outcome)) });
  revalidatePath("/admin/payments");
  return outcome;
}

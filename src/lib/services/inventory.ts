import { AnimalStatus, ReservationStatus, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { getEnv } from "../env";
import { generateOrderReference } from "../domain/references";
import { calculatePricing } from "../domain/pricing";

export class AnimalUnavailableError extends Error {
  constructor(message = "Animal is no longer available for reservation") {
    super(message);
    this.name = "AnimalUnavailableError";
  }
}

export interface AcquireHoldParams {
  animalId: string;
  customer: {
    email: string;
    name: string;
    phone: string;
    country: string;
    billingAddress?: Record<string, unknown>;
    deliveryAddress?: Record<string, unknown>;
    locale?: string;
  };
  deliveryCountry?: string;
  deliveryMethod?: "standard" | "express" | "vip";
  termsVersion?: string;
  /**
   * Only the SUPER_ADMIN test-payment flow may reserve the internal payment-test animal.
   * Public checkout leaves this false, so the test animal is rejected server-side.
   */
  allowPaymentTest?: boolean;
}

export interface HoldResult {
  orderId: string;
  orderReference: string;
  reservationId: string;
  expiresAt: Date;
  pricing: ReturnType<typeof calculatePricing>;
  isTest: boolean;
}

/**
 * Atomically acquires a temporary reservation hold on an animal.
 * Enforces database-level uniqueness via activeAnimalId.
 */
export async function acquireHold(params: AcquireHoldParams): Promise<HoldResult> {
  const env = getEnv();
  const holdMinutes = env.HOLD_MINUTES || 30;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000);
  const locale = params.customer.locale || "en";
  const termsVersion = params.termsVersion || "2026-v1";

  // Use Serializable isolation on PostgreSQL when supported, default on SQLite
  const txOptions: {
    timeout?: number;
    maxWait?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  } = {
    timeout: 15000,
    maxWait: 10000,
    ...(env.DATABASE_PROVIDER === "postgresql"
      ? { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      : {}),
  };

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch animal and lock status
      const animal = await tx.animal.findUnique({
        where: { id: params.animalId },
        include: { breed: true },
      });

      const isTest = Boolean(animal?.isPaymentTest);
      if (!animal || animal.status !== AnimalStatus.AVAILABLE) {
        throw new AnimalUnavailableError("Animal is not available for adoption.");
      }
      if (isTest ? !params.allowPaymentTest : !animal.published) {
        throw new AnimalUnavailableError("Animal is not available for adoption.");
      }

      // 2. Atomic update to HELD
      const updateResult = await tx.animal.updateMany({
        where: {
          id: params.animalId,
          status: AnimalStatus.AVAILABLE,
          ...(isTest ? { isPaymentTest: true } : { published: true, isPaymentTest: false }),
        },
        data: {
          status: AnimalStatus.HELD,
        },
      });

      if (updateResult.count !== 1) {
        throw new AnimalUnavailableError("Animal was reserved by another customer.");
      }

      // 3. Upsert customer
      let customer = await tx.customer.findFirst({
        where: {
          email: params.customer.email.toLowerCase().trim(),
          phone: params.customer.phone.trim(),
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            email: params.customer.email.toLowerCase().trim(),
            name: params.customer.name.trim(),
            phone: params.customer.phone.trim(),
            country: params.customer.country,
            billingAddress: params.customer.billingAddress ? JSON.stringify(params.customer.billingAddress) : null,
            deliveryAddress: params.customer.deliveryAddress ? JSON.stringify(params.customer.deliveryAddress) : null,
            locale,
          },
        });
      }

      // 4. Calculate server-authoritative pricing
      // The internal test animal is charged its exact price (no transport, fees or extra VAT).
      const pricing = isTest
        ? {
            animalPriceCents: animal.priceCents,
            transportCents: 0,
            taxCents: 0,
            feesCents: 0,
            totalCents: animal.priceCents,
            currency: "EUR",
          }
        : calculatePricing(animal.priceCents, {
            deliveryCountry: params.deliveryCountry || params.customer.country,
            deliveryMethod: params.deliveryMethod,
          });

      const orderReference = generateOrderReference();

      // 5. Create Order
      const order = await tx.order.create({
        data: {
          reference: orderReference,
          customerId: customer.id,
          status: OrderStatus.PENDING_PAYMENT,
          locale,
          subtotalCents: pricing.animalPriceCents,
          transportCents: pricing.transportCents,
          taxCents: pricing.taxCents,
          feesCents: pricing.feesCents,
          totalCents: pricing.totalCents,
          currency: pricing.currency,
          termsAcceptedAt: now,
          termsVersion,
          isTest,
        },
      });

      // 6. Create OrderItem
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          animalId: animal.id,
          priceCents: animal.priceCents,
          animalName: animal.name,
          breedName: locale === "fr" ? animal.breed.nameFr : animal.breed.nameEn,
        },
      });

      // 7. Create Reservation with activeAnimalId unique lock
      const reservation = await tx.reservation.create({
        data: {
          animalId: animal.id,
          orderId: order.id,
          status: ReservationStatus.ACTIVE,
          expiresAt,
          activeAnimalId: animal.id, // DB unique constraint guarantees no duplicate active hold
        },
      });

      // 8. Order Status History log
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: OrderStatus.PENDING_PAYMENT,
          actorType: "SYSTEM",
          reason: "Reservation hold acquired during checkout",
        },
      });

      return {
        orderId: order.id,
        orderReference,
        reservationId: reservation.id,
        expiresAt,
        pricing,
        isTest,
      };
    }, txOptions);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("activeAnimalId")) {
      throw new AnimalUnavailableError("Animal has an active reservation hold.");
    }
    throw error;
  }
}

/**
 * Releases an active reservation hold.
 */
export async function releaseHold(
  reservationId: string,
  reason = "Hold expired or cancelled by user",
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;

  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
    include: { animal: true, order: true },
  });

  if (!reservation || reservation.status !== ReservationStatus.ACTIVE) {
    return;
  }

  const runRelease = async (innerTx: Prisma.TransactionClient) => {
    // 1. Release reservation record
    await innerTx.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.RELEASED,
        releasedAt: new Date(),
        activeAnimalId: null, // Clear active lock
      },
    });

    // 2. Revert animal to AVAILABLE if currently HELD
    await innerTx.animal.updateMany({
      where: {
        id: reservation.animalId,
        status: AnimalStatus.HELD,
      },
      data: {
        status: AnimalStatus.AVAILABLE,
      },
    });

    // 3. Mark order as CANCELLED if still pending
    if (
      reservation.order.status === OrderStatus.PENDING_PAYMENT ||
      reservation.order.status === OrderStatus.PAYMENT_PROCESSING
    ) {
      await innerTx.order.update({
        where: { id: reservation.orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      await innerTx.orderStatusHistory.create({
        data: {
          orderId: reservation.orderId,
          fromStatus: reservation.order.status,
          toStatus: OrderStatus.CANCELLED,
          actorType: "SYSTEM",
          reason,
        },
      });
    }
  };

  if (tx) {
    await runRelease(tx);
  } else {
    await prisma.$transaction(runRelease);
  }
}

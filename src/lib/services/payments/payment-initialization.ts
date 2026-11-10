/**
 * src/lib/services/payments/payment-initialization.ts
 *
 * Secure card initialization pipeline for Pawelium 2.0.
 * Implements pre-request Payment and PaymentAttempt tracking, circuit-breaker
 * error classification, and safe multi-gateway fallback.
 */

import { prisma } from "../../db/client";
import { PaymentStatus, PaymentAttemptStatus } from "@prisma/client";
import { selectCardGateways } from "./payment-router";
import { recordGatewayFailure, recordGatewaySuccess } from "./gateway-health";
import { classifyInitError } from "./payment-fallback";
import { geniusPay } from "./geniuspay";
import { generateToken } from "../../security/tokens";
import { getEnv } from "../../env";

export interface InitializeCardPaymentInput {
  orderId: string;
  orderRef: string;
  amountCents: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    country: string;
  };
  successUrl: string;
  errorUrl: string;
}

export interface CardPaymentInitResult {
  paymentId: string;
  checkoutUrl: string;
  providerReference: string;
  attemptId: string;
}

export async function initializeCardPayment(
  input: InitializeCardPaymentInput
): Promise<CardPaymentInitResult> {
  const env = getEnv();
  const paymentEnv = env.GENIUSPAY_ENVIRONMENT === "production" ? "LIVE" : "SANDBOX";

  // 1. Create top-level Payment record in INITIALIZING state
  const payment = await prisma.payment.create({
    data: {
      orderId: input.orderId,
      amountCents: input.amountCents,
      currency: input.currency.toUpperCase(),
      method: "card",
      status: PaymentStatus.INITIALIZING,
      environment: paymentEnv as any,
    },
  });

  // 2. Select eligible, healthy card gateways
  const gateways = await selectCardGateways({
    method: "card",
    currency: input.currency,
    country: input.customer.country,
    amountCents: input.amountCents,
  });

  if (gateways.length === 0) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    throw new Error("CARD_PAYMENT_UNAVAILABLE");
  }

  // 3. Loop through gateways in priority order
  let lastError: string = "All payment gateways unavailable.";

  for (let i = 0; i < gateways.length; i++) {
    const gateway = gateways[i];
    const attemptNo = i + 1;
    const idempotencyKey = `${payment.id}_att_${attemptNo}_${generateToken(8)}`;
    const attemptRef = `att_${payment.id.slice(0, 8)}_${attemptNo}`;

    // Create attempt record BEFORE calling provider
    const attempt = await prisma.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        gatewayId: gateway.id,
        attemptNo,
        idempotencyKey,
        externalReference: attemptRef,
        status: PaymentAttemptStatus.INITIALIZING,
      },
    });

    try {
      // Call provider with 10s fetch timeout
      const providerRes = await geniusPay.createPayment({
        orderId: input.orderId,
        orderRef: input.orderRef,
        amountCents: input.amountCents,
        currency: input.currency,
        gateway: gateway.providerValue || undefined,
        customer: input.customer,
        successUrl: input.successUrl,
        errorUrl: input.errorUrl,
      });

      // Success: update attempt and payment
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: PaymentAttemptStatus.SUCCEEDED,
          providerReference: providerRes.reference,
        },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PENDING,
          providerReference: providerRes.reference,
          checkoutUrl: providerRes.checkoutUrl,
          expiresAt: providerRes.expiresAt ? new Date(providerRes.expiresAt) : null,
        },
      });

      await recordGatewaySuccess(gateway.id);

      return {
        paymentId: payment.id,
        checkoutUrl: providerRes.checkoutUrl,
        providerReference: providerRes.reference,
        attemptId: attempt.id,
      };
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error";
      lastError = errorMsg;

      const errorClass = classifyInitError({
        errorMessage: errorMsg,
        requestSent: true,
      });

      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status:
            errorClass === "AMBIGUOUS"
              ? PaymentAttemptStatus.AMBIGUOUS
              : PaymentAttemptStatus.FAILED_INIT,
          errorCode: errorClass,
        },
      });

      if (errorClass === "SAFE" || errorClass === "VALIDATION") {
        await recordGatewayFailure(gateway.id, errorMsg);
        // Continue fallback loop to next gateway
        continue;
      }

      // If decline or ambiguous, halt fallback to prevent duplicate session creation
      break;
    }
  }

  // All attempts failed
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });

  throw new Error(`CARD_PAYMENT_UNAVAILABLE: ${lastError}`);
}

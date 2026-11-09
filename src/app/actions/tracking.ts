"use server";

import { cookies } from "next/headers";
import { requestTrackingOTP, verifyTrackingOTP, TRACKING_COOKIE_NAME } from "@/lib/services/tracking";

export async function actionRequestTrackingOTP(orderRef: string, email: string) {
  try {
    return await requestTrackingOTP(orderRef, email);
  } catch (error: any) {
    return {
      success: true,
      message: "If an order matches these details, a verification code has been dispatched to your email address.",
    };
  }
}

export async function actionVerifyTrackingOTP(orderRef: string, email: string, code: string) {
  const result = await verifyTrackingOTP(orderRef, email, code);

  if (result.success && result.sessionToken) {
    const cookieStore = await cookies();
    cookieStore.set(TRACKING_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60, // 30 minutes
    });
  }

  return result;
}

export async function actionLogoutTracking() {
  const cookieStore = await cookies();
  cookieStore.delete(TRACKING_COOKIE_NAME);
}

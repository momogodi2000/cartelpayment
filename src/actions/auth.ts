"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { verifyPassword, signToken, hashPassword } from "@/lib/auth";
import { sendMail } from "@/lib/mail";

export async function loginAdmin(prevState: unknown, formData: FormData) {
  try {
    const rawEmail = formData.get("email")?.toString() || "";
    const rawPassword = formData.get("password")?.toString() || "";

    const validation = loginSchema.safeParse({ email: rawEmail, password: rawPassword });
    if (!validation.success) {
      return { success: false, message: "Invalid email format or password requirements not met." };
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "Invalid email or password." };
    if (!user.isActive) return { success: false, message: "This administrator account is disabled." };

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) return { success: false, message: "Invalid email or password." };

    const token = await signToken({ id: user.id, email: user.email, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set({
      name: "auth_logged_in",
      value: "true",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, message: "Access granted. Redirecting to dashboard..." };
  } catch (error) {
    console.error("Error logging in admin:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_logged_in");
  return { success: true };
}

export async function requestPasswordReset(prevState: unknown, formData: FormData) {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please enter a valid email address." };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Invalidate any existing unused tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email, used: false },
        data: { used: true },
      });

      const rawToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token: rawToken, expiresAt },
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetUrl = `${siteUrl}/admin/reset-password?token=${rawToken}`;

      await sendMail({
        to: email,
        subject: "AraHaven Admin — Password Reset Request",
        html: `
          <p>Hello ${user.name},</p>
          <p>A password reset was requested for your admin account.</p>
          <p><a href="${resetUrl}" style="background:#1A6B3C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">Reset Password</a></p>
          <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
          <p style="color:#737373;font-size:12px;">${resetUrl}</p>
        `,
      }).catch(() => {
        // Log silently — don't leak whether email was sent
      });
    }

    // Always return generic success to prevent email enumeration
    return {
      success: true,
      message: "If an admin account exists with that email, you'll receive reset instructions shortly.",
    };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  try {
    const token = formData.get("token")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    if (!token) return { success: false, message: "Invalid reset link." };
    if (password !== confirmPassword) return { success: false, message: "Passwords do not match." };
    if (password.length < 8) return { success: false, message: "Password must be at least 8 characters." };

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return {
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return { success: true, message: "Password updated successfully. You can now log in." };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

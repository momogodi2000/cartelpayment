"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { verifyPassword, signToken } from "@/lib/auth";

export async function loginAdmin(prevState: unknown, formData: FormData) {
  try {
    const rawEmail = formData.get("email")?.toString() || "";
    const rawPassword = formData.get("password")?.toString() || "";

    // 1. Zod schema validation
    const validation = loginSchema.safeParse({ email: rawEmail, password: rawPassword });

    if (!validation.success) {
      return {
        success: false,
        message: "Invalid email format or password requirements not met.",
      };
    }

    const { email, password } = validation.data;

    // 2. Fetch admin user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // 3. Verify hashed password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // 4. Create signed session token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Store session in HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 Hours
    });

    // Client-readable cookie to toggle navigation states
    cookieStore.set({
      name: "auth_logged_in",
      value: "true",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 Hours
    });

    return {
      success: true,
      message: "Access granted. Redirecting to dashboard...",
    };
  } catch (error) {
    console.error("Error logging in admin:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_logged_in");
  return { success: true };
}

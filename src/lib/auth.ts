import bcrypt from "bcryptjs";
import * as jose from "jose";

const TEST_SECRET = "test-only-secret-that-is-long-enough-for-jwt-signing";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || process.env.SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "test" || process.env.VITEST) {
      return new TextEncoder().encode(TEST_SECRET);
    }

    throw new Error("Missing JWT_SECRET, AUTH_SECRET, or SESSION_SECRET environment variable.");
  }

  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("JWT secret must contain at least 32 characters in production.");
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export async function signToken(payload: SessionUser): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionUser;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

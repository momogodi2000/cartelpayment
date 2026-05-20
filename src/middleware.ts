import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

// Simple in-memory rate limiter for single-server or dev environments
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  record.count += 1;
  if (record.count > limit) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  // 1. Apply Rate Limiting to Sensitive Routes (100 requests per 1 minute)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin/login") ||
    pathname === "/contact"
  ) {
    const limited = isRateLimited(ip, 100, 60 * 1000);
    if (limited) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Protect Admin Dashboard Routes
  if (pathname.startsWith("/admin/dashboard")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  // 3. Inject Secure Security Headers
  const response = NextResponse.next();
  
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Relaxed development CSP to support Next.js compilation websockets, google fonts, and unsplash
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://images.unsplash.com https://arahaven.com; " +
    "connect-src 'self' ws: wss:;"
  );

  return response;
}

export const config = {
  // Run middleware on all paths except static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\..*).*)",
  ],
};

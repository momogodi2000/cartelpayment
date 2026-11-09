import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let admin and internal API pass directly to their respective handlers
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Internationalization middleware for public routes
  const response = intlMiddleware(request);

  // Security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      "media-src 'self' https://res.cloudinary.com",
      "connect-src 'self' ws: wss: https://res.cloudinary.com https://geniuspay.ci",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://geniuspay.ci",
      "object-src 'none'",
    ].join("; ")
  );

  return response;
}

export const config = {
  // Exclude admin, api, Next internals, metadata routes and static assets
  matcher: [
    "/((?!api|admin|_next/static|_next/image|opengraph-image|twitter-image|icon|apple-icon|manifest|.*\\..*).*)",
  ],
};

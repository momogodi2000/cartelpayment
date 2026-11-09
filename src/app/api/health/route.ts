import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "ok";
  let dbLatencyMs = 0;

  try {
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - start);
  } catch (error: any) {
    dbStatus = `error: ${error.message}`;
  }

  const env = getEnv();
  const configStatus = {
    databaseProvider: env.DATABASE_PROVIDER,
    geniusPayConfigured: !!env.GENIUSPAY_API_KEY && !env.GENIUSPAY_API_KEY.includes("placeholder"),
    resendConfigured: !!env.RESEND_API_KEY && !env.RESEND_API_KEY.includes("placeholder"),
    cloudinaryConfigured: !!env.CLOUDINARY_CLOUD_NAME,
  };

  const isHealthy = dbStatus === "ok";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      service: "pawelium",
      version: "2.0.0",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      configuration: configStatus,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

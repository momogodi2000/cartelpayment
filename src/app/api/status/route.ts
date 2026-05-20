import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    const memory = process.memoryUsage();
    const uptime = process.uptime();

    return NextResponse.json(
      {
        status: "operational",
        uptimeSeconds: Math.floor(uptime),
        database: {
          status: "connected",
          latencyMs,
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.NODE_ENV,
          memoryUsage: {
            rssMb: Math.round(memory.rss / (1024 * 1024)),
            heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
            heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Status check failed:", error);
    return NextResponse.json(
      {
        status: "degraded",
        error: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

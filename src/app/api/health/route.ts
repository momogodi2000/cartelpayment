import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "PawElite",
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "0.1.0",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

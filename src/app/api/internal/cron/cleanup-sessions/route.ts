import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { timingSafeCompare } from "@/lib/security/tokens";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || !timingSafeCompare(token, getEnv().CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Purge expired guest verifications (older than 24h)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const deletedVerifications = await prisma.guestVerification.deleteMany({
    where: {
      OR: [
        { expiresAt: { lte: oneDayAgo } },
        { consumedAt: { not: null, lte: oneDayAgo } },
      ],
    },
  });

  // 2. Purge expired guest sessions
  const deletedSessions = await prisma.guestSession.deleteMany({
    where: { expiresAt: { lte: now } },
  });

  // 3. Purge revoked or expired admin sessions older than 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const deletedAdminSessions = await prisma.adminSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lte: sevenDaysAgo } },
        { revokedAt: { not: null, lte: sevenDaysAgo } },
      ],
    },
  });

  return NextResponse.json({
    status: "success",
    purged: {
      verifications: deletedVerifications.count,
      guestSessions: deletedSessions.count,
      adminSessions: deletedAdminSessions.count,
    },
  });
}

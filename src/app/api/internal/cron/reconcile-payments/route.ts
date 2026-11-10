import { NextRequest, NextResponse } from "next/server";
import { reconcileUnresolvedPayments } from "@/lib/services/payments/reconciliation";
import { getEnv } from "@/lib/env";
import { timingSafeCompare } from "@/lib/security/tokens";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || !timingSafeCompare(token, getEnv().CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await reconcileUnresolvedPayments();

  return NextResponse.json({
    status: "success",
    report,
  });
}

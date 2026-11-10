import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getSuperAdmin } from "@/lib/services/admin-auth";

export const dynamic = "force-dynamic";

// Neutralise spreadsheet formula injection and quote every field.
const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await getSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const rows = [["email", "locale", "status", "subscribed_at"], ...subs.map((s) => [s.email, s.locale, s.status, s.createdAt.toISOString()])];
  return new NextResponse(rows.map((r) => r.map(cell).join(",")).join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"', "Cache-Control": "no-store" },
  });
}

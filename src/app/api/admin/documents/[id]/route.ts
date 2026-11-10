import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getSuperAdmin } from "@/lib/services/admin-auth";
import { signedDocumentUrl } from "@/lib/services/media";

export const dynamic = "force-dynamic";

/** Private animal documents: SUPER_ADMIN session required, 5-minute signed Cloudinary URL. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const doc = await prisma.animalDocument.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [publicId, format] = doc.storageKey.split("|");
  return NextResponse.redirect(signedDocumentUrl(publicId, format || "pdf"), { status: 302, headers: { "Cache-Control": "no-store" } });
}

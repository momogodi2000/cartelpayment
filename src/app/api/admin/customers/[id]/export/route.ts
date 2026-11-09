import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { exportCustomerData } from "@/lib/services/gdpr";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const data = await exportCustomerData(id);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="gdpr-export-${id}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

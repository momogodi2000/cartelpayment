"use server";

import prisma from "@/lib/db";

export async function updateInquiryStatus(id: string, status: "PENDING" | "COMPLETED" | "ARCHIVED") {
  try {
    const updated = await prisma.cartInquiry.update({
      where: { id },
      data: { status },
    });

    // Write audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: "ADMIN",
        userEmail: "admin@arahaven.com",
        action: "CART_INQUIRY_STATUS_UPDATE",
        details: JSON.stringify({
          inquiryId: id,
          status,
        }),
      },
    });

    return { success: true, updated };
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteInquiry(id: string) {
  try {
    // Delete inquiry items first if cascade is not set, but schema uses cascade:
    await prisma.cartInquiry.delete({
      where: { id },
    });

    // Write audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: "ADMIN",
        userEmail: "admin@arahaven.com",
        action: "CART_INQUIRY_DELETE",
        details: JSON.stringify({
          inquiryId: id,
        }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return { success: false, error: "Failed to delete inquiry." };
  }
}

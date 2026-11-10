import React from "react";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { resolveAdminLocale } from "@/i18n/locale";
import AdminConsoleShell from "@/components/admin/AdminConsoleShell";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin = null;
  let isAuthenticated = false;

  try {
    const auth = await requireSuperAdmin();
    admin = auth.admin;
    isAuthenticated = true;
  } catch {
    isAuthenticated = false;
  }

  if (!isAuthenticated || !admin) {
    redirect("/admin/login");
  }

  const locale = await resolveAdminLocale();

  return (
    <AdminConsoleShell
      admin={{
        id: admin.id,
        name: admin.name,
        email: admin.email,
      }}
      locale={locale}
    >
      {children}
    </AdminConsoleShell>
  );
}

import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSuperAdmin } from "@/lib/services/admin-auth";
import ScopedIntl from "@/i18n/ScopedIntl";
import AdminConsoleShell from "@/components/admin/AdminConsoleShell";

export const dynamic = "force-dynamic";

/**
 * Every console page is rendered behind this server-side SUPER_ADMIN check
 * (Server Actions and Route Handlers additionally call requireSuperAdmin themselves).
 */
export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const auth = await getSuperAdmin();
  if (!auth) redirect("/admin/login");

  // First login with a generated password: force the password change before anything else.
  const pathname = (await headers()).get("x-pw-pathname") || "";
  if (auth.admin.mustChangePassword && !pathname.startsWith("/admin/account")) {
    redirect("/admin/account");
  }

  return (
    <ScopedIntl namespaces={["AdminShell"]}>
      <AdminConsoleShell admin={{ id: auth.admin.id, name: auth.admin.name, email: auth.admin.email }}>
        {children}
      </AdminConsoleShell>
    </ScopedIntl>
  );
}

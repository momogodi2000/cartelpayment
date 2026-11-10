import React from "react";
import { getTranslations } from "next-intl/server";
import { Lock } from "lucide-react";
import ScopedIntl from "@/i18n/ScopedIntl";
import AuthCard from "../../AuthCard";
import ResetPasswordForm from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AdminResetPasswordPage({ params }: PageProps) {
  const { token } = await params;
  const t = await getTranslations("AdminAuth");
  return (
    <AuthCard icon={<Lock className="h-6 w-6" aria-hidden="true" />} title={t("resetTitle")} subtitle={t("resetSubtitle")} backLabel={t("backToLogin")}>
      <ScopedIntl namespaces={["AdminAuth"]}>
        <ResetPasswordForm token={token} />
      </ScopedIntl>
    </AuthCard>
  );
}

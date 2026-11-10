import React from "react";
import { getTranslations } from "next-intl/server";
import { KeyRound } from "lucide-react";
import ScopedIntl from "@/i18n/ScopedIntl";
import ForgotPasswordForm from "./ForgotPasswordForm";
import AuthCard from "../AuthCard";

export const dynamic = "force-dynamic";

export default async function AdminForgotPasswordPage() {
  const t = await getTranslations("AdminAuth");
  return (
    <AuthCard icon={<KeyRound className="h-6 w-6" aria-hidden="true" />} title={t("forgotTitle")} subtitle={t("forgotSubtitle")} backLabel={t("backToLogin")}>
      <ScopedIntl namespaces={["AdminAuth"]}>
        <ForgotPasswordForm />
      </ScopedIntl>
    </AuthCard>
  );
}

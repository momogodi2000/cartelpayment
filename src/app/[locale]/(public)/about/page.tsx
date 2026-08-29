import { redirect } from "@/i18n/routing";

/** Legacy alias — the canonical page lives at /a-propos */
export default async function AboutAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/a-propos", locale });
}

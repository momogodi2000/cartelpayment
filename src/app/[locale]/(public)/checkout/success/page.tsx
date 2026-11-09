import { redirect } from "next/navigation";

export default async function CheckoutSuccessRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  const { ref } = await searchParams;
  redirect(`/${locale}/checkout/return${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`);
}

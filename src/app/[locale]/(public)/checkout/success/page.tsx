import { redirect } from "next/navigation";

export default async function CheckoutSuccessRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; t?: string }>;
}) {
  const { locale } = await params;
  const { ref, t } = await searchParams;
  const qs = new URLSearchParams();
  if (ref) qs.set("ref", ref);
  if (t) qs.set("t", t);
  const query = qs.toString();
  redirect(`/${locale}/checkout/return${query ? `?${query}` : ""}`);
}

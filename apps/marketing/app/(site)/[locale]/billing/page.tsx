import { redirect } from "next/navigation";

import { productUrls } from "@/lib/content";

export default async function BillingRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const plan = typeof params.plan === "string" ? `?plan=${encodeURIComponent(params.plan)}` : "";

  redirect(`${productUrls.workspace}/billing${plan}`);
}

import { BillingScreen } from "@/domains/billing/components/billing-screen";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; cycle?: string; return?: string }>;
}) {
  const [{ locale }, selection] = await Promise.all([params, searchParams]);
  return <BillingScreen locale={locale === "ar" ? "ar" : "en"} initialPlan={selection.plan} initialCycle={selection.cycle} returnState={selection.return} />;
}

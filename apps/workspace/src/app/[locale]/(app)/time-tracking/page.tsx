import { TimeTrackingPageRedesigned } from "@/domains/time-tracking/components/TimeTrackingPageRedesigned";
import {
  isProductCapabilityEnabled,
  productCapabilityFallback,
} from "@/domains/capabilities/product-capabilities";
import { redirect } from "next/navigation";

export default async function TimeTrackingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isProductCapabilityEnabled("timeTracking")) {
    redirect(`/${locale}${productCapabilityFallback("timeTracking")}`);
  }

  return <TimeTrackingPageRedesigned />;
}

import { redirect } from "next/navigation";
import { InboxActivityScreen } from "@/domains/inbox/components/inbox-activity-screen";
import {
  isProductCapabilityEnabled,
  productCapabilityFallback,
} from "@/domains/capabilities/product-capabilities";

export default async function WsActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isProductCapabilityEnabled("inboxActivity")) {
    redirect(`/${locale}${productCapabilityFallback("inboxActivity")}`);
  }

  return <InboxActivityScreen />;
}

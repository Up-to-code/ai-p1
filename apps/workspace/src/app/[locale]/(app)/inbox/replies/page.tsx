import { redirect } from "next/navigation";
import { InboxRepliesScreen } from "@/domains/inbox/components/inbox-replies-screen";
import {
  isProductCapabilityEnabled,
  productCapabilityFallback,
} from "@/domains/capabilities/product-capabilities";

export default async function RepliesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isProductCapabilityEnabled("inboxReplies")) {
    redirect(`/${locale}${productCapabilityFallback("inboxReplies")}`);
  }

  return <InboxRepliesScreen />;
}

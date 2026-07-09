import { redirect } from "next/navigation";
import { InboxPostsScreen } from "@/domains/inbox/components/inbox-posts-screen";
import {
  isProductCapabilityEnabled,
  productCapabilityFallback,
} from "@/domains/capabilities/product-capabilities";

export default async function WsPostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isProductCapabilityEnabled("inboxPosts")) {
    redirect(`/${locale}${productCapabilityFallback("inboxPosts")}`);
  }

  return <InboxPostsScreen />;
}

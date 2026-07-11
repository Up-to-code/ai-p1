import { InboxChannelScreen } from "@/domains/inbox/components/inbox-channel-screen";
import { InboxPrimaryScreen } from "@/domains/inbox/components/inbox-primary-screen";

type InboxSearchParams = {
  channel?: string | string[];
  new?: string | string[];
  settings?: string | string[];
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams?: Promise<InboxSearchParams>;
}) {
  const resolved = await searchParams;
  const isChannelRoute = Boolean(
    resolved?.channel || resolved?.new || resolved?.settings,
  );
  return isChannelRoute ? <InboxChannelScreen /> : <InboxPrimaryScreen />;
}

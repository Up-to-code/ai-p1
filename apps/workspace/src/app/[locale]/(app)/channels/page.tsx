import { InboxChannelScreen } from "@/domains/inbox/components/inbox-channel-screen";
import { InboxWorkspaceShell } from "@/domains/inbox/components/inbox-workspace-shell";

export default function ChannelsPage() {
  return (
    <InboxWorkspaceShell>
      <InboxChannelScreen />
    </InboxWorkspaceShell>
  );
}

"use client";

import { useAccountContext } from "@/domains/auth";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { TopbarAssistantButton } from "./components/topbar-assistant-button";
import { TopbarShareSection } from "./components/topbar-share-section";

/** Right-side topbar actions: share, AI assistant, and profile menu. */
export function TopbarActions() {
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  return (
    <div className="flex items-center gap-2">
      <TopbarShareSection organizationId={organizationId} />
      <TopbarAssistantButton />
      <div className="ms-2 border-l border-border/50 ps-4">
        <ProfileMenu />
      </div>
    </div>
  );
}

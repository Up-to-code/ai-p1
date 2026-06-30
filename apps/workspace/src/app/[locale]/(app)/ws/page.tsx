"use client";

import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { OverviewView } from "./_pages/overview-view";

export default function WsPage() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  return <OverviewView />;
}

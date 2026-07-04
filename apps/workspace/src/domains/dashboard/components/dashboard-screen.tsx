"use client";

import { useAuthSession } from "@/domains/auth";
import { EveDashboardChat } from "@/components/dashboard/eve-dashboard-chat";

export function DashboardScreen() {
  const session = useAuthSession();
  const organizationId =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  return <EveDashboardChat organizationId={organizationId} />;
}

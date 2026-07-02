"use client";

import { useAuthSession } from "@/domains/auth";
import { DashboardChat } from "@/components/dashboard/dashboard-chat";

export function DashboardScreen() {
  const session = useAuthSession();
  const organizationId =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  return <DashboardChat organizationId={organizationId} />;
}

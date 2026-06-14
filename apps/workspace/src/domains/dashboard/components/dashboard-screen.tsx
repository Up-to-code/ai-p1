"use client";

import { useAccountContext } from "@/domains/auth";
import { DashboardChat } from "@/components/dashboard/dashboard-chat";

export function DashboardScreen() {
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready"
      ? (account.workspace.organizationId ?? undefined)
      : undefined;

  return <DashboardChat organizationId={organizationId} />;
}

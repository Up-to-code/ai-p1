"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export type AutomationConnectionProvider = "google_sheets" | "whatsapp";

export function useAutomationBindings(organizationId?: string) {
  const publishedAgents = useQuery(
    api.customAgents.read.listPublishedMine,
    organizationId ? { organizationId } : "skip",
  );
  const connections = useQuery(
    api.automationConnections.read.listMine,
    organizationId ? { organizationId } : "skip",
  );
  const saveConnection = useAction(api.automationConnections.actions.save);
  const revokeConnection = useMutation(api.automationConnections.write.revoke);

  return {
    publishedAgents,
    connections: connections?.filter((connection) => connection.status === "active"),
    saveConnection,
    revokeConnection,
  };
}

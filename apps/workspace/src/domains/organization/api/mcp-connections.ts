"use client";

import { workspaceFetch, workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationMcpConnection, McpConnectionPermission, McpConnectionScope } from "./types";

export function listOrganizationMcpConnections(organizationId: string) {
  return workspaceFetch<{ connections: OrganizationMcpConnection[] }>(
    organizationId,
    "mcp-connections",
    { method: "GET", body: undefined, fallbackMessage: "Agent links could not be loaded." },
  ).then((result) => result.connections);
}

export function createOrganizationMcpConnection(
  organizationId: string,
  input: {
    name: string;
    instructions?: string;
    principalType?: "user" | "organization";
    permissions: McpConnectionPermission[];
    scope?: McpConnectionScope;
    expiresAt?: number;
  },
) {
  return workspaceMutation<{ connection: OrganizationMcpConnection; agentLink: string }>(
    organizationId,
    "mcp-connections",
    { method: "POST", body: input, fallbackMessage: "Agent link could not be created." },
  );
}

export function updateOrganizationMcpConnection(
  organizationId: string,
  connectionId: string,
  input: {
    name?: string;
    instructions?: string;
    permissions?: McpConnectionPermission[];
    scope?: McpConnectionScope;
    status?: "active" | "paused";
    expiresAt?: number | null;
  },
) {
  return workspaceMutation<{ connection: OrganizationMcpConnection }>(
    organizationId,
    `mcp-connections/${connectionId}`,
    { method: "PATCH", body: input, fallbackMessage: "Agent link could not be updated." },
  ).then((result) => result.connection);
}

export function revokeOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return workspaceMutation<{ revoked: boolean }>(
    organizationId,
    `mcp-connections/${connectionId}`,
    { method: "DELETE", body: undefined, fallbackMessage: "Agent link could not be revoked." },
  );
}

export function rotateOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return workspaceMutation<{ connection: OrganizationMcpConnection; agentLink: string }>(
    organizationId,
    `mcp-connections/${connectionId}/rotate`,
    { method: "POST", body: undefined, fallbackMessage: "A new link could not be made." },
  );
}

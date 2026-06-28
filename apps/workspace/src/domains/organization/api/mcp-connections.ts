"use client";

import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationMcpConnection, McpConnectionPermission } from "./types";

export function listOrganizationMcpConnections(organizationId: string) {
  return requestOrganizationAction<{ connections: OrganizationMcpConnection[] }>(
    organizationApiPath(organizationId, "mcp-connections"),
    "GET",
    undefined,
    "Agent links could not be loaded.",
  ).then((result) => result.connections);
}

export function createOrganizationMcpConnection(
  organizationId: string,
  input: {
    name: string;
    instructions?: string;
    principalType?: "user" | "organization";
    permissions: McpConnectionPermission[];
    expiresAt?: number;
  },
) {
  return requestOrganizationAction<{ connection: OrganizationMcpConnection; agentLink: string }>(
    organizationApiPath(organizationId, "mcp-connections"),
    "POST",
    input,
    "Agent link could not be created.",
  );
}

export function updateOrganizationMcpConnection(
  organizationId: string,
  connectionId: string,
  input: {
    name?: string;
    instructions?: string;
    permissions?: McpConnectionPermission[];
    status?: "active" | "paused";
    expiresAt?: number | null;
  },
) {
  return requestOrganizationAction<{ connection: OrganizationMcpConnection }>(
    organizationApiPath(organizationId, "mcp-connections", connectionId),
    "PATCH",
    input,
    "Agent link could not be updated.",
  ).then((result) => result.connection);
}

export function revokeOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return requestOrganizationAction<{ revoked: boolean }>(
    organizationApiPath(organizationId, "mcp-connections", connectionId),
    "DELETE",
    undefined,
    "Agent link could not be revoked.",
  );
}

export function rotateOrganizationMcpConnection(organizationId: string, connectionId: string) {
  return requestOrganizationAction<{ connection: OrganizationMcpConnection; agentLink: string }>(
    organizationApiPath(organizationId, "mcp-connections", connectionId, "rotate"),
    "POST",
    undefined,
    "A new link could not be made.",
  );
}

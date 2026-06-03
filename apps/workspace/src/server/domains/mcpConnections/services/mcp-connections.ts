import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-workos/server";
import type { CreateMcpConnectionPayload, UpdateMcpConnectionPayload } from "../validation/mcp-connection.schema";

export function listMcpConnections(organizationId: string) {
  return fetchAuthQuery(api.mcp.connections.list, { organizationId });
}

export function createMcpConnection(organizationId: string, input: CreateMcpConnectionPayload) {
  return fetchAuthMutation(api.mcp.connections.createFromHono, { organizationId, input });
}

export function updateMcpConnection(
  organizationId: string,
  connectionId: string,
  input: UpdateMcpConnectionPayload,
) {
  return fetchAuthMutation(api.mcp.connections.updateFromHono, {
    organizationId,
    connectionId: connectionId as Id<"organizationMcpConnections">,
    input,
  });
}

export function revokeMcpConnection(organizationId: string, connectionId: string) {
  return fetchAuthMutation(api.mcp.connections.revokeFromHono, { organizationId, connectionId: connectionId as Id<"organizationMcpConnections"> });
}

export function rotateMcpConnection(organizationId: string, connectionId: string) {
  return fetchAuthMutation(api.mcp.connections.rotateFromHono, { organizationId, connectionId: connectionId as Id<"organizationMcpConnections"> });
}

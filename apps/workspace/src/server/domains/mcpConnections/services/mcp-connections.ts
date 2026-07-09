import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-auth";
import type { CreateMcpConnectionPayload, UpdateMcpConnectionPayload } from "../validation/mcp-connection.schema";

type ConvexMcpScope =
  | { type: "organization" }
  | { type: "space"; spaceIds: Id<"spaces">[] }
  | { type: "project"; projectIds: Id<"projects">[] };

function toConvexMcpScope(
  scope: CreateMcpConnectionPayload["scope"] | NonNullable<UpdateMcpConnectionPayload["scope"]>,
): ConvexMcpScope {
  if (scope.type === "space") {
    return { type: "space", spaceIds: scope.spaceIds as Id<"spaces">[] };
  }
  if (scope.type === "project") {
    return { type: "project", projectIds: scope.projectIds as Id<"projects">[] };
  }
  return { type: "organization" };
}

export function listMcpConnections(organizationId: string) {
  return fetchAuthQuery(api.mcp.connections.list, { organizationId });
}

export function createMcpConnection(organizationId: string, input: CreateMcpConnectionPayload) {
  return fetchAuthMutation(api.mcp.connections.createFromHono, {
    organizationId,
    input: { ...input, scope: toConvexMcpScope(input.scope) },
  });
}

export function updateMcpConnection(
  organizationId: string,
  connectionId: string,
  input: UpdateMcpConnectionPayload,
) {
  const { scope, ...rest } = input;
  return fetchAuthMutation(api.mcp.connections.updateFromHono, {
    organizationId,
    connectionId: connectionId as Id<"organizationMcpConnections">,
    input: {
      ...rest,
      ...(scope ? { scope: toConvexMcpScope(scope) } : {}),
    },
  });
}

export function revokeMcpConnection(organizationId: string, connectionId: string) {
  return fetchAuthMutation(api.mcp.connections.revokeFromHono, { organizationId, connectionId: connectionId as Id<"organizationMcpConnections"> });
}

export function rotateMcpConnection(organizationId: string, connectionId: string) {
  return fetchAuthMutation(api.mcp.connections.rotateFromHono, { organizationId, connectionId: connectionId as Id<"organizationMcpConnections"> });
}

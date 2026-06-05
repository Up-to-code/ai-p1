import type { Doc } from "../_generated/dataModel";

export type McpConnectionPrincipalType = "user" | "organization";

export function mcpConnectionTtlMs(expiresAt: number | undefined, now = Date.now()) {
  return expiresAt ? Math.max(expiresAt - now, 0) : null;
}

export function mcpConnectionPrincipalType(connection: Doc<"organizationMcpConnections">): McpConnectionPrincipalType {
  return connection.principalType ?? "user";
}

export function presentMcpConnection(connection: Doc<"organizationMcpConnections">) {
  const principalType = mcpConnectionPrincipalType(connection);
  return {
    _id: connection._id,
    _creationTime: connection._creationTime,
    id: connection._id,
    organizationId: connection.organizationId,
    publicId: connection.publicId,
    keyId: connection.keyId,
    keyLast4: connection.keyLast4,
    name: connection.name,
    instructions: connection.instructions,
    permissions: connection.permissions,
    status: connection.status,
    principalType,
    principalUserId: principalType === "user"
      ? connection.principalUserId ?? connection.createdByUserId
      : undefined,
    createdByUserId: connection.createdByUserId,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
    lastUsedAt: connection.lastUsedAt,
    expiresAt: connection.expiresAt,
    usageCount: connection.usageCount,
    revokedAt: connection.revokedAt,
  };
}

export function visibleMcpConnections(
  connections: Doc<"organizationMcpConnections">[],
  params: { canManage: boolean; userId: string },
) {
  return connections
    .filter((connection) =>
      params.canManage ||
      mcpConnectionPrincipalType(connection) === "organization" ||
      (connection.principalUserId ?? connection.createdByUserId) === params.userId,
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

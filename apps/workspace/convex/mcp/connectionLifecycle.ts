import type { Doc } from "../_generated/dataModel";

export function mcpConnectionTtlMs(expiresAt: number | undefined, now = Date.now()) {
  return expiresAt ? Math.max(expiresAt - now, 0) : null;
}

export function presentMcpConnection(connection: Doc<"organizationMcpConnections">) {
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
    .filter((connection) => params.canManage || connection.createdByUserId === params.userId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

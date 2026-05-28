import type { MutationCtx } from "../_generated/server";

export function presentWorkspaceRecord<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

export function assertActiveWorkspaceRecord<T extends { organizationId: string; deletedAt?: number }>(
  doc: T | null,
  organizationId: string,
  label: string,
) {
  if (!doc || doc.organizationId !== organizationId || doc.deletedAt) {
    throw new Error(`${label} was not found.`);
  }
  return doc;
}

export function isPublicWorkspaceRecord(doc: { visibility?: "private" | "public" }) {
  return (doc.visibility ?? "private") === "public";
}

export function assertPublicWorkspaceRecord<T extends { visibility?: "private" | "public" }>(doc: T, label: string) {
  if (!isPublicWorkspaceRecord(doc)) {
    throw new Error(`${label} was not found.`);
  }
  return doc;
}

export function workspaceReference(prefix: string, now: number) {
  return `${prefix}-${now.toString(36).toUpperCase().slice(-6)}`;
}

export function mcpActor(connectionId: string) {
  return `mcp:${connectionId}`;
}

export async function writeMcpWorkspaceAudit(
  ctx: MutationCtx,
  input: {
    organizationId: string;
    connectionId: string;
    action: string;
    target: string;
    summary: string;
  },
) {
  await ctx.db.insert("organizationAuditEvents", {
    organizationId: input.organizationId,
    actorUserId: mcpActor(input.connectionId),
    actorType: "mcpConnection",
    actorMcpConnectionId: input.connectionId,
    action: input.action,
    target: input.target,
    summary: input.summary,
    createdAt: Date.now(),
  });
}

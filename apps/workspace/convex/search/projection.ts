import type { SearchProjection } from "@qentrah/domain-contracts";
import type { MutationCtx } from "../_generated/server";

export async function writeSearchProjection(ctx: MutationCtx, projection: SearchProjection) {
  const existing = await ctx.db.query("searchProjections").withIndex("by_resource", (q) => q
    .eq("organizationId", projection.organizationId).eq("resourceType", projection.resourceType).eq("resourceId", projection.resourceId)).unique();
  if (existing && existing.sourceUpdatedAt > projection.sourceUpdatedAt) return existing._id;
  const now = Date.now();
  const version = existing ? Math.max(projection.version, existing.version + 1) : projection.version;
  const value = {
    ...projection,
    version,
    keywords: [...new Set(projection.keywords)],
    principalKeys: [...new Set(projection.principalKeys)],
    spaceIds: [...new Set(projection.spaceIds)],
    projectIds: [...new Set(projection.projectIds)],
    ownerIds: projection.ownerIds ? [...new Set(projection.ownerIds)] : undefined,
    assigneeIds: projection.assigneeIds ? [...new Set(projection.assigneeIds)] : undefined,
    clientIds: projection.clientIds ? [...new Set(projection.clientIds)] : undefined,
    statuses: projection.statuses ? [...new Set(projection.statuses)] : undefined,
    tagIds: projection.tagIds ? [...new Set(projection.tagIds)] : undefined,
  };
  const projectionId = existing ? (await ctx.db.patch(existing._id, value), existing._id) : await ctx.db.insert("searchProjections", value);
  const previousEvent = await ctx.db.query("searchOutboxEvents").withIndex("by_organization_resource_version", (q) => q
    .eq("organizationId", projection.organizationId).eq("resourceType", projection.resourceType).eq("resourceId", projection.resourceId).eq("projectionVersion", version)).unique();
  if (!previousEvent) await ctx.db.insert("searchOutboxEvents", {
    organizationId: projection.organizationId, resourceType: projection.resourceType, resourceId: projection.resourceId,
    projectionVersion: version, operation: projection.deletedAt ? "delete" : "upsert", status: "pending", attempts: 0,
    nextAttemptAt: now, createdAt: now, updatedAt: now,
  });
  return projectionId;
}

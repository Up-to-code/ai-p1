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

export async function tombstoneSearchResource(
  ctx: MutationCtx,
  organizationId: string,
  resourceType: SearchProjection["resourceType"],
  resourceId: string,
) {
  const existing = await ctx.db.query("searchProjections").withIndex("by_resource", (q) => q
    .eq("organizationId", organizationId).eq("resourceType", resourceType).eq("resourceId", resourceId)).unique();
  if (!existing || existing.deletedAt) return;
  const projection: SearchProjection = {
    organizationId: existing.organizationId,
    resourceType: existing.resourceType,
    resourceId: existing.resourceId,
    route: existing.route,
    title: existing.title,
    subtitle: existing.subtitle,
    identifier: existing.identifier,
    searchText: existing.searchText,
    keywords: existing.keywords,
    locale: existing.locale,
    scopeType: existing.scopeType,
    spaceIds: existing.spaceIds,
    projectIds: existing.projectIds,
    principalKeys: existing.principalKeys,
    sensitivity: existing.sensitivity,
    sourceUpdatedAt: existing.sourceUpdatedAt,
    version: existing.version,
    ownerIds: existing.ownerIds,
    assigneeIds: existing.assigneeIds,
    clientIds: existing.clientIds,
    statuses: existing.statuses,
    tagIds: existing.tagIds,
    dateValue: existing.dateValue,
  };
  await writeSearchProjection(ctx, {
    ...projection,
    deletedAt: Date.now(),
    sourceUpdatedAt: Math.max(Date.now(), projection.sourceUpdatedAt + 1),
    version: projection.version + 1,
  });
}

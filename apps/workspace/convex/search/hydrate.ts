import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { resolveProjectAccess } from "../access/project";
import { resolveTaskAccess } from "../access/task";
import { resolveSpaceAccess } from "../access/space";
import { assertMediaPermission } from "../media/resourcePolicy";
import { resolveDeliveryAccess } from "../access/delivery";
import { canUseOrganizationResourceAction } from "../organizations/profile/access";
import { searchCandidateInputValidator, hydratedSearchResultValidator } from "./validators";
import type { SearchCandidate, SearchProjection } from "@qentrah/domain-contracts";

const MAX_CANDIDATES = 50;

export function highestScoringCandidates<T extends Pick<SearchCandidate, "resourceType" | "resourceId" | "score">>(candidates: readonly T[]) {
  const highest = new Map<string, T>();
  for (const candidate of candidates) {
    const key = `${candidate.resourceType}:${candidate.resourceId}`;
    const existing = highest.get(key);
    if (!existing || candidate.score > existing.score) highest.set(key, candidate);
  }
  return [...highest.values()];
}

export function isCurrentSearchCandidate(
  projection: Pick<SearchProjection, "version" | "deletedAt"> | null,
  candidate: Pick<SearchCandidate, "version">,
): projection is Pick<SearchProjection, "version" | "deletedAt"> {
  return Boolean(projection && !projection.deletedAt && projection.version === candidate.version);
}

export const candidates = query({
  args: {
    organizationId: v.string(),
    candidates: v.array(searchCandidateInputValidator),
  },
  returns: v.array(hydratedSearchResultValidator),
  handler: async (ctx, args) => {
    if (args.candidates.length > MAX_CANDIDATES) {
      throw new ConvexError({ code: "SEARCH_CANDIDATE_LIMIT", message: `Search accepts at most ${MAX_CANDIDATES} candidates.` });
    }
    const [projectAccess, taskAccess, spaceAccess, deliveryAccess, canReadDeals, canUpdateDeals] = await Promise.all([
      resolveProjectAccess(ctx, args.organizationId),
      resolveTaskAccess(ctx, args.organizationId),
      resolveSpaceAccess(ctx, args.organizationId),
      resolveDeliveryAccess(ctx, args.organizationId),
      canUseOrganizationResourceAction(ctx, args.organizationId, "deal", "read"),
      canUseOrganizationResourceAction(ctx, args.organizationId, "deal", "update"),
    ]);
    const uniqueCandidates = highestScoringCandidates(args.candidates);
    const hydrated = await Promise.all(uniqueCandidates.map(async (candidate) => {
      const projection = await ctx.db.query("searchProjections").withIndex("by_resource", (q) => q
        .eq("organizationId", args.organizationId)
        .eq("resourceType", candidate.resourceType)
        .eq("resourceId", candidate.resourceId),
      ).unique();
      if (!isCurrentSearchCandidate(projection, candidate)) return null;

      if (candidate.resourceType === "project") {
        const id = ctx.db.normalizeId("projects", candidate.resourceId);
        const project = id ? await ctx.db.get(id) : null;
        if (!project || !projectAccess.canRead(project)) return null;
        return presentProject(project, candidate.score, projection.route, projectAccess);
      }
      if (candidate.resourceType === "task") {
        const id = ctx.db.normalizeId("tasks", candidate.resourceId);
        const task = id ? await ctx.db.get(id) : null;
        if (!task || !(await taskAccess.canRead(task))) return null;
        return presentTask(task, candidate.score, projection.route, {
          canUpdate: await taskAccess.canUpdate(task),
          canDelete: await taskAccess.canDelete(task),
        });
      }
      if (candidate.resourceType === "attachment") {
        const id = ctx.db.normalizeId("mediaAssets", candidate.resourceId);
        const asset = id ? await ctx.db.get(id) : null;
        if (!asset || asset.organizationId !== args.organizationId || asset.malwareScanStatus !== "clean") return null;
        const capabilities = await attachmentCapabilities(ctx, asset, { projectAccess, taskAccess, spaceAccess });
        if (!capabilities.canRead) return null;
        return {
          resourceType: "attachment" as const,
          resourceId: String(asset._id),
          title: asset.name,
          subtitle: `${asset.mimeType} · ${formatBytes(asset.size)}`,
          route: projection.route,
          score: candidate.score,
          capabilities,
        };
      }
      if (candidate.resourceType === "proposal") {
        const id = ctx.db.normalizeId("proposals", candidate.resourceId);
        const proposal = id ? await ctx.db.get(id) : null;
        if (!canReadDeals || !activeOrganizationRecord(proposal, args.organizationId)) return null;
        return presentCommercial(proposal, candidate.score, projection.route, canUpdateDeals);
      }
      if (candidate.resourceType === "contract") {
        const id = ctx.db.normalizeId("contracts", candidate.resourceId);
        const contract = id ? await ctx.db.get(id) : null;
        if (!canReadDeals || !activeOrganizationRecord(contract, args.organizationId)) return null;
        return presentCommercial(contract, candidate.score, projection.route, canUpdateDeals);
      }
      if (candidate.resourceType === "engagement") {
        const id = ctx.db.normalizeId("engagements", candidate.resourceId);
        const engagement = id ? await ctx.db.get(id) : null;
        if (!engagement || !await deliveryAccess.canRead(engagement)) return null;
        const canUpdate = await deliveryAccess.canUpdate(engagement);
        return { resourceType: "engagement" as const, resourceId: String(engagement._id), title: engagement.name, subtitle: `${engagement.commercialModel} · ${engagement.status}`, route: projection.route, score: candidate.score, capabilities: { canRead: true, canUpdate, canDelete: false } };
      }
      if (candidate.resourceType === "deliverable") {
        const id = ctx.db.normalizeId("deliverables", candidate.resourceId);
        const deliverable = id ? await ctx.db.get(id) : null;
        const engagement = deliverable ? await ctx.db.get(deliverable.engagementId) : null;
        if (!deliverable || deliverable.organizationId !== args.organizationId || deliverable.deletedAt || !engagement || !await deliveryAccess.canRead(engagement)) return null;
        const canUpdate = await deliveryAccess.canUpdate(engagement);
        return { resourceType: "deliverable" as const, resourceId: String(deliverable._id), title: deliverable.name, subtitle: deliverable.description, route: projection.route, score: candidate.score, capabilities: { canRead: true, canUpdate, canDelete: false } };
      }
      return null;
    }));
    return hydrated.filter((result): result is NonNullable<typeof result> => result !== null)
      .sort((left, right) => right.score - left.score);
  },
});

function activeOrganizationRecord<T extends { organizationId: string; deletedAt?: number; recordState: string }>(record: T | null, organizationId: string): record is T {
  return Boolean(record && record.organizationId === organizationId && !record.deletedAt && record.recordState !== "deleted");
}

function presentCommercial(
  record: Doc<"proposals"> | Doc<"contracts">,
  score: number,
  route: string,
  canUpdate: boolean,
) {
  return {
    resourceType: ("proposalId" in record ? "contract" : "proposal") as "proposal" | "contract",
    resourceId: String(record._id),
    title: record.title,
    subtitle: `${record.commercialModel} · ${record.status}`,
    route,
    score,
    capabilities: { canRead: true, canUpdate, canDelete: false },
  };
}

function presentProject(
  project: Doc<"projects">,
  score: number,
  route: string,
  access: Awaited<ReturnType<typeof resolveProjectAccess>>,
) {
  return {
    resourceType: "project" as const,
    resourceId: String(project._id),
    title: project.name,
    subtitle: project.description,
    route,
    score,
    capabilities: {
      canRead: true,
      canUpdate: access.canUpdate(project),
      canDelete: access.canDelete(project),
    },
  };
}

async function attachmentCapabilities(
  ctx: QueryCtx,
  asset: Doc<"mediaAssets">,
  access: {
    projectAccess: Awaited<ReturnType<typeof resolveProjectAccess>>;
    taskAccess: Awaited<ReturnType<typeof resolveTaskAccess>>;
    spaceAccess: Awaited<ReturnType<typeof resolveSpaceAccess>>;
  },
) {
  if (asset.resourceType === "project") {
    const id = ctx.db.normalizeId("projects", asset.resourceId);
    const project = id ? await ctx.db.get(id) : null;
    return project && access.projectAccess.canRead(project)
      ? { canRead: true, canUpdate: access.projectAccess.canUpdate(project), canDelete: access.projectAccess.canUpdate(project) }
      : { canRead: false, canUpdate: false, canDelete: false };
  }
  if (asset.resourceType === "task") {
    const id = ctx.db.normalizeId("tasks", asset.resourceId);
    const task = id ? await ctx.db.get(id) : null;
    return task && await access.taskAccess.canRead(task)
      ? { canRead: true, canUpdate: await access.taskAccess.canUpdate(task), canDelete: await access.taskAccess.canDelete(task) }
      : { canRead: false, canUpdate: false, canDelete: false };
  }
  if (asset.resourceType === "space") {
    const id = ctx.db.normalizeId("spaces", asset.resourceId);
    const space = id ? await ctx.db.get(id) : null;
    return space && access.spaceAccess.canRead(space)
      ? { canRead: true, canUpdate: access.spaceAccess.canUpdate(space), canDelete: access.spaceAccess.canUpdate(space) }
      : { canRead: false, canUpdate: false, canDelete: false };
  }
  const canRead = await mediaPermission(ctx, asset, "read");
  const canUpdate = canRead && await mediaPermission(ctx, asset, "update");
  return { canRead, canUpdate, canDelete: canUpdate };
}

async function mediaPermission(
  ctx: QueryCtx,
  asset: Doc<"mediaAssets">,
  action: "read" | "update",
) {
  try {
    await assertMediaPermission(ctx, asset.organizationId, asset.resourceType, action);
    return true;
  } catch {
    return false;
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${Math.round(bytes / 1_024)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function presentTask(
  task: Doc<"tasks">,
  score: number,
  route: string,
  capabilities: { canUpdate: boolean; canDelete: boolean },
) {
  return {
    resourceType: "task" as const,
    resourceId: String(task._id),
    title: task.title,
    subtitle: task.description,
    route,
    score,
    capabilities: { canRead: true, ...capabilities },
  };
}

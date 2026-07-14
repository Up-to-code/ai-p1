import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { resolveProjectAccess } from "../access/project";
import { resolveTaskAccess } from "../access/task";
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
    const [projectAccess, taskAccess] = await Promise.all([
      resolveProjectAccess(ctx, args.organizationId),
      resolveTaskAccess(ctx, args.organizationId),
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
      return null;
    }));
    return hydrated.filter((result): result is NonNullable<typeof result> => result !== null)
      .sort((left, right) => right.score - left.score);
  },
});

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

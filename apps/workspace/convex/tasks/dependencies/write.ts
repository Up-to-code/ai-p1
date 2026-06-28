import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { requireWorkspaceAccess } from "../../auth/permissions";
import { presentBaseRecord } from "../../shared/present";
import { taskDependencyInputValidator, taskDependencyValidator } from "./validators";

function presentDependency(dep: Doc<"taskDependencies">) {
  return presentBaseRecord(dep);
}

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    input: taskDependencyInputValidator,
  },
  returns: taskDependencyValidator,
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "task", "update");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    // Prevent self-referencing dependencies
    if (args.input.sourceTaskId === args.input.targetTaskId) {
      throw new Error("A task cannot depend on itself.");
    }

    // Check for duplicate
    const existing = await ctx.db
      .query("taskDependencies")
      .withIndex("by_source_target", (q) =>
        q.eq("sourceTaskId", args.input.sourceTaskId)
         .eq("targetTaskId", args.input.targetTaskId),
      )
      .first();

    if (existing && !existing.deletedAt) {
      throw new Error("This dependency already exists.");
    }

    // Prevent circular dependencies by checking if source already depends on target indirectly
    if (await wouldCreateCycle(ctx, args.input.sourceTaskId, args.input.targetTaskId)) {
      throw new Error("This dependency would create a circular chain.");
    }

    // Verify both tasks exist and belong to the same workspace
    const sourceTask = await ctx.db.get(args.input.sourceTaskId);
    if (!sourceTask || sourceTask.deletedAt) {
      throw new Error("Source task not found.");
    }
    const targetTask = await ctx.db.get(args.input.targetTaskId);
    if (!targetTask || targetTask.deletedAt) {
      throw new Error("Target task not found.");
    }
    if (sourceTask.workspaceId !== args.workspaceId || targetTask.workspaceId !== args.workspaceId) {
      throw new Error("Both tasks must belong to the same workspace.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("taskDependencies", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      sourceTaskId: args.input.sourceTaskId,
      targetTaskId: args.input.targetTaskId,
      dependencyType: args.input.dependencyType,
      createdByUserId: userId,
      createdAt: now,
    });

    const dep = await ctx.db.get(id);
    if (!dep) throw new Error("Dependency could not be created.");
    return presentDependency(dep);
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dependencyId: v.id("taskDependencies"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "task", "update");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    const existing = await ctx.db.get(args.dependencyId);
    if (!existing || existing.deletedAt) {
      throw new Error("Dependency not found.");
    }

    await ctx.db.patch(args.dependencyId, { deletedAt: Date.now() });
    return { removed: true };
  },
});

/**
 * BFS from `startId` following outgoing `depends_on` edges.
 * If we reach `targetId`, a cycle would be created.
 */
async function wouldCreateCycle(
  ctx: any,
  startId: string,
  targetId: string,
  visited = new Set<string>(),
): Promise<boolean> {
  if (startId === targetId) return true;
  if (visited.has(startId)) return false;

  visited.add(startId);

  const outgoing = await ctx.db
    .query("taskDependencies")
    .withIndex("by_source_task", (q) => q.eq("sourceTaskId", startId))
    .filter((q: any) => q.eq(q.field("dependencyType"), "depends_on"))
    .collect();

  for (const dep of outgoing) {
    if (dep.deletedAt) continue;
    if (await wouldCreateCycle(ctx, dep.targetTaskId, targetId, visited)) {
      return true;
    }
  }

  return false;
}

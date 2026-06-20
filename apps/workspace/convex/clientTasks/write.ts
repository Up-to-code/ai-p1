import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { cancelQueuedJobsForSource, scheduleTaskReminders } from "../notifications/helpers";
import { clientTaskInputValidator, clientTaskValidator } from "./validators";
import { validateStrictTaskDates, updateProjectRollup } from "../projects/rollup";
import { assertActiveWorkspaceRecord } from "../workspace/businessData";

function presentTask<TTask extends { _id: string; visibility?: "private" | "team" | "workspace" }>(task: TTask) {
  return { ...task, id: task._id, visibility: task.visibility ?? "private" };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: clientTaskInputValidator },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    
    // Strict dates check
    if (args.input.projectId) {
      await validateStrictTaskDates(ctx.db, args.input.projectId, args.input.dueDate);
    }
    
    const now = Date.now();
    const id = await ctx.db.insert("tasks", {
      organizationId: args.organizationId,
      ...args.input,
      visibility: args.input.visibility ?? "private",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      ...(args.input.status === "done" ? { completedAt: now } : {}),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.create",
      target: id,
      summary: `Created task ${args.input.title}.`,
      createdAt: now,
    });

    // Rollup progress
    if (args.input.projectId) {
      await updateProjectRollup(ctx.db, args.input.projectId);
    }

    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task could not be created.");
    await scheduleTaskReminders(ctx, task);
    return presentTask(task);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("tasks"), input: clientTaskInputValidator },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
    
    // Strict dates check
    if (args.input.projectId) {
      await validateStrictTaskDates(ctx.db, args.input.projectId, args.input.dueDate);
    }

    const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
    const now = Date.now();
    await ctx.db.patch(args.taskId, {
      ...args.input,
      visibility: nextVisibility,
      updatedAt: now,
      ...(args.input.status === "done" ? { completedAt: existing.completedAt ?? now } : {}),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.update",
      target: args.taskId,
      summary: `Updated task ${args.input.title}.`,
      createdAt: now,
    });

    // Rollup progress updates
    if (args.input.projectId) {
      await updateProjectRollup(ctx.db, args.input.projectId);
    }
    if (existing.projectId && existing.projectId !== args.input.projectId) {
      await updateProjectRollup(ctx.db, existing.projectId);
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task was not found.");
    await scheduleTaskReminders(ctx, task);
    return presentTask(task);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("tasks") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
    const now = Date.now();
    await ctx.db.patch(args.taskId, { deletedAt: now, updatedAt: now });
    await cancelQueuedJobsForSource(ctx, args.organizationId, "task", args.taskId);
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.delete",
      target: args.taskId,
      summary: `Deleted task ${existing.title}.`,
      createdAt: now,
    });

    // Rollup progress updates on deletion
    if (existing.projectId) {
      await updateProjectRollup(ctx.db, existing.projectId);
    }

    return { removed: true };
  },
});

export const assignTasksToProject = mutation({
  args: {
    organizationId: v.string(),
    taskIds: v.array(v.id("tasks")),
    projectId: v.id("projects"),
  },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const project = await ctx.db.get(args.projectId);
    assertActiveWorkspaceRecord(project, args.organizationId, "Project");

    const now = Date.now();
    let updated = 0;
    const affectedProjectIds = new Set<string>();

    for (const taskId of args.taskIds) {
      const existing = await ctx.db.get(taskId);
      if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) continue;

      await ctx.db.patch(taskId, {
        projectId: args.projectId,
        updatedAt: now,
      });
      updated++;

      if (existing.projectId) affectedProjectIds.add(existing.projectId);
      affectedProjectIds.add(args.projectId);
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.update",
      target: args.taskIds[0],
      summary: `Assigned ${updated} task(s) to project.`,
      createdAt: now,
    });

    for (const pid of affectedProjectIds) {
      await updateProjectRollup(ctx.db, pid);
    }

    return { updated };
  },
});

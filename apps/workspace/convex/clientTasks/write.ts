import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { authUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { cancelQueuedJobsForSource, scheduleTaskReminders } from "../notifications/helpers";
import { clientTaskInputValidator, clientTaskValidator, clientTaskStatusValidator, visibilityValidator } from "./validators";
import { updateProjectRollup, validateStrictTaskDates } from "../projects/rollup";
import { assertActiveWorkspaceRecord } from "../workspace/businessData";

type ClientTaskInput = {
  title: string;
  status: "todo" | "inProgress" | "waiting" | "done" | "canceled";
  pipelineOrder?: number;
  visibility?: "private" | "team" | "workspace";
  priority: "normal" | "high" | "urgent" | "low";
  assigneeUserId?: string;
  clientId?: string;
  projectId?: string;
  spaceId?: string;
  dueDate?: string;
  description?: string;
  tags?: string[];
};

function presentTask<TTask extends { _id: string; visibility?: "private" | "team" | "workspace" }>(task: TTask) {
  return { ...task, id: task._id, visibility: task.visibility ?? "private" };
}

async function createTaskCore(ctx: MutationCtx, args: { organizationId: string; input: ClientTaskInput; actorUserId: string }) {
  if (args.input.projectId) {
    await validateStrictTaskDates(ctx.db, args.input.projectId, args.input.dueDate);
  }

  const now = Date.now();
  const id = await ctx.db.insert("tasks", {
    organizationId: args.organizationId,
    ...args.input,
    visibility: args.input.visibility ?? "private",
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
    ...(args.input.status === "done" ? { completedAt: now } : {}),
  });

  if (args.input.projectId) {
    await updateProjectRollup(ctx.db, args.input.projectId);
  }

  const task = await ctx.db.get(id);
  if (!task) throw new Error("Task could not be created.");
  await scheduleTaskReminders(ctx, task);
  return { presented: presentTask(task), now };
}

async function updateTaskCore(ctx: MutationCtx, args: { organizationId: string; taskId: Id<"tasks">; input: ClientTaskInput; actorUserId: string }) {
  const existing = await ctx.db.get(args.taskId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");

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

  if (args.input.projectId) {
    await updateProjectRollup(ctx.db, args.input.projectId);
  }
  if (existing.projectId && existing.projectId !== args.input.projectId) {
    await updateProjectRollup(ctx.db, existing.projectId);
  }

  const task = await ctx.db.get(args.taskId);
  if (!task) throw new Error("Task was not found.");
  await scheduleTaskReminders(ctx, task);
  return { presented: presentTask(task), now };
}

async function deleteTaskCore(ctx: MutationCtx, args: { organizationId: string; taskId: Id<"tasks">; actorUserId: string }) {
  const existing = await ctx.db.get(args.taskId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
  const now = Date.now();
  await ctx.db.patch(args.taskId, { deletedAt: now, recordState: "deleted", updatedAt: now });
  await cancelQueuedJobsForSource(ctx, args.organizationId, "task", args.taskId);

  if (existing.projectId) {
    await updateProjectRollup(ctx.db, existing.projectId);
  }

  return { removed: true as const, now, title: existing.title };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: clientTaskInputValidator },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const { presented, now } = await createTaskCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.create",
      target: presented.id,
      summary: `Created task ${args.input.title}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("tasks"), input: clientTaskInputValidator },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const { presented, now } = await updateTaskCore(ctx, {
      organizationId: args.organizationId,
      taskId: args.taskId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.update",
      target: args.taskId,
      summary: `Updated task ${args.input.title}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("tasks") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const { now, title } = await deleteTaskCore(ctx, {
      organizationId: args.organizationId,
      taskId: args.taskId,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.delete",
      target: args.taskId,
      summary: `Deleted task ${title}.`,
      createdAt: now,
    });
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
    const user = await authUser.getAuthUser(ctx);
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

export const createInternal = internalMutation({
  args: { organizationId: v.string(), input: clientTaskInputValidator, actorUserId: v.string() },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const { presented } = await createTaskCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const updateInternal = internalMutation({
  args: { organizationId: v.string(), taskId: v.id("tasks"), input: clientTaskInputValidator, actorUserId: v.string() },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const { presented } = await updateTaskCore(ctx, {
      organizationId: args.organizationId,
      taskId: args.taskId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const deleteInternal = internalMutation({
  args: { organizationId: v.string(), taskId: v.id("tasks"), actorUserId: v.string() },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    await deleteTaskCore(ctx, {
      organizationId: args.organizationId,
      taskId: args.taskId,
      actorUserId: args.actorUserId,
    });
    return { removed: true };
  },
});

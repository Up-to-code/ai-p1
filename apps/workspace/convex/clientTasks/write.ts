import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { DatabaseReader, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { resolveTaskAccess, type TaskScopeInput } from "../access/task";
import { cancelQueuedJobsForSource, scheduleTaskReminders } from "../notifications/helpers";
import { clientTaskInputValidator, clientTaskValidator } from "./validators";
import { updateProjectRollup, validateStrictTaskDates } from "../projects/rollup";

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

function taskInputFromExisting(task: ClientTaskInput & { visibility?: ClientTaskInput["visibility"] }): ClientTaskInput {
  return {
    title: task.title,
    status: task.status,
    pipelineOrder: task.pipelineOrder,
    visibility: task.visibility,
    priority: task.priority,
    assigneeUserId: task.assigneeUserId,
    clientId: task.clientId,
    projectId: task.projectId,
    spaceId: task.spaceId,
    dueDate: task.dueDate,
    description: task.description,
    tags: task.tags,
  };
}

async function assertActiveTaskLinks(
  db: DatabaseReader,
  organizationId: string,
  input: TaskScopeInput,
) {
  const project = input.projectId
    ? await db.get(input.projectId as Id<"projects">)
    : null;
  const space = input.spaceId
    ? await db.get(input.spaceId as Id<"spaces">)
    : null;
  if (
    (input.projectId && (!project || project.organizationId !== organizationId || project.deletedAt || project.recordState === "deleted")) ||
    (input.spaceId && (!space || space.organizationId !== organizationId || space.deletedAt || space.recordState === "deleted"))
  ) {
    throw new Error("Task links must reference active records in this organization.");
  }
  if (project && space) {
    const link = await db
      .query("projectSpaces")
      .withIndex("by_project_space", (q) =>
        q.eq("organizationId", organizationId).eq("projectId", project._id).eq("spaceId", space._id),
      )
      .first();
    if (!link || link.deletedAt || link.recordState === "deleted") {
      throw new Error("Task space must be linked to its project.");
    }
  }
}

export function taskCompletionPatch(args: {
  existingStatus: ClientTaskInput["status"];
  nextStatus: ClientTaskInput["status"];
  existingCompletedAt?: number;
  now: number;
}) {
  if (args.nextStatus !== "done") return { completedAt: undefined };
  if (args.existingStatus === "done") return { completedAt: args.existingCompletedAt };
  return { completedAt: args.now };
}

async function createTaskCore(ctx: MutationCtx, args: { organizationId: string; input: ClientTaskInput; actorUserId: string }) {
  await assertActiveTaskLinks(ctx.db, args.organizationId, args.input);
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

  await assertActiveTaskLinks(ctx.db, args.organizationId, args.input);

  if (args.input.projectId) {
    await validateStrictTaskDates(ctx.db, args.input.projectId, args.input.dueDate);
  }

  const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
  const now = Date.now();
  await ctx.db.patch(args.taskId, {
    ...args.input,
    visibility: nextVisibility,
    updatedAt: now,
    ...taskCompletionPatch({
      existingStatus: existing.status,
      nextStatus: args.input.status,
      existingCompletedAt: existing.completedAt,
      now,
    }),
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
    const access = await resolveTaskAccess(ctx, args.organizationId);
    await access.assertCanCreate(args.input);
    const { presented, now } = await createTaskCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: access.actor.userId,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
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
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
    await access.assertCanUpdate(existing);
    await access.assertCanCreate(args.input);
    const { presented, now } = await updateTaskCore(ctx, {
      organizationId: args.organizationId,
      taskId: args.taskId,
      input: args.input,
      actorUserId: access.actor.userId,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
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
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
    await access.assertCanDelete(existing);
    const { now, title } = await deleteTaskCore(ctx, {
      organizationId: args.organizationId,
      taskId: args.taskId,
      actorUserId: access.actor.userId,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
      action: "client.task.delete",
      target: args.taskId,
      summary: `Deleted task ${title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});

export const completeFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("tasks") },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
    await access.assertCanUpdate(existing);
    const input = { ...taskInputFromExisting(existing), status: "done" as const };
    await access.assertCanCreate(input);
    const { presented, now } = await updateTaskCore(ctx, {
      organizationId: args.organizationId,
      taskId: args.taskId,
      input,
      actorUserId: access.actor.userId,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
      action: "client.task.update",
      target: args.taskId,
      summary: `Completed task ${existing.title}.`,
      createdAt: now,
    });
    return presented;
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
    const access = await resolveTaskAccess(ctx, args.organizationId);
    await access.assertCanCreate({ projectId: args.projectId });

    const now = Date.now();
    let updated = 0;
    const affectedProjectIds = new Set<string>();

    for (const taskId of args.taskIds) {
      const existing = await ctx.db.get(taskId);
      if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) continue;
      if (!(await access.canUpdate(existing))) continue;
      await access.assertCanCreate({
        projectId: args.projectId,
        spaceId: existing.spaceId,
        visibility: existing.visibility ?? "private",
      });

      await ctx.db.patch(taskId, {
        projectId: args.projectId,
        updatedAt: now,
        ...taskCompletionPatch({
          existingStatus: existing.status,
          nextStatus: existing.status,
          existingCompletedAt: existing.completedAt,
          now,
        }),
      });
      updated++;

      if (existing.projectId) affectedProjectIds.add(existing.projectId);
      affectedProjectIds.add(args.projectId);
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
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

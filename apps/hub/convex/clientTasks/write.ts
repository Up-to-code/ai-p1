import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { assertPlatformAdmin } from "../platform/access";
import { clientTaskInputValidator, clientTaskValidator } from "./validators";

function presentTask<TTask extends { _id: string; visibility?: "private" | "public" }>(task: TTask) {
  return { ...task, id: task._id, visibility: task.visibility ?? "private" };
}

async function assertClient(ctx: MutationCtx, organizationId: string, clientId: Id<"clients">) {
  const client = await ctx.db.get(clientId);
  if (!client || client.organizationId !== organizationId || client.deletedAt) {
    throw new Error("Client was not found.");
  }
}

async function assertOptionalLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: { propertyId?: Id<"propertyUnits">; projectId?: Id<"projects">; calendarEventId?: Id<"calendarEvents"> },
) {
  if (input.propertyId) {
    const property = await ctx.db.get(input.propertyId);
    if (!property || property.organizationId !== organizationId || property.deletedAt) throw new Error("Property unit was not found.");
  }
  if (input.projectId) {
    const project = await ctx.db.get(input.projectId);
    if (!project || project.organizationId !== organizationId || project.deletedAt) throw new Error("Project was not found.");
  }
  if (input.calendarEventId) {
    const event = await ctx.db.get(input.calendarEventId);
    if (!event || event.organizationId !== organizationId || event.deletedAt) throw new Error("Calendar event was not found.");
  }
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: clientTaskInputValidator },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    if ((args.input.visibility ?? "private") === "public") {
      await assertPlatformAdmin(ctx);
    }
    await assertClient(ctx, args.organizationId, args.input.clientId);
    await assertOptionalLinks(ctx, args.organizationId, args.input);
    const now = Date.now();
    const id = await ctx.db.insert("clientTasks", {
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
      target: args.input.clientId,
      summary: `Created task ${args.input.title}.`,
      createdAt: now,
    });

    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task could not be created.");
    return presentTask(task);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("clientTasks"), input: clientTaskInputValidator },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
    const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
    if (nextVisibility !== (existing.visibility ?? "private")) {
      await assertPlatformAdmin(ctx);
    }
    await assertClient(ctx, args.organizationId, args.input.clientId);
    await assertOptionalLinks(ctx, args.organizationId, args.input);
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
      target: args.input.clientId,
      summary: `Updated task ${args.input.title}.`,
      createdAt: now,
    });

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task was not found.");
    return presentTask(task);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("clientTasks") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Task was not found.");
    const now = Date.now();
    await ctx.db.patch(args.taskId, { deletedAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.task.delete",
      target: existing.clientId,
      summary: `Deleted task ${existing.title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});

import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { clientTaskValidator } from "./validators";

const MAX_LIST_TASKS = 500;

function presentTask<TTask extends { _id: string; visibility?: "private" | "public" }>(task: TTask) {
  return { ...task, id: task._id, visibility: task.visibility ?? "private" };
}

export const list = query({
  args: { organizationId: v.string(), clientId: v.optional(v.id("clients")) },
  returns: v.array(clientTaskValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const tasks = args.clientId
      ? await ctx.db
          .query("clientTasks")
          .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", args.clientId!))
          .take(MAX_LIST_TASKS)
      : await ctx.db
          .query("clientTasks")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
          .take(MAX_LIST_TASKS);

    return tasks
      .filter((task) => !task.deletedAt)
      .sort((a, b) => (a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.dueAt ?? Number.MAX_SAFE_INTEGER))
      .map(presentTask);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), title: v.string(), clientId: v.id("clients") })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));
    const tasks = await ctx.db
      .query("clientTasks")
      .withIndex("by_due", (q) => q.eq("organizationId", args.organizationId))
      .take(limit);

    return tasks
      .filter((task) => !task.deletedAt)
      .map((task) => ({ id: task._id, title: task.title, clientId: task.clientId }));
  },
});

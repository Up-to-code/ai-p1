import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeUpdatedWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { followUpValidator } from "./validators";

const MAX_LIST_FOLLOWUPS = 200;

function presentFollowUp<TFollowUp extends { _id: string; visibility?: "private" | "team" | "workspace" }>(followUp: TFollowUp) {
  return { ...followUp, id: followUp._id, visibility: followUp.visibility ?? "private" as const };
}

export const listByClient = query({
  args: {
    organizationId: v.string(),
    clientId: v.string(),
    status: v.optional(followUpValidator.fields.status),
    limit: v.optional(v.number()),
  },
  returns: v.array(followUpValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, MAX_LIST_FOLLOWUPS, MAX_LIST_FOLLOWUPS);

    const followUps = await ctx.db
      .query("clientFollowUps")
      .withIndex("by_organization_client", (q) =>
        q.eq("organizationId", args.organizationId).eq("clientId", args.clientId),
      )
      .take(limit);

    return activeUpdatedWorkspaceRows(followUps)
      .filter((fu) => !args.status || fu.status === args.status)
      .map(presentFollowUp);
  },
});

export const get = query({
  args: { organizationId: v.string(), followUpId: v.id("clientFollowUps") },
  returns: v.union(followUpValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const followUp = await ctx.db.get(args.followUpId);
    if (!followUp || followUp.organizationId !== args.organizationId || followUp.deletedAt) return null;
    return presentFollowUp(followUp);
  },
});

export const stats = query({
  args: { organizationId: v.string(), clientId: v.string() },
  returns: v.object({
    total: v.number(),
    completed: v.number(),
    upcoming: v.number(),
    past: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const followUps = await ctx.db
      .query("clientFollowUps")
      .withIndex("by_organization_client", (q) =>
        q.eq("organizationId", args.organizationId).eq("clientId", args.clientId),
      )
      .take(MAX_LIST_FOLLOWUPS);

    const active = activeUpdatedWorkspaceRows(followUps);
    return {
      total: active.length,
      completed: active.filter((fu) => fu.status === "completed").length,
      upcoming: active.filter((fu) => fu.status === "upcoming").length,
      past: active.filter((fu) => fu.status === "past").length,
    };
  },
});

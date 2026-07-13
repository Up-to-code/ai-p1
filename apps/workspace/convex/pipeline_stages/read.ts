import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUser } from "../auth";

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(v.object({
    _id: v.id("workflowStates"),
    _creationTime: v.number(),
    organizationId: v.string(),
    key: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Authentication required to list pipeline stages.");

    const workflow = await ctx.db
      .query("workflowDefinitions")
      .withIndex("by_resource_key", (q) =>
        q.eq("organizationId", args.organizationId).eq("resourceType", "client").eq("key", "client-pipeline"),
      )
      .first();
    if (!workflow || workflow.recordState !== "active") return [];

    const states = await ctx.db
      .query("workflowStates")
      .withIndex("by_workflow_state_order", (q) =>
        q.eq("organizationId", args.organizationId).eq("workflowId", workflow._id).eq("recordState", "active"),
      )
      .collect();

    return states.map((state) => ({
      _id: state._id,
      _creationTime: state._creationTime,
      organizationId: state.organizationId,
      key: state.key,
      name: state.label,
      color: state.color,
      order: state.order,
      isActive: state.recordState === "active",
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    }));
  },
});

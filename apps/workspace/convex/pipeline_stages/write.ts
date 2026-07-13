import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { getAuthUser } from "../auth";

const DEFAULT_CLIENT_STAGES = [
  { key: "blank", name: "Blank", color: "#B4B2A9", order: 0, category: "not_started" as const },
  { key: "new_lead", name: "New Lead", color: "#EF9F27", order: 1, category: "active" as const },
  { key: "attempted", name: "Attempted", color: "#F0997B", order: 2, category: "active" as const },
  { key: "contacted", name: "Contacted", color: "#378ADD", order: 3, category: "active" as const },
  { key: "qualified", name: "Qualified", color: "#639922", order: 4, category: "terminal" as const },
];

export const create = mutation({
  args: {
    organizationId: v.string(),
    key: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(),
  },
  returns: v.id("workflowStates"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const workflowId = await ensureClientPipelineWorkflow(ctx, args.organizationId, user._id);

    const existing = await ctx.db
      .query("workflowStates")
      .withIndex("by_workflow_key", (q) =>
        q.eq("organizationId", args.organizationId).eq("workflowId", workflowId).eq("key", args.key),
      )
      .first();
    if (existing && existing.recordState === "active") {
      throw new Error(`A stage with key "${args.key}" already exists.`);
    }

    const now = Date.now();
    return await ctx.db.insert("workflowStates", {
      organizationId: args.organizationId,
      workflowId,
      key: args.key,
      label: args.name,
      color: args.color,
      order: args.order,
      category: "active",
      isDefault: false,
      isTerminal: false,
      isRemovable: true,
      recordState: "active",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    stageId: v.id("workflowStates"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const state = await ctx.db.get(args.stageId);
    if (!state) throw new Error("Pipeline stage was not found.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.label = args.name;
    if (args.color !== undefined) patch.color = args.color;
    if (args.order !== undefined) patch.order = args.order;
    if (args.isActive !== undefined) patch.recordState = args.isActive ? "active" : "archived";
    await ctx.db.patch(args.stageId, patch);
    return null;
  },
});

export const remove = mutation({
  args: { stageId: v.id("workflowStates") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const state = await ctx.db.get(args.stageId);
    if (!state) throw new Error("Pipeline stage was not found.");
    if (!state.isRemovable) throw new Error("Default pipeline stages cannot be removed.");

    const now = Date.now();
    await ctx.db.patch(args.stageId, { recordState: "deleted", deletedAt: now, updatedAt: now });
    return null;
  },
});

export const reorder = mutation({
  args: {
    organizationId: v.string(),
    stageOrders: v.array(v.object({
      stageId: v.id("workflowStates"),
      order: v.number(),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const now = Date.now();
    for (const { stageId, order } of args.stageOrders) {
      const stage = await ctx.db.get(stageId);
      if (stage && stage.organizationId === args.organizationId) {
        await ctx.db.patch(stageId, { order, updatedAt: now });
      }
    }
    return null;
  },
});

export const seedDefaults = mutation({
  args: { organizationId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const workflowId = await ensureClientPipelineWorkflow(ctx, args.organizationId, user._id);
    const existing = await ctx.db
      .query("workflowStates")
      .withIndex("by_workflow_state_order", (q) =>
        q.eq("organizationId", args.organizationId).eq("workflowId", workflowId).eq("recordState", "active"),
      )
      .first();
    if (existing) return null;

    const now = Date.now();
    for (const stage of DEFAULT_CLIENT_STAGES) {
      await ctx.db.insert("workflowStates", {
        organizationId: args.organizationId,
        workflowId,
        key: stage.key,
        label: stage.name,
        color: stage.color,
        order: stage.order,
        category: stage.category,
        isDefault: stage.order === 1,
        isTerminal: stage.category === "terminal",
        isRemovable: stage.key !== "blank",
        sourceTemplateId: "default:client-pipeline",
        recordState: "active",
        createdByUserId: user._id,
        createdAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});

async function requireUser(ctx: MutationCtx) {
  const user = await getAuthUser(ctx);
  if (!user) throw new Error("Authentication required to manage pipeline stages.");
  return user;
}

async function ensureClientPipelineWorkflow(
  ctx: MutationCtx,
  organizationId: string,
  userId: string,
) {
  const existing = await ctx.db
    .query("workflowDefinitions")
    .withIndex("by_resource_key", (q) =>
      q.eq("organizationId", organizationId).eq("resourceType", "client").eq("key", "client-pipeline"),
    )
    .first();
  if (existing) return existing._id;

  const now = Date.now();
  return await ctx.db.insert("workflowDefinitions", {
    organizationId,
    resourceType: "client",
    key: "client-pipeline",
    name: "Client Pipeline",
    isDefault: true,
    isRemovable: false,
    sourceTemplateId: "default:client-pipeline",
    recordState: "active",
    createdByUserId: userId,
    createdAt: now,
    updatedAt: now,
  });
}

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationEntitlement } from "../billing/access";
import { resolveScopePolicy } from "../mcp/scopePolicy";
import { customAgentError, requireCustomAgentOwner } from "./access";
import { customAgentDocumentValidator } from "./validators";

const DEFAULT_MODEL = "openai/gpt-4.1-nano";
const MAX_AGENTS = 100;

function normalizedName(value: string) {
  const name = value.trim().slice(0, 120);
  if (!name) customAgentError("CUSTOM_AGENT_NAME_REQUIRED", "Agent name is required.");
  return name;
}

function normalizedInstructions(value: string) {
  const instructions = value.trim().slice(0, 40_000);
  if (!instructions) {
    customAgentError(
      "CUSTOM_AGENT_INSTRUCTIONS_REQUIRED",
      "Agent instructions are required.",
    );
  }
  return instructions;
}

function normalizedModel(value: string) {
  const model = value.trim().slice(0, 160);
  return model || DEFAULT_MODEL;
}

export const create = mutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: customAgentDocumentValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await resolveScopePolicy(ctx, {
      organizationId: args.organizationId,
      actorUserId: user._id,
      scope: { type: "organization" },
    });
    const existing = await ctx.db
      .query("customAgents")
      .withIndex("by_owner_organization_updated", (q) =>
        q.eq("ownerUserId", user._id).eq("organizationId", args.organizationId),
      )
      .take(MAX_AGENTS);
    if (existing.length >= MAX_AGENTS) {
      customAgentError("CUSTOM_AGENT_LIMIT", "You have reached the custom agent limit.");
    }
    const now = Date.now();
    const agentId = await ctx.db.insert("customAgents", {
      organizationId: args.organizationId,
      ownerUserId: user._id,
      name: normalizedName(args.name),
      description: args.description?.trim().slice(0, 500) || undefined,
      instructions:
        "Help the user complete the assigned work. Be precise, identify problems, and return a concise actionable response.",
      model: DEFAULT_MODEL,
      status: "draft",
      draftRevision: 1,
      createdAt: now,
      updatedAt: now,
    });
    const agent = await ctx.db.get(agentId);
    if (!agent) customAgentError("CUSTOM_AGENT_CREATE_FAILED", "Agent creation failed.");
    return agent;
  },
});

export const saveDraft = mutation({
  args: {
    agentId: v.id("customAgents"),
    name: v.string(),
    description: v.optional(v.string()),
    instructions: v.string(),
    model: v.string(),
    expectedRevision: v.number(),
  },
  returns: customAgentDocumentValidator,
  handler: async (ctx, args) => {
    const { agent } = await requireCustomAgentOwner(ctx, args.agentId);
    if (agent.draftRevision !== args.expectedRevision) {
      customAgentError(
        "CUSTOM_AGENT_CONFLICT",
        "This agent changed in another session. Reload before saving.",
      );
    }
    await ctx.db.patch(agent._id, {
      name: normalizedName(args.name),
      description: args.description?.trim().slice(0, 500) || undefined,
      instructions: normalizedInstructions(args.instructions),
      model: normalizedModel(args.model),
      draftRevision: agent.draftRevision + 1,
      status: agent.status === "archived" ? "draft" : agent.status,
      archivedAt: undefined,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(agent._id);
    if (!updated) customAgentError("CUSTOM_AGENT_SAVE_FAILED", "Agent save failed.");
    return updated;
  },
});

export const publish = mutation({
  args: {
    agentId: v.id("customAgents"),
    expectedRevision: v.number(),
  },
  returns: customAgentDocumentValidator,
  handler: async (ctx, args) => {
    const { agent } = await requireCustomAgentOwner(ctx, args.agentId);
    if (agent.draftRevision !== args.expectedRevision) {
      customAgentError(
        "CUSTOM_AGENT_CONFLICT",
        "Save the latest draft before publishing.",
      );
    }
    await assertOrganizationEntitlement(ctx, {
      organizationId: agent.organizationId,
      key: "ai",
      used: 0,
    });
    const now = Date.now();
    await ctx.db.patch(agent._id, {
      status: "published",
      publishedRevision: agent.draftRevision,
      publishedInstructions: normalizedInstructions(agent.instructions),
      publishedModel: normalizedModel(agent.model),
      publishedAt: now,
      updatedAt: now,
    });
    const published = await ctx.db.get(agent._id);
    if (!published) customAgentError("CUSTOM_AGENT_PUBLISH_FAILED", "Agent publish failed.");
    return published;
  },
});

export const archive = mutation({
  args: { agentId: v.id("customAgents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { agent } = await requireCustomAgentOwner(ctx, args.agentId);
    const now = Date.now();
    await ctx.db.patch(agent._id, {
      status: "archived",
      archivedAt: now,
      updatedAt: now,
    });
    return null;
  },
});

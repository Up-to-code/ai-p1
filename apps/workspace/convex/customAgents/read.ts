import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";
import { getAuthUser } from "../auth";
import { resolveScopePolicy } from "../mcp/scopePolicy";
import { requireCustomAgentOwner } from "./access";
import {
  customAgentDocumentValidator,
  publishedCustomAgentValidator,
} from "./validators";

const MAX_AGENTS = 100;

function publishedProjection(
  agent: Awaited<ReturnType<typeof requireCustomAgentOwner>>["agent"],
) {
  if (
    agent.status !== "published" ||
    !agent.publishedInstructions ||
    !agent.publishedModel ||
    agent.publishedRevision === undefined
  ) {
    return null;
  }
  return {
    id: agent._id,
    organizationId: agent.organizationId,
    ownerUserId: agent.ownerUserId,
    name: agent.name,
    description: agent.description,
    instructions: agent.publishedInstructions,
    model: agent.publishedModel,
    revision: agent.publishedRevision,
  };
}

export const listMine = query({
  args: { organizationId: v.string() },
  returns: v.array(customAgentDocumentValidator),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await resolveScopePolicy(ctx, {
      organizationId: args.organizationId,
      actorUserId: user._id,
      scope: { type: "organization" },
    });
    return await ctx.db
      .query("customAgents")
      .withIndex("by_owner_organization_updated", (q) =>
        q.eq("ownerUserId", user._id).eq("organizationId", args.organizationId),
      )
      .order("desc")
      .take(MAX_AGENTS);
  },
});

export const getMine = query({
  args: { agentId: v.id("customAgents") },
  returns: v.union(customAgentDocumentValidator, v.null()),
  handler: async (ctx, args) => {
    const { agent } = await requireCustomAgentOwner(ctx, args.agentId);
    return agent;
  },
});

export const listPublishedMine = query({
  args: { organizationId: v.string() },
  returns: v.array(publishedCustomAgentValidator),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await resolveScopePolicy(ctx, {
      organizationId: args.organizationId,
      actorUserId: user._id,
      scope: { type: "organization" },
    });
    const agents = await ctx.db
      .query("customAgents")
      .withIndex("by_owner_organization_status", (q) =>
        q
          .eq("ownerUserId", user._id)
          .eq("organizationId", args.organizationId)
          .eq("status", "published"),
      )
      .take(MAX_AGENTS);
    return agents.flatMap((agent) => {
      const projection = publishedProjection(agent);
      return projection ? [projection] : [];
    });
  },
});

export const getPublishedForRuntime = query({
  args: {
    organizationId: v.string(),
    agentId: v.id("customAgents"),
  },
  returns: v.union(publishedCustomAgentValidator, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireCustomAgentOwner(ctx, args.agentId);
    if (owner.agent.organizationId !== args.organizationId) return null;
    return publishedProjection(owner.agent);
  },
});

export const loadPublishedForOwner = internalQuery({
  args: {
    organizationId: v.string(),
    ownerUserId: v.string(),
    agentId: v.id("customAgents"),
  },
  returns: v.union(publishedCustomAgentValidator, v.null()),
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (
      !agent ||
      agent.organizationId !== args.organizationId ||
      agent.ownerUserId !== args.ownerUserId
    ) {
      return null;
    }
    return publishedProjection(agent);
  },
});

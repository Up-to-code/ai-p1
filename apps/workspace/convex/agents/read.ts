import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { agentMessageValidator, agentThreadValidator } from "./validators";

function presentThread<T extends { _id: string }>(thread: T) {
  return { ...thread, id: thread._id };
}

function presentMessage<T extends { _id: string }>(message: T) {
  return { ...message, id: message._id };
}

export const listThreads = query({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(agentThreadValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const limit = Math.max(1, Math.min(args.limit ?? 20, 50));
    const threads = await ctx.db
      .query("agentThreads")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return threads.map(presentThread);
  },
});

export const listMessages = query({
  args: {
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    limit: v.optional(v.number()),
  },
  returns: v.array(agentMessageValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.organizationId !== args.organizationId) return [];

    const limit = Math.max(1, Math.min(args.limit ?? 80, 120));
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_thread", (q) =>
        q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
      )
      .order("desc")
      .take(limit);

    return messages.reverse().map(presentMessage);
  },
});

export const getThreadContext = query({
  args: {
    organizationId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    messages: v.array(agentMessageValidator),
    summary: v.optional(v.string()),
    facts: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    if (!args.threadId) return { messages: [], facts: [] };

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.organizationId !== args.organizationId) {
      return { messages: [], facts: [] };
    }

    const limit = Math.max(1, Math.min(args.limit ?? 16, 30));
    const [messages, summary, facts] = await Promise.all([
      ctx.db
        .query("agentMessages")
        .withIndex("by_thread", (q) =>
          q.eq("organizationId", args.organizationId).eq("threadId", args.threadId!),
        )
        .order("desc")
        .take(limit),
      ctx.db
        .query("agentMemorySummaries")
        .withIndex("by_thread", (q) =>
          q.eq("organizationId", args.organizationId).eq("threadId", args.threadId!),
        )
        .first(),
      ctx.db
        .query("agentMemoryFacts")
        .withIndex("by_thread", (q) =>
          q.eq("organizationId", args.organizationId).eq("threadId", args.threadId!),
        )
        .order("desc")
        .take(10),
    ]);

    return {
      messages: messages.reverse().map(presentMessage),
      summary: summary?.summary,
      facts: facts.map((fact) => fact.fact),
    };
  },
});

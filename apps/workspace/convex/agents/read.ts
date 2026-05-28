import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { agentMessageValidator, agentThreadValidator } from "./validators";
import {
  boundedAgentReadLimit,
  chronologicalAgentMessages,
  presentAgentMessage,
  presentAgentRecord,
  presentAgentThreadPage,
  revealAgentText,
} from "./readSurface";

export const listThreads = query({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(agentThreadValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const limit = boundedAgentReadLimit(args.limit, 20, 50);
    const threads = await ctx.db
      .query("agentThreads")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    return threads.map(presentAgentRecord);
  },
});

export const listThreadsPage = query({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
  },
  returns: v.object({
    threads: v.array(agentThreadValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const limit = boundedAgentReadLimit(args.limit, 10, 10);
    const page = await ctx.db
      .query("agentThreads")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .paginate({ numItems: limit, cursor: args.cursor });

    return presentAgentThreadPage(page);
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

    const limit = boundedAgentReadLimit(args.limit, 80, 120);
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_thread", (q) =>
        q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
      )
      .order("desc")
      .take(limit);

    return Promise.all(chronologicalAgentMessages(messages).map((message) => presentAgentMessage(message)));
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

    const limit = boundedAgentReadLimit(args.limit, 16, 30);
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
      messages: await Promise.all(chronologicalAgentMessages(messages).map((message) => presentAgentMessage(message))),
      summary: summary
        ? await revealAgentText(summary.organizationId, "agent-memory-summary", summary.encryptedSummary, summary.summary)
        : undefined,
      facts: await Promise.all(facts.map((fact) =>
        revealAgentText(fact.organizationId, "agent-memory-fact", fact.encryptedFact, fact.fact),
      )),
    };
  },
});

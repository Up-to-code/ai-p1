import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  agentRunStatusValidator,
  agentRunValidator,
  agentStepPhaseValidator,
  agentStepStatusValidator,
  agentThreadValidator,
  agentToolStatusValidator,
} from "./validators";

function present<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

function titleFromMessage(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (!normalized) return "New agent thread";
  return normalized.length > 56 ? `${normalized.slice(0, 53)}...` : normalized;
}

export const startRunFromHono = mutation({
  args: {
    organizationId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
    message: v.string(),
    model: v.string(),
  },
  returns: v.object({
    thread: agentThreadValidator,
    run: agentRunValidator,
    userMessageId: v.id("agentMessages"),
  }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");

    const now = Date.now();
    let threadId = args.threadId;
    if (threadId) {
      const existing = await ctx.db.get(threadId);
      if (!existing || existing.organizationId !== args.organizationId) {
        throw new Error("Agent thread was not found.");
      }
    } else {
      threadId = await ctx.db.insert("agentThreads", {
        organizationId: args.organizationId,
        title: titleFromMessage(args.message),
        createdByUserId: user._id,
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
      });
    }

    const runId = await ctx.db.insert("agentRuns", {
      organizationId: args.organizationId,
      threadId,
      status: "running",
      model: args.model,
      createdByUserId: user._id,
      startedAt: now,
    });
    const userMessageId = await ctx.db.insert("agentMessages", {
      organizationId: args.organizationId,
      threadId,
      role: "user",
      content: args.message,
      runId,
      createdAt: now,
    });
    await ctx.db.patch(threadId, { updatedAt: now, lastMessageAt: now });
    await ctx.db.insert("agentRunSteps", {
      organizationId: args.organizationId,
      threadId,
      runId,
      phase: "understand",
      status: "started",
      summary: "Received user request.",
      createdAt: now,
    });

    const [thread, run] = await Promise.all([ctx.db.get(threadId), ctx.db.get(runId)]);
    if (!thread || !run) throw new Error("Agent run could not be started.");

    return { thread: present(thread), run: present(run), userMessageId };
  },
});

export const recordStepFromHono = mutation({
  args: {
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    phase: agentStepPhaseValidator,
    status: agentStepStatusValidator,
    summary: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const run = await ctx.db.get(args.runId);
    if (!run || run.organizationId !== args.organizationId || run.threadId !== args.threadId) {
      throw new Error("Agent run was not found.");
    }
    await ctx.db.insert("agentRunSteps", { ...args, createdAt: Date.now() });
    return null;
  },
});

export const recordToolCallFromHono = mutation({
  args: {
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    status: agentToolStatusValidator,
    inputPreview: v.optional(v.string()),
    outputPreview: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const run = await ctx.db.get(args.runId);
    if (!run || run.organizationId !== args.organizationId || run.threadId !== args.threadId) {
      throw new Error("Agent run was not found.");
    }
    const now = Date.now();
    await ctx.db.insert("agentToolCalls", {
      ...args,
      createdAt: now,
      completedAt: now,
    });
    return null;
  },
});

export const finishRunFromHono = mutation({
  args: {
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    status: agentRunStatusValidator,
    assistantMessage: v.string(),
    summary: v.optional(v.string()),
    memoryFacts: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
  },
  returns: v.object({ assistantMessageId: v.id("agentMessages") }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const run = await ctx.db.get(args.runId);
    if (!run || run.organizationId !== args.organizationId || run.threadId !== args.threadId) {
      throw new Error("Agent run was not found.");
    }

    const now = Date.now();
    const assistantMessageId = await ctx.db.insert("agentMessages", {
      organizationId: args.organizationId,
      threadId: args.threadId,
      role: "assistant",
      content: args.assistantMessage,
      runId: args.runId,
      createdAt: now,
    });
    await ctx.db.patch(args.runId, {
      status: args.status,
      completedAt: now,
      ...(args.error ? { error: args.error } : {}),
    });
    await ctx.db.patch(args.threadId, { updatedAt: now, lastMessageAt: now });
    await ctx.db.insert("agentRunSteps", {
      organizationId: args.organizationId,
      threadId: args.threadId,
      runId: args.runId,
      phase: "memory",
      status: args.status === "failed" ? "failed" : "completed",
      summary: "Persisted assistant response and memory.",
      createdAt: now,
    });

    if (args.summary) {
      const existing = await ctx.db
        .query("agentMemorySummaries")
        .withIndex("by_thread", (q) =>
          q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
        )
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          summary: args.summary,
          messageCount: existing.messageCount + 2,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("agentMemorySummaries", {
          organizationId: args.organizationId,
          threadId: args.threadId,
          summary: args.summary,
          messageCount: 2,
          updatedAt: now,
        });
      }
    }

    for (const fact of args.memoryFacts ?? []) {
      const trimmed = fact.trim();
      if (trimmed.length < 8 || trimmed.length > 240) continue;
      await ctx.db.insert("agentMemoryFacts", {
        organizationId: args.organizationId,
        threadId: args.threadId,
        fact: trimmed,
        sourceMessageId: assistantMessageId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { assistantMessageId };
  },
});

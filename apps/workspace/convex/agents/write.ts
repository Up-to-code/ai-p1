import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  agentRunStatusValidator,
  agentRunValidator,
  agentStepPhaseValidator,
  agentStepStatusValidator,
  agentThreadValidator,
  agentToolStatusValidator,
} from "./validators";
import {
  encryptedPlaceholder,
  protectOrganizationText,
  redactSensitiveText,
} from "../security/organizationData";

function present<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

function titleFromMessage(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (!normalized) return "New agent thread";
  return normalized.length > 56 ? `${normalized.slice(0, 53)}...` : normalized;
}

function assertOwnedThread(
  thread: { organizationId: string; createdByUserId: string } | null,
  organizationId: string,
  userId: string,
) {
  if (!thread || thread.organizationId !== organizationId || thread.createdByUserId !== userId) {
    throw new Error("Agent thread was not found.");
  }
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    const userId = String(user._id);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");

    const now = Date.now();
    let threadId = args.threadId;
    if (threadId) {
      const existing = await ctx.db.get(threadId);
      assertOwnedThread(existing, args.organizationId, userId);
    } else {
      threadId = await ctx.db.insert("agentThreads", {
        organizationId: args.organizationId,
        title: titleFromMessage(args.message),
        createdByUserId: userId,
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
      createdByUserId: userId,
      startedAt: now,
    });
    const userMessageId = await ctx.db.insert("agentMessages", {
      organizationId: args.organizationId,
      threadId,
      role: "user",
      content: redactSensitiveText(args.message),
      encryptedContent: await protectOrganizationText(args.organizationId, "agent-message", args.message),
      contentRedacted: true,
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

export const deleteThreadFromHono = mutation({
  args: {
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
  },
  returns: v.object({
    deleted: v.boolean(),
    threadId: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    const userId = String(user._id);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");

    const thread = await ctx.db.get(args.threadId);
    assertOwnedThread(thread, args.organizationId, userId);

    const runningRun = await ctx.db
      .query("agentRuns")
      .withIndex("by_thread", (q) =>
        q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
      )
      .filter((q) => q.eq(q.field("status"), "running"))
      .first();
    if (runningRun) {
      throw new Error("Agent thread has a running run.");
    }

    const runs = await ctx.db
      .query("agentRuns")
      .withIndex("by_thread", (q) =>
        q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
      )
      .collect();

    for (const run of runs) {
      const [steps, toolCalls, confirmations] = await Promise.all([
        ctx.db
          .query("agentRunSteps")
          .withIndex("by_run", (q) => q.eq("organizationId", args.organizationId).eq("runId", run._id))
          .collect(),
        ctx.db
          .query("agentToolCalls")
          .withIndex("by_run", (q) => q.eq("organizationId", args.organizationId).eq("runId", run._id))
          .collect(),
        ctx.db
          .query("agentConfirmations")
          .withIndex("by_run", (q) => q.eq("organizationId", args.organizationId).eq("runId", run._id))
          .collect(),
      ]);

      for (const step of steps) await ctx.db.delete(step._id);
      for (const toolCall of toolCalls) await ctx.db.delete(toolCall._id);
      for (const confirmation of confirmations) await ctx.db.delete(confirmation._id);
      await ctx.db.delete(run._id);
    }

    const [messages, summaries, facts] = await Promise.all([
      ctx.db
        .query("agentMessages")
        .withIndex("by_thread", (q) =>
          q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
        )
        .collect(),
      ctx.db
        .query("agentMemorySummaries")
        .withIndex("by_thread", (q) =>
          q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
        )
        .collect(),
      ctx.db
        .query("agentMemoryFacts")
        .withIndex("by_thread", (q) =>
          q.eq("organizationId", args.organizationId).eq("threadId", args.threadId),
        )
        .collect(),
    ]);

    for (const message of messages) await ctx.db.delete(message._id);
    for (const summary of summaries) await ctx.db.delete(summary._id);
    for (const fact of facts) await ctx.db.delete(fact._id);
    await ctx.db.delete(args.threadId);

    return { deleted: true, threadId: args.threadId };
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
    const encryptedInputPreview = args.inputPreview
      ? await protectOrganizationText(args.organizationId, "agent-tool-input", args.inputPreview)
      : undefined;
    const encryptedOutputPreview = args.outputPreview
      ? await protectOrganizationText(args.organizationId, "agent-tool-output", args.outputPreview)
      : undefined;
    await ctx.db.insert("agentToolCalls", {
      ...args,
      inputPreview: args.inputPreview ? redactSensitiveText(args.inputPreview) : undefined,
      outputPreview: args.outputPreview ? redactSensitiveText(args.outputPreview) : undefined,
      encryptedInputPreview,
      encryptedOutputPreview,
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
      content: redactSensitiveText(args.assistantMessage),
      encryptedContent: await protectOrganizationText(args.organizationId, "agent-message", args.assistantMessage),
      contentRedacted: true,
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
          summary: encryptedPlaceholder(),
          encryptedSummary: await protectOrganizationText(args.organizationId, "agent-memory-summary", args.summary),
          summaryRedacted: true,
          messageCount: existing.messageCount + 2,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("agentMemorySummaries", {
          organizationId: args.organizationId,
          threadId: args.threadId,
          summary: encryptedPlaceholder(),
          encryptedSummary: await protectOrganizationText(args.organizationId, "agent-memory-summary", args.summary),
          summaryRedacted: true,
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
        fact: redactSensitiveText(trimmed),
        encryptedFact: await protectOrganizationText(args.organizationId, "agent-memory-fact", trimmed),
        factRedacted: true,
        sourceMessageId: assistantMessageId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { assistantMessageId };
  },
});

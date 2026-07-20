import { ConvexError, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import {
  internalMutation,
  mutation,
  type MutationCtx,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { consumeOrganizationEntitlement } from "../billing/access";
import { automationNodeValidator } from "./validators";
import { automationActionNeedsApproval } from "./commandAdapter";
import { orderedReachableActions } from "./graph";
import { getAuthUser } from "../auth";

export type AutomationRunSource = "manual" | "webhook" | "event" | "schedule";

export async function queueAutomationRun(
  ctx: MutationCtx,
  automation: Doc<"automations">,
  input: {
    source: AutomationRunSource;
    payload?: Record<string, string>;
    eventType?: string;
    triggeredByUserId?: string;
    idempotencyKey?: string;
  },
) {
  const now = Date.now();
  await consumeOrganizationEntitlement(ctx, {
    organizationId: automation.organizationId,
    key: "automation_run",
    now,
  });
  const payloadJson = JSON.stringify(input.payload ?? {});
  const runId = await ctx.db.insert("automationRuns", {
    organizationId: automation.organizationId,
    ownerUserId: automation.createdByUserId,
    automationId: automation._id,
    source: input.source,
    status: "queued",
    message: "Workflow is queued.",
    eventType: input.eventType,
    payloadJson,
    triggeredByUserId: input.triggeredByUserId,
    idempotencyKey: input.idempotencyKey,
    definitionRevision: automation.contentRevision ?? 0,
    definitionNodes: automation.nodes,
    definitionEdges: automation.edges,
    nextActionIndex: 0,
    startedAt: now,
  });
  const actions = orderedReachableActions(automation.nodes, automation.edges);
  for (let actionIndex = 0; actionIndex < actions.length; actionIndex += 1) {
    const action = actions[actionIndex]!;
    let bindingSnapshotJson: string | undefined;
    if (action.type === "agent") {
      const agentId = ctx.db.normalizeId(
        "customAgents",
        action.config.agentId ?? "",
      );
      const agent = agentId ? await ctx.db.get(agentId) : null;
      if (
        !agent ||
        agent.organizationId !== automation.organizationId ||
        agent.ownerUserId !== automation.createdByUserId ||
        agent.status !== "published" ||
        !agent.publishedInstructions ||
        !agent.publishedModel ||
        agent.publishedRevision === undefined
      ) {
        throw new ConvexError({
          code: "PUBLISHED_AGENT_UNAVAILABLE",
          message: `${action.label}: the published agent is unavailable.`,
        });
      }
      bindingSnapshotJson = JSON.stringify({
        id: agent._id,
        name: agent.name,
        instructions: agent.publishedInstructions,
        model: agent.publishedModel,
        revision: agent.publishedRevision,
      });
    }
    await ctx.db.insert("automationRunSteps", {
      organizationId: automation.organizationId,
      automationId: automation._id,
      runId,
      nodeId: action.id,
      actionIndex,
      actionType: action.type,
      status: "pending",
      attempts: 0,
      idempotencyKey: `${runId}:${action.id}`,
      inputJson: payloadJson,
      bindingSnapshotJson,
    });
  }
  await ctx.db.patch(automation._id, { lastRunAt: now, updatedAt: now });
  await ctx.scheduler.runAfter(0, internal.automations.worker.executeRun, { runId });
  return runId;
}

const claimResultValidator = v.union(
  v.object({ state: v.literal("stopped") }),
  v.object({ state: v.literal("pending_approval") }),
  v.object({ state: v.literal("completed") }),
  v.object({
    state: v.literal("claimed"),
    organizationId: v.string(),
    ownerUserId: v.string(),
    automationId: v.id("automations"),
    stepId: v.id("automationRunSteps"),
    idempotencyKey: v.string(),
    action: automationNodeValidator,
    payloadJson: v.string(),
    bindingSnapshotJson: v.optional(v.string()),
    priorOutputsJson: v.array(
      v.object({
        nodeId: v.string(),
        actionType: v.string(),
        outputJson: v.string(),
      }),
    ),
  }),
);

export const claimNextStep = internalMutation({
  args: { runId: v.id("automationRuns") },
  returns: claimResultValidator,
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run || !["queued", "running"].includes(run.status)) {
      return { state: "stopped" as const };
    }
    const automation = await ctx.db.get(run.automationId);
    if (
      !automation ||
      automation.organizationId !== run.organizationId ||
      automation.createdByUserId !== run.ownerUserId
    ) {
      await ctx.db.patch(run._id, {
        status: "failed",
        message: "The automation definition is unavailable.",
        finishedAt: Date.now(),
      });
      return { state: "stopped" as const };
    }
    const actions = orderedReachableActions(
      run.definitionNodes ?? automation.nodes,
      run.definitionEdges ?? automation.edges,
    );
    const actionIndex = run.nextActionIndex ?? 0;
    if (actionIndex >= actions.length) {
      const now = Date.now();
      await ctx.db.patch(run._id, {
        status: "success",
        message: run.message || "Workflow completed.",
        finishedAt: now,
      });
      await ctx.db.patch(automation._id, {
        runCount: automation.runCount + 1,
        lastRunAt: now,
        updatedAt: now,
      });
      return { state: "completed" as const };
    }

    const action = actions[actionIndex]!;
    const step = await ctx.db
      .query("automationRunSteps")
      .withIndex("by_run_action", (q) =>
        q.eq("runId", run._id).eq("actionIndex", actionIndex),
      )
      .unique();
    if (!step) {
      await ctx.db.patch(run._id, {
        status: "failed",
        message: "The next automation step is unavailable.",
        finishedAt: Date.now(),
      });
      return { state: "stopped" as const };
    }
    if (step.status === "running") return { state: "stopped" as const };
    if (step.status === "success") {
      await ctx.db.patch(run._id, { nextActionIndex: actionIndex + 1 });
      await ctx.scheduler.runAfter(0, internal.automations.worker.executeRun, {
        runId: run._id,
      });
      return { state: "stopped" as const };
    }

    if (automationActionNeedsApproval(action.type)) {
      const approved = await ctx.db
        .query("automationApprovals")
        .withIndex("by_run_node_status", (q) =>
          q
            .eq("organizationId", automation.organizationId)
            .eq("runId", run._id)
            .eq("actionNodeId", action.id)
            .eq("status", "approved"),
        )
        .first();
      if (!approved) {
        const pending = await ctx.db
          .query("automationApprovals")
          .withIndex("by_run_status", (q) =>
            q
              .eq("organizationId", automation.organizationId)
              .eq("runId", run._id)
              .eq("status", "pending"),
          )
          .first();
        if (!pending) {
          await ctx.db.insert("automationApprovals", {
            organizationId: automation.organizationId,
            automationId: automation._id,
            runId: run._id,
            actionNodeId: action.id,
            actionType: action.type,
            actionIndex,
            payloadJson: run.payloadJson ?? "{}",
            status: "pending",
            requestedByUserId: automation.createdByUserId,
            requestedAt: Date.now(),
            expiresAt: Date.now() + 7 * 86_400_000,
          });
        }
        await ctx.db.patch(run._id, {
          status: "pending_approval",
          message: `Approval required before ${action.label}.`,
        });
        return { state: "pending_approval" as const };
      }
    }

    const priorSteps = await ctx.db
      .query("automationRunSteps")
      .withIndex("by_run_action", (q) => q.eq("runId", run._id))
      .collect();
    const now = Date.now();
    await ctx.db.patch(step._id, {
      status: "running",
      attempts: step.attempts + 1,
      startedAt: now,
      error: undefined,
    });
    await ctx.db.patch(run._id, {
      status: "running",
      message: `Running ${action.label}.`,
    });
    return {
      state: "claimed" as const,
      organizationId: automation.organizationId,
      ownerUserId: automation.createdByUserId,
      automationId: automation._id,
      stepId: step._id,
      idempotencyKey: step.idempotencyKey,
      action,
      payloadJson: run.payloadJson ?? "{}",
      bindingSnapshotJson: step.bindingSnapshotJson,
      priorOutputsJson: priorSteps
        .filter((item) => item.status === "success" && item.outputJson)
        .map((item) => ({
          nodeId: item.nodeId,
          actionType: item.actionType,
          outputJson: item.outputJson!,
        })),
    };
  },
});

export const completeStep = internalMutation({
  args: {
    runId: v.id("automationRuns"),
    stepId: v.id("automationRunSteps"),
    status: v.union(v.literal("success"), v.literal("failed")),
    message: v.string(),
    outputJson: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const [run, step] = await Promise.all([
      ctx.db.get(args.runId),
      ctx.db.get(args.stepId),
    ]);
    if (!run || !step || step.runId !== run._id || step.status !== "running") {
      return null;
    }
    const now = Date.now();
    if (run.status === "cancelled") {
      await ctx.db.patch(step._id, {
        status: "cancelled",
        finishedAt: now,
      });
      return null;
    }
    if (args.status === "failed") {
      await ctx.db.patch(step._id, {
        status: "failed",
        error: args.message,
        finishedAt: now,
      });
      await ctx.db.patch(run._id, {
        status: "failed",
        message: args.message,
        finishedAt: now,
      });
      return null;
    }
    await ctx.db.patch(step._id, {
      status: "success",
      outputJson: args.outputJson,
      finishedAt: now,
    });
    await ctx.db.patch(run._id, {
      status: "running",
      message: args.message,
      outputJson: args.outputJson,
      nextActionIndex: step.actionIndex + 1,
    });
    await ctx.scheduler.runAfter(0, internal.automations.worker.executeRun, {
      runId: run._id,
    });
    return null;
  },
});

export const cancel = mutation({
  args: {
    organizationId: v.string(),
    runId: v.id("automationRuns"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    const user = await getAuthUser(ctx);
    if (
      !run ||
      run.organizationId !== args.organizationId ||
      run.ownerUserId !== user._id
    ) {
      throw new ConvexError({ code: "RUN_NOT_FOUND", message: "Automation run not found." });
    }
    if (["success", "failed", "cancelled"].includes(run.status)) return null;
    const now = Date.now();
    await ctx.db.patch(run._id, {
      status: "cancelled",
      message: "Workflow cancelled.",
      finishedAt: now,
    });
    const steps = await ctx.db
      .query("automationRunSteps")
      .withIndex("by_run_action", (q) => q.eq("runId", run._id))
      .collect();
    await Promise.all(
      steps
        .filter((step) => step.status === "pending")
        .map((step) =>
          ctx.db.patch(step._id, { status: "cancelled", finishedAt: now }),
        ),
    );
    return null;
  },
});

export const recoverDueRuns = internalMutation({
  args: {},
  returns: v.object({ requeued: v.number(), failed: v.number() }),
  handler: async (ctx) => {
    const cutoff = Date.now() - 10 * 60_000;
    const queued = await ctx.db
      .query("automationRuns")
      .withIndex("by_status_started", (q) => q.eq("status", "queued"))
      .take(50);
    for (const run of queued) {
      await ctx.scheduler.runAfter(0, internal.automations.worker.executeRun, {
        runId: run._id,
      });
    }
    const interruptedSteps = await ctx.db
      .query("automationRunSteps")
      .withIndex("by_status_started", (q) =>
        q.eq("status", "running").lt("startedAt", cutoff),
      )
      .take(50);
    const interruptedRunIds = [
      ...new Set(interruptedSteps.map((step) => step.runId)),
    ];
    let failed = 0;
    for (const runId of interruptedRunIds) {
      const run = await ctx.db.get(runId);
      if (!run || run.status !== "running") continue;
      await ctx.db.patch(run._id, {
        status: "failed",
        message:
          "The worker stopped while a step was executing. Retry manually to avoid duplicate external messages.",
        finishedAt: Date.now(),
      });
      failed += 1;
    }
    return { requeued: queued.length, failed };
  },
});

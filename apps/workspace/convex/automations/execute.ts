import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { queueAutomationRun } from "./runState";
import { automationEnablementProblems } from "./preflight";

const executionResultValidator = v.object({
  status: v.union(
    v.literal("queued"),
    v.literal("failed"),
    v.literal("pending_approval"),
  ),
  message: v.string(),
  runId: v.optional(v.id("automationRuns")),
});

export const runManual = mutation({
  args: {
    organizationId: v.string(),
    automationId: v.id("automations"),
    payload: v.optional(v.record(v.string(), v.string())),
  },
  returns: executionResultValidator,
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      "organization",
      "read",
    );
    const user = await getAuthUser(ctx);
    const automation = await ctx.db.get(args.automationId);
    if (
      !automation ||
      automation.organizationId !== args.organizationId ||
      automation.createdByUserId !== user._id
    ) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Automation not found.",
      });
    }
    const problems = await automationEnablementProblems(ctx, automation);
    if (problems.length) {
      throw new ConvexError({
        code: "AUTOMATION_NOT_READY",
        message: problems.join(" "),
        problems,
      });
    }
    const runId = await queueAutomationRun(ctx, automation, {
      source: "manual",
      payload: args.payload,
      triggeredByUserId: user._id,
    });
    return {
      status: "queued" as const,
      message: "Workflow queued for background execution.",
      runId,
    };
  },
});

export const decideApproval = mutation({
  args: {
    organizationId: v.string(),
    approvalId: v.id("automationApprovals"),
    decision: v.union(v.literal("approve"), v.literal("reject")),
    note: v.optional(v.string()),
  },
  returns: executionResultValidator,
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      "organization",
      "read",
    );
    const user = await getAuthUser(ctx);
    const approval = await ctx.db.get(args.approvalId);
    if (
      !approval ||
      approval.organizationId !== args.organizationId ||
      approval.requestedByUserId !== user._id ||
      approval.status !== "pending"
    ) {
      throw new ConvexError({
        code: "APPROVAL_NOT_FOUND",
        message: "Pending automation approval not found.",
      });
    }
    if (approval.expiresAt <= Date.now()) {
      await ctx.db.patch(approval._id, {
        status: "expired",
        decidedAt: Date.now(),
      });
      throw new ConvexError({
        code: "APPROVAL_EXPIRED",
        message: "Automation approval expired.",
      });
    }
    const run = await ctx.db.get(approval.runId);
    if (!run || run.ownerUserId !== user._id) {
      throw new ConvexError({
        code: "RUN_NOT_FOUND",
        message: "Automation run is unavailable.",
      });
    }
    const now = Date.now();
    await ctx.db.patch(approval._id, {
      status: args.decision === "approve" ? "approved" : "rejected",
      decidedByUserId: user._id,
      decidedAt: now,
      decisionNote: args.note?.trim(),
    });
    if (args.decision === "reject") {
      const step = await ctx.db
        .query("automationRunSteps")
        .withIndex("by_run_action", (q) =>
          q.eq("runId", run._id).eq("actionIndex", approval.actionIndex),
        )
        .unique();
      if (step) {
        await ctx.db.patch(step._id, {
          status: "failed",
          error: "Automation action was rejected.",
          finishedAt: now,
        });
      }
      await ctx.db.patch(run._id, {
        status: "failed",
        message: "Automation action was rejected.",
        finishedAt: now,
      });
      return {
        status: "failed" as const,
        message: "Automation action was rejected.",
        runId: run._id,
      };
    }
    await ctx.db.patch(run._id, {
      status: "queued",
      message: "Approval received. Workflow queued to resume.",
    });
    await ctx.scheduler.runAfter(0, internal.automations.worker.executeRun, {
      runId: run._id,
    });
    return {
      status: "queued" as const,
      message: "Approval received. Workflow queued to resume.",
      runId: run._id,
    };
  },
});

export const runWebhook = internalMutation({
  args: {
    token: v.string(),
    payload: v.record(v.string(), v.string()),
    idempotencyKey: v.optional(v.string()),
  },
  returns: executionResultValidator,
  handler: async (ctx, args) => {
    const automation = await ctx.db
      .query("automations")
      .withIndex("by_webhook_token", (q) => q.eq("webhookToken", args.token))
      .unique();
    if (!automation || !automation.enabled) {
      return {
        status: "failed" as const,
        message: "Webhook automation is missing or disabled.",
      };
    }
    if (args.idempotencyKey) {
      const existing = await ctx.db
        .query("automationRuns")
        .withIndex("by_automation_idempotency", (q) =>
          q
            .eq("automationId", automation._id)
            .eq("idempotencyKey", args.idempotencyKey),
        )
        .first();
      if (existing) {
        return {
          status: "queued" as const,
          message: "Webhook was already accepted.",
          runId: existing._id,
        };
      }
    }
    const runId = await queueAutomationRun(ctx, automation, {
      source: "webhook",
      payload: args.payload,
      triggeredByUserId: automation.createdByUserId,
      idempotencyKey: args.idempotencyKey,
    });
    return {
      status: "queued" as const,
      message: "Webhook accepted for background execution.",
      runId,
    };
  },
});

export const processPendingEvents = internalMutation({
  args: { limit: v.optional(v.number()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const events = await ctx.db
      .query("automationEvents")
      .withIndex("by_status_next_attempt", (q) =>
        q.eq("status", "pending").lte("nextAttemptAt", now),
      )
      .take(Math.min(args.limit ?? 10, 50));
    for (const event of events) {
      await ctx.db.patch(event._id, {
        status: "processing",
        attempts: event.attempts + 1,
      });
      try {
        const automations = await ctx.db
          .query("automations")
          .withIndex("by_organization_updated", (q) =>
            q.eq("organizationId", event.organizationId),
          )
          .collect();
        for (const automation of automations) {
          const matches = automation.enabled &&
            automation.nodes.some(
              (node) =>
                node.kind === "trigger" &&
                node.type === "domain_event" &&
                node.config.eventType === event.eventType,
            );
          if (!matches) continue;
          const problems = await automationEnablementProblems(ctx, automation);
          if (problems.length) {
            await ctx.db.patch(automation._id, {
              enabled: false,
              updatedAt: Date.now(),
            });
            continue;
          }
          await queueAutomationRun(ctx, automation, {
            source: "event",
            payload: {
              ...event.payload,
              resourceType: event.resourceType,
              resourceId: event.resourceId,
            },
            eventType: event.eventType,
            triggeredByUserId: event.actorUserId,
          });
        }
        await ctx.db.patch(event._id, {
          status: "completed",
          processedAt: Date.now(),
          error: undefined,
        });
      } catch (error) {
        const attempts = event.attempts + 1;
        const exhausted = attempts >= 5;
        await ctx.db.patch(event._id, {
          status: exhausted ? "failed" : "pending",
          error:
            error instanceof Error ? error.message : "Event processing failed.",
          nextAttemptAt:
            Date.now() + Math.min(2 ** attempts * 1_000, 300_000),
        });
      }
    }
    return events.length;
  },
});

export const processSchedules = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = Date.now();
    const automations = await ctx.db
      .query("automations")
      .withIndex("by_enabled_last_run", (q) => q.eq("enabled", true))
      .take(200);
    let queued = 0;
    for (const automation of automations) {
      const trigger = automation.nodes.find((node) => node.kind === "trigger");
      if (trigger?.type !== "schedule") continue;
      const intervalMinutes = Number(trigger.config.intervalMinutes);
      if (!Number.isInteger(intervalMinutes) || intervalMinutes < 1) continue;
      const dueAt =
        (automation.lastRunAt ?? automation.createdAt) +
        intervalMinutes * 60_000;
      if (dueAt > now) continue;
      const problems = await automationEnablementProblems(ctx, automation);
      if (problems.length) {
        await ctx.db.patch(automation._id, {
          enabled: false,
          updatedAt: Date.now(),
        });
        continue;
      }
      await queueAutomationRun(ctx, automation, {
        source: "schedule",
        triggeredByUserId: automation.createdByUserId,
      });
      queued += 1;
    }
    return queued;
  },
});

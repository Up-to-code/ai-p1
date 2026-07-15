import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { internalMutation, mutation, type MutationCtx } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { consumeOrganizationEntitlement } from "../billing/access";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { automationActionNeedsApproval, executeAutomationAction } from "./commandAdapter";
import { orderedReachableActions } from "./graph";

type Source = "manual" | "webhook" | "event";
type Result = { status: "success" | "failed" | "pending_approval"; message: string };

async function execute(ctx: MutationCtx, automation: Doc<"automations">, input: { source: Source; payload?: Record<string, string>; eventType?: string; triggeredByUserId?: string; runId?: Id<"automationRuns">; startIndex?: number; approvedNodeId?: string }): Promise<Result> {
  const startedAt = Date.now(), payload = input.payload ?? {};
  if (!input.runId) await consumeOrganizationEntitlement(ctx, { organizationId: automation.organizationId, key: "automation_run", now: startedAt });
  const runId = input.runId ?? await ctx.db.insert("automationRuns", { organizationId: automation.organizationId, automationId: automation._id, source: input.source, status: "running", message: "Workflow is running.", eventType: input.eventType, payloadJson: JSON.stringify(payload), triggeredByUserId: input.triggeredByUserId, nextActionIndex: 0, startedAt, finishedAt: startedAt });
  const actions = orderedReachableActions(automation.nodes, automation.edges);
  let message = "Workflow completed without actions.";
  try {
    for (let index = input.startIndex ?? 0; index < actions.length; index += 1) {
      const action = actions[index]!;
      if (automationActionNeedsApproval(action.type) && action.id !== input.approvedNodeId) {
        const existing = await ctx.db.query("automationApprovals").withIndex("by_run_status", (q) => q.eq("organizationId", automation.organizationId).eq("runId", runId).eq("status", "pending")).unique();
        if (!existing) await ctx.db.insert("automationApprovals", { organizationId: automation.organizationId, automationId: automation._id, runId, actionNodeId: action.id, actionType: action.type, actionIndex: index, payloadJson: JSON.stringify(payload), status: "pending", requestedByUserId: automation.createdByUserId, requestedAt: Date.now(), expiresAt: Date.now() + 7 * 86_400_000 });
        message = `Approval required before ${action.label}.`;
        await ctx.db.patch(runId, { status: "pending_approval", message, nextActionIndex: index, finishedAt: Date.now() });
        return { status: "pending_approval", message };
      }
      message = await executeAutomationAction(ctx, automation, action, payload);
      input.approvedNodeId = undefined;
      await ctx.db.patch(runId, { nextActionIndex: index + 1, message });
    }
    const finishedAt = Date.now();
    await ctx.db.patch(runId, { status: "success", message, nextActionIndex: actions.length, finishedAt });
    if (!input.runId) await ctx.db.patch(automation._id, { lastRunAt: finishedAt, runCount: automation.runCount + 1, updatedAt: finishedAt });
    return { status: "success", message };
  } catch (error) {
    message = error instanceof Error ? error.message : "Workflow failed.";
    const finishedAt = Date.now();
    await ctx.db.patch(runId, { status: "failed", message, finishedAt });
    if (!input.runId) await ctx.db.patch(automation._id, { lastRunAt: finishedAt, runCount: automation.runCount + 1, updatedAt: finishedAt });
    return { status: "failed", message };
  }
}

const executionResultValidator = v.object({ status: v.union(v.literal("success"), v.literal("failed"), v.literal("pending_approval")), message: v.string() });

export const runManual = mutation({
  args: { organizationId: v.string(), automationId: v.id("automations"), payload: v.optional(v.record(v.string(), v.string())) }, returns: executionResultValidator,
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "update");
    const actor = await requireServerActor(ctx), automation = await ctx.db.get(args.automationId);
    if (!automation || automation.organizationId !== args.organizationId) throw new ConvexError({ code: "NOT_FOUND", message: "Automation not found." });
    return execute(ctx, automation, { source: "manual", payload: args.payload, triggeredByUserId: actor.userId });
  },
});

export const decideApproval = mutation({
  args: { organizationId: v.string(), approvalId: v.id("automationApprovals"), decision: v.union(v.literal("approve"), v.literal("reject")), note: v.optional(v.string()) }, returns: executionResultValidator,
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "update");
    const actor = await requireServerActor(ctx), approval = await ctx.db.get(args.approvalId);
    if (!approval || approval.organizationId !== args.organizationId || approval.status !== "pending") throw new Error("Pending automation approval not found.");
    if (approval.expiresAt <= Date.now()) { await ctx.db.patch(approval._id, { status: "expired", decidedAt: Date.now() }); throw new Error("Automation approval expired."); }
    const automation = await ctx.db.get(approval.automationId), run = await ctx.db.get(approval.runId);
    if (!automation || !run) throw new Error("Automation run is unavailable.");
    await ctx.db.patch(approval._id, { status: args.decision === "approve" ? "approved" : "rejected", decidedByUserId: actor.userId, decidedAt: Date.now(), decisionNote: args.note?.trim() });
    if (args.decision === "reject") { const message = "Automation action was rejected."; await ctx.db.patch(run._id, { status: "failed", message, finishedAt: Date.now() }); return { status: "failed" as const, message }; }
    return execute(ctx, automation, { source: run.source, payload: JSON.parse(run.payloadJson ?? "{}") as Record<string, string>, eventType: run.eventType, triggeredByUserId: run.triggeredByUserId, runId: run._id, startIndex: approval.actionIndex, approvedNodeId: approval.actionNodeId });
  },
});

export const runWebhook = internalMutation({
  args: { token: v.string(), payload: v.record(v.string(), v.string()) }, returns: executionResultValidator,
  handler: async (ctx, args) => {
    const automation = await ctx.db.query("automations").withIndex("by_webhook_token", (q) => q.eq("webhookToken", args.token)).unique();
    if (!automation || !automation.enabled) return { status: "failed" as const, message: "Webhook automation is missing or disabled." };
    return execute(ctx, automation, { source: "webhook", payload: args.payload, triggeredByUserId: automation.createdByUserId });
  },
});

export const processPendingEvents = internalMutation({
  args: { limit: v.optional(v.number()) }, returns: v.number(),
  handler: async (ctx, args) => {
    const now = Date.now(), events = await ctx.db.query("automationEvents").withIndex("by_status_next_attempt", (q) => q.eq("status", "pending").lte("nextAttemptAt", now)).take(Math.min(args.limit ?? 10, 50));
    for (const event of events) {
      await ctx.db.patch(event._id, { status: "processing", attempts: event.attempts + 1 });
      try {
        const automations = await ctx.db.query("automations").withIndex("by_organization_updated", (q) => q.eq("organizationId", event.organizationId)).collect();
        for (const automation of automations.filter((item) => item.enabled && item.nodes.some((node) => node.kind === "trigger" && node.type === "domain_event" && node.config.eventType === event.eventType))) await execute(ctx, automation, { source: "event", payload: { ...event.payload, resourceType: event.resourceType, resourceId: event.resourceId }, eventType: event.eventType, triggeredByUserId: event.actorUserId });
        await ctx.db.patch(event._id, { status: "completed", processedAt: Date.now(), error: undefined });
      } catch (error) {
        const attempts = event.attempts + 1, exhausted = attempts >= 5;
        await ctx.db.patch(event._id, { status: exhausted ? "failed" : "pending", error: error instanceof Error ? error.message : "Event processing failed.", nextAttemptAt: Date.now() + Math.min(2 ** attempts * 1_000, 300_000) });
      }
    }
    return events.length;
  },
});

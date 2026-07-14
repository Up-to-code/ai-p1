import { ConvexError, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { internalMutation, mutation, type MutationCtx } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { consumeOrganizationEntitlement } from "../billing/access";
import { orderedReachableActions } from "./graph";

async function execute(
  ctx: MutationCtx,
  automation: Doc<"automations">,
  source: "manual" | "webhook",
  payload: Record<string, string> = {},
) {
  const startedAt = Date.now();
  await consumeOrganizationEntitlement(ctx, {
    organizationId: automation.organizationId,
    key: "automation_run",
    now: startedAt,
  });
  let message = "Workflow completed without actions.";
  let status: "success" | "failed" = "success";

  try {
    const actions = orderedReachableActions(automation.nodes, automation.edges);
    for (const action of actions) {
      if (action.type === "update_task") {
        const taskId = action.config.taskId || payload.taskId;
        if (!taskId) throw new Error("Update task needs a taskId in the step or webhook payload.");
        const normalizedTaskId = ctx.db.normalizeId("tasks", taskId);
        if (!normalizedTaskId) throw new Error("The supplied taskId is invalid.");
        const task = await ctx.db.get(normalizedTaskId);
        if (!task || task.organizationId !== automation.organizationId) {
          throw new Error("The task is not available in this organization.");
        }
        const nextStatus = action.config.status?.trim();
        if (!nextStatus) throw new Error("Update task needs a status.");
        await ctx.db.patch(normalizedTaskId, {
          status: nextStatus,
          completedAt: nextStatus === "completed" ? Date.now() : undefined,
          updatedAt: Date.now(),
        });
        message = `Task status updated to ${nextStatus}.`;
      }

      if (action.type === "create_task") {
        const now = Date.now();
        const title = action.config.title || payload.title;
        if (!title) throw new Error("Create task needs a title.");
        const priority = ["low", "normal", "high", "urgent"].includes(action.config.priority)
          ? action.config.priority as "low" | "normal" | "high" | "urgent"
          : "normal";
        const taskId = await ctx.db.insert("tasks", {
          organizationId: automation.organizationId,
          title,
          status: action.config.status || "todo",
          priority,
          projectId: action.config.projectId || payload.projectId || undefined,
          recordState: "active",
          createdByUserId: automation.createdByUserId,
          createdAt: now,
          updatedAt: now,
        });
        message = `Task created: ${taskId}.`;
      }

      if (action.type === "create_document") {
        const now = Date.now();
        const title = action.config.title || payload.title;
        if (!title) throw new Error("Create document needs a title.");
        const docId = await ctx.db.insert("docs", {
          organizationId: automation.organizationId,
          title,
          content: action.config.content || payload.content || undefined,
          visibility: "workspace",
          createdByUserId: automation.createdByUserId,
          createdAt: now,
          updatedAt: now,
        });
        message = `Document created: ${docId}.`;
      }

      if (action.type === "update_client") {
        const clientId = action.config.clientId || payload.clientId;
        if (!clientId) throw new Error("Update client needs a clientId in the step or webhook payload.");
        const normalizedClientId = ctx.db.normalizeId("clients", clientId);
        if (!normalizedClientId) throw new Error("The supplied clientId is invalid.");
        const client = await ctx.db.get(normalizedClientId);
        if (!client || client.organizationId !== automation.organizationId) {
          throw new Error("The client is not available in this organization.");
        }
        const nextStatus = action.config.status?.trim();
        if (!nextStatus || !["new", "active", "nurture", "inactive", "archived"].includes(nextStatus)) {
          throw new Error("Update client needs a valid status.");
        }
        await ctx.db.patch(normalizedClientId, { status: nextStatus as typeof client.status, updatedAt: Date.now() });
        message = `Client status updated to ${nextStatus}.`;
      }
    }
  } catch (error) {
    status = "failed";
    message = error instanceof Error ? error.message : "Workflow failed.";
  }

  const finishedAt = Date.now();
  await ctx.db.insert("automationRuns", {
    organizationId: automation.organizationId,
    automationId: automation._id,
    source,
    status,
    message,
    startedAt,
    finishedAt,
  });
  await ctx.db.patch(automation._id, {
    lastRunAt: finishedAt,
    runCount: automation.runCount + 1,
    updatedAt: finishedAt,
  });
  return { status, message };
}

const executionResultValidator = v.object({
  status: v.union(v.literal("success"), v.literal("failed")),
  message: v.string(),
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
      "update",
    );
    const automation = await ctx.db.get(args.automationId);
    if (!automation || automation.organizationId !== args.organizationId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Automation not found." });
    }
    return await execute(ctx, automation, "manual", args.payload);
  },
});

export const runWebhook = internalMutation({
  args: { token: v.string(), payload: v.record(v.string(), v.string()) },
  returns: executionResultValidator,
  handler: async (ctx, args) => {
    const automation = await ctx.db
      .query("automations")
      .withIndex("by_webhook_token", (q) => q.eq("webhookToken", args.token))
      .unique();
    if (!automation || !automation.enabled) {
      return { status: "failed" as const, message: "Webhook automation is missing or disabled." };
    }
    return await execute(ctx, automation, "webhook", args.payload);
  },
});

import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { canPerformOrganizationAction, canPerformProjectAction } from "../permissions";
import { taskSearchProjection } from "../search/adapters/task";

async function assertAction(ctx: MutationCtx, automation: Doc<"automations">, resource: "task" | "document" | "client", action: "create" | "update") {
  if (!await canPerformOrganizationAction(ctx, automation.organizationId, automation.createdByUserId, resource, action)) throw new Error(`Automation principal can no longer ${action} ${resource} records.`);
}

async function assertProject(ctx: MutationCtx, automation: Doc<"automations">, projectId: string | undefined, action: "create" | "update") {
  if (!projectId) return;
  const normalized = ctx.db.normalizeId("projects", projectId);
  if (!normalized || !await canPerformProjectAction(ctx, automation.organizationId, normalized, automation.createdByUserId, action)) throw new Error("Automation principal cannot access the selected Project.");
}

export async function executeAutomationAction(ctx: MutationCtx, automation: Doc<"automations">, action: Doc<"automations">["nodes"][number], payload: Record<string, string>) {
  if (action.type === "update_task") {
    await assertAction(ctx, automation, "task", "update");
    const id = ctx.db.normalizeId("tasks", action.config.taskId || payload.taskId || "");
    if (!id) throw new Error("Update task needs a valid taskId.");
    const task = await ctx.db.get(id);
    if (!task || task.organizationId !== automation.organizationId || task.deletedAt || task.recordState === "deleted") throw new Error("The task is unavailable.");
    await assertProject(ctx, automation, task.projectId, "update");
    const status = action.config.status?.trim();
    if (!status) throw new Error("Update task needs a status.");
    await ctx.db.patch(id, { status, completedAt: status === "completed" ? Date.now() : undefined, updatedAt: Date.now() });
    const updated = await ctx.db.get(id); if (updated) await taskSearchProjection(ctx, updated);
    return `Task status updated to ${status}.`;
  }
  if (action.type === "create_task") {
    await assertAction(ctx, automation, "task", "create");
    const projectId = action.config.projectId || payload.projectId || undefined;
    await assertProject(ctx, automation, projectId, "create");
    const title = (action.config.title || payload.title || "").trim(); if (!title) throw new Error("Create task needs a title.");
    const priority = ["low", "normal", "high", "urgent"].includes(action.config.priority) ? action.config.priority as "low" | "normal" | "high" | "urgent" : "normal";
    const now = Date.now();
    const id = await ctx.db.insert("tasks", { organizationId: automation.organizationId, title, status: action.config.status || "todo", priority, projectId, recordState: "active", createdByUserId: automation.createdByUserId, createdAt: now, updatedAt: now });
    const created = await ctx.db.get(id); if (created) await taskSearchProjection(ctx, created);
    return `Task created: ${id}.`;
  }
  if (action.type === "create_document") {
    await assertAction(ctx, automation, "document", "create");
    const projectId = action.config.projectId || payload.projectId || undefined;
    await assertProject(ctx, automation, projectId, "create");
    const title = (action.config.title || payload.title || "").trim(); if (!title) throw new Error("Create document needs a title.");
    const now = Date.now();
    const id = await ctx.db.insert("docs", { organizationId: automation.organizationId, title, projectId, content: action.config.content || payload.content || undefined, visibility: "workspace", createdByUserId: automation.createdByUserId, createdAt: now, updatedAt: now });
    return `Document created: ${id}.`;
  }
  if (action.type === "update_client") {
    await assertAction(ctx, automation, "client", "update");
    const id = ctx.db.normalizeId("clients", action.config.clientId || payload.clientId || "");
    if (!id) throw new Error("Update client needs a valid clientId.");
    const client = await ctx.db.get(id);
    if (!client || client.organizationId !== automation.organizationId || client.deletedAt || client.recordState === "deleted") throw new Error("The client is unavailable.");
    const status = action.config.status?.trim();
    if (!status || !["new", "active", "nurture", "inactive", "archived"].includes(status)) throw new Error("Update client needs a valid status.");
    await ctx.db.patch(id, { status: status as typeof client.status, updatedAt: Date.now() });
    return `Client status updated to ${status}.`;
  }
  throw new Error(`Unsupported automation action: ${action.type}.`);
}

export function automationActionNeedsApproval(actionType: string) {
  return new Set(["update_client", "accept_proposal", "activate_engagement", "approve_deliverable", "approve_change_order", "post_invoice", "record_payment", "close_accounting_period"]).has(actionType);
}

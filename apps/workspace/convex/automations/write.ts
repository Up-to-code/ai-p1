import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { assertOrganizationEntitlement } from "../billing/access";
import { automationEdgeValidator, automationNodeValidator, automationViewportValidator } from "./validators";
import { graphProblem } from "./graph";
import { automationLayoutUnchanged, mergeAutomationPositions } from "./layout";
import { getAuthUser } from "../auth";
import { automationEnablementProblems } from "./preflight";

async function assertOwnedAutomation(
  ctx: MutationCtx,
  organizationId: string,
  automationId: Id<"automations">,
): Promise<Doc<"automations">> {
  await assertOrganizationResourcePermission(
    ctx,
    organizationId,
    "organization",
    "update",
  );
  const automation = await ctx.db.get(automationId);
  const user = await getAuthUser(ctx);
  if (
    !automation ||
    automation.organizationId !== organizationId ||
    automation.createdByUserId !== user._id
  ) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Automation not found." });
  }
  return automation;
}

export const create = mutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    nodes: v.optional(v.array(automationNodeValidator)),
    edges: v.optional(v.array(automationEdgeValidator)),
  },
  returns: v.id("automations"),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      "organization",
      "update",
    );
    await assertOrganizationEntitlement(ctx, {
      organizationId: args.organizationId,
      key: "automation_run",
      used: 0,
    });
    const user = await getAuthUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("automations", {
      organizationId: args.organizationId,
      name: args.name.trim() || "Untitled automation",
      description: args.description,
      enabled: false,
      webhookToken: crypto.randomUUID().replaceAll("-", ""),
      nodes: args.nodes ?? [
        { id: "trigger-1", kind: "trigger", type: "manual", label: "Run manually", x: 80, y: 180, config: {} },
        { id: "action-1", kind: "action", type: "update_task", label: "Update task status", x: 440, y: 180, config: { status: "in_progress" } },
      ],
      edges: args.edges ?? [{ id: "trigger-1-action-1", source: "trigger-1", target: "action-1" }],
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      runCount: 0,
      contentRevision: 0,
    });
  },
});

export const save = mutation({
  args: {
    organizationId: v.string(),
    automationId: v.id("automations"),
    name: v.string(),
    description: v.optional(v.string()),
    nodes: v.array(automationNodeValidator),
    edges: v.array(automationEdgeValidator),
    viewport: v.optional(automationViewportValidator),
    expectedRevision: v.number(),
  },
  returns: v.object({ revision: v.number(), savedAt: v.number() }),
  handler: async (ctx, args) => {
    const automation = await assertOwnedAutomation(ctx, args.organizationId, args.automationId);
    const currentRevision = automation.contentRevision ?? 0;
    if (currentRevision !== args.expectedRevision) {
      throw new ConvexError({ code: "AUTOMATION_CONFLICT", message: "This automation changed in another session. Reload it before saving." });
    }
    const nodeIds = new Set(args.nodes.map((node) => node.id));
    if (args.nodes.filter((node) => node.kind === "trigger").length !== 1) {
      throw new ConvexError({ code: "INVALID_WORKFLOW", message: "A workflow needs exactly one trigger." });
    }
    if (args.edges.some((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))) {
      throw new ConvexError({ code: "INVALID_WORKFLOW", message: "Every line must connect existing steps." });
    }
    const problem = graphProblem(args.nodes, args.edges);
    if (problem) throw new ConvexError({ code: "INVALID_WORKFLOW", message: problem });
    if (automation.enabled) {
      const problems = await automationEnablementProblems(ctx, {
        ...automation,
        name: args.name.trim() || "Untitled automation",
        description: args.description?.trim() || undefined,
        nodes: args.nodes,
        edges: args.edges,
        viewport: args.viewport,
      });
      if (problems.length > 0) {
        throw new ConvexError({
          code: "AUTOMATION_NOT_READY",
          message: problems.join(" "),
          problems,
        });
      }
    }
    const savedAt = Date.now();
    const revision = currentRevision + 1;
    await ctx.db.patch(args.automationId, {
      name: args.name.trim() || "Untitled automation",
      description: args.description?.trim() || undefined,
      nodes: args.nodes,
      edges: args.edges,
      viewport: args.viewport,
      contentRevision: revision,
      updatedAt: savedAt,
    });
    return { revision, savedAt };
  },
});

export const saveLayout = mutation({
  args: {
    organizationId: v.string(),
    automationId: v.id("automations"),
    positions: v.array(v.object({ id: v.string(), x: v.number(), y: v.number() })),
    viewport: automationViewportValidator,
  },
  returns: v.object({ changed: v.boolean(), savedAt: v.number() }),
  handler: async (ctx, args) => {
    const automation = await assertOwnedAutomation(ctx, args.organizationId, args.automationId);
    const nodes = mergeAutomationPositions(automation.nodes, args.positions);
    if (!nodes) {
      throw new ConvexError({ code: "INVALID_LAYOUT", message: "The canvas layout does not match this automation." });
    }
    const unchanged = automationLayoutUnchanged(automation.nodes, nodes, automation.viewport, args.viewport);
    const savedAt = Date.now();
    if (unchanged) return { changed: false, savedAt: automation.layoutUpdatedAt ?? automation.updatedAt };
    await ctx.db.patch(args.automationId, { nodes, viewport: args.viewport, layoutUpdatedAt: savedAt });
    return { changed: true, savedAt };
  },
});

export const setEnabled = mutation({
  args: { organizationId: v.string(), automationId: v.id("automations"), enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const automation = await assertOwnedAutomation(ctx, args.organizationId, args.automationId);
    if (args.enabled) {
      const problems = await automationEnablementProblems(ctx, automation);
      if (problems.length > 0) {
        throw new ConvexError({
          code: "AUTOMATION_NOT_READY",
          message: problems.join(" "),
          problems,
        });
      }
    }
    await ctx.db.patch(args.automationId, { enabled: args.enabled, updatedAt: Date.now() });
    return null;
  },
});

export const remove = mutation({
  args: { organizationId: v.string(), automationId: v.id("automations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOwnedAutomation(ctx, args.organizationId, args.automationId);
    const now = Date.now();
    const runs = await ctx.db
      .query("automationRuns")
      .withIndex("by_automation_started", (q) =>
        q.eq("automationId", args.automationId),
      )
      .collect();
    for (const run of runs.filter(
      (candidate) =>
        !["success", "failed", "cancelled"].includes(candidate.status),
    )) {
      await ctx.db.patch(run._id, {
        status: "cancelled",
        message: "Automation archived by its owner.",
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
            ctx.db.patch(step._id, {
              status: "cancelled",
              finishedAt: now,
            }),
          ),
      );
    }
    await ctx.db.patch(args.automationId, {
      enabled: false,
      archivedAt: now,
      updatedAt: now,
    });
    return null;
  },
});

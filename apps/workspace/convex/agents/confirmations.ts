import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internalMutation, mutation } from "../_generated/server";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { assertPlatformAdmin } from "../platform/access";
import {
  encryptedPlaceholder,
  protectOrganizationJson,
  redactSensitiveText,
  revealOrganizationJson,
} from "../security/organizationData";

const confirmationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("canceled"),
  v.literal("expired"),
  v.literal("executed"),
  v.literal("failed"),
);

const approvalRequirementValidator = v.union(v.literal("none"), v.literal("user"), v.literal("admin"));
const riskLevelValidator = v.union(
  v.literal("read"),
  v.literal("low_write"),
  v.literal("sensitive_write"),
  v.literal("destructive"),
  v.literal("admin"),
);

const confirmationValidator = v.object({
  _id: v.id("agentConfirmations"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  threadId: v.optional(v.id("agentThreads")),
  runId: v.optional(v.id("agentRuns")),
  createdByUserId: v.string(),
  actorType: v.optional(v.union(v.literal("user"), v.literal("mcpConnection"))),
  actorMcpConnectionId: v.optional(v.string()),
  adapter: v.optional(v.union(v.literal("agent"), v.literal("mcp"))),
  tool: v.string(),
  resource: v.string(),
  action: v.string(),
  riskLevel: v.optional(riskLevelValidator),
  approvalRequirement: v.optional(approvalRequirementValidator),
  summary: v.string(),
  inputPreview: v.optional(v.string()),
  status: confirmationStatusValidator,
  expiresAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  approvedAt: v.optional(v.number()),
  approvedByUserId: v.optional(v.string()),
  canceledAt: v.optional(v.number()),
  executedAt: v.optional(v.number()),
  failedAt: v.optional(v.number()),
  error: v.optional(v.string()),
});

function presentConfirmation(doc: Doc<"agentConfirmations">) {
  const {
    encryptedInput: _encryptedInput,
    input: _input,
    inputRedacted: _inputRedacted,
    requestContext: _requestContext,
    ...safeDoc
  } = doc;
  void _encryptedInput;
  void _input;
  void _inputRedacted;
  void _requestContext;
  return { ...safeDoc, id: doc._id };
}

async function requireCurrentUser(ctx: MutationCtx) {
  const user = await authComponent.getAuthUser(ctx);
  const userId = user._id;
  if (!userId) throw new Error("Authenticated user was not found.");
  return String(userId);
}

async function getOwnedPendingConfirmation(
  ctx: MutationCtx,
  organizationId: string,
  confirmationId: Id<"agentConfirmations">,
) {
  const userId = await requireCurrentUser(ctx);
  const confirmation = await ctx.db.get(confirmationId);
  if (!confirmation || confirmation.organizationId !== organizationId) {
    throw new Error("Agent confirmation was not found.");
  }
  if (confirmation.createdByUserId !== userId) {
    if (confirmation.approvalRequirement === "admin") {
      await assertPlatformAdmin(ctx);
    } else {
      throw new Error("Agent confirmation was not found.");
    }
  } else {
    await assertOrganizationResourcePermission(ctx, organizationId, "organization", "read");
  }
  if (confirmation.status !== "pending") {
    throw new Error("Agent confirmation is no longer pending.");
  }
  const now = Date.now();
  if (confirmation.expiresAt <= now) {
    await ctx.db.patch(confirmation._id, { status: "expired", updatedAt: now });
    throw new Error("Agent confirmation has expired.");
  }
  return confirmation;
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    riskLevel: v.optional(riskLevelValidator),
    approvalRequirement: v.optional(approvalRequirementValidator),
    summary: v.string(),
    inputPreview: v.optional(v.string()),
    input: v.any(),
    requestContext: v.optional(v.any()),
    expiresAt: v.number(),
  },
  returns: confirmationValidator,
  handler: async (ctx, args) => {
    const userId = await requireCurrentUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, args.resource as never, args.action);
    const run = await ctx.db.get(args.runId);
    if (!run || run.organizationId !== args.organizationId || run.threadId !== args.threadId) {
      throw new Error("Agent run was not found.");
    }

    const now = Date.now();
    const confirmationId = await ctx.db.insert("agentConfirmations", {
      organizationId: args.organizationId,
      threadId: args.threadId,
      runId: args.runId,
      createdByUserId: userId,
      tool: args.tool,
      resource: args.resource,
      action: args.action,
      actorType: "user",
      adapter: "agent",
      riskLevel: args.riskLevel,
      approvalRequirement: args.approvalRequirement ?? "user",
      summary: redactSensitiveText(args.summary, 500),
      inputPreview: args.inputPreview ? redactSensitiveText(args.inputPreview, 500) : undefined,
      input: encryptedPlaceholder(),
      encryptedInput: await protectOrganizationJson(args.organizationId, "agent-confirmation-input", args.input),
      inputRedacted: true,
      requestContext: args.requestContext,
      status: "pending",
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    const confirmation = await ctx.db.get(confirmationId);
    if (!confirmation) throw new Error("Agent confirmation could not be created.");
    return presentConfirmation(confirmation);
  },
});

export const createFromMcpLink = internalMutation({
  args: {
    organizationId: v.string(),
    connectionId: v.id("organizationMcpConnections"),
    createdByUserId: v.string(),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    riskLevel: riskLevelValidator,
    approvalRequirement: approvalRequirementValidator,
    summary: v.string(),
    inputPreview: v.optional(v.string()),
    input: v.any(),
    expiresAt: v.number(),
  },
  returns: confirmationValidator,
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.organizationId !== args.organizationId || connection.status !== "active") {
      throw new Error("Agent link was not found.");
    }

    const now = Date.now();
    const confirmationId = await ctx.db.insert("agentConfirmations", {
      organizationId: args.organizationId,
      createdByUserId: args.createdByUserId,
      actorType: "mcpConnection",
      actorMcpConnectionId: args.connectionId,
      adapter: "mcp",
      tool: args.tool,
      resource: args.resource,
      action: args.action,
      riskLevel: args.riskLevel,
      approvalRequirement: args.approvalRequirement,
      summary: redactSensitiveText(args.summary, 500),
      inputPreview: args.inputPreview ? redactSensitiveText(args.inputPreview, 500) : undefined,
      input: encryptedPlaceholder(),
      encryptedInput: await protectOrganizationJson(args.organizationId, "agent-confirmation-input", args.input),
      inputRedacted: true,
      status: "pending",
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: args.createdByUserId,
      actorType: "mcpConnection",
      actorMcpConnectionId: args.connectionId,
      action: "agentApproval.request",
      target: confirmationId,
      summary: redactSensitiveText(`${args.approvalRequirement} approval requested for ${args.tool}.`, 500),
      createdAt: now,
    });

    const confirmation = await ctx.db.get(confirmationId);
    if (!confirmation) throw new Error("Agent approval could not be created.");
    return presentConfirmation(confirmation);
  },
});

export const approveFromHono = mutation({
  args: {
    organizationId: v.string(),
    confirmationId: v.id("agentConfirmations"),
  },
  returns: v.object({
    confirmation: confirmationValidator,
    input: v.any(),
  }),
  handler: async (ctx, args) => {
    const userId = await requireCurrentUser(ctx);
    const confirmation = await getOwnedPendingConfirmation(ctx, args.organizationId, args.confirmationId);
    if (confirmation.approvalRequirement === "admin") {
      await assertPlatformAdmin(ctx);
    } else {
      await assertOrganizationResourcePermission(ctx, args.organizationId, confirmation.resource as never, confirmation.action);
    }
    const input = await revealOrganizationJson(args.organizationId, "agent-confirmation-input", confirmation.encryptedInput, {});
    const now = Date.now();
    await ctx.db.patch(confirmation._id, {
      status: "approved",
      approvedAt: now,
      approvedByUserId: userId,
      updatedAt: now,
    });
    const approved = await ctx.db.get(confirmation._id);
    if (!approved) throw new Error("Agent confirmation was not found.");
    return { confirmation: presentConfirmation(approved), input };
  },
});

export const cancelFromHono = mutation({
  args: {
    organizationId: v.string(),
    confirmationId: v.id("agentConfirmations"),
  },
  returns: confirmationValidator,
  handler: async (ctx, args) => {
    const confirmation = await getOwnedPendingConfirmation(ctx, args.organizationId, args.confirmationId);
    const now = Date.now();
    await ctx.db.patch(confirmation._id, {
      status: "canceled",
      canceledAt: now,
      updatedAt: now,
    });
    const canceled = await ctx.db.get(confirmation._id);
    if (!canceled) throw new Error("Agent confirmation was not found.");
    return presentConfirmation(canceled);
  },
});

export const markExecutedFromHono = mutation({
  args: {
    organizationId: v.string(),
    confirmationId: v.id("agentConfirmations"),
  },
  returns: confirmationValidator,
  handler: async (ctx, args) => {
    const userId = await requireCurrentUser(ctx);
    const confirmation = await ctx.db.get(args.confirmationId);
    if (!confirmation || confirmation.organizationId !== args.organizationId || (confirmation.createdByUserId !== userId && confirmation.approvedByUserId !== userId)) {
      throw new Error("Agent confirmation was not found.");
    }
    if (confirmation.status !== "approved") {
      throw new Error("Agent confirmation is not approved.");
    }
    const now = Date.now();
    await ctx.db.patch(confirmation._id, {
      status: "executed",
      executedAt: now,
      updatedAt: now,
    });
    const executed = await ctx.db.get(confirmation._id);
    if (!executed) throw new Error("Agent confirmation was not found.");
    return presentConfirmation(executed);
  },
});

export const markFailedFromHono = mutation({
  args: {
    organizationId: v.string(),
    confirmationId: v.id("agentConfirmations"),
    error: v.string(),
  },
  returns: confirmationValidator,
  handler: async (ctx, args) => {
    const userId = await requireCurrentUser(ctx);
    const confirmation = await ctx.db.get(args.confirmationId);
    if (!confirmation || confirmation.organizationId !== args.organizationId || (confirmation.createdByUserId !== userId && confirmation.approvedByUserId !== userId)) {
      throw new Error("Agent confirmation was not found.");
    }
    if (confirmation.status !== "approved") {
      throw new Error("Agent confirmation is not approved.");
    }
    const now = Date.now();
    await ctx.db.patch(confirmation._id, {
      status: "failed",
      failedAt: now,
      error: redactSensitiveText(args.error, 500),
      updatedAt: now,
    });
    const failed = await ctx.db.get(confirmation._id);
    if (!failed) throw new Error("Agent confirmation was not found.");
    return presentConfirmation(failed);
  },
});

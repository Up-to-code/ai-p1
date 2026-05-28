import { v } from "convex/values";

export const agentRoleValidator = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system"),
  v.literal("tool"),
);

export const agentRunStatusValidator = v.union(
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("blocked"),
);

export const agentStepPhaseValidator = v.union(
  v.literal("understand"),
  v.literal("retrieve"),
  v.literal("plan"),
  v.literal("policy"),
  v.literal("execute"),
  v.literal("summarize"),
  v.literal("memory"),
);

export const agentStepStatusValidator = v.union(
  v.literal("started"),
  v.literal("completed"),
  v.literal("blocked"),
  v.literal("failed"),
);

export const agentToolStatusValidator = v.union(
  v.literal("allowed"),
  v.literal("blocked"),
  v.literal("requires_confirmation"),
  v.literal("requires_admin_approval"),
  v.literal("failed"),
);

export const agentThreadValidator = v.object({
  _id: v.id("agentThreads"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastMessageAt: v.number(),
});

export const agentMessageValidator = v.object({
  _id: v.id("agentMessages"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  threadId: v.id("agentThreads"),
  role: agentRoleValidator,
  content: v.string(),
  runId: v.optional(v.id("agentRuns")),
  createdAt: v.number(),
});

export const agentRunValidator = v.object({
  _id: v.id("agentRuns"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  threadId: v.id("agentThreads"),
  status: agentRunStatusValidator,
  model: v.string(),
  createdByUserId: v.string(),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  error: v.optional(v.string()),
});

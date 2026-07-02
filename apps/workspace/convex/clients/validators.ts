import { v } from "convex/values";

export const clientTypeValidator = v.union(
  v.literal("person"),
  v.literal("organization"),
);

export const clientStatusValidator = v.union(
  v.literal("new"),
  v.literal("active"),
  v.literal("nurture"),
  v.literal("inactive"),
  v.literal("archived"),
);

export const clientPriorityValidator = v.union(
  v.literal("low"),
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent"),
);

export const visibilityValidator = v.union(v.literal("private"), v.literal("team"), v.literal("workspace"));

export const clientPipelineStageValidator = v.string();

export type ClientPipelineStage = string;

export function resolveClientPipelineStage(client: {
  status: "new" | "active" | "nurture" | "inactive" | "archived";
  pipelineStage?: string;
}): string {
  if (client.status === "archived") return "closed";
  return client.pipelineStage ?? "new";
}

export const clientInputValidator = v.object({
  name: v.string(),
  type: clientTypeValidator,
  ownerUserId: v.optional(v.string()),
  status: clientStatusValidator,
  pipelineStage: v.optional(clientPipelineStageValidator),
  pipelineOrder: v.optional(v.number()),
  source: v.optional(v.string()),
  contact: v.optional(v.string()),
  priority: v.optional(clientPriorityValidator),
  budget: v.optional(v.string()),
  assetInterest: v.optional(v.string()),
  added: v.optional(v.string()),
  lastContact: v.optional(v.string()),
  visibility: v.optional(visibilityValidator),
  company: v.optional(v.string()),
  contactName: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export const clientValidator = v.object({
  _id: v.id("clients"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  type: clientTypeValidator,
  ownerUserId: v.string(),
  status: clientStatusValidator,
  source: v.string(),
  visibility: visibilityValidator,
  contact: v.optional(v.string()),
  company: v.optional(v.string()),
  contactName: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  notes: v.optional(v.string()),
  priority: v.optional(clientPriorityValidator),
  budget: v.optional(v.string()),
  assetInterest: v.optional(v.string()),
  pipelineStage: clientPipelineStageValidator,
  pipelineOrder: v.optional(v.number()),
  tags: v.optional(v.array(v.string())),
  customFields: v.optional(v.array(v.any())),
  added: v.optional(v.string()),
  lastContact: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

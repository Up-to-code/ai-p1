import { v } from "convex/values";
import { customAgentStatusValidator } from "../schema/customAgents";

export const customAgentDocumentValidator = v.object({
  _id: v.id("customAgents"),
  _creationTime: v.number(),
  organizationId: v.string(),
  ownerUserId: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  instructions: v.string(),
  model: v.string(),
  status: customAgentStatusValidator,
  draftRevision: v.number(),
  publishedRevision: v.optional(v.number()),
  publishedInstructions: v.optional(v.string()),
  publishedModel: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
  archivedAt: v.optional(v.number()),
});

export const publishedCustomAgentValidator = v.object({
  id: v.id("customAgents"),
  organizationId: v.string(),
  ownerUserId: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  instructions: v.string(),
  model: v.string(),
  revision: v.number(),
});

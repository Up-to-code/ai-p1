import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldValueValidator } from "./shared";

export const taskTables = {
  tasks: defineTable({
    organizationId: v.string(),
    title: v.string(),
    status: v.union(v.literal("todo"), v.literal("inProgress"), v.literal("waiting"), v.literal("done"), v.literal("canceled")),
    pipelineOrder: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    assigneeUserId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    description: v.optional(v.string()),
    checklist: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      done: v.boolean(),
    }))),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    spaceId: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_assignee", ["organizationId", "assigneeUserId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_organization_project_space", ["organizationId", "projectId", "spaceId"])
    .index("by_due", ["organizationId", "dueDate"])
    .index("by_updated", ["updatedAt"]),
};

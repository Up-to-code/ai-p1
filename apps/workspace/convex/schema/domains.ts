import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldValueValidator } from "./validators";

export const domainTables = {
  projects: defineTable({
    organizationId: v.string(),
    name: v.string(),
    clientId: v.optional(v.id("clients")),
    opportunityId: v.optional(v.id("opportunities")),
    ownerUserId: v.string(),
    teamMemberIds: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("planned"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("archived"),
    ),
    health: v.union(v.literal("onTrack"), v.literal("atRisk"), v.literal("blocked")),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    budget: v.optional(v.number()),
    currency: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    isStrict: v.optional(v.boolean()),
    isRollupEnabled: v.optional(v.boolean()),
    templateId: v.optional(v.string()),
    customTabs: v.optional(v.array(v.string())),
    progress: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_health", ["organizationId", "health"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_status_updated", ["organizationId", "isDeleted", "status", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_opportunity", ["organizationId", "opportunityId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),

  projectSpaces: defineTable({
    organizationId: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    visibility: v.union(v.literal("all_members"), v.literal("selected_members")),
    defaultAssigneeIds: v.optional(v.array(v.string())),
    slug: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_project_id", ["organizationId", "projectId"])
    .index("by_project_slug", ["organizationId", "projectId", "slug"])
    .index("by_organization_id", ["organizationId"]),

  clients: defineTable({
    organizationId: v.string(),
    name: v.string(),
    type: v.union(v.literal("person"), v.literal("organization")),
    ownerUserId: v.string(),
    status: v.union(v.literal("new"), v.literal("active"), v.literal("nurture"), v.literal("inactive"), v.literal("archived")),
    pipelineStage: v.optional(v.string()),
    pipelineOrder: v.optional(v.number()),
    source: v.string(),
    company: v.optional(v.string()),
    contactName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    encryptedEmail: v.optional(v.string()),
    encryptedPhone: v.optional(v.string()),
    piiEncryptedAt: v.optional(v.number()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_type", ["organizationId", "type"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_type_updated", ["organizationId", "isDeleted", "type", "updatedAt"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),

  opportunities: defineTable({
    organizationId: v.string(),
    title: v.string(),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    stage: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("paused"),
    ),
    value: v.optional(v.number()),
    currency: v.optional(v.string()),
    source: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    closeDate: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    ownerUserId: v.string(),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_stage", ["organizationId", "stage"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_project", ["organizationId", "projectId"])
    .index("by_updated", ["updatedAt"]),

  deals: defineTable({
    organizationId: v.string(),
    title: v.string(),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    stage: v.union(
      v.literal("lead"),
      v.literal("qualified"),
      v.literal("proposal_sent"),
      v.literal("contract_sent"),
      v.literal("won"),
      v.literal("lost"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("paused"),
    ),
    value: v.optional(v.number()),
    currency: v.optional(v.string()),
    dealThinking: v.optional(v.string()),
    source: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    closeDate: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    ownerUserId: v.string(),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_stage", ["organizationId", "stage"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_project", ["organizationId", "projectId"])
    .index("by_updated", ["updatedAt"]),

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

  calendarEvents: defineTable({
    organizationId: v.string(),
    title: v.string(),
    ownerUserId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    taskId: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.number(),
    type: v.union(
      v.literal("meeting"),
      v.literal("deadline"),
      v.literal("reminder"),
      v.literal("milestone"),
      v.literal("focusBlock"),
    ),
    status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("draft")),
    attendeeUserIds: v.optional(v.array(v.string())),
    externalAttendees: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    spaceId: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_organization_project_space", ["organizationId", "projectId", "spaceId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_start", ["organizationId", "startAt"])
    .index("by_updated", ["updatedAt"]),

  clientFollowUps: defineTable({
    organizationId: v.string(),
    clientId: v.string(),
    type: v.union(
      v.literal("call"),
      v.literal("meeting"),
      v.literal("email"),
      v.literal("task"),
    ),
    title: v.string(),
    notes: v.optional(v.string()),
    followUpDate: v.number(),
    dueDate: v.optional(v.string()),
    status: v.union(
      v.literal("completed"),
      v.literal("upcoming"),
      v.literal("past"),
      v.literal("canceled"),
    ),
    opportunityId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    calendarEventId: v.optional(v.string()),
    assigneeUserId: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_date", ["organizationId", "followUpDate"])
    .index("by_updated", ["updatedAt"]),

  workspaceWidgetLayouts: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    widgets: v.array(v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      w: v.number(),
      h: v.number(),
      x: v.optional(v.number()),
      y: v.optional(v.number()),
    })),
    layout: v.optional(v.any()),
    updatedAt: v.number(),
  })
    .index("by_organization_user", ["organizationId", "userId"])
    .index("by_updated", ["updatedAt"]),

  projectDashboards: defineTable({
    organizationId: v.string(),
    projectId: v.string(),
    widgetConfig: v.string(),
    layout: v.string(),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_organization_project", ["organizationId", "projectId"]),
};

import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldValueValidator } from "./validators";

export const domainTables = {
  spaces: defineTable({
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    slug: v.string(),
    visibility: v.union(v.literal("private"), v.literal("public"), v.literal("request_only")),
    defaultProjectVisibility: v.optional(v.union(v.literal("private"), v.literal("space_members"), v.literal("organization"))),
    allowMemberProjectCreation: v.optional(v.boolean()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_slug", ["organizationId", "slug"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),

  spaceMembers: defineTable({
    organizationId: v.string(),
    spaceId: v.id("spaces"),
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    addedByUserId: v.string(),
    addedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_space_id", ["organizationId", "spaceId"])
    .index("by_user_id", ["organizationId", "userId"])
    .index("by_space_user", ["organizationId", "spaceId", "userId"]),

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
    visibility: v.optional(v.union(v.literal("private"), v.literal("space_members"), v.literal("organization"), v.literal("workspace"), v.literal("team"))),
    spaceIds: v.optional(v.array(v.id("spaces"))),
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
    .index("by_space", ["organizationId", "spaceIds"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),

  projectSpaces: defineTable({
    organizationId: v.string(),
    projectId: v.id("projects"),
    spaceId: v.id("spaces"),
    isPrimary: v.boolean(),
    addedByUserId: v.string(),
    addedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_project_id", ["organizationId", "projectId"])
    .index("by_space_id", ["organizationId", "spaceId"])
    .index("by_project_space", ["organizationId", "projectId", "spaceId"])
    .index("by_space_project", ["organizationId", "spaceId", "projectId"])
    .index("by_project_primary", ["organizationId", "projectId", "isPrimary"]),

  clients: defineTable({
    organizationId: v.string(),
    name: v.string(),
    type: v.union(v.literal("person"), v.literal("organization")),
    ownerUserId: v.string(),
    status: v.union(v.literal("new"), v.literal("active"), v.literal("nurture"), v.literal("inactive"), v.literal("archived")),
    pipelineStage: v.optional(v.string()),
    pipelineOrder: v.optional(v.number()),
    source: v.string(),
    contact: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))),
    budget: v.optional(v.string()),
    assetInterest: v.optional(v.string()),
    added: v.optional(v.string()),
    lastContact: v.optional(v.string()),
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

  channels: defineTable({
    id: v.string(),
    organizationId: v.string(),
    name: v.string(),
    type: v.union(v.literal("organization"), v.literal("project"), v.literal("space"), v.literal("client"), v.literal("dm")),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("dm")),
    description: v.optional(v.string()),
    projectId: v.optional(v.string()),
    projectIds: v.optional(v.array(v.string())),
    spaceId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    memberIds: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    unreadCount: v.optional(v.number()),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_project", ["projectId"])
    .index("by_client", ["clientId"])
    .index("by_type", ["organizationId", "type"]),

  messages: defineTable({
    id: v.string(),
    channelId: v.string(),
    content: v.string(),
    authorId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    threadId: v.optional(v.string()),
    replyToId: v.optional(v.string()),
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userIds: v.array(v.string()),
    }))),
    mentions: v.optional(v.array(v.object({
      type: v.string(),
      id: v.string(),
      name: v.string(),
    }))),
    attachments: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      url: v.string(),
      type: v.string(),
      size: v.number(),
    }))),
    isDeleted: v.optional(v.boolean()),
    editedAt: v.optional(v.number()),
  })
    .index("by_channel", ["channelId"])
    .index("by_channel_created", ["channelId", "createdAt"])
    .index("by_thread", ["threadId"]),

  threads: defineTable({
    id: v.string(),
    channelId: v.string(),
    parentMessageId: v.string(),
    messageCount: v.number(),
    participantIds: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_parent", ["parentMessageId"]),

  milestones: defineTable({
    organizationId: v.string(),
    projectId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("canceled")),
    order: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_project_id", ["organizationId", "projectId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_due", ["organizationId", "dueDate"])
    .index("by_updated", ["updatedAt"]),

  taskDependencies: defineTable({
    organizationId: v.string(),
    taskId: v.string(),
    dependsOnTaskId: v.string(),
    projectId: v.optional(v.string()),
    dependencyType: v.union(v.literal("finish_to_start"), v.literal("start_to_start"), v.literal("finish_to_finish"), v.literal("start_to_finish")),
    createdByUserId: v.string(),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_task_id", ["organizationId", "taskId"])
    .index("by_depends_on", ["organizationId", "dependsOnTaskId"])
    .index("by_project_id", ["organizationId", "projectId"]),

  piiAccessAudit: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    resourceType: v.union(v.literal("client"), v.literal("task"), v.literal("deal"), v.literal("opportunity")),
    resourceId: v.string(),
    accessedFields: v.array(v.string()),
    accessReason: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_user_id", ["organizationId", "userId"])
    .index("by_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_timestamp", ["organizationId", "timestamp"]),
};

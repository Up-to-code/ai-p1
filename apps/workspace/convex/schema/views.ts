import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  recordStateValidator,
  savedViewConfigValidator,
  scopeTypeValidator,
  viewTypeValidator,
  workspaceVisibilityValidator,
  workOsRecordResourceValidator,
} from "./validators";

export const viewTables = {
  surfaces: defineTable({
    organizationId: v.string(),
    scopeType: scopeTypeValidator,
    scopeId: v.optional(v.string()),
    key: v.string(),
    title: v.string(),
    ownerUserId: v.optional(v.string()),
    visibility: workspaceVisibilityValidator,
    recordState: recordStateValidator,
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_scope", ["organizationId", "scopeType", "scopeId"])
    .index("by_organization_state_updated", ["organizationId", "recordState", "updatedAt"])
    .index("by_organization_key", ["organizationId", "key"]),

  surfaceTabs: defineTable({
    organizationId: v.string(),
    surfaceId: v.id("surfaces"),
    tabType: v.union(v.literal("savedView"), v.literal("record"), v.literal("system")),
    label: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
    savedViewId: v.optional(v.id("savedViews")),
    recordType: v.optional(workOsRecordResourceValidator),
    recordId: v.optional(v.string()),
    systemKey: v.optional(v.string()),
    ownerUserId: v.optional(v.string()),
    visibility: workspaceVisibilityValidator,
    recordState: recordStateValidator,
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_surface_state_order", ["organizationId", "surfaceId", "recordState", "order"])
    .index("by_saved_view", ["organizationId", "savedViewId"])
    .index("by_record", ["organizationId", "recordType", "recordId"]),

  savedViews: defineTable({
    organizationId: v.string(),
    resourceType: workOsRecordResourceValidator,
    viewType: viewTypeValidator,
    name: v.string(),
    description: v.optional(v.string()),
    ownerUserId: v.optional(v.string()),
    scopeType: scopeTypeValidator,
    scopeId: v.optional(v.string()),
    visibility: workspaceVisibilityValidator,
    sharingMode: v.optional(v.union(v.literal("personal"), v.literal("shared"), v.literal("protected"))),
    revision: v.optional(v.number()),
    config: savedViewConfigValidator,
    isDefault: v.optional(v.boolean()),
    sourceTemplateId: v.optional(v.string()),
    isSystemDefault: v.optional(v.boolean()),
    isRemovable: v.boolean(),
    recordState: recordStateValidator,
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_resource_scope_state", ["organizationId", "resourceType", "scopeType", "scopeId", "recordState"])
    .index("by_owner_resource", ["organizationId", "ownerUserId", "resourceType"])
    .index("by_resource_state", ["organizationId", "resourceType", "recordState", "updatedAt"])
    .index("by_default", ["organizationId", "resourceType", "scopeType", "scopeId", "isDefault"])
    .index("by_state_updated", ["organizationId", "recordState", "updatedAt"]),

  savedViewGrants: defineTable({
    organizationId: v.string(),
    viewId: v.id("savedViews"),
    principalType: v.union(v.literal("user"), v.literal("team")),
    principalId: v.string(),
    access: v.union(v.literal("read"), v.literal("configure")),
    recordState: recordStateValidator,
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_view_principal", ["organizationId", "viewId", "principalType", "principalId"])
    .index("by_principal_view", ["organizationId", "principalType", "principalId", "viewId"])
    .index("by_view_state", ["organizationId", "viewId", "recordState"]),

  workflowDefinitions: defineTable({
    organizationId: v.string(),
    resourceType: workOsRecordResourceValidator,
    key: v.string(),
    name: v.string(),
    isDefault: v.boolean(),
    isRemovable: v.boolean(),
    sourceTemplateId: v.optional(v.string()),
    recordState: recordStateValidator,
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_resource_key", ["organizationId", "resourceType", "key"])
    .index("by_resource_default", ["organizationId", "resourceType", "isDefault"])
    .index("by_state_updated", ["organizationId", "recordState", "updatedAt"]),

  workflowStates: defineTable({
    organizationId: v.string(),
    workflowId: v.id("workflowDefinitions"),
    key: v.string(),
    label: v.string(),
    color: v.string(),
    order: v.number(),
    category: v.union(
      v.literal("not_started"),
      v.literal("active"),
      v.literal("waiting"),
      v.literal("terminal"),
    ),
    isDefault: v.boolean(),
    isTerminal: v.boolean(),
    isRemovable: v.boolean(),
    sourceTemplateId: v.optional(v.string()),
    recordState: recordStateValidator,
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_workflow_state_order", ["organizationId", "workflowId", "recordState", "order"])
    .index("by_workflow_key", ["organizationId", "workflowId", "key"])
    .index("by_state_updated", ["organizationId", "recordState", "updatedAt"]),

  fieldLayouts: defineTable({
    organizationId: v.string(),
    resourceType: workOsRecordResourceValidator,
    scopeType: scopeTypeValidator,
    scopeId: v.optional(v.string()),
    surfaceKey: v.union(v.literal("form"), v.literal("table"), v.literal("detail"), v.literal("board")),
    fieldDefinitionId: v.optional(v.id("customFieldDefinitions")),
    fieldKey: v.string(),
    label: v.optional(v.string()),
    order: v.number(),
    visible: v.boolean(),
    requiredOnCreate: v.optional(v.boolean()),
    recordState: recordStateValidator,
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_resource_scope_surface", ["organizationId", "resourceType", "scopeType", "scopeId", "surfaceKey"])
    .index("by_field", ["organizationId", "fieldDefinitionId"])
    .index("by_state_updated", ["organizationId", "recordState", "updatedAt"]),
};

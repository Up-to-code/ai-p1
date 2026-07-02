import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsRecordResourceValidator, workOsCustomFieldTypeValidator, workOsCustomFieldOptionValidator, workOsCustomFieldValueValidator } from "./validators";

export const customFieldTables = {
  customFieldDefinitions: defineTable({
    organizationId: v.string(),
    workspaceId: v.optional(v.string()),
    templateId: v.optional(v.string()),
    key: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    type: workOsCustomFieldTypeValidator,
    required: v.boolean(),
    options: v.optional(v.array(workOsCustomFieldOptionValidator)),
    appliesTo: v.array(workOsRecordResourceValidator),
    defaultValue: v.optional(v.any()),
    display: v.optional(v.object({
      formSection: v.optional(v.string()),
      tableVisible: v.boolean(),
      boardVisible: v.boolean(),
      detailVisible: v.boolean(),
      requiredOnCreate: v.boolean(),
    })),
    order: v.number(),
    archivedAt: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_key", ["organizationId", "key"])
    .index("by_organization_template", ["organizationId", "templateId"])
    .index("by_updated", ["updatedAt"]),

  customFieldValues: defineTable({
    organizationId: v.string(),
    fieldDefinitionId: v.id("customFieldDefinitions"),
    fieldKey: v.string(),
    recordType: workOsRecordResourceValidator,
    recordId: v.string(),
    type: workOsCustomFieldTypeValidator,
    textValue: v.optional(v.string()),
    numberValue: v.optional(v.number()),
    currencyValue: v.optional(v.number()),
    booleanValue: v.optional(v.boolean()),
    dateValue: v.optional(v.string()),
    dateTimeValue: v.optional(v.string()),
    selectValue: v.optional(v.string()),
    multiSelectValue: v.optional(v.array(v.string())),
    userValue: v.optional(v.string()),
    urlValue: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_record", ["organizationId", "recordType", "recordId"])
    .index("by_organization_field", ["organizationId", "fieldDefinitionId"])
    .index("by_organization_field_record", ["organizationId", "fieldDefinitionId", "recordType", "recordId"])
    .index("by_updated", ["updatedAt"]),

  recordLinks: defineTable({
    organizationId: v.string(),
    linkType: v.union(
      v.literal("related"),
      v.literal("owns"),
      v.literal("dependsOn"),
      v.literal("blocks"),
      v.literal("createdFrom"),
      v.literal("attachedTo"),
    ),
    sourceRecordType: workOsRecordResourceValidator,
    sourceRecordId: v.string(),
    targetRecordType: workOsRecordResourceValidator,
    targetRecordId: v.string(),
    label: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_source", ["organizationId", "sourceRecordType", "sourceRecordId"])
    .index("by_target", ["organizationId", "targetRecordType", "targetRecordId"])
    .index("by_type", ["organizationId", "linkType"]),

  workspaceTemplates: defineTable({
    organizationId: v.optional(v.string()),
    key: v.union(
      v.literal("custom"),
      v.literal("sales_crm"),
      v.literal("agency_marketing"),
      v.literal("consulting_services"),
      v.literal("operations"),
    ),
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    recordLabels: v.optional(v.any()),
    recordStatuses: v.optional(v.any()),
    opportunityStages: v.optional(v.array(v.string())),
    customFieldDefinitions: v.optional(v.array(v.object({
      id: v.optional(v.string()),
      organizationId: v.optional(v.string()),
      workspaceId: v.optional(v.string()),
      templateId: v.optional(v.string()),
      key: v.string(),
      label: v.string(),
      description: v.optional(v.string()),
      type: workOsCustomFieldTypeValidator,
      required: v.boolean(),
      options: v.optional(v.array(workOsCustomFieldOptionValidator)),
      appliesTo: v.array(workOsRecordResourceValidator),
      defaultValue: v.optional(v.any()),
      display: v.optional(v.object({
        formSection: v.optional(v.string()),
        tableVisible: v.boolean(),
        boardVisible: v.boolean(),
        detailVisible: v.boolean(),
        requiredOnCreate: v.boolean(),
      })),
      order: v.optional(v.number()),
      archivedAt: v.optional(v.number()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    }))),
    automationRecipes: v.optional(v.array(v.string())),
    views: v.optional(v.array(v.object({
      recordType: workOsRecordResourceValidator,
      type: v.union(v.literal("table"), v.literal("board"), v.literal("calendar"), v.literal("detail")),
      name: v.string(),
    }))),
    createdByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_organization_key", ["organizationId", "key"])
    .index("by_updated", ["updatedAt"]),

  automations: defineTable({
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    trigger: v.any(),
    conditions: v.optional(v.array(v.any())),
    conditionMode: v.optional(v.union(v.literal("all"), v.literal("any"))),
    actions: v.array(v.any()),
    ownerUserId: v.optional(v.string()),
    lastRunAt: v.optional(v.number()),
    lastRunStatus: v.optional(v.union(v.literal("success"), v.literal("failed"), v.literal("skipped"))),
    lastRunSummary: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_enabled", ["organizationId", "enabled"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_updated", ["updatedAt"]),

  pipeline_stages: defineTable({
    organizationId: v.string(),
    key: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_key", ["organizationId", "key"]),
};

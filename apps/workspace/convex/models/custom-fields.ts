import { defineTable } from "convex/server";
import { v } from "convex/values";

export const customFieldTables = {
  customFieldDefinitions: defineTable({
    organizationId: v.string(),
    workspaceId: v.optional(v.string()),
    templateId: v.optional(v.string()),
    key: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("text"), v.literal("longText"), v.literal("number"),
      v.literal("currency"), v.literal("date"), v.literal("dateTime"),
      v.literal("select"), v.literal("multiSelect"), v.literal("boolean"),
      v.literal("user"), v.literal("url"),
    ),
    required: v.boolean(),
    options: v.optional(v.array(v.object({
      id: v.string(),
      label: v.string(),
      color: v.optional(v.string()),
      order: v.number(),
      archivedAt: v.optional(v.number()),
    }))),
    appliesTo: v.array(v.union(
      v.literal("client"), v.literal("deal"), v.literal("opportunity"),
      v.literal("project"), v.literal("task"), v.literal("calendarEvent"),
      v.literal("space"),
    )),
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
    recordType: v.union(
      v.literal("client"), v.literal("deal"), v.literal("opportunity"),
      v.literal("project"), v.literal("task"), v.literal("calendarEvent"),
      v.literal("space"),
    ),
    recordId: v.string(),
    type: v.union(
      v.literal("text"), v.literal("longText"), v.literal("number"),
      v.literal("currency"), v.literal("date"), v.literal("dateTime"),
      v.literal("select"), v.literal("multiSelect"), v.literal("boolean"),
      v.literal("user"), v.literal("url"),
    ),
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
};

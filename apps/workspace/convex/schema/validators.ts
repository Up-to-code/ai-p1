import { v } from "convex/values";

export const workOsRecordResourceValidator = v.union(
  v.literal("client"),
  v.literal("deal"),
  v.literal("opportunity"),
  v.literal("project"),
  v.literal("task"),
  v.literal("calendarEvent"),
  v.literal("space"),
);

export const workOsCustomFieldTypeValidator = v.union(
  v.literal("text"),
  v.literal("longText"),
  v.literal("number"),
  v.literal("currency"),
  v.literal("date"),
  v.literal("dateTime"),
  v.literal("select"),
  v.literal("multiSelect"),
  v.literal("boolean"),
  v.literal("user"),
  v.literal("url"),
);

export const workOsCustomFieldOptionValidator = v.object({
  id: v.string(),
  label: v.string(),
  color: v.optional(v.string()),
  order: v.number(),
  archivedAt: v.optional(v.number()),
});

export const workOsCustomFieldDefinitionValidator = v.object({
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
});

export const workOsCustomFieldValueValidator = v.object({
  fieldDefinitionId: v.optional(v.string()),
  fieldKey: v.string(),
  recordType: v.optional(workOsRecordResourceValidator),
  recordId: v.optional(v.string()),
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
});

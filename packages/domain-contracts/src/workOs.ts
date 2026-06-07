import { z } from "zod";

const isoDateTimeSchema = z.string().datetime();
const nonEmptyStringSchema = z.string().trim().min(1);
const optionalTextSchema = z.string().trim().optional();

export const workOsCoreRecordTypeSchema = z.enum([
  "client",
  "opportunity",
  "project",
  "task",
  "calendarEvent",
  "asset",
]);

export type WorkOsCoreRecordType = z.infer<typeof workOsCoreRecordTypeSchema>;

export const workOsCoreResourceSchema = z.enum([
  "organization",
  ...workOsCoreRecordTypeSchema.options,
  "automation",
  "workspaceTemplate",
]);

export type WorkOsCoreResource = z.infer<typeof workOsCoreResourceSchema>;

export const workOsRecordResourceSchema = workOsCoreRecordTypeSchema;
export type WorkOsRecordResource = WorkOsCoreRecordType;

export const workOsTemplateKeySchema = z.enum([
  "custom",
  "sales_crm",
  "agency_marketing",
  "consulting_services",
  "operations",
  "real_estate_legacy",
]);

export type WorkOsTemplateKey = z.infer<typeof workOsTemplateKeySchema>;

export const workOsCustomFieldTypeSchema = z.enum([
  "text",
  "longText",
  "number",
  "currency",
  "date",
  "dateTime",
  "select",
  "multiSelect",
  "boolean",
  "user",
  "url",
]);

export type WorkOsCustomFieldType = z.infer<typeof workOsCustomFieldTypeSchema>;

export const workOsCustomFieldOptionSchema = z.object({
  id: nonEmptyStringSchema,
  label: nonEmptyStringSchema.max(120),
  color: z.string().trim().max(40).optional(),
  order: z.number().int().nonnegative().default(0),
  archivedAt: isoDateTimeSchema.optional(),
});

export type WorkOsCustomFieldOption = z.infer<typeof workOsCustomFieldOptionSchema>;

export const workOsCustomFieldDefinitionSchema = z.object({
  id: nonEmptyStringSchema.optional(),
  organizationId: nonEmptyStringSchema.optional(),
  workspaceId: nonEmptyStringSchema.optional(),
  templateId: nonEmptyStringSchema.max(120).optional(),
  key: z.string().trim().min(1).max(64).regex(/^[a-z][a-zA-Z0-9]*$/),
  label: nonEmptyStringSchema.max(120),
  description: optionalTextSchema,
  type: workOsCustomFieldTypeSchema,
  required: z.boolean().default(false),
  options: z.array(workOsCustomFieldOptionSchema).default([]),
  appliesTo: z.array(workOsCoreRecordTypeSchema).min(1),
  defaultValue: z.unknown().optional(),
  display: z.object({
    formSection: z.string().trim().max(80).optional(),
    tableVisible: z.boolean().default(false),
    boardVisible: z.boolean().default(false),
    detailVisible: z.boolean().default(true),
    requiredOnCreate: z.boolean().default(false),
  }).default({
    tableVisible: false,
    boardVisible: false,
    detailVisible: true,
    requiredOnCreate: false,
  }),
  order: z.number().int().nonnegative().default(0),
  archivedAt: isoDateTimeSchema.optional(),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
}).superRefine((definition, ctx) => {
  const optionTypes = new Set<WorkOsCustomFieldType>(["select", "multiSelect"]);
  if (optionTypes.has(definition.type) && definition.options.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: `${definition.type} custom fields require options.`,
    });
  }

  if (!optionTypes.has(definition.type) && definition.options.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: `${definition.type} custom fields cannot define options.`,
    });
  }
});

export type WorkOsCustomFieldDefinition = z.infer<typeof workOsCustomFieldDefinitionSchema>;

export const workOsCustomFieldValueSchema = z.object({
  fieldDefinitionId: nonEmptyStringSchema.optional(),
  fieldKey: z.string().trim().min(1).max(64),
  recordType: workOsCoreRecordTypeSchema.optional(),
  recordId: nonEmptyStringSchema.optional(),
  type: workOsCustomFieldTypeSchema,
  textValue: z.string().optional(),
  numberValue: z.number().finite().optional(),
  currencyValue: z.number().finite().optional(),
  booleanValue: z.boolean().optional(),
  dateValue: z.string().date().optional(),
  dateTimeValue: isoDateTimeSchema.optional(),
  selectValue: z.string().optional(),
  multiSelectValue: z.array(z.string()).optional(),
  userValue: z.string().optional(),
  urlValue: z.string().url().optional(),
}).superRefine((value, ctx) => {
  const valueKeysByType = {
    text: "textValue",
    longText: "textValue",
    number: "numberValue",
    currency: "currencyValue",
    date: "dateValue",
    dateTime: "dateTimeValue",
    select: "selectValue",
    multiSelect: "multiSelectValue",
    boolean: "booleanValue",
    user: "userValue",
    url: "urlValue",
  } as const satisfies Record<WorkOsCustomFieldType, keyof typeof value>;

  const typedKeys = Object.values(valueKeysByType);
  const presentTypedKeys = new Set(typedKeys.filter((key) => value[key] !== undefined));
  const expectedKey = valueKeysByType[value.type];

  if (value[expectedKey] === undefined) {
    ctx.addIssue({
      code: "custom",
      path: [expectedKey],
      message: `Expected ${expectedKey} for ${value.type} custom field.`,
    });
  }

  if (presentTypedKeys.size > 1) {
    ctx.addIssue({
      code: "custom",
      message: "Expected exactly one typed custom field value channel.",
    });
  }
});

export type WorkOsCustomFieldValue = z.infer<typeof workOsCustomFieldValueSchema>;

export const workOsRecordLinkTypeSchema = z.enum([
  "related",
  "owns",
  "dependsOn",
  "blocks",
  "createdFrom",
  "attachedTo",
]);

export type WorkOsRecordLinkType = z.infer<typeof workOsRecordLinkTypeSchema>;

export const workOsRecordRefSchema = z.object({
  recordType: workOsCoreRecordTypeSchema,
  recordId: nonEmptyStringSchema,
});

export type WorkOsRecordRef = z.infer<typeof workOsRecordRefSchema>;

export const workOsRecordLinkSchema = z.object({
  id: nonEmptyStringSchema.optional(),
  organizationId: nonEmptyStringSchema,
  source: workOsRecordRefSchema,
  target: workOsRecordRefSchema,
  linkType: workOsRecordLinkTypeSchema,
  label: z.string().trim().max(120).optional(),
  createdBy: z.string().trim().optional(),
  createdAt: isoDateTimeSchema.optional(),
});

export type WorkOsRecordLink = z.infer<typeof workOsRecordLinkSchema>;

const workOsBaseRecordSchema = z.object({
  id: nonEmptyStringSchema.optional(),
  organizationId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema.optional(),
  ownerId: nonEmptyStringSchema.optional(),
  visibility: z.enum(["private", "team", "workspace"]).default("workspace"),
  tags: z.array(z.string().trim().min(1).max(80)).default([]),
  customFields: z.array(workOsCustomFieldValueSchema).default([]),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
  archivedAt: isoDateTimeSchema.optional(),
});

export const workOsClientStatusSchema = z.enum(["new", "active", "nurture", "inactive", "archived"]);
export const workOsClientTypeSchema = z.enum(["person", "organization"]);

export const workOsClientRecordSchema = workOsBaseRecordSchema.extend({
  recordType: z.literal("client").default("client"),
  name: nonEmptyStringSchema.max(160),
  type: workOsClientTypeSchema,
  ownerId: nonEmptyStringSchema,
  status: workOsClientStatusSchema.default("new"),
  source: z.string().trim().max(120).default("manual"),
  company: z.string().trim().max(160).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(60).optional(),
  website: z.string().url().optional(),
  contactName: z.string().trim().max(160).optional(),
  notes: optionalTextSchema,
});

export type WorkOsClientRecord = z.infer<typeof workOsClientRecordSchema>;

export const workOsOpportunityStageSchema = z.enum([
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const workOsPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);

export const workOsOpportunityRecordSchema = workOsBaseRecordSchema.extend({
  recordType: z.literal("opportunity").default("opportunity"),
  title: nonEmptyStringSchema.max(180),
  stage: workOsOpportunityStageSchema.default("new"),
  ownerId: nonEmptyStringSchema,
  clientId: z.string().trim().optional(),
  value: z.number().finite().nonnegative().optional(),
  currency: z.string().trim().length(3).optional(),
  source: z.string().trim().max(120).optional(),
  priority: workOsPrioritySchema.default("normal"),
  closeDate: z.string().date().optional(),
  nextStep: z.string().trim().max(240).optional(),
  projectId: z.string().trim().optional(),
});

export type WorkOsOpportunityRecord = z.infer<typeof workOsOpportunityRecordSchema>;

export const workOsProjectStatusSchema = z.enum(["planned", "active", "paused", "completed", "archived"]);
export const workOsProjectHealthSchema = z.enum(["onTrack", "atRisk", "blocked"]);

export const workOsProjectRecordSchema = workOsBaseRecordSchema.extend({
  recordType: z.literal("project").default("project"),
  name: nonEmptyStringSchema.max(180),
  ownerId: nonEmptyStringSchema,
  status: workOsProjectStatusSchema.default("planned"),
  clientId: z.string().trim().optional(),
  opportunityId: z.string().trim().optional(),
  teamMemberIds: z.array(z.string().trim().min(1)).default([]),
  health: workOsProjectHealthSchema.default("onTrack"),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  budget: z.number().finite().nonnegative().optional(),
  currency: z.string().trim().length(3).optional(),
  description: optionalTextSchema,
});

export type WorkOsProjectRecord = z.infer<typeof workOsProjectRecordSchema>;

export const workOsTaskStatusSchema = z.enum(["todo", "inProgress", "waiting", "done", "canceled"]);

export const workOsTaskRecordSchema = workOsBaseRecordSchema.extend({
  recordType: z.literal("task").default("task"),
  title: nonEmptyStringSchema.max(180),
  status: workOsTaskStatusSchema.default("todo"),
  priority: workOsPrioritySchema.default("normal"),
  assigneeId: z.string().trim().optional(),
  dueDate: z.string().date().optional(),
  description: optionalTextSchema,
  checklist: z.array(z.object({
    id: nonEmptyStringSchema,
    title: nonEmptyStringSchema.max(180),
    done: z.boolean().default(false),
  })).default([]),
});

export type WorkOsTaskRecord = z.infer<typeof workOsTaskRecordSchema>;

export const workOsCalendarEventTypeSchema = z.enum([
  "meeting",
  "deadline",
  "reminder",
  "milestone",
  "focusBlock",
]);

export const workOsCalendarEventRecordSchema = workOsBaseRecordSchema.extend({
  recordType: z.literal("calendarEvent").default("calendarEvent"),
  title: nonEmptyStringSchema.max(180),
  type: workOsCalendarEventTypeSchema,
  startAt: isoDateTimeSchema,
  endAt: isoDateTimeSchema,
  attendeeIds: z.array(z.string().trim().min(1)).default([]),
  externalAttendees: z.array(z.string().email()).default([]),
  location: z.string().trim().max(240).optional(),
  meetingUrl: z.string().url().optional(),
  notes: optionalTextSchema,
});

export type WorkOsCalendarEventRecord = z.infer<typeof workOsCalendarEventRecordSchema>;

export const workOsAssetTypeSchema = z.enum([
  "file",
  "document",
  "image",
  "video",
  "link",
  "deliverable",
  "resource",
  "note",
]);

export const workOsAssetStatusSchema = z.enum(["draft", "active", "review", "approved", "archived"]);

export const workOsAssetRecordSchema = workOsBaseRecordSchema.extend({
  recordType: z.literal("asset").default("asset"),
  name: nonEmptyStringSchema.max(180),
  type: workOsAssetTypeSchema,
  status: workOsAssetStatusSchema.default("draft"),
  ownerId: nonEmptyStringSchema,
  fileId: z.string().trim().optional(),
  url: z.string().url().optional(),
  description: optionalTextSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type WorkOsAssetRecord = z.infer<typeof workOsAssetRecordSchema>;

export const workOsRecordSchema = z.discriminatedUnion("recordType", [
  workOsClientRecordSchema,
  workOsOpportunityRecordSchema,
  workOsProjectRecordSchema,
  workOsTaskRecordSchema,
  workOsCalendarEventRecordSchema,
  workOsAssetRecordSchema,
]);

export type WorkOsRecord = z.infer<typeof workOsRecordSchema>;

export const workOsViewTypeSchema = z.enum(["table", "board", "calendar", "detail"]);

export const workOsTemplateStatusSchema = z.enum(["draft", "active", "archived"]);

export const workOsTemplateSchema = z.object({
  id: nonEmptyStringSchema.optional(),
  key: workOsTemplateKeySchema,
  name: nonEmptyStringSchema.max(120),
  category: z.string().trim().max(120).default("custom"),
  description: optionalTextSchema,
  version: z.string().trim().max(40).default("1.0.0"),
  status: workOsTemplateStatusSchema.default("draft"),
  recordLabels: z.record(z.string(), z.string().trim().min(1).max(120)).default({}),
  recordStatuses: z.record(z.string(), z.array(z.string().trim().min(1))).default({}),
  opportunityStages: z.array(z.string().trim().min(1)).default([]),
  views: z.array(z.object({
    recordType: workOsCoreRecordTypeSchema,
    type: workOsViewTypeSchema,
    name: nonEmptyStringSchema.max(120),
  })).default([]),
  customFieldDefinitions: z.array(workOsCustomFieldDefinitionSchema).default([]),
  automationRecipes: z.array(z.string().trim().min(1)).default([]),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
});

export type WorkOsTemplate = z.infer<typeof workOsTemplateSchema>;

export const workOsAutomationTriggerTypeSchema = z.enum([
  "recordCreated",
  "fieldChanged",
  "stageChanged",
  "statusChanged",
  "dueDateReached",
]);

export const workOsAutomationActionTypeSchema = z.enum([
  "createTask",
  "scheduleEvent",
  "updateField",
  "notify",
  "linkRecord",
]);

export const workOsAutomationTriggerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("recordCreated"),
    recordType: workOsCoreRecordTypeSchema,
    recordId: nonEmptyStringSchema.optional(),
  }),
  z.object({
    type: z.literal("fieldChanged"),
    recordType: workOsCoreRecordTypeSchema,
    recordId: nonEmptyStringSchema.optional(),
    fieldKey: nonEmptyStringSchema,
    previousValue: z.unknown().optional(),
    nextValue: z.unknown().optional(),
  }),
  z.object({
    type: z.literal("stageChanged"),
    recordType: z.literal("opportunity"),
    recordId: nonEmptyStringSchema.optional(),
    previousStage: z.string().trim().optional(),
    nextStage: z.string().trim().optional(),
  }),
  z.object({
    type: z.literal("statusChanged"),
    recordType: workOsCoreRecordTypeSchema,
    recordId: nonEmptyStringSchema.optional(),
    previousStatus: z.string().trim().optional(),
    nextStatus: z.string().trim().optional(),
  }),
  z.object({
    type: z.literal("dueDateReached"),
    recordType: z.enum(["task", "opportunity", "project", "calendarEvent"]),
    recordId: nonEmptyStringSchema.optional(),
    dueAt: isoDateTimeSchema.optional(),
  }),
]);

export type WorkOsAutomationTrigger = z.infer<typeof workOsAutomationTriggerSchema>;

export const workOsAutomationConditionSchema = z.object({
  fieldKey: nonEmptyStringSchema,
  operator: z.enum([
    "equals",
    "notEquals",
    "contains",
    "greaterThan",
    "lessThan",
    "isEmpty",
    "isNotEmpty",
    "before",
    "after",
  ]),
  value: z.unknown().optional(),
});

export type WorkOsAutomationCondition = z.infer<typeof workOsAutomationConditionSchema>;

export const workOsAutomationActionSchema = z.object({
  type: workOsAutomationActionTypeSchema,
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type WorkOsAutomationAction = z.infer<typeof workOsAutomationActionSchema>;

export const workOsAutomationRuleSchema = z.object({
  id: nonEmptyStringSchema.optional(),
  organizationId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema.optional(),
  name: nonEmptyStringSchema.max(160),
  description: optionalTextSchema,
  enabled: z.boolean().default(true),
  trigger: workOsAutomationTriggerSchema,
  conditions: z.array(workOsAutomationConditionSchema).default([]),
  conditionMode: z.enum(["all", "any"]).default("all"),
  actions: z.array(workOsAutomationActionSchema).min(1),
  ownerId: z.string().trim().optional(),
  lastRunAt: isoDateTimeSchema.optional(),
  lastRunStatus: z.enum(["success", "failed", "skipped"]).optional(),
  lastRunSummary: z.string().trim().max(240).optional(),
});

export type WorkOsAutomationRule = z.infer<typeof workOsAutomationRuleSchema>;

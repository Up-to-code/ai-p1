import { v } from "convex/values";

export const workOsRecordResourceValidator = v.union(
  v.literal("client"),
  v.literal("deal"),
  v.literal("doc"),
  v.literal("media"),
  v.literal("opportunity"),
  v.literal("project"),
  v.literal("task"),
  v.literal("calendarEvent"),
  v.literal("space"),
);

export const recordStateValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
  v.literal("deleted"),
);

export const scopeTypeValidator = v.union(
  v.literal("workspace"),
  v.literal("space"),
  v.literal("project"),
  v.literal("resource"),
);

export const workspaceVisibilityValidator = v.union(
  v.literal("private"),
  v.literal("space_members"),
  v.literal("organization"),
);

export const viewTypeValidator = v.union(
  v.literal("table"),
  v.literal("board"),
  v.literal("list"),
  v.literal("calendar"),
  v.literal("timeline"),
  v.literal("dashboard"),
  v.literal("fileManager"),
);

export const savedViewValueValidator = v.union(
  v.null(),
  v.string(),
  v.number(),
  v.boolean(),
  v.array(v.string()),
  v.array(v.number()),
  v.array(v.boolean()),
);

export const savedViewFilterValidator = v.object({
  id: v.optional(v.string()),
  field: v.string(),
  operator: v.string(),
  value: v.optional(savedViewValueValidator),
});

export const savedViewColumnValidator = v.object({
  id: v.string(),
  label: v.optional(v.string()),
  width: v.optional(v.number()),
  visible: v.optional(v.boolean()),
  sortable: v.optional(v.boolean()),
  filterable: v.optional(v.boolean()),
});

export const savedViewDashboardWidgetValidator = v.object({
  id: v.string(),
  widgetType: v.string(),
  x: v.number(),
  y: v.number(),
  width: v.number(),
  height: v.number(),
});

export const projectSavedViewSettingsValidator = v.object({
  visibleFields: v.optional(v.array(v.string())),
  calendarScale: v.optional(v.union(v.literal("week"), v.literal("month"))),
  calendarColorBy: v.optional(
    v.union(v.literal("space"), v.literal("status"), v.literal("health")),
  ),
  timelineScale: v.optional(
    v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month"),
      v.literal("quarter"),
    ),
  ),
  showUnscheduled: v.optional(v.boolean()),
  dashboardWidgets: v.optional(v.array(savedViewDashboardWidgetValidator)),
});

export const savedViewConfigValidator = v.object({
  groupBy: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  search: v.optional(v.string()),
  density: v.optional(v.union(v.literal("compact"), v.literal("normal"))),
  showFields: v.optional(v.boolean()),
  filters: v.optional(v.array(savedViewFilterValidator)),
  columns: v.optional(v.array(savedViewColumnValidator)),
  columnWidths: v.optional(v.record(v.string(), v.number())),
  columnVisibility: v.optional(v.record(v.string(), v.boolean())),
  columnOrder: v.optional(v.array(v.string())),
  project: v.optional(projectSavedViewSettingsValidator),
});

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

import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const customFieldRecordTypeSchema = z.enum([
  "client",
  "project",
  "deal",
  "task",
  "media",
  "space",
  "calendarEvent",
  "doc",
  "opportunity",
]);

export const customFieldDefinitionSchema = z.object({
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  description: optionalTrimmedText,
  type: z.enum([
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
  ]),
  required: z.boolean().default(false),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        color: z.optional(z.string()),
        order: z.number(),
        archivedAt: z.optional(z.number()),
      }),
    )
    .optional(),
  appliesTo: z
    .array(customFieldRecordTypeSchema)
    .min(1),
  defaultValue: z.any().optional(),
  display: z
    .object({
      formSection: z.optional(z.string()),
      tableVisible: z.boolean().default(false),
      boardVisible: z.boolean().default(false),
      detailVisible: z.boolean().default(true),
      requiredOnCreate: z.boolean().default(false),
    })
    .optional(),
  order: z.number().optional(),
});

export const customFieldValueSchema = z.object({
  fieldDefinitionId: z.string().trim().min(1),
  fieldKey: z.string().trim().min(1),
  recordType: customFieldRecordTypeSchema,
  recordId: z.string().trim().min(1),
  type: z.enum([
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
  ]),
  textValue: z.string().optional(),
  numberValue: z.number().optional(),
  currencyValue: z.number().optional(),
  booleanValue: z.boolean().optional(),
  dateValue: z.string().optional(),
  dateTimeValue: z.string().optional(),
  selectValue: z.string().optional(),
  multiSelectValue: z.array(z.string()).optional(),
  userValue: z.string().optional(),
  urlValue: z.string().optional(),
});

export type CustomFieldDefinitionInput = z.infer<typeof customFieldDefinitionSchema>;
export type CustomFieldValueInput = z.infer<typeof customFieldValueSchema>;
export type CustomFieldRecordTypeInput = z.infer<typeof customFieldRecordTypeSchema>;

import { z } from "zod";

const stringId = z.string().min(1);
const optionalText = z.string().optional();
const listSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
  search: z.string().trim().max(160).optional(),
  cursor: z.string().nullable().optional(),
}).passthrough();
const visibilitySchema = z.enum(["private", "team", "workspace"]).optional();
const clientContactText = z.string().trim().optional().transform((value) => value || undefined);
export const organizationIdentityInputSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  logo: z.string().trim().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).passthrough();
export const organizationProfileInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  legalName: z.string().trim().max(180),
  type: z.string().trim().max(80),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(40),
  website: z.string().trim().max(120),
  address: z.string().trim().max(240),
}).passthrough();
export const invitationInputSchema = z.object({
  email: z.string().trim().email(),
  role: z.string().trim().min(1).max(80),
}).passthrough();
export const memberRoleInputSchema = z.object({
  memberId: stringId,
  role: z.string().trim().min(1).max(80),
}).passthrough();
export const memberRemoveInputSchema = z.object({
  memberIdOrEmail: stringId,
}).passthrough();
const rolePermissionSchema = z.record(z.string(), z.array(z.string().trim().min(1)).max(20));
export const roleCreateInputSchema = z.object({
  role: z.string().trim().min(1).max(80),
  permission: rolePermissionSchema,
}).passthrough();
export const roleUpdateInputSchema = z.object({
  roleId: stringId,
  roleName: z.string().trim().min(1).max(80).optional(),
  permission: rolePermissionSchema.optional(),
}).passthrough();
export const clientInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["person", "organization"]),
  email: optionalText,
  phone: optionalText,
  company: optionalText,
  contactName: optionalText,
  website: optionalText,
  notes: optionalText,
  source: z.string(),
  status: z.enum(["new", "active", "nurture", "inactive", "archived"]),
  visibility: visibilitySchema,
}).passthrough();
export const clientCreateInputSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["person", "organization"]).default("person"),
  email: clientContactText,
  phone: clientContactText,
  company: clientContactText,
  contactName: clientContactText,
  website: clientContactText,
  notes: clientContactText,
  source: z.string().trim().default("agent"),
  status: z.enum(["new", "active", "nurture", "inactive", "archived"]).default("new"),
  visibility: visibilitySchema,
}).passthrough().superRefine((value, context) => {
  if (!value.email && !value.phone) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide either email or phone for the client.",
      path: ["email"],
    });
  }
});
export const projectInputSchema = z.object({
  name: z.string().min(1),
  clientId: stringId.optional(),
  opportunityId: stringId.optional(),
  status: z.enum(["planned", "active", "paused", "completed", "archived"]),
  health: z.enum(["onTrack", "atRisk", "blocked"]).default("onTrack"),
  visibility: visibilitySchema,
  budget: z.number().optional(),
  currency: optionalText,
  description: optionalText,
}).passthrough();
export const calendarInputSchema = z.object({
  title: z.string().min(1),
  ownerUserId: optionalText,
  clientId: stringId.optional(),
  projectId: stringId.optional(),
  taskId: stringId.optional(),
  startAt: z.number(),
  endAt: z.number(),
  type: z.enum(["meeting", "deadline", "reminder", "milestone", "focusBlock"]),
  status: z.enum(["confirmed", "pending", "draft"]),
  location: optionalText,
  meetingUrl: optionalText,
  notes: optionalText,
  tags: z.array(z.string()).optional(),
}).passthrough();
export const taskInputSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["todo", "inProgress", "waiting", "done", "canceled"]),
  visibility: visibilitySchema,
  priority: z.enum(["low", "normal", "high", "urgent"]),
  assigneeUserId: optionalText,
  clientId: stringId.optional(),
  projectId: stringId.optional(),
  dueDate: optionalText,
  description: optionalText,
}).passthrough();
export const notificationScheduleInputSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  category: z.enum(["calendar", "task", "manual", "organization"]).default("manual"),
  scheduledAt: z.number(),
  timezone: optionalText,
  recurrence: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]),
    interval: z.number().int().min(1).max(30),
    untilAt: z.number().optional(),
  }).optional(),
}).passthrough();

export function cleanInput<T extends z.ZodRawShape>(schema: z.ZodObject<T>, value: unknown) {
  return schema.strip().parse(value);
}

const presentedDatabaseFields = [
  "_id",
  "_creationTime",
  "id",
  "organizationId",
  "createdByUserId",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "isDeleted",
  "syncState",
  "added",
  "lastContact",
  "nextActionDate",
  "appointmentTime",
];

export function stripPresentedDatabaseFields(value: Record<string, unknown>) {
  const clean = { ...value };
  for (const field of presentedDatabaseFields) {
    delete clean[field];
  }
  return clean;
}

export const toolInputSchemas: Record<string, z.ZodTypeAny> = {
  organization_info: z.object({}).passthrough(),
  organization_update_identity: organizationIdentityInputSchema,
  organization_update_profile: organizationProfileInputSchema,
  members_update_role: memberRoleInputSchema,
  members_remove: memberRemoveInputSchema,
  invitations_create: invitationInputSchema,
  invitations_cancel: z.object({ invitationId: stringId }).passthrough(),
  roles_list: z.object({}).passthrough(),
  roles_create: roleCreateInputSchema,
  roles_update: roleUpdateInputSchema,
  roles_delete: z.object({ roleId: stringId }).passthrough(),
  clients_list: listSchema,
  clients_get: z.object({ clientId: stringId }).passthrough(),
  clients_create: clientCreateInputSchema,
  clients_update: clientInputSchema.partial().extend({ clientId: stringId }).passthrough(),
  clients_delete: z.object({ clientId: stringId }).passthrough(),
  projects_list: listSchema,
  projects_get: z.object({ projectId: stringId }).passthrough(),
  projects_create: projectInputSchema,
  projects_update: projectInputSchema.partial().extend({ projectId: stringId }).passthrough(),
  projects_delete: z.object({ projectId: stringId }).passthrough(),
  calendar_list_today: z.object({ limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  calendar_list_range: z.object({ startAt: z.number(), endAt: z.number(), limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  calendar_list_month: z.object({ year: z.number(), month: z.number().min(1).max(12), limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  calendar_get: z.object({ eventId: stringId }).passthrough(),
  calendar_create: calendarInputSchema,
  calendar_update: calendarInputSchema.partial().extend({ eventId: stringId }).passthrough(),
  calendar_delete: z.object({ eventId: stringId }).passthrough(),
  notifications_schedule: notificationScheduleInputSchema,
  notifications_update_schedule: notificationScheduleInputSchema.extend({ scheduleId: stringId }).passthrough(),
  notifications_cancel_schedule: z.object({ scheduleId: stringId }).passthrough(),
  tasks_list: z.object({ assigneeUserId: stringId.optional(), limit: z.number().int().min(1).max(50).optional(), search: z.string().trim().max(160).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  tasks_get: z.object({ taskId: stringId }).passthrough(),
  tasks_create: taskInputSchema,
  tasks_update: taskInputSchema.partial().extend({ taskId: stringId }).passthrough(),
  tasks_complete: z.object({ taskId: stringId }).passthrough(),
  tasks_delete: z.object({ taskId: stringId }).passthrough(),
  media_list: z.object({ resourceType: z.enum(["project", "client", "calendarEvent", "task"]), resourceId: stringId, limit: z.number().int().min(1).max(50).optional(), cursor: z.string().nullable().optional() }).passthrough(),
  media_attach_url: z.object({
    resourceType: z.enum(["project", "client", "calendarEvent", "task"]),
    resourceId: stringId,
    url: z.string().url(),
    name: z.string().min(1),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    kind: z.enum(["image", "document", "video"]).optional(),
    isCover: z.boolean().optional(),
  }).passthrough(),
};

export function compact(value: unknown, maxItems = 50) {
  if (Array.isArray(value)) return value.slice(0, maxItems);
  if (value && typeof value === "object" && "page" in value && Array.isArray((value as { page?: unknown }).page)) {
    return { ...value, page: (value as { page: unknown[] }).page.slice(0, maxItems) };
  }
  return value;
}

export function limit(input: { limit?: number }) {
  return Math.max(1, Math.min(input.limit ?? 25, 50));
}

export function pagination(input: { limit?: number; cursor?: string | null }) {
  return { numItems: limit(input), cursor: input.cursor ?? null };
}

export function taskToolSearchResults<TTask extends { title?: string; notes?: string }>(
  tasks: TTask[],
  searchInput: unknown,
) {
  const search = typeof searchInput === "string" ? searchInput.trim().toLowerCase() : "";
  return search
    ? tasks.filter((task) => [task.title, task.notes].some((value) => value?.toLowerCase().includes(search)))
    : tasks;
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { startAt: start.getTime(), endAt: end.getTime() };
}

export function extensionName(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").filter(Boolean).at(-1);
    return name ? decodeURIComponent(name) : "External document";
  } catch {
    return "External document";
  }
}

export function mediaKind(input: { kind?: "image" | "document" | "video"; mimeType?: string }) {
  if (input.kind) return input.kind;
  if (input.mimeType?.startsWith("image/")) return "image";
  if (input.mimeType?.startsWith("video/")) return "video";
  return "document";
}

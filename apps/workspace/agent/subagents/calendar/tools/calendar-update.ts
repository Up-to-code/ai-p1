import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { stripDatabaseFields } from "../../../lib/update-entity";

const databaseFields = [
  "_id", "_creationTime", "id", "organizationId", "createdByUserId",
  "createdAt", "updatedAt", "deletedAt", "isDeleted", "syncState",
  "added", "lastContact", "nextActionDate", "appointmentTime",
];

export default defineTool({
  description: "Update an existing calendar event.",
  inputSchema: z.object({
    eventId: z.string().min(1),
    title: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    taskId: z.string().min(1).optional(),
    startAt: z.number().optional(),
    endAt: z.number().optional(),
    type: z.enum(["meeting", "deadline", "reminder", "milestone", "focusBlock"]).optional(),
    status: z.enum(["confirmed", "pending", "draft"]).optional(),
    location: z.string().optional(),
    meetingUrl: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    const existing = await fetchAuthQuery(ctx, api.calendar.read.get, {
      organizationId,
      eventId: (args as Record<string, unknown>).eventId as never,
    });
    if (!existing) throw new Error("Calendar event was not found.");
    const { eventId: _eventId, ...patch } = args as Record<string, unknown>;
    const clean = { ...existing } as Record<string, unknown>;
    for (const field of databaseFields) delete clean[field];
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) clean[key] = value;
    }
    return fetchAuthMutation(ctx, api.calendar.write.updateFromHono, {
      organizationId,
      eventId: (args as Record<string, unknown>).eventId as never,
      input: clean as never,
    });
  },
});

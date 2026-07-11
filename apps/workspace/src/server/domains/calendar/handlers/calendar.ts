import { createDomainRouter } from "@/server/utils/create-domain-router";
import { calendarEventPayloadSchema, floatingDateTimeToTimestamp } from "../validation/calendar.schema";
import { api } from "@convex/_generated/api";
import type { CalendarEventPayload } from "../validation/calendar.schema";

function toConvexInput(input: CalendarEventPayload) {
  const startAt = floatingDateTimeToTimestamp(input.date, input.time);
  return {
    title: input.title,
    ownerUserId: input.ownerUserId,
    clientId: input.clientId,
    projectId: input.projectId,
    taskId: input.taskId,
    documentId: input.documentId,
    startAt,
    endAt: startAt + input.durationMinutes * 60_000,
    type: input.type,
    status: input.status,
    ...(input.attendeeUserIds ? { attendeeUserIds: input.attendeeUserIds } : {}),
    ...(input.externalAttendees ? { externalAttendees: input.externalAttendees } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.meetingUrl ? { meetingUrl: input.meetingUrl } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
  };
}

export const { handleCreate: handleCreateCalendarEvent, handleUpdate: handleUpdateCalendarEvent, handleDelete: handleDeleteCalendarEvent } = createDomainRouter({
  resourceName: "event",
  createSchema: calendarEventPayloadSchema,
  updateSchema: calendarEventPayloadSchema,
  resourceIdParam: "eventId",
  convex: {
    create: api.calendar.write.createFromHono,
    update: api.calendar.write.updateFromHono,
    delete: api.calendar.write.deleteFromHono,
  },
  toConvexInput: { create: toConvexInput, update: toConvexInput },
});

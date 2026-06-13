import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import { floatingDateTimeToTimestamp, type CalendarEventPayload } from "../validation/calendar.schema";

function toConvexInput(input: CalendarEventPayload) {
  const startAt = floatingDateTimeToTimestamp(input.date, input.time);
  return {
    title: input.title,
    ownerUserId: input.ownerUserId,
    clientId: input.clientId,
    projectId: input.projectId,
    taskId: input.taskId,
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

export async function createCalendarEvent(organizationId: string, input: CalendarEventPayload) {
  return fetchAuthMutation(api.calendar.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateCalendarEvent(organizationId: string, eventId: string, input: CalendarEventPayload) {
  return fetchAuthMutation(api.calendar.write.updateFromHono, {
    organizationId,
    eventId: eventId as never,
    input: toConvexInput(input),
  });
}

export async function deleteCalendarEvent(organizationId: string, eventId: string) {
  return fetchAuthMutation(api.calendar.write.deleteFromHono, {
    organizationId,
    eventId: eventId as never,
  });
}

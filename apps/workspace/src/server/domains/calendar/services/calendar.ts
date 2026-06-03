import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-workos/server";
import { floatingDateTimeToTimestamp, type CalendarEventPayload } from "../validation/calendar.schema";

function toConvexInput(input: CalendarEventPayload) {
  const propertyId = input.propertyId ?? input.unitId;
  return {
    title: input.title,
    owner: input.owner,
    startAt: floatingDateTimeToTimestamp(input.date, input.time),
    type: input.type,
    status: input.status,
    ...(input.clientId ? { clientId: input.clientId as never } : {}),
    ...(propertyId ? { propertyId: propertyId as never } : {}),
    ...(input.projectId ? { projectId: input.projectId as never } : {}),
    ...(input.taskId ? { taskId: input.taskId as never } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.customFields ? { customFields: input.customFields } : {}),
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

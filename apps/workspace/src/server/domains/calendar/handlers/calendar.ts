import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { calendarEventPayloadSchema } from "../validation/calendar.schema";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "../services/calendar";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Calendar action failed.");
}

export async function handleCreateCalendarEvent(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, calendarEventPayloadSchema, "Invalid calendar payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const event = await createCalendarEvent(organizationId, parsed.data);
    return c.json({ event });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateCalendarEvent(c: Context) {
  const organizationId = c.req.param("organizationId");
  const eventId = c.req.param("eventId");
  if (!organizationId || !eventId) return c.json({ error: "Organization and event ids are required." }, 400);
  const parsed = await validateJsonBody(c, calendarEventPayloadSchema, "Invalid calendar payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const event = await updateCalendarEvent(organizationId, eventId, parsed.data);
    return c.json({ event });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteCalendarEvent(c: Context) {
  const organizationId = c.req.param("organizationId");
  const eventId = c.req.param("eventId");
  if (!organizationId || !eventId) return c.json({ error: "Organization and event ids are required." }, 400);

  try {
    const result = await deleteCalendarEvent(organizationId, eventId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

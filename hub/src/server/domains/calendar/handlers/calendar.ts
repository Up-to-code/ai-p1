import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { calendarEventPayloadSchema } from "../validation/calendar.schema";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "../services/calendar";

function handleError(c: Context, error: unknown) {
  const message = error instanceof Error ? error.message : "Calendar action failed.";
  return c.json({ error: message }, 500 as ContentfulStatusCode);
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

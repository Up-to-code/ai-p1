import { createCrudHandlers } from "@/server/utils/handler-factory";
import { calendarEventPayloadSchema } from "../validation/calendar.schema";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "../services/calendar";

export const { handleCreate: handleCreateCalendarEvent, handleUpdate: handleUpdateCalendarEvent, handleDelete: handleDeleteCalendarEvent } = createCrudHandlers({
  resourceName: "event",
  createSchema: calendarEventPayloadSchema,
  updateSchema: calendarEventPayloadSchema,
  resourceIdParam: "eventId",
  service: { create: createCalendarEvent, update: updateCalendarEvent, delete: deleteCalendarEvent },
});

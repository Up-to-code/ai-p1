import type { Doc } from "../_generated/dataModel";
import { isoDate, isoTime, presentWorkspaceRecord } from "../shared/present";

export function presentCalendarEvent(event: Doc<"calendarEvents">) {
  return {
    ...presentWorkspaceRecord(event),
    date: isoDate(event.startAt),
    time: isoTime(event.startAt),
  };
}

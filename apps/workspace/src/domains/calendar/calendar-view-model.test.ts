import { describe, expect, it } from "vitest";
import {
  calendarDateOptions,
  calendarDayMonthLabel,
  calendarEventsForTimeSlot,
  calendarIsoOptionLabel,
  calendarLongDayLabel,
  calendarLongDayYearLabel,
  calendarShortMonthLabel,
  calendarTasksForClient,
  calendarTimeOptions,
  orderedCalendarEvents,
  visibleCalendarPickerOptions,
} from "./calendar-view-model";

describe("calendar view-model", () => {
  it("formats calendar date labels through one Module", () => {
    const date = new Date(2026, 4, 28);

    expect(calendarShortMonthLabel(date, "en-US")).toBe("May");
    expect(calendarDayMonthLabel(date, "en-US")).toBe("May 28");
    expect(calendarLongDayLabel(date, "en-US")).toBe("Thursday, May 28");
    expect(calendarLongDayYearLabel(date, "en-US")).toBe("Thursday, May 28, 2026");
    expect(calendarIsoOptionLabel("2026-05-28", "en-US")).toBe("Thu, May 28, 2026");
  });

  it("builds date options and preserves selected out-of-range dates", () => {
    const today = new Date(2026, 4, 28);

    expect(calendarDateOptions(today, undefined, 3)).toEqual(["2026-05-28", "2026-05-29", "2026-05-30"]);
    expect(calendarDateOptions(today, "2026-06-15", 3)).toEqual([
      "2026-06-15",
      "2026-05-28",
      "2026-05-29",
      "2026-05-30",
    ]);
  });

  it("builds time options and preserves selected custom times", () => {
    expect(calendarTimeOptions("09:30")[0]).toBe("08:00");
    expect(calendarTimeOptions("07:45").slice(0, 2)).toEqual(["07:45", "08:00"]);
  });

  it("filters tasks by selected client", () => {
    const tasks = [
      { id: "t1", clientId: "client-1" },
      { id: "t2", clientId: "client-2" },
      { id: "t3", clientId: null },
    ];

    expect(calendarTasksForClient(tasks, undefined).map((task) => task.id)).toEqual(["t1", "t2", "t3"]);
    expect(calendarTasksForClient(tasks, "client-1").map((task) => task.id)).toEqual(["t1"]);
  });

  it("filters picker options by label", () => {
    const options = [
      { id: "1", label: "Noura Ahmed" },
      { id: "2", label: "North Gate" },
      { id: "3", label: "Site Visit" },
    ];

    expect(visibleCalendarPickerOptions(options, "").map((option) => option.id)).toEqual(["1", "2", "3"]);
    expect(visibleCalendarPickerOptions(options, "north").map((option) => option.id)).toEqual(["2"]);
  });

  it("orders calendar events without mutating the input", () => {
    const events = [
      { id: "later", time: "11:00" },
      { id: "earlier", time: "09:30" },
      { id: "middle", time: "10:00" },
    ];

    expect(orderedCalendarEvents(events).map((event) => event.id)).toEqual(["earlier", "middle", "later"]);
    expect(events.map((event) => event.id)).toEqual(["later", "earlier", "middle"]);
  });

  it("projects events into half-hour time slots in agenda order", () => {
    const events = [
      { id: "next-slot", time: "09:30" },
      { id: "slot-late", time: "09:20" },
      { id: "slot-early", time: "09:00" },
      { id: "previous-slot", time: "08:59" },
    ];

    expect(calendarEventsForTimeSlot(events, "09:00").map((event) => event.id)).toEqual([
      "slot-early",
      "slot-late",
    ]);
  });
});

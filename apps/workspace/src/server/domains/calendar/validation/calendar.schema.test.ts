import { describe, expect, it } from "vitest";
import { calendarEventPayloadSchema, floatingDateTimeToTimestamp } from "./calendar.schema";

describe("calendar validation", () => {
  it("accepts workspace event context", () => {
    const parsed = calendarEventPayloadSchema.parse({
      title: "Asset review",
      ownerUserId: "user_123",
      date: "2026-05-10",
      time: "14:30",
      type: "meeting",
      status: "confirmed",
      durationMinutes: 45,
      tags: ["review"],
    });

    expect(parsed.ownerUserId).toBe("user_123");
    expect(parsed.durationMinutes).toBe(45);
    expect(parsed.tags).toEqual(["review"]);
  });

  it("accepts business event types", () => {
    for (const type of ["meeting", "deadline", "document", "reminder", "milestone", "focusBlock"] as const) {
      const parsed = calendarEventPayloadSchema.parse({
        title: "Client work",
        ownerUserId: "user_123",
        date: "2026-05-10",
        time: "14:30",
        type,
        status: "confirmed",
      });

      expect(parsed.type).toBe(type);
    }
  });

  it("trims and removes empty tags", () => {
    const parsed = calendarEventPayloadSchema.parse({
      title: "Client call",
      ownerUserId: "user_123",
      date: "2026-05-10",
      time: "14:30",
      type: "meeting",
      status: "confirmed",
      tags: [" Channel ", " "],
    });

    expect(parsed.tags).toEqual(["Channel"]);
  });

  it("allows missing tags and workspace event types", () => {
    const parsed = calendarEventPayloadSchema.parse({
      title: "Asset review",
      ownerUserId: "user_123",
      date: "2026-05-10",
      time: "14:30",
      type: "deadline",
      status: "confirmed",
    });

    expect(parsed.tags).toBeUndefined();
    expect(parsed.type).toBe("deadline");
  });

  it("stores floating workspace date/time without timezone drift", () => {
    expect(new Date(floatingDateTimeToTimestamp("2026-05-10", "14:30")).toISOString()).toBe("2026-05-10T14:30:00.000Z");
  });
});

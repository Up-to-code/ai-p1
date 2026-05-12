import { describe, expect, it } from "vitest";
import { calendarEventPayloadSchema, floatingDateTimeToTimestamp } from "./calendar.schema";

describe("calendar validation", () => {
  it("accepts client-linked event context", () => {
    const parsed = calendarEventPayloadSchema.parse({
      title: "Unit viewing",
      owner: "Abdullah Al-Faisal",
      date: "2026-05-10",
      time: "14:30",
      type: "site-viewing",
      status: "confirmed",
      clientId: "client_123",
      unitId: "unit_123",
      taskId: "",
    });

    expect(parsed.clientId).toBe("client_123");
    expect(parsed.unitId).toBe("unit_123");
    expect(parsed.taskId).toBeUndefined();
  });

  it("accepts business event types", () => {
    for (const type of ["visit", "call", "meeting", "follow-up"] as const) {
      const parsed = calendarEventPayloadSchema.parse({
        title: "Client work",
        owner: "Abdullah Al-Faisal",
        date: "2026-05-10",
        time: "14:30",
        type,
        status: "confirmed",
      });

      expect(parsed.type).toBe(type);
    }
  });

  it("trims and removes empty custom fields", () => {
    const parsed = calendarEventPayloadSchema.parse({
      title: "Client call",
      owner: "Abdullah Al-Faisal",
      date: "2026-05-10",
      time: "14:30",
      type: "call",
      status: "confirmed",
      customFields: [
        { label: " Channel ", value: " WhatsApp " },
        { label: " ", value: "" },
      ],
    });

    expect(parsed.customFields).toEqual([{ label: "Channel", value: "WhatsApp" }]);
  });

  it("allows missing custom fields and legacy event types", () => {
    const parsed = calendarEventPayloadSchema.parse({
      title: "Unit viewing",
      owner: "Abdullah Al-Faisal",
      date: "2026-05-10",
      time: "14:30",
      type: "site-viewing",
      status: "confirmed",
    });

    expect(parsed.customFields).toBeUndefined();
    expect(parsed.type).toBe("site-viewing");
  });

  it("stores floating workspace date/time without timezone drift", () => {
    expect(new Date(floatingDateTimeToTimestamp("2026-05-10", "14:30")).toISOString()).toBe("2026-05-10T14:30:00.000Z");
  });
});

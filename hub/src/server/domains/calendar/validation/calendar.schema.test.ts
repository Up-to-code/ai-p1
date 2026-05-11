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

  it("stores floating workspace date/time without timezone drift", () => {
    expect(new Date(floatingDateTimeToTimestamp("2026-05-10", "14:30")).toISOString()).toBe("2026-05-10T14:30:00.000Z");
  });
});

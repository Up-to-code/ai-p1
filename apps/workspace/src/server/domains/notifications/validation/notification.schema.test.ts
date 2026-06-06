import { describe, expect, it } from "vitest";
import {
  notificationPreferenceSchema,
  notificationScheduleSchema,
  pushDeviceSchema,
} from "./notification.schema";

describe("notification route validation", () => {
  it("accepts a bounded preference payload with quiet hours", () => {
    const parsed = notificationPreferenceSchema.parse({
      enabled: true,
      categories: {
        calendar: true,
        task: true,
        manual: false,
        organization: true,
      },
      quietHours: {
        enabled: true,
        startMinute: 22 * 60,
        endMinute: 7 * 60,
        timezone: "Africa/Cairo",
      },
      reminderRules: [
        {
          id: "calendar-before-30",
          sourceType: "calendarEvent",
          trigger: "before_start",
          offsetMinutes: 30,
          enabled: true,
        },
      ],
    });

    expect(parsed.quietHours?.timezone).toBe("Africa/Cairo");
  });

  it("rejects invalid quiet-hour minutes and oversized rule sets", () => {
    expect(() => notificationPreferenceSchema.parse({
      enabled: true,
      categories: {
        calendar: true,
        task: true,
        manual: true,
        organization: true,
      },
      quietHours: {
        enabled: true,
        startMinute: -1,
        endMinute: 1440,
        timezone: "Africa/Cairo",
      },
      reminderRules: Array.from({ length: 21 }, (_, index) => ({
        id: `rule-${index}`,
        sourceType: "calendarEvent",
        trigger: "before_start",
        offsetMinutes: 5,
        enabled: true,
      })),
    })).toThrow();
  });

  it("validates device registration payloads", () => {
    expect(pushDeviceSchema.parse({
      pushToken: "ExponentPushToken[abc]",
      installationId: "qentrah-device",
      platform: "ios",
      appVersion: "0.1.0",
    })).toMatchObject({ platform: "ios" });

    expect(() => pushDeviceSchema.parse({
      pushToken: "",
      installationId: "",
      platform: "",
    })).toThrow();
  });

  it("accepts manual recurring schedules and rejects invalid intervals", () => {
    expect(notificationScheduleSchema.parse({
      title: "Meeting reminder",
      body: "Client visit starts soon.",
      scheduledAt: Date.UTC(2026, 5, 6, 12, 0, 0),
      timezone: "Africa/Cairo",
      recurrence: {
        frequency: "weekly",
        interval: 2,
      },
    }).category).toBe("manual");

    expect(() => notificationScheduleSchema.parse({
      title: "Bad",
      body: "Invalid interval.",
      scheduledAt: Date.UTC(2026, 5, 6, 12, 0, 0),
      recurrence: {
        frequency: "daily",
        interval: 0,
      },
    })).toThrow();
  });
});

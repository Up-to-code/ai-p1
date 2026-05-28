import { describe, expect, it } from "vitest";
import {
  activityActionLabel,
  activityCategoryTone,
  activityRelativeTime,
  shortActivityActor,
  type AuditCategory,
} from "./activity-view-model";

describe("activity view-model", () => {
  it("maps audit categories to status tones", () => {
    const tones = new Map<AuditCategory, ReturnType<typeof activityCategoryTone>>([
      ["projects", "success"],
      ["properties", "success"],
      ["clients", "info"],
      ["calendar", "info"],
      ["media", "info"],
      ["invites", "warning"],
      ["people", "danger"],
      ["roles", "danger"],
      ["organization", "neutral"],
    ]);

    for (const [category, tone] of tones) {
      expect(activityCategoryTone(category)).toBe(tone);
    }
  });

  it("projects readable action labels while preserving existing organization filtering", () => {
    expect(activityActionLabel("organization.member_invited")).toBe("member invited");
    expect(activityActionLabel("projects.unit_price_updated")).toBe("projects unit price updated");
  });

  it("shortens long actor identifiers only when needed", () => {
    expect(shortActivityActor("user-1234567")).toBe("user-1234567");
    expect(shortActivityActor("abcdef1234567890wxyz")).toBe("abcdef...wxyz");
  });

  it("formats relative time from an injected clock", () => {
    const now = Date.parse("2026-05-28T12:00:00.000Z");

    expect(activityRelativeTime(now - 60_000, "en", now)).toBe("1 minute ago");
    expect(activityRelativeTime(now + 60 * 60 * 1000, "en", now)).toBe("in 1 hour");
  });
});

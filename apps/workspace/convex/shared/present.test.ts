import { describe, expect, it } from "vitest";
import { isoDate, isoTime, timestampMilliseconds } from "./present";

describe("calendar timestamp presentation", () => {
  it("normalizes legacy Unix-second timestamps", () => {
    expect(timestampMilliseconds(1_788_884_400)).toBe(1_788_884_400_000);
    expect(isoDate(1_788_884_400)).toBe("2026-09-08");
    expect(isoTime(1_788_884_400)).toBe("16:20");
  });

  it("preserves current millisecond timestamps", () => {
    expect(timestampMilliseconds(1_788_884_400_000)).toBe(1_788_884_400_000);
    expect(isoDate(1_788_884_400_000)).toBe("2026-09-08");
  });
});

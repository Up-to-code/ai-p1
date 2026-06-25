import { describe, expect, it } from "vitest";
import { expiryTimestamp } from "./expiry-timestamp";

describe("expiryTimestamp", () => {
  const now = 1_700_000_000_000;

  it("returns undefined for open-ended access", () => {
    expect(expiryTimestamp("never", now)).toBeUndefined();
  });

  it("adds the requested duration in milliseconds", () => {
    expect(expiryTimestamp("5h", now)).toBe(now + 5 * 60 * 60 * 1000);
    expect(expiryTimestamp("14d", now)).toBe(now + 14 * 24 * 60 * 60 * 1000);
    expect(expiryTimestamp("30d", now)).toBe(now + 30 * 24 * 60 * 60 * 1000);
  });
});

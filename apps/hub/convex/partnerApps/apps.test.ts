import { describe, expect, it } from "vitest";
import {
  PARTNER_CONNECTION_TTL_MS,
  partnerConnectionEffectiveStatus,
  partnerConnectionExpiresAt,
} from "./apps";

describe("partner organization connections", () => {
  it("defaults organization authorization to 14 days", () => {
    const now = Date.UTC(2026, 4, 12);

    expect(partnerConnectionExpiresAt(now)).toBe(now + PARTNER_CONNECTION_TTL_MS);
    expect(PARTNER_CONNECTION_TTL_MS).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it("reports active connections as expired after expiresAt", () => {
    expect(partnerConnectionEffectiveStatus({ status: "active", expiresAt: 100 }, 101)).toBe("expired");
    expect(partnerConnectionEffectiveStatus({ status: "paused", expiresAt: 100 }, 101)).toBe("paused");
  });
});

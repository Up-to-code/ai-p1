import { describe, expect, it } from "vitest";
import {
  AUTH_HANDOFF_TTL_MS,
  createAuthHandoff,
  decodeAuthHandoff,
  encodeAuthHandoff,
} from "./auth-handoff";

describe("auth handoff", () => {
  it("round-trips a recent organization handoff", () => {
    const handoff = createAuthHandoff("org_1", 1_000);
    expect(decodeAuthHandoff(encodeAuthHandoff(handoff), 1_500)).toEqual(handoff);
  });

  it("ignores expired handoffs", () => {
    const handoff = createAuthHandoff("org_1", 1_000);
    expect(decodeAuthHandoff(encodeAuthHandoff(handoff), 1_000 + AUTH_HANDOFF_TTL_MS + 1)).toBeNull();
  });

  it("ignores malformed handoffs", () => {
    expect(decodeAuthHandoff(null)).toBeNull();
    expect(decodeAuthHandoff("not json")).toBeNull();
    expect(decodeAuthHandoff(JSON.stringify({ createdAt: 1_000 }), 1_500)).toBeNull();
    expect(decodeAuthHandoff(JSON.stringify({ organizationId: "org_1" }), 1_500)).toBeNull();
  });
});

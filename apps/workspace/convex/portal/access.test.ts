import { describe, expect, it } from "vitest";
import { hashPortalToken } from "./access";

describe("portal session token hashing", () => {
  it("is deterministic without persisting the bearer secret", async () => {
    const token = "a".repeat(64), hash = await hashPortalToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(await hashPortalToken(token));
    expect(hash).not.toContain(token);
  });
});

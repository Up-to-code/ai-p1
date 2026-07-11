import { describe, expect, it, vi } from "vitest";
import { connectionKeys } from "./connectionKeys";

describe("MCP connection keys", () => {
  it("creates a hashed token and validates it without storing the secret", async () => {
    const created = await connectionKeys.create({} as never, {
      namespace: "organization:org_1:mcp:user:user_1",
    });
    const stored = {
      _id: "connection_1",
      organizationId: "org_1",
      keyId: created.keyId,
      tokenHash: created.tokenHash,
    };
    const ctx = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn((_name: string, build: (query: { eq: () => unknown }) => unknown) => {
            build({ eq: () => undefined });
            return { first: vi.fn(async () => stored) };
          }),
        })),
      },
    };

    await expect(connectionKeys.validate(ctx as never, { token: created.token })).resolves.toMatchObject({
      ok: true,
      keyId: created.keyId,
      metadata: { organizationId: "org_1" },
    });
    expect(created.tokenHash).not.toBe(created.token);
  });
});

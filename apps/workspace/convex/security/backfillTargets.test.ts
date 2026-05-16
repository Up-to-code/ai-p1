import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBackfillPatchesForTarget } from "./backfillTargets";

describe("data security backfill target adapters", () => {
  beforeEach(() => {
    vi.stubEnv("ORGANIZATION_DATA_ENCRYPTION_KEY", "0123456789abcdef0123456789abcdef");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates idempotent soft-delete patches", async () => {
    await expect(createBackfillPatchesForTarget("clientsDeletedFlag", [
      { _id: "client_1", deletedAt: 100 },
      { _id: "client_2", isDeleted: false },
    ])).resolves.toEqual({
      patches: [{ id: "client_1", patch: { isDeleted: true } }],
      failures: [],
    });
  });

  it("skips already protected payload rows", async () => {
    await expect(createBackfillPatchesForTarget("webhookDeliveries", [
      { _id: "delivery_1", encryptedPayload: "org-aesgcm:v1:iv:ciphertext", payload: { ok: true } },
      { _id: "delivery_2", payload: undefined },
    ])).resolves.toEqual({ patches: [], failures: [] });
  });

  it("encrypts and redacts sensitive text rows", async () => {
    const result = await createBackfillPatchesForTarget("agentMessages", [
      {
        _id: "message_1",
        organizationId: "org_1",
        content: "Call +201001234567 with Bearer secret-token",
      },
    ]);

    expect(result.failures).toEqual([]);
    expect(result.patches).toHaveLength(1);
    expect(result.patches[0]).toMatchObject({
      id: "message_1",
      patch: {
        contentRedacted: true,
      },
    });
    expect(String(result.patches[0]?.patch.encryptedContent)).toMatch(/^org-aesgcm:v1:/u);
    expect(String(result.patches[0]?.patch.content)).toContain("[redacted-token]");
  });
});

import { describe, expect, it } from "vitest";
import {
  orderedOrganizationApiKeys,
  organizationApiKeyStatus,
  organizationApiKeyTtlMs,
  presentOrganizationApiKey,
} from "./organizationApiKeyLifecycle";
import type { Doc } from "./_generated/dataModel";

function apiKey(input: Partial<Doc<"organizationApiKeys">>) {
  return {
    _id: "key_1",
    _creationTime: 1,
    organizationId: "org_1",
    keyId: "kid",
    keyLast4: "1234",
    name: "Main",
    permissions: [],
    status: "active",
    createdByUserId: "user_1",
    createdAt: 1,
    updatedAt: 1,
    usageCount: 0,
    quotaWindowStartedAt: 1,
    quotaUsed: 0,
    ...input,
  } as Doc<"organizationApiKeys">;
}

describe("organization API key lifecycle", () => {
  it("projects active, expired, and revoked presentation state", () => {
    expect(organizationApiKeyStatus(apiKey({ expiresAt: 20 }), 10)).toBe("active");
    expect(organizationApiKeyStatus(apiKey({ expiresAt: 10 }), 10)).toBe("expired");
    expect(organizationApiKeyStatus(apiKey({ status: "revoked", expiresAt: 10 }), 20)).toBe("revoked");

    expect(presentOrganizationApiKey(apiKey({ expiresAt: 10, quotaUsed: 4 }), 20)).toMatchObject({
      id: "key_1",
      status: "expired",
      quotaLimit: 1000,
      quotaWindowMs: 3_600_000,
      quotaUsed: 4,
    });
  });

  it("orders API keys by recent updates", () => {
    expect(orderedOrganizationApiKeys([
      apiKey({ _id: "old" as never, updatedAt: 1 }),
      apiKey({ _id: "new" as never, updatedAt: 3 }),
      apiKey({ _id: "middle" as never, updatedAt: 2 }),
    ]).map((key) => key._id)).toEqual(["new", "middle", "old"]);
  });

  it("derives creation ttl from optional expiration", () => {
    expect(organizationApiKeyTtlMs(undefined, 100)).toBeNull();
    expect(organizationApiKeyTtlMs(150, 100)).toBe(50);
    expect(organizationApiKeyTtlMs(50, 100)).toBe(0);
  });
});

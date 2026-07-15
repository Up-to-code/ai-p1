import { describe, expect, it } from "vitest";
import {
  normalizeOrganizationApiKeyPermissions,
  organizationApiKeyExpiresAt,
} from "./api-key.schema";

describe("organization API key validation", () => {
  it("maps expiry selector values to absolute expiry timestamps", () => {
    const now = 1_700_000_000_000;

    expect(organizationApiKeyExpiresAt("5h", now)).toBe(now + 5 * 60 * 60 * 1000);
    expect(organizationApiKeyExpiresAt("14d", now)).toBe(now + 14 * 24 * 60 * 60 * 1000);
    expect(organizationApiKeyExpiresAt("30d", now)).toBe(now + 30 * 24 * 60 * 60 * 1000);
    expect(organizationApiKeyExpiresAt("never", now)).toBeUndefined();
  });

  it("deduplicates permissions and limits write-capable resources for v1", () => {
    expect(normalizeOrganizationApiKeyPermissions([
      { resource: "client", actions: ["read", "create", "read"] },
      { resource: "organization", actions: ["read"] },
    ])).toEqual([
      { resource: "client", actions: ["create", "read"] },
      { resource: "organization", actions: ["read"] },
    ]);

    expect(() => normalizeOrganizationApiKeyPermissions([
      { resource: "media", actions: ["read", "update"] },
    ])).toThrow("Only client, task, and document API keys can create or update records in v1.");

    expect(() => normalizeOrganizationApiKeyPermissions([
      { resource: "document", actions: ["read", "delete"] },
    ])).toThrow("Task and document API keys do not support delete in v1.");
  });
});

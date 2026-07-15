import { afterEach, describe, expect, it, vi } from "vitest";
import { organizationLookupFingerprint } from "./organizationData";

afterEach(() => vi.unstubAllEnvs());

describe("Organization-scoped lookup fingerprints", () => {
  it("is stable within one Organization and unlinkable across Organizations", async () => {
    vi.stubEnv("ORGANIZATION_DATA_ENCRYPTION_KEY", "test-key-with-at-least-thirty-two-characters");
    const first = await organizationLookupFingerprint("org_1", "crm-email-lookup", "person@example.com");
    const repeated = await organizationLookupFingerprint("org_1", "crm-email-lookup", "person@example.com");
    const otherOrganization = await organizationLookupFingerprint("org_2", "crm-email-lookup", "person@example.com");
    expect(first).toBe(repeated);
    expect(first).not.toBe(otherOrganization);
    expect(first).not.toContain("person@example.com");
  });
});

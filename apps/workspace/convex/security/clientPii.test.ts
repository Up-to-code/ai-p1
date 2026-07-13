import { describe, expect, it, vi } from "vitest";
import { protectClientPiiPatch } from "./clientPii";

vi.mock("./organizationData", () => ({
  protectOrganizationText: vi.fn(async (_organizationId: string, purpose: string, value: string) =>
    `encrypted:${purpose}:${value}`),
  redactSensitiveText: vi.fn((value: string) => `redacted:${value}`),
  revealOrganizationText: vi.fn(),
}));

describe("Client PII patch protection", () => {
  it("does not clear omitted PII fields", async () => {
    await expect(protectClientPiiPatch("org_1", {})).resolves.toEqual({});
  });

  it("encrypts only explicitly supplied PII fields", async () => {
    const patch = await protectClientPiiPatch("org_1", { email: "team@acme.test" });

    expect(patch).toMatchObject({
      email: "redacted:team@acme.test",
      encryptedEmail: "encrypted:client-email:team@acme.test",
      piiEncryptedAt: expect.any(Number),
    });
    expect(patch).not.toHaveProperty("phone");
    expect(patch).not.toHaveProperty("encryptedPhone");
  });

  it("explicitly clears a supplied empty PII value", async () => {
    const patch = await protectClientPiiPatch("org_1", { phone: "" });
    expect(patch).toMatchObject({ phone: undefined, encryptedPhone: undefined });
    expect(patch).toHaveProperty("piiEncryptedAt");
  });
});

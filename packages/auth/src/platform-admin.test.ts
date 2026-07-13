import { describe, expect, it } from "vitest";
import { isPlatformAdminEmail, parsePlatformAdminEmails } from "./platform-admin.js";

describe("platform admin policy", () => {
  it("normalizes and deduplicates configured addresses", () => {
    expect(parsePlatformAdminEmails(" Admin@example.com,ops@example.com,admin@example.com ")).toEqual([
      "admin@example.com",
      "ops@example.com",
    ]);
  });

  it("fails closed for missing and non-allowlisted identities", () => {
    const allowlist = "admin@example.com";

    expect(isPlatformAdminEmail(undefined, allowlist)).toBe(false);
    expect(isPlatformAdminEmail("member@example.com", allowlist)).toBe(false);
    expect(isPlatformAdminEmail("ADMIN@example.com", allowlist)).toBe(true);
  });
});

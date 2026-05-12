import { describe, expect, it } from "vitest";
import { isPlatformAdminEmail, parsePlatformAdminEmails } from "@/packages/config/auth";

describe("platform admin config", () => {
  it("parses comma-separated emails with normalization and dedupe", () => {
    expect(parsePlatformAdminEmails(" Admin@Example.com, ops@example.com , admin@example.com ,,")).toEqual([
      "admin@example.com",
      "ops@example.com",
    ]);
  });

  it("matches emails case-insensitively against the allowlist", () => {
    expect(isPlatformAdminEmail("ADMIN@example.com", ["admin@example.com"])).toBe(true);
    expect(isPlatformAdminEmail("member@example.com", ["admin@example.com"])).toBe(false);
    expect(isPlatformAdminEmail(null, ["admin@example.com"])).toBe(false);
  });
});

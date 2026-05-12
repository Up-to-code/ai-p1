import { describe, expect, it } from "vitest";
import { assertPartnerOwnsApp, normalizeRedirectUris, normalizeScopes } from "./partnerAppPolicies";

describe("partner app backend policies", () => {
  it("deduplicates and sorts scopes before persistence", () => {
    expect(normalizeScopes(["workspace:read", " apps:write ", "workspace:read"])).toEqual([
      "apps:write",
      "workspace:read",
    ]);
  });

  it("allows localhost redirects but rejects insecure remote redirects", () => {
    expect(normalizeRedirectUris([" http://localhost:3000/callback "])).toEqual(["http://localhost:3000/callback"]);
    expect(() => normalizeRedirectUris(["http://example.com/callback"])).toThrow();
  });

  it("rejects access to apps owned by another partner subject", () => {
    expect(() => assertPartnerOwnsApp({ partnerAuthSubject: "auth-user-1" }, "auth-user-2")).toThrow();
  });
});

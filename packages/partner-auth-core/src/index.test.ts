import { describe, expect, it } from "vitest";
import {
  hasPartnerScope,
  normalizePartnerScopes,
  parsePartnerAccessClaims,
  partnerDefaultScopes,
  partnerOAuthClaims,
  partnerResourceAudience,
  permissionToScope,
  scopeToPermission,
} from "./index";

describe("@qentrah/partner-auth-core", () => {
  it("maps partner scopes to organization permission checks", () => {
    expect(scopeToPermission("client:update")).toEqual({ resource: "client", action: "update" });
    expect(permissionToScope("project", "read")).toBe("project:read");
  });

  it("normalizes only supported partner permission scopes", () => {
    expect(normalizePartnerScopes([
      " client:read ",
      "client:read",
      "profile",
      "client:publish",
      "unknown:read",
      "task:create",
    ])).toEqual(["client:read", "task:create"]);
  });

  it("checks partner scopes without granting implicit wildcard access", () => {
    expect(hasPartnerScope(partnerDefaultScopes, "client", "read")).toBe(true);
    expect(hasPartnerScope(partnerDefaultScopes, "client", "create")).toBe(false);
  });

  it("parses canonical Better Auth partner access claims", () => {
    expect(parsePartnerAccessClaims({
      [partnerOAuthClaims.organizationId]: "org_1",
      azp: "partners_client_1",
      scope: "openid client:read media:update",
      [partnerOAuthClaims.partnerScopes]: ["client:read"],
    })).toEqual({
      organizationId: "org_1",
      partnersClientId: "partners_client_1",
      scopes: ["openid", "client:read", "media:update"],
      partnerScopes: ["client:read"],
    });
  });

  it("accepts client_id when azp is unavailable", () => {
    expect(parsePartnerAccessClaims({
      organization_id: "org_1",
      client_id: "partners_client_1",
      scope: "client:read",
    }).partnersClientId).toBe("partners_client_1");
  });

  it("rejects legacy organization claim aliases", () => {
    expect(() => parsePartnerAccessClaims({
      organizationId: "org_1",
      azp: "partners_client_1",
      scope: "client:read",
    })).toThrow("Legacy organization claim aliases");
    expect(() => parsePartnerAccessClaims({
      org_id: "org_1",
      azp: "partners_client_1",
      scope: "client:read",
    })).toThrow("Legacy organization claim aliases");
  });

  it("rejects missing canonical organization and client claims", () => {
    expect(() => parsePartnerAccessClaims({ azp: "client_1", scope: "client:read" })).toThrow("organization");
    expect(() => parsePartnerAccessClaims({ organization_id: "org_1", scope: "client:read" })).toThrow("client");
  });

  it("builds the canonical partner resource audience", () => {
    expect(partnerResourceAudience("https://workspace.qentrah.test/")).toBe("https://workspace.qentrah.test/api/v1/partner");
  });
});

import { describe, expect, it } from "vitest";
import {
  hasPartnerScope,
  normalizeScopes,
  partnerDefaultScopes,
  permissionToScope,
  scopeToPermission,
} from "./scopes";

describe("partner app OAuth scopes", () => {
  it("maps scopes to organization permission checks", () => {
    expect(scopeToPermission("client:update")).toEqual({ resource: "client", action: "update" });
    expect(permissionToScope("project", "read")).toBe("project:read");
  });

  it("normalizes only supported permission scopes", () => {
    expect(normalizeScopes([
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
});

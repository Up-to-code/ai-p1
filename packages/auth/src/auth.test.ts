import { describe, expect, it } from "vitest";
import { normalizeRequestedScopes } from "./scopes";
import { authContextFromClaims } from "./server/claims";
import { requireEntitlement, requireOrganization, requireResourceOwner, requireScopes } from "./server/guards";
import { AuthError } from "./types";

describe("@qentrah/auth", () => {
  it("normalizes supported OAuth scopes", () => {
    expect(normalizeRequestedScopes("email openid assets:read nope assets:read")).toEqual([
      "assets:read",
      "email",
      "openid",
    ]);
  });

  it("projects OIDC claims into an auth context", () => {
    const context = authContextFromClaims({
      sub: "user-1",
      scope: "openid assets:read",
      role: "broker",
      org_id: "org-1",
      broker_id: "broker-1",
      org_permissions: ["clients:read"],
    });

    expect(context).toMatchObject({
      userId: "user-1",
      organizationId: "org-1",
      brokerId: "broker-1",
      ownerType: "broker",
      ownerId: "broker-1",
      scopes: ["assets:read", "openid"],
    });
    expect(context.entitlements).toContain("workspace:broker");
    expect(context.entitlements).toContain("clients:read");
  });

  it("enforces scopes, entitlements, organizations, and resource ownership", () => {
    const context = authContextFromClaims({
      sub: "user-1",
      scope: "assets:read",
      entitlements: ["platform:admin"],
      org_id: "org-1",
      broker_id: "broker-1",
    });

    expect(requireScopes(context, ["assets:read"])).toBe(context);
    expect(requireEntitlement(context, "platform:admin")).toBe(context);
    expect(requireOrganization(context, "org-1")).toBe(context);
    expect(requireResourceOwner(context, { brokerId: "broker-1" })).toBe(context);
    expect(() => requireScopes(context, ["assets:create_own"])).toThrow(AuthError);
    expect(() => requireOrganization(context, "org-2")).toThrow(AuthError);
  });
});

import { describe, expect, it } from "vitest";
import { normalizeRequestedScopes } from "./scopes";
import { authContextFromClaims } from "./server/claims";
import { requireEntitlement, requireOrganization, requireResourceOwner, requireScopes } from "./server/guards";
import { AuthError } from "./types";

describe("@anan/auth", () => {
  it("normalizes supported OAuth scopes", () => {
    expect(normalizeRequestedScopes("email openid properties:read nope properties:read")).toEqual([
      "email",
      "openid",
      "properties:read",
    ]);
  });

  it("projects OIDC claims into an auth context", () => {
    const context = authContextFromClaims({
      sub: "user-1",
      scope: "openid properties:read",
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
      scopes: ["openid", "properties:read"],
    });
    expect(context.entitlements).toContain("workspace:broker");
    expect(context.entitlements).toContain("clients:read");
  });

  it("enforces scopes, entitlements, organizations, and resource ownership", () => {
    const context = authContextFromClaims({
      sub: "user-1",
      scope: "properties:read",
      entitlements: ["platform:admin"],
      org_id: "org-1",
      broker_id: "broker-1",
    });

    expect(requireScopes(context, ["properties:read"])).toBe(context);
    expect(requireEntitlement(context, "platform:admin")).toBe(context);
    expect(requireOrganization(context, "org-1")).toBe(context);
    expect(requireResourceOwner(context, { brokerId: "broker-1" })).toBe(context);
    expect(() => requireScopes(context, ["properties:create_own"])).toThrow(AuthError);
    expect(() => requireOrganization(context, "org-2")).toThrow(AuthError);
  });
});

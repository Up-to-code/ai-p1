import { describe, expect, it } from "vitest";
import { canMutateAdminResources, canUseAdminConsole, resolveAdminRoles } from "./admin-roles";

describe("admin roles", () => {
  it("resolves platform admins only from the operator allowlist", () => {
    expect(resolveAdminRoles("Owner@Qentrah.com", {
      PLATFORM_ADMIN_EMAILS: "owner@qentrah.com",
    })).toEqual(["platform_admin"]);
  });

  it("resolves read-only operational roles from dedicated env allowlists", () => {
    expect(resolveAdminRoles("sec@qentrah.com", {
      PLATFORM_ADMIN_EMAILS: "",
      PLATFORM_SECURITY_REVIEWER_EMAILS: "sec@qentrah.com",
      PLATFORM_SUPPORT_OPERATOR_EMAILS: "support@qentrah.com",
      PLATFORM_AUDIT_VIEWER_EMAILS: "audit@qentrah.com",
    })).toEqual(["security_reviewer"]);
  });

  it("keeps mutation access limited to platform admins", () => {
    expect(canUseAdminConsole(["audit_viewer"])).toBe(true);
    expect(canMutateAdminResources(["audit_viewer"])).toBe(false);
    expect(canMutateAdminResources(["platform_admin"])).toBe(true);
  });
});

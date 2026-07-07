import { describe, expect, it, vi } from "vitest";
import { evaluateOrganizationCapabilities } from "./capabilities";

describe("organization capability evaluator", () => {
  it("grants owner capabilities", () => {
    const capabilities = evaluateOrganizationCapabilities({ memberRole: "owner" });

    expect(capabilities.canUpdateOrganization).toBe(true);
    expect(capabilities.canCreateApiKeys).toBe(true);
    expect(capabilities.canDeleteClients).toBe(true);
    expect(capabilities.canManageVisibility).toBe(false);
  });

  it("keeps admin capabilities below owner-only organization and API-key writes", () => {
    const capabilities = evaluateOrganizationCapabilities({ memberRole: "admin" });

    expect(capabilities.canReadOrganization).toBe(true);
    expect(capabilities.canUpdateOrganization).toBe(false);
    expect(capabilities.canReadApiKeys).toBe(true);
    expect(capabilities.canCreateApiKeys).toBe(false);
    expect(capabilities.canCreateClients).toBe(true);
  });

  it("grants member read-only capabilities", () => {
    const capabilities = evaluateOrganizationCapabilities({ memberRole: "member" });

    expect(capabilities.canReadClients).toBe(true);
    expect(capabilities.canCreateClients).toBe(false);
    expect(capabilities.canReadProjects).toBe(true);
    expect(capabilities.canDeleteProjects).toBe(false);
  });

  it("merges dynamic role permissions", () => {
    const capabilities = evaluateOrganizationCapabilities({
      memberRole: "sales",
      dynamicRoles: [
        {
          role: "sales",
          permission: JSON.stringify({ client: ["read", "create"], task: ["read"] }),
        },
      ],
    });

    expect(capabilities.canReadClients).toBe(true);
    expect(capabilities.canCreateClients).toBe(true);
    expect(capabilities.canUpdateClients).toBe(false);
    expect(capabilities.canReadTasks).toBe(true);
  });

  it("merges object-shaped dynamic role permissions", () => {
    const capabilities = evaluateOrganizationCapabilities({
      memberRole: "operations",
      dynamicRoles: [
        {
          role: "operations",
          permission: { project: ["read", "update"], calendar: ["read"] },
        },
      ],
    });

    expect(capabilities.canReadProjects).toBe(true);
    expect(capabilities.canUpdateProjects).toBe(true);
    expect(capabilities.canDeleteProjects).toBe(false);
    expect(capabilities.canReadCalendarEvents).toBe(true);
  });

  it("denies unknown and missing member roles", () => {
    const unknown = evaluateOrganizationCapabilities({ memberRole: "does-not-exist" });
    const missing = evaluateOrganizationCapabilities({ memberRole: null });

    expect(unknown.canReadOrganization).toBe(false);
    expect(unknown.canReadClients).toBe(false);
    expect(missing.canReadOrganization).toBe(false);
    expect(missing.canReadClients).toBe(false);
  });

  it("denies invalid dynamic role JSON and reports the role", () => {
    const onInvalidDynamicRole = vi.fn();
    const capabilities = evaluateOrganizationCapabilities({
      memberRole: "sales",
      dynamicRoles: [{ role: "sales", permission: "{bad-json" }],
      onInvalidDynamicRole,
    });

    expect(capabilities.canReadClients).toBe(false);
    expect(onInvalidDynamicRole).toHaveBeenCalledWith("sales");
  });

  it("sets platform-admin-only flags separately from organization permissions", () => {
    const capabilities = evaluateOrganizationCapabilities({
      memberRole: "member",
      isPlatformAdmin: true,
    });

    expect(capabilities.isPlatformAdmin).toBe(true);
    expect(capabilities.canManageVisibility).toBe(true);
    expect(capabilities.canUpdateOrganization).toBe(false);
  });
});

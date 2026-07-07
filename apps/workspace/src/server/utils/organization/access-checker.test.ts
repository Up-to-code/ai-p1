import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@convex/_generated/api", () => ({
  api: {
    organizations: {
      workRoles: {
        list: "organizations.workRoles.list",
      },
      profile: {
        access: {
          canUpdateProfile: "organizations.profile.access.canUpdateProfile",
          canUseResourceAction: "organizations.profile.access.canUseResourceAction",
          getCapabilities: "organizations.profile.access.getCapabilities",
        },
      },
    },
  },
}));

vi.mock("@/server/auth/convex-auth", () => ({
  fetchAuthQuery: vi.fn(),
}));

vi.mock("@/server/domains/organization/services/better-auth-organization-service", () => ({
  getCurrentBetterAuthOrganizationRole: vi.fn(),
}));

import { fetchAuthQuery } from "@/server/auth/convex-auth";
import { getCurrentBetterAuthOrganizationRole } from "@/server/domains/organization/services/better-auth-organization-service";
import {
  assertCanUseOrganizationResource,
  getOrganizationCapabilities,
} from "./access-checker";

describe("organization access checker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentBetterAuthOrganizationRole).mockResolvedValue(null);
  });

  it("loads capabilities with one Convex query", async () => {
    const capabilities = {
      canReadOrganization: true,
      canUpdateOrganization: true,
      isPlatformAdmin: false,
      canManageVisibility: false,
    };
    vi.mocked(fetchAuthQuery).mockResolvedValue(capabilities);

    await expect(getOrganizationCapabilities("org_1")).resolves.toBe(capabilities);

    expect(fetchAuthQuery).toHaveBeenCalledTimes(1);
    expect(fetchAuthQuery).toHaveBeenCalledWith(
      "organizations.profile.access.getCapabilities",
      { organizationId: "org_1" },
    );
  });

  it("merges Better Auth custom work role permissions", async () => {
    vi.mocked(getCurrentBetterAuthOrganizationRole).mockResolvedValue("operations");
    vi.mocked(fetchAuthQuery).mockResolvedValue([
      {
        id: "role_1",
        organizationId: "org_1",
        role: "operations",
        permission: { client: ["read", "update"] },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    const capabilities = await getOrganizationCapabilities("org_1");

    expect(capabilities.canReadClients).toBe(true);
    expect(capabilities.canUpdateClients).toBe(true);
    expect(capabilities.canDeleteClients).toBe(false);
    expect(fetchAuthQuery).toHaveBeenCalledWith(
      "organizations.workRoles.list",
      { organizationId: "org_1" },
    );
  });

  it("keeps write/read assertions on the specific permission query", async () => {
    vi.mocked(fetchAuthQuery).mockResolvedValue({ allowed: true });

    await assertCanUseOrganizationResource("org_1", "client", "create");

    expect(fetchAuthQuery).toHaveBeenCalledWith(
      "organizations.profile.access.canUseResourceAction",
      { organizationId: "org_1", resource: "client", action: "create" },
    );
  });
});

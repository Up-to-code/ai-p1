import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@convex/_generated/api", () => ({
  api: {
    organizations: {
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

vi.mock("@/server/auth/clerk-convex", () => ({
  fetchAuthQuery: vi.fn(),
}));

import { fetchAuthQuery } from "@/server/auth/clerk-convex";
import {
  assertCanUseOrganizationResource,
  getOrganizationCapabilities,
} from "./access-checker";

describe("organization access checker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("keeps write/read assertions on the specific permission query", async () => {
    vi.mocked(fetchAuthQuery).mockResolvedValue({ allowed: true });

    await assertCanUseOrganizationResource("org_1", "client", "create");

    expect(fetchAuthQuery).toHaveBeenCalledWith(
      "organizations.profile.access.canUseResourceAction",
      { organizationId: "org_1", resource: "client", action: "create" },
    );
  });
});

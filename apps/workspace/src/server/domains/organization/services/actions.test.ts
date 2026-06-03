import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@convex/_generated/api", () => ({
  api: {
    organizations: {
      audit: {
        write: {
          recordFromHono: "organizations.audit.write.recordFromHono",
        },
      },
    },
  },
}));

vi.mock("@/server/auth/convex-workos/server", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("@/server/utils/organization/access-checker", () => ({
  assertCanUseOrganizationResource: vi.fn(),
  getOrganizationCapabilities: vi.fn(),
}));

vi.mock("./workos-organization-adapter", () => ({
  getWorkOSOrganizationSession: vi.fn(),
  listWorkOSOrganizationMembers: vi.fn(),
  removeWorkOSOrganizationMember: vi.fn(),
}));

import { fetchAuthMutation } from "@/server/auth/convex-workos/server";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";
import {
  getWorkOSOrganizationSession,
  listWorkOSOrganizationMembers,
  removeWorkOSOrganizationMember,
} from "./workos-organization-adapter";
import { removeOrganizationMember } from "./actions";

const context = {} as never;

describe("organization actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getWorkOSOrganizationSession).mockResolvedValue({
      userId: "user_owner",
      workosUserId: "user_owner",
      organizationId: "org_1",
      workosOrganizationId: "workos_org_1",
      roles: ["owner"],
      permissions: [],
      user: {
        id: "user_owner",
        email: "owner@example.com",
        name: "Owner",
      },
    });
    vi.mocked(assertCanUseOrganizationResource).mockResolvedValue(undefined);
    vi.mocked(fetchAuthMutation).mockResolvedValue(undefined);
    vi.mocked(listWorkOSOrganizationMembers).mockResolvedValue([
      {
        id: "member_owner",
        organizationId: "org_1",
        userId: "user_owner",
        role: "owner",
        createdAt: "2026-01-01T00:00:00.000Z",
        user: { email: "owner@example.com" },
      },
      {
        id: "member_target",
        organizationId: "org_1",
        userId: "user_target",
        role: "member",
        createdAt: "2026-01-01T00:00:00.000Z",
        user: { email: "target@example.com" },
      },
    ]);
    vi.mocked(removeWorkOSOrganizationMember).mockResolvedValue({
      id: "member_target",
      organizationId: "org_1",
      userId: "user_target",
      role: "member",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("removes members through organization permission, not platform admin allowlist", async () => {
    await expect(removeOrganizationMember(context, "org_1", "member_target")).resolves.toEqual(
      expect.objectContaining({ id: "member_target" }),
    );

    expect(assertCanUseOrganizationResource).toHaveBeenCalledWith("org_1", "member", "delete");
    expect(removeWorkOSOrganizationMember).toHaveBeenCalledWith("org_1", "member_target");
    expect(fetchAuthMutation).toHaveBeenCalledWith(
      "organizations.audit.write.recordFromHono",
      expect.objectContaining({
        organizationId: "org_1",
        input: expect.objectContaining({ action: "organization.member.remove" }),
      }),
    );
  });
});

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

vi.mock("@/server/auth/auth-request", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("@/server/utils/organization/access-checker", () => ({
  assertCanUseOrganizationResource: vi.fn(),
  getOrganizationCapabilities: vi.fn(),
}));

vi.mock("./better-auth-organization-service", () => ({
  getBetterAuthSession: vi.fn(),
  listOrganizationMembersBA: vi.fn(),
  removeMemberBA: vi.fn(),
}));

import { fetchAuthMutation } from "@/server/auth/auth-request";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";
import { getBetterAuthSession, listOrganizationMembersBA, removeMemberBA } from "./better-auth-organization-service";
import { removeOrganizationMember } from "./actions";

const context = {} as never;

describe("organization actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBetterAuthSession).mockResolvedValue({
      session: { userId: "user_owner", activeOrganizationId: "org_1" },
      user: {
        id: "user_owner",
        email: "owner@example.com",
        name: "Owner",
      },
    });
    vi.mocked(assertCanUseOrganizationResource).mockResolvedValue(undefined);
    vi.mocked(fetchAuthMutation).mockResolvedValue(undefined);
    vi.mocked(listOrganizationMembersBA).mockResolvedValue([
      { id: "member_owner", userId: "user_owner", role: "owner", user: { email: "owner@example.com" } },
      { id: "member_target", userId: "user_target", role: "member", user: { email: "target@example.com" } },
    ]);
    vi.mocked(removeMemberBA).mockResolvedValue({ id: "member_target" } as never);
  });

  it("removes members through organization permission, not platform admin allowlist", async () => {
    await expect(removeOrganizationMember(context, "org_1", "member_target")).resolves.toEqual({
      id: "member_target",
    });

    expect(assertCanUseOrganizationResource).toHaveBeenCalledWith("org_1", "member", "delete");
    expect(removeMemberBA).toHaveBeenCalledWith(context, "org_1", "member_target");
    expect(fetchAuthMutation).toHaveBeenCalledWith(
      "organizations.audit.write.recordFromHono",
      expect.objectContaining({
        organizationId: "org_1",
        input: expect.objectContaining({ action: "organization.member.remove" }),
      }),
    );
  });
});

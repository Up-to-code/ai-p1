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

vi.mock("@/server/auth/better-auth/server", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("@/server/utils/organization/access-checker", () => ({
  assertCanUseOrganizationResource: vi.fn(),
  getOrganizationCapabilities: vi.fn(),
}));

vi.mock("./better-auth-proxy", () => ({
  callBetterAuth: vi.fn(),
  getBetterAuthSession: vi.fn(),
}));

import { fetchAuthMutation } from "@/server/auth/better-auth/server";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";
import { callBetterAuth, getBetterAuthSession } from "./better-auth-proxy";
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
    vi.mocked(callBetterAuth).mockImplementation(async (_c, path) => {
      if (path === "/organization/list-members") {
        return [
          { id: "member_owner", userId: "user_owner", role: "owner", user: { email: "owner@example.com" } },
          { id: "member_target", userId: "user_target", role: "member", user: { email: "target@example.com" } },
        ];
      }

      if (path === "/organization/remove-member") {
        return { id: "member_target" };
      }

      throw new Error(`Unexpected Better Auth path: ${path}`);
    });
  });

  it("removes members through organization permission, not platform admin allowlist", async () => {
    await expect(removeOrganizationMember(context, "org_1", "member_target")).resolves.toEqual({
      id: "member_target",
    });

    expect(assertCanUseOrganizationResource).toHaveBeenCalledWith("org_1", "member", "delete");
    expect(callBetterAuth).toHaveBeenCalledWith(
      context,
      "/organization/remove-member",
      expect.objectContaining({
        body: { organizationId: "org_1", memberIdOrEmail: "member_target" },
      }),
    );
    expect(fetchAuthMutation).toHaveBeenCalledWith(
      "organizations.audit.write.recordFromHono",
      expect.objectContaining({
        organizationId: "org_1",
        input: expect.objectContaining({ action: "organization.member.remove" }),
      }),
    );
  });
});

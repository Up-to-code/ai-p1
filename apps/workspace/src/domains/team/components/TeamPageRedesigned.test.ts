import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@tanstack/react-query", () => ({ useQuery: vi.fn() }));
vi.mock("@qentrah/ui", () => ({ QentrahTable: () => null }));
vi.mock("@/components/ui/button", () => ({ Button: () => null }));
vi.mock("@/components/shared/domain/DomainHeader", () => ({
  DomainHeader: () => null,
}));
vi.mock("@/components/shared", () => ({
  AppDataTable: () => null,
  AppPageHeader: () => null,
  AppPageShell: ({ children }: { children: unknown }) => children,
  AppSection: ({ children }: { children: unknown }) => children,
  AppToolbar: () => null,
}));
vi.mock("@/components/shared/crud-ui", () => ({
  EmptyWorkspace: () => null,
  ErrorState: () => null,
  LoadingState: () => null,
  WorkspaceQueryState: () => null,
}));
vi.mock("@/domains/organization/components/screens/custom-permissions-screen", () => ({
  CustomPermissionsDrawer: () => null,
}));
vi.mock("@/domains/auth", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/domains/organization/api", () => ({
  getOrganizationCapabilities: vi.fn(),
  createOrganizationInvitation: vi.fn(),
  createOrganizationInviteLink: vi.fn(),
  cancelOrganizationInvitation: vi.fn(),
  listOrganizationInvitations: vi.fn(),
  listOrganizationMembers: vi.fn(),
  listOrganizationRoles: vi.fn(),
  removeOrganizationMember: vi.fn(),
  updateOrganizationMemberRole: vi.fn(),
}));
vi.mock("@/lib/utils", () => ({
  cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
}));
import {
  buildTeamRows,
  getTeamSurfaceState,
  teamAvailableViews,
  teamHeaderActions,
  teamPermissionState,
  teamRolePresentation,
} from "./TeamPageRedesigned";

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};
const componentSource = readFileSync(
  fileURLToPath(new URL("./TeamPageRedesigned.tsx", import.meta.url)),
  "utf8",
);

describe("TeamPageRedesigned", () => {
  it("keeps loading, query error, and true empty states distinct", () => {
    expect(
      getTeamSurfaceState({ isPending: true, isError: false, rowCount: 0 }),
    ).toBe("loading");
    expect(
      getTeamSurfaceState({ isPending: false, isError: true, rowCount: 0 }),
    ).toBe("error");
    expect(
      getTeamSurfaceState({ isPending: true, isError: true, rowCount: 0 }),
    ).toBe("error");
    expect(
      getTeamSurfaceState({ isPending: false, isError: false, rowCount: 0 }),
    ).toBe("empty");
    expect(
      getTeamSurfaceState({ isPending: false, isError: false, rowCount: 1 }),
    ).toBe("ready");
  });

  it("keeps active members and pending invitations as separate truthful rows", () => {
    const rows = buildTeamRows(
      [
        {
          id: "member_1",
          organizationId: "org_1",
          userId: "user_1",
          role: "owner",
          createdAt: "2026-07-01T00:00:00.000Z",
          user: { id: "user_1", name: "Ada Owner", email: "ada@example.com" },
        },
      ],
      [
        {
          id: "invite_1",
          organizationId: "org_1",
          email: "sam@example.com",
          role: "project_manager",
          status: "pending",
          inviterId: "user_1",
          createdAt: "2026-07-02T00:00:00.000Z",
          expiresAt: "2026-07-09T00:00:00.000Z",
        },
        {
          id: "invite_2",
          organizationId: "org_1",
          email: "accepted@example.com",
          role: "member",
          status: "accepted",
          inviterId: "user_1",
          createdAt: "2026-07-02T00:00:00.000Z",
          expiresAt: "2026-07-09T00:00:00.000Z",
        },
      ],
    );

    expect(rows).toMatchObject([
      { id: "member_1", type: "member", status: "active", name: "Ada Owner" },
      {
        id: "invite_1",
        type: "invitation",
        status: "pending",
        name: "sam@example.com",
      },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows).not.toContainEqual(
      expect.objectContaining({ id: "invite_2" }),
    );
  });

  it("presents owner, admin, and custom roles through organization role helpers", () => {
    expect(
      teamRolePresentation(
        "org:owner",
        ["owner", "admin", "member"],
        roleLabels,
      ),
    ).toMatchObject({
      isOwner: true,
      isAdmin: false,
      label: "Owner",
    });
    expect(
      teamRolePresentation(
        "org:admin",
        ["owner", "admin", "member"],
        roleLabels,
      ),
    ).toMatchObject({
      isOwner: false,
      isAdmin: true,
      label: "Admin",
    });
    expect(
      teamRolePresentation(
        "project_manager",
        ["owner", "admin", "member", "project_manager"],
        roleLabels,
      ),
    ).toMatchObject({
      isOwner: false,
      isAdmin: false,
      label: "Project Manager",
    });
  });

  it("keeps member-management permissions distinct from read-only access", () => {
    expect(teamPermissionState(undefined)).toBe("read-only");
    expect(
      teamPermissionState({
        canInviteMembers: false,
        canUpdateMembers: true,
        canRemoveMembers: false,
      }),
    ).toBe("manage");
  });

  it("does not expose unimplemented views or enabled no-op header actions", () => {
    expect(teamAvailableViews).toEqual(["table"]);
    expect(teamHeaderActions).toEqual([]);
    expect(componentSource).not.toContain('headerName: "Actions"');
    expect(componentSource).not.toContain("onClick: () => {}");
    expect(componentSource).not.toContain('t("actions.inviteMember")');
    expect(componentSource).not.toContain("rowSelection=");
    expect(componentSource).toContain("AppPageShell");
    expect(componentSource).not.toContain("AppStatsGrid");
    expect(componentSource).toContain("TeamDirectorySkeleton");
    expect(componentSource).not.toContain("People directory");
    expect(componentSource).not.toContain("Workspace directory");
    expect(componentSource).toContain("Invite member");
    expect(componentSource).toContain("Manage roles");
  });
});

"use client";

import { Crown, Shield, UserCog, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { Button } from "@/components/ui/button";
import {
  DomainHeader,
  type HeaderAction,
} from "@/components/shared/domain/DomainHeader";
import {
  EmptyWorkspace,
  ErrorState,
  LoadingState,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import {
  getOrganizationCapabilities,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationRoles,
  type OrganizationCapabilities,
  type OrganizationInvitation,
  type OrganizationMember,
} from "@/domains/organization/api";
import {
  formatRoleName,
  isOwner,
  roleOptions,
} from "@/domains/organization/settings-view-model";
import { cn } from "@/lib/utils";

type TeamRow = {
  id: string;
  type: "member" | "invitation";
  name: string;
  email: string;
  role: string;
  joinedAt: Date | string;
  status: "active" | "pending";
};

type DefaultRoleLabels = Record<"owner" | "admin" | "member", string>;

export type TeamSurfaceState = "loading" | "error" | "empty" | "ready";

export const teamAvailableViews = ["table"] as const;
export const teamHeaderActions: readonly HeaderAction[] = [];

export function buildTeamRows(
  members: OrganizationMember[],
  invitations: OrganizationInvitation[],
): TeamRow[] {
  return [
    ...members.map((member) => ({
      id: member.id,
      type: "member" as const,
      name: member.user?.name || member.user?.email || "Unknown",
      email: member.user?.email || "Unknown",
      role: member.role,
      joinedAt: member.createdAt,
      status: "active" as const,
    })),
    ...invitations
      .filter((invitation) => invitation.status === "pending")
      .map((invitation) => ({
        id: invitation.id,
        type: "invitation" as const,
        name: invitation.email,
        email: invitation.email,
        role: invitation.role,
        joinedAt: invitation.createdAt,
        status: "pending" as const,
      })),
  ];
}

export function getTeamSurfaceState({
  isPending,
  isError,
  rowCount,
}: {
  isPending: boolean;
  isError: boolean;
  rowCount: number;
}): TeamSurfaceState {
  if (isError) return "error";
  if (isPending) return "loading";
  return rowCount === 0 ? "empty" : "ready";
}

export function normalizeTeamRole(role: string) {
  return role
    .split(",")
    .map((part) => part.trim().replace(/^org:/, ""))
    .filter(Boolean)
    .join(", ");
}

export function teamPermissionState(
  capabilities:
    | Pick<
        OrganizationCapabilities,
        "canInviteMembers" | "canUpdateMembers" | "canRemoveMembers"
      >
    | undefined,
) {
  return capabilities?.canInviteMembers ||
    capabilities?.canUpdateMembers ||
    capabilities?.canRemoveMembers
    ? "manage"
    : "read-only";
}

export function teamRolePresentation(
  role: string,
  availableRoles: string[],
  labels: DefaultRoleLabels,
) {
  const normalizedRole = normalizeTeamRole(role);
  const knownRole = availableRoles.find(
    (candidate) => normalizeTeamRole(candidate) === normalizedRole,
  );
  const presentedRole = knownRole ?? normalizedRole;
  const owner = isOwner(presentedRole);
  const admin = !owner && presentedRole === "admin";

  return {
    isOwner: owner,
    isAdmin: admin,
    label: formatRoleName(presentedRole, labels),
  };
}

export function TeamPageRedesigned() {
  const t = useTranslations("Organization");
  const session = useAuthSession();
  const organizationId = session.organization.id ?? "";
  const workspaceStatus = session.workspace.status;

  const membersQuery = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: Boolean(organizationId),
  });
  const invitationsQuery = useQuery({
    queryKey: ["organization-invitations", organizationId],
    queryFn: () => listOrganizationInvitations(organizationId),
    enabled: Boolean(organizationId),
  });
  const rolesQuery = useQuery({
    queryKey: ["organization-roles", organizationId],
    queryFn: () => listOrganizationRoles(organizationId),
    enabled: Boolean(organizationId),
  });
  const capabilitiesQuery = useQuery({
    queryKey: ["organization-capabilities", organizationId],
    queryFn: () => getOrganizationCapabilities(organizationId),
    enabled: Boolean(organizationId),
  });

  const teamQueries = [
    membersQuery,
    invitationsQuery,
    rolesQuery,
    capabilitiesQuery,
  ];
  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const tableData = buildTeamRows(members, invitations);
  const availableRoles = roleOptions(rolesQuery.data ?? []);
  const roleLabels = {
    owner: t("roles.defaultLabels.owner"),
    admin: t("roles.defaultLabels.admin"),
    member: t("roles.defaultLabels.member"),
  };
  const surfaceState = getTeamSurfaceState({
    isPending: teamQueries.some((query) => query.isPending),
    isError: teamQueries.some((query) => query.isError),
    rowCount: tableData.length,
  });
  const queryError = teamQueries.find((query) => query.isError)?.error;
  const errorDescription =
    queryError instanceof Error
      ? queryError.message
      : "Team data could not be loaded. Try again.";

  const columns: QentrahColumnDef<TeamRow>[] = [
    {
      headerName: "Name",
      field: "name",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params: { data?: TeamRow }) => {
        const presentation = teamRolePresentation(
          params.data?.role ?? "member",
          availableRoles,
          roleLabels,
        );
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {params.data?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {params.data?.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {params.data?.email}
              </span>
            </div>
            {presentation.isOwner && (
              <Crown
                className="h-3.5 w-3.5 shrink-0 text-amber-500"
                aria-label="Owner"
              />
            )}
          </div>
        );
      },
    },
    {
      headerName: "Role",
      field: "role",
      width: 140,
      cellRenderer: (params: { data?: TeamRow }) => {
        const presentation = teamRolePresentation(
          params.data?.role ?? "member",
          availableRoles,
          roleLabels,
        );
        const RoleIcon =
          presentation.isOwner || presentation.isAdmin ? Shield : UserCog;

        return (
          <div className="flex items-center gap-1.5">
            <RoleIcon
              className={cn(
                "h-3.5 w-3.5",
                presentation.isOwner || presentation.isAdmin
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
            <span className="text-xs font-medium text-foreground">
              {presentation.label}
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "status",
      width: 100,
      cellRenderer: (params: { data?: TeamRow }) => {
        const status = params.data?.status;
        return (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              status === "active"
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            )}
          >
            {status === "active" ? "Active" : "Pending"}
          </span>
        );
      },
    },
    {
      headerName: "Added",
      field: "joinedAt",
      width: 120,
      valueFormatter: (params: { value?: Date | string }) => {
        if (!params.value) return "-";
        return new Date(params.value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
  ];

  const unavailableWorkspaceStatus =
    workspaceStatus === "ready" ? "noOrganization" : workspaceStatus;
  if (workspaceStatus !== "ready" || !organizationId) {
    return (
      <TeamPageLayout currentSection="All Members">
        <WorkspaceQueryState
          status={unavailableWorkspaceStatus}
          variant="table"
        />
      </TeamPageLayout>
    );
  }

  if (surfaceState === "loading") {
    return (
      <TeamPageLayout currentSection="All Members">
        <LoadingState variant="table" />
      </TeamPageLayout>
    );
  }

  if (surfaceState === "error") {
    return (
      <TeamPageLayout currentSection="All Members">
        <ErrorState
          title="Team data could not be loaded"
          description={errorDescription}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                for (const query of teamQueries) {
                  if (query.isError) void query.refetch();
                }
              }}
            >
              Try again
            </Button>
          }
        />
      </TeamPageLayout>
    );
  }

  if (surfaceState === "empty") {
    return (
      <TeamPageLayout currentSection="All Members">
        <EmptyWorkspace
          icon={Users}
          title="No team members or invitations yet"
          description="People will appear here after they join or are invited."
        />
      </TeamPageLayout>
    );
  }

  const activeMemberCount = members.length;
  const pendingInvitationCount = tableData.filter(
    (row) => row.type === "invitation",
  ).length;
  const permissionState = teamPermissionState(capabilitiesQuery.data);
  const currentSection =
    pendingInvitationCount > 0
      ? `${activeMemberCount} member${activeMemberCount === 1 ? "" : "s"}, ${pendingInvitationCount} pending`
      : `${activeMemberCount} member${activeMemberCount === 1 ? "" : "s"}`;

  return (
    <TeamPageLayout
      currentSection={
        permissionState === "read-only"
          ? `${currentSection} - Read-only`
          : currentSection
      }
    >
      <div className="h-full w-full p-6">
        <div className="h-full overflow-hidden rounded-xl border border-border bg-card">
          <QentrahTable
            rows={tableData}
            columns={columns}
            density="compact"
            height="100%"
            getRowId={(row) => row.id}
          />
        </div>
      </div>
    </TeamPageLayout>
  );
}

function TeamPageLayout({
  currentSection,
  children,
}: {
  currentSection: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <DomainHeader
        domain="Team"
        currentSection={currentSection}
        actions={[...teamHeaderActions]}
        showViewSwitcher={false}
      />
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {children}
      </div>
    </div>
  );
}

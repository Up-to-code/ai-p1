"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Plus, Users, Mail, Shield, Crown, UserCog, Trash2, EllipsisVertical } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  listOrganizationMembers,
  listOrganizationInvitations,
  listOrganizationRoles,
  getOrganizationCapabilities,
  type OrganizationMember,
  type OrganizationInvitation,
} from "@/domains/organization/api/clerk-organization-api";
import { formatRoleName, ownerMemberCount, roleOptions } from "@/domains/organization/settings-view-model";

export function TeamPageRedesigned() {
  const t = useTranslations("Organization");
  const [activeView, setActiveView] = useState<ViewMode>('table');
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

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const customRoles = rolesQuery.data ?? [];
  const capabilities = capabilitiesQuery.data;
  const canInviteMembers = capabilities?.canInviteMembers ?? false;
  const canUpdateMembers = capabilities?.canUpdateMembers ?? false;
  const canRemoveMembers = capabilities?.canRemoveMembers ?? false;

  // Combine members and invitations for the table
  const tableData = [
    ...members.map((member) => ({
      id: member.id,
      type: 'member' as const,
      name: member.user?.name || member.user?.email || 'Unknown',
      email: member.user?.email || 'Unknown',
      role: member.role,
      joinedAt: member.createdAt,
      status: 'active' as const,
    })),
    ...invitations.map((invite) => ({
      id: invite.id,
      type: 'invitation' as const,
      name: invite.email,
      email: invite.email,
      role: invite.role,
      joinedAt: invite.createdAt,
      status: 'pending' as const,
    })),
  ];

  const columns: QentrahColumnDef<any>[] = [
    {
      headerName: "Name",
      field: "name",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (p: any) => {
        const isOwner = p.data?.role === 'org:admin' && p.data?.type === 'member';
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
              {p.data?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {p.data?.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {p.data?.email}
              </span>
            </div>
            {isOwner && (
              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
          </div>
        );
      },
    },
    {
      headerName: "Role",
      field: "role",
      width: 140,
      cellRenderer: (p: any) => {
        const role = p.data?.role;
        const isAdmin = role === 'org:admin';
        const isMember = role === 'org:member';
        // Simple role display without formatRoleName for now
        const roleLabel = isAdmin ? 'Admin' : isMember ? 'Member' : role;
        return (
          <div className="flex items-center gap-1.5">
            {isAdmin ? (
              <Shield className="h-3.5 w-3.5 text-primary" />
            ) : (
              <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-foreground">
              {roleLabel}
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "status",
      width: 100,
      cellRenderer: (p: any) => {
        const status = p.data?.status;
        return (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            status === 'active'
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          )}>
            {status === 'active' ? 'Active' : 'Pending'}
          </span>
        );
      },
    },
    {
      headerName: "Joined",
      field: "joinedAt",
      width: 120,
      valueFormatter: (p: any) => {
        if (!p.value) return "—";
        return new Date(p.value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 80,
      cellRenderer: (p: any) => {
        const isOwner = p.data?.role === 'org:admin';
        const canRemove = canRemoveMembers && !isOwner;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={!canRemove}
            >
              <EllipsisVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        );
      },
    },
  ];

  const actions: HeaderAction[] = [
    {
      label: t("actions.inviteMember"),
      icon: <Plus className="w-4 h-4" />,
      onClick: () => {},
      variant: "primary",
      disabled: !canInviteMembers,
    },
  ];

  const availableViews: ViewMode[] = ['table', 'board', 'dashboard', 'widgets'];

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Team"
          currentSection="All Members"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        </div>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Team"
          currentSection="All Members"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace
            icon={Users}
            title="No team members yet"
            description="Invite team members to collaborate on projects"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <DomainHeader
        domain="Team"
        currentSection={`${tableData.length} member${tableData.length !== 1 ? "s" : ""}`}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="flex-1 overflow-hidden">
        {activeView === 'table' && (
          <div className="h-full p-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
              <QentrahTable
                rows={tableData}
                columns={columns}
                density="compact"
                height="100%"
                rowSelection="single"
                getRowId={(row) => row.id}
              />
            </div>
          </div>
        )}

        {activeView === 'board' && (
          <div className="h-full p-6">
            <ViewLoading style="board" message="Board view coming soon" />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Dashboard view coming soon" />
          </div>
        )}

        {activeView === 'widgets' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Widgets view coming soon" />
          </div>
        )}
      </div>
    </div>
  );
}

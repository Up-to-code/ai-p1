"use client";

import { useMemo, useState } from "react";
import { Crown, Copy, EllipsisVertical, HelpCircle, LinkIcon, Loader2, Mail, Plus, Search, Shield, Trash2, UserCog, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomPermissionsDrawer } from "@/domains/organization/components/screens/custom-permissions-screen";
import type { HeaderAction } from "@/components/shared/domain/DomainHeader";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppSection,
  AppToolbar,
} from "@/components/shared";
import {
  EmptyWorkspace,
  ErrorState,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import {
  getOrganizationCapabilities,
  createOrganizationInvitation,
  createOrganizationInviteLink,
  cancelOrganizationInvitation,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationRoles,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  type OrganizationCapabilities,
  type OrganizationInvitation,
  type OrganizationMember,
} from "@/domains/organization/api";
import {
  formatRoleName,
  canManageCustomPermissions,
  isOwner,
  ownerMemberCount,
  roleOptions,
} from "@/domains/organization/settings-view-model";
import { invalidateOrganizationSettings } from "@/domains/organization/settings-cache";
import { cn } from "@/lib/utils";

type TeamRow = {
  id: string;
  type: "member" | "invitation";
  name: string;
  email: string;
  role: string;
  joinedAt: Date | string;
  status: "active" | "pending";
  image?: string | null;
};

type DefaultRoleLabels = Record<"owner" | "admin" | "member", string>;
type TeamMemberAction =
  | { type: "remove"; member: OrganizationMember };
type InviteMode = "link" | "email";

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
      image: member.user?.image,
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
  const locale = useLocale();
  const session = useAuthSession();
  const organizationId = session.organization.id ?? "";
  const workspaceStatus = session.workspace.status;
  const [statusFilter, setStatusFilter] = useState<"active" | "pending">("active");
  const [search, setSearch] = useState("");
  const [memberAction, setMemberAction] = useState<TeamMemberAction | null>(null);
  const [customPermissionsOpen, setCustomPermissionsOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<InviteMode>("link");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [createdInviteUrl, setCreatedInviteUrl] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return tableData.filter((row) => {
      const matchesStatus = row.status === statusFilter;
      const matchesSearch = !normalizedSearch || [row.name, row.email, row.role]
        .some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, tableData]);
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
  const activeMemberCount = members.length;
  const pendingInvitationCount = tableData.filter(
    (row) => row.type === "invitation",
  ).length;
  const canInviteMembers = capabilitiesQuery.data?.canInviteMembers ?? false;
  const canUpdateMembers = capabilitiesQuery.data?.canUpdateMembers ?? false;
  const canRemoveMembers = capabilitiesQuery.data?.canRemoveMembers ?? false;
  const currentMemberRole = members.find((member) => member.userId === session.user.id)?.role ?? null;
  const canManageRoles = !membersQuery.isLoading && !capabilitiesQuery.isLoading && canManageCustomPermissions({
    capabilities: capabilitiesQuery.data,
    currentMemberRole,
  });
  const ownerCount = ownerMemberCount(members);
  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  );
  const invitationById = useMemo(
    () => new Map(invitations.map((invitation) => [invitation.id, invitation])),
    [invitations],
  );

  const refreshTeamData = (targets: Array<"members" | "invitations">) => {
    void invalidateOrganizationSettings(queryClient, organizationId, targets);
  };
  const changeRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      updateOrganizationMemberRole(organizationId, memberId, role),
    onSuccess: () => {
      setMemberAction(null);
      refreshTeamData(["members"]);
      toast({ title: "Member role updated", description: "The member's organization role was updated.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not update member", description: error.message, type: "error" }),
  });
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeOrganizationMember(organizationId, memberId),
    onSuccess: () => {
      setMemberAction(null);
      refreshTeamData(["members"]);
      toast({ title: "Member removed", description: "The member no longer has access to this organization.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not remove member", description: error.message, type: "error" }),
  });
  const cancelInviteMutation = useMutation({
    mutationFn: (invitationId: string) => cancelOrganizationInvitation(organizationId, invitationId),
    onSuccess: () => {
      refreshTeamData(["invitations"]);
      toast({ title: "Invitation canceled", description: "The pending invitation is no longer valid.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not cancel invitation", description: error.message, type: "error" }),
  });
  const inviteMutation = useMutation({
    mutationFn: (input: { email: string; role: string }) => createOrganizationInvitation(organizationId, input),
    onSuccess: () => {
      setInviteDialogOpen(false);
      setInviteEmail("");
      void invalidateOrganizationSettings(queryClient, organizationId, ["invitations"]);
      toast({ title: "Invitation created", description: "The email invitation is ready to send.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not create invitation", description: error.message, type: "error" }),
  });
  const inviteLinkMutation = useMutation({
    mutationFn: (input: { role: string; locale: string }) => createOrganizationInviteLink(organizationId, input),
    onSuccess: async (result) => {
      setCreatedInviteUrl(result.inviteUrl);
      try {
        await navigator.clipboard?.writeText(result.inviteUrl);
      } catch {
        // Keep the URL visible if clipboard access is unavailable.
      }
      void invalidateOrganizationSettings(queryClient, organizationId, ["invitations"]);
      toast({ title: "Invite link created", description: "The link was copied to your clipboard.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not create invite link", description: error.message, type: "error" }),
  });

  const unavailableWorkspaceStatus =
    workspaceStatus === "ready" ? "noOrganization" : workspaceStatus;
  if (workspaceStatus !== "ready" || !organizationId) {
    return (
      <TeamPageLayout>
        <WorkspaceQueryState
          status={unavailableWorkspaceStatus}
          variant="table"
        />
      </TeamPageLayout>
    );
  }

  if (surfaceState === "loading") {
    return (
      <TeamPageLayout>
        <TeamDirectorySkeleton />
      </TeamPageLayout>
    );
  }

  if (surfaceState === "error") {
    return (
      <TeamPageLayout>
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
      <TeamPageLayout>
        <EmptyWorkspace
          icon={Users}
          title="No team members or invitations yet"
          description="People will appear here after they join or are invited."
        />
      </TeamPageLayout>
    );
  }

  const copyInviteLink = async (invitation: OrganizationInvitation) => {
    const inviteUrl = `${window.location.origin}/${locale}/accept-invite?invitationId=${encodeURIComponent(invitation.id)}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({ title: "Invitation link copied", description: "Share it with the invited person.", type: "success" });
    } catch (error) {
      toast({ title: "Could not copy invitation link", description: error instanceof Error ? error.message : "Clipboard access was blocked.", type: "error" });
    }
  };

  const confirmMemberAction = () => {
    if (!memberAction) return;
    const { member } = memberAction;
    const isCurrentUser = member.userId === session.user.id;
    const isLastOwner = isOwner(member.role) && ownerCount <= 1;

    if (isCurrentUser || isLastOwner) return;
    removeMemberMutation.mutate(member.id);
  };

  const closeInviteDialog = () => {
    setInviteDialogOpen(false);
    setInviteEmail("");
    setCreatedInviteUrl("");
    setInviteMode("link");
  };

  return (
    <TeamPageLayout>
      <AppPageShell maxWidth="full" className="w-full min-w-0" contentClassName="space-y-7">
        <AppPageHeader
          title="Members"
          context={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canInviteMembers ? <Button type="button" onClick={() => setInviteDialogOpen(true)} className="h-9 rounded-xl px-3 text-xs font-bold"><Plus className="mr-1.5 h-3.5 w-3.5" />Invite member</Button> : null}
              {canManageRoles ? <Button type="button" variant="outline" onClick={() => setCustomPermissionsOpen(true)} className="h-9 rounded-xl px-3 text-xs font-bold"><Shield className="mr-1.5 h-3.5 w-3.5" />Manage roles</Button> : null}
            </div>
          }
        />

        <AppSection
          className="p-0 overflow-hidden"
        >
          <AppToolbar
            className="border-b border-border px-6 py-4"
            filters={[
              { value: "active", label: `Active · ${activeMemberCount}`, icon: Users },
              { value: "pending", label: `Pending · ${pendingInvitationCount}`, icon: Mail },
            ]}
            activeFilter={statusFilter}
            onFilterChange={(value) => setStatusFilter(value as "active" | "pending")}
            trailing={
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members" className="h-10 rounded-xl pl-9 text-xs" />
              </div>
            }
          />
          <AppDataTable
            className="rounded-none border-0"
            columns={[
              {
                key: "member",
                header: "Person",
                className: "min-w-[260px]",
                render: (row: TeamRow) => (
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-xs font-black text-primary ring-4 ring-primary/5">
                      {row.image ? <img src={row.image} alt="" className="h-full w-full object-cover" /> : row.name.charAt(0).toUpperCase()}
                      <span className={cn("absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-card", row.status === "active" ? "bg-emerald-500" : "bg-amber-500")} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-foreground">{row.name}</span>
                        {row.type === "member" && row.role && isOwner(row.role) ? <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Owner" /> : null}
                      </div>
                      <span className="block truncate text-xs text-muted-foreground">{row.email}</span>
                    </div>
                  </div>
                ),
              },
              { key: "role", header: "Role", render: (row: TeamRow) => {
                const presentation = teamRolePresentation(row.role, availableRoles, roleLabels);
                const RoleIcon = presentation.isOwner || presentation.isAdmin ? Shield : UserCog;
                const member = row.type === "member" ? memberById.get(row.id) : undefined;
                const isLastOwner = Boolean(member && isOwner(member.role) && ownerCount <= 1);
                if (!member) return <Badge variant="outline" className="h-6 gap-1.5 rounded-full px-2.5 text-[10px] normal-case tracking-normal"><RoleIcon className="h-3 w-3" />{presentation.label}</Badge>;
                return <Select value={member.role} disabled={!canUpdateMembers || isLastOwner || changeRoleMutation.isPending} onValueChange={(role: string | null) => { if (role && role !== member.role) changeRoleMutation.mutate({ memberId: member.id, role }); }}><SelectTrigger aria-label={`Role for ${row.name}`} className="h-8 w-36 rounded-xl border-border bg-background px-2.5 text-xs font-semibold"><SelectValue /></SelectTrigger><SelectContent align="start">{availableRoles.map((role) => <SelectItem key={role} value={role}>{formatRoleName(role, roleLabels)}</SelectItem>)}</SelectContent></Select>;
              } },
              { key: "added", header: "Added", render: (row: TeamRow) => <span className="text-xs text-muted-foreground">{new Date(row.joinedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span> },
              { key: "status", header: "Status", render: (row: TeamRow) => <Badge variant="outline" className={cn("h-6 gap-1.5 rounded-full px-2.5 text-[10px] normal-case tracking-normal", row.status === "active" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300")}><span className={cn("h-1.5 w-1.5 rounded-full", row.status === "active" ? "bg-emerald-500" : "bg-amber-500")} />{row.status === "active" ? "Active" : "Pending"}</Badge> },
              { key: "actions", header: "", className: "w-16", render: (row: TeamRow) => {
                const member = row.type === "member" ? memberById.get(row.id) : undefined;
                const invitation = row.type === "invitation" ? invitationById.get(row.id) : undefined;
                const isCurrentUser = member?.userId === session.user.id;
                const isLastOwner = Boolean(member && isOwner(member.role) && ownerCount <= 1);
                return <DropdownMenu><DropdownMenuTrigger render={<button type="button" aria-label={`Actions for ${row.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground" disabled={row.type === "member" ? !member || !canRemoveMembers : !canInviteMembers}><EllipsisVertical className="h-4 w-4" /></button>} /><DropdownMenuContent align="end" className="w-44">{member ? <DropdownMenuItem variant="destructive" disabled={!canRemoveMembers || isCurrentUser || isLastOwner} onClick={() => setMemberAction({ type: "remove", member })}><Trash2 className="mr-2 h-3.5 w-3.5" />Remove member</DropdownMenuItem> : null}{invitation ? <><DropdownMenuItem onClick={() => void copyInviteLink(invitation)}><Copy className="mr-2 h-3.5 w-3.5" />Copy invite link</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" disabled={cancelInviteMutation.isPending} onClick={() => cancelInviteMutation.mutate(invitation.id)}><Trash2 className="mr-2 h-3.5 w-3.5" />Cancel invitation</DropdownMenuItem></> : null}</DropdownMenuContent></DropdownMenu>;
              } },
            ]}
            data={visibleRows}
            getRowKey={(row) => row.id}
            emptyMessage={`No ${statusFilter} people match this search.`}
          />
        </AppSection>
        <Dialog open={Boolean(memberAction)} onOpenChange={(open) => !open && setMemberAction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Remove member</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This removes {memberAction?.member.user?.name || memberAction?.member.user?.email || "this member"} from the organization and revokes their access.</p>
            <DialogFooter><Button variant="ghost" onClick={() => setMemberAction(null)}>Cancel</Button><Button variant="destructive" disabled={removeMemberMutation.isPending} onClick={confirmMemberAction}>{removeMemberMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Remove member</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={inviteDialogOpen} onOpenChange={(open) => { if (!open) closeInviteDialog(); }}>
          <DialogContent className="max-w-lg rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-lg font-semibold">Invite a teammate</DialogTitle></DialogHeader>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
                {(["link", "email"] as InviteMode[]).map((mode) => <button key={mode} type="button" onClick={() => { setInviteMode(mode); setCreatedInviteUrl(""); }} className={cn("rounded-xl px-3 py-2 text-sm font-medium transition-colors", inviteMode === mode ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground")}>{mode === "link" ? "Share link" : "Email invite"}</button>)}
              </div>
              {inviteMode === "link" && createdInviteUrl ? <div className="space-y-3"><div className="space-y-2"><Label htmlFor="teamInviteUrl">Generated invite link</Label><Input id="teamInviteUrl" readOnly value={createdInviteUrl} className="h-11 bg-muted font-mono text-sm" /><p className="text-xs text-muted-foreground">The link has been copied. Share it with the teammate.</p></div><DialogFooter><Button type="button" variant="outline" onClick={() => setCreatedInviteUrl("")}>Create another</Button><Button type="button" onClick={closeInviteDialog}>Done</Button></DialogFooter></div> : <>
                {inviteMode === "email" ? <div className="space-y-2"><Label htmlFor="teamInviteEmail">Email address</Label><Input id="teamInviteEmail" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="name@company.com" /></div> : null}
                <div className="space-y-2"><div className="flex items-center gap-2"><Label htmlFor="teamInviteRole">Organization role</Label><HelpCircle className="h-4 w-4 text-muted-foreground" /></div><Select value={inviteRole} onValueChange={(value: string | null) => value && setInviteRole(value)}><SelectTrigger id="teamInviteRole"><SelectValue /></SelectTrigger><SelectContent>{availableRoles.map((role) => <SelectItem key={role} value={role}>{formatRoleName(role, roleLabels)}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">The invited teammate receives this role when they join.</p></div>
                <DialogFooter><Button type="button" variant="ghost" onClick={closeInviteDialog}>Cancel</Button>{inviteMode === "link" ? <Button type="button" disabled={inviteLinkMutation.isPending} onClick={() => inviteLinkMutation.mutate({ role: inviteRole, locale })}>{inviteLinkMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}Create link</Button> : <Button type="button" disabled={inviteMutation.isPending || !inviteEmail.trim()} onClick={() => inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole })}>{inviteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}Send invite</Button>}</DialogFooter>
              </>}
            </div>
          </DialogContent>
        </Dialog>
        <CustomPermissionsDrawer open={customPermissionsOpen} onOpenChange={setCustomPermissionsOpen} />
      </AppPageShell>
    </TeamPageLayout>
  );
}

function TeamPageLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full min-h-0 w-full min-w-0 flex-1 items-stretch overflow-hidden">{children}</div>;
}

function TeamDirectorySkeleton() {
  return (
    <AppPageShell maxWidth="full" className="w-full min-w-0" contentClassName="space-y-7">
      <AppPageHeader
        title={<Skeleton className="h-8 w-40 rounded-lg" />}
      />
      <AppSection className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[minmax(260px,1.7fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)_minmax(100px,0.6fr)_64px] gap-4 border-b border-border px-6 py-4">
              {["w-16", "w-12", "w-12", "w-14", "w-4"].map((width, index) => <Skeleton key={index} className={cn("h-3 rounded-full", width)} />)}
            </div>
            {[0, 1, 2].map((row) => (
              <div key={row} className="grid grid-cols-[minmax(260px,1.7fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)_minmax(100px,0.6fr)_64px] items-center gap-4 border-b border-border px-6 py-5 last:border-b-0">
                <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 shrink-0 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-3 w-32 rounded-full" /><Skeleton className="h-3 w-44 rounded-full" /></div></div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </AppSection>
    </AppPageShell>
  );
}

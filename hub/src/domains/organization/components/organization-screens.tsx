"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Bot, Building2, CalendarDays, Check, CheckCircle2, Copy, FileText, HelpCircle, Home, KeyRound, LinkIcon, Loader2, Mail, PauseCircle, Plus, RefreshCcw, Save, ShieldCheck, Trash2, UserRoundCog, Users } from "lucide-react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { organizationPermissionStatement, type OrganizationPermissionStatement } from "@/packages/authz";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { StatusPill } from "@/components/shared/crud-ui";
import { updateOrganizationProfileSchema, type UpdateOrganizationProfileValues } from "../validation/organization.schema";
import { useUpdateOrganizationProfileMutation } from "../api/use-update-profile";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cancelOrganizationInviteLink,
  cancelOrganizationInvitation,
  createOrganizationMcpConnection,
  createOrganizationInviteLink,
  createOrganizationInvitation,
  createOrganizationRole,
  deleteOrganizationRole,
  getOrganizationCapabilities,
  listOrganizationMcpConnections,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationRoles,
  revokeOrganizationMcpConnection,
  rotateOrganizationMcpConnection,
  removeOrganizationMember,
  updateAuthOrganization,
  updateOrganizationMemberRole,
  updateOrganizationMcpConnection,
  updateOrganizationRole,
  type McpConnectionPermission,
  type McpPermissionAction,
  type McpPermissionResource,
  type OrganizationMcpConnection,
  type OrganizationInviteLink,
  type OrganizationInvitation,
  type OrganizationMember,
  type OrganizationRole,
} from "../api/better-auth-organization";
import { OrganizationLogoUploader } from "./organization-logo-uploader";

type Tab = "profile" | "members" | "agentLinks" | "invites" | "roles";
type InviteMode = "link" | "email";
type PermissionResource = keyof OrganizationPermissionStatement;
type WorkAction = "read" | "create" | "update" | "delete" | "authorize";

const defaultRoleNames = ["owner", "admin", "member"] as const;
const workActionColumns: WorkAction[] = ["read", "create", "update", "delete"];
const advancedActionColumns: WorkAction[] = ["read", "create", "update", "delete", "authorize"];

type WorkArea = {
  resource: PermissionResource;
  labelKey: string;
  helperKey: string;
  advanced?: boolean;
};

type WorkRoleTemplate = {
  id: string;
  suggestedName: string;
  labelKey: string;
  helperKey: string;
  permission: Partial<Record<PermissionResource, string[]>>;
};

const workAreas: WorkArea[] = [
  { resource: "organization", labelKey: "organization", helperKey: "organization" },
  { resource: "team", labelKey: "team", helperKey: "team" },
  { resource: "member", labelKey: "member", helperKey: "member" },
  { resource: "project", labelKey: "project", helperKey: "project" },
  { resource: "property", labelKey: "property", helperKey: "property" },
  { resource: "client", labelKey: "client", helperKey: "client" },
  { resource: "task", labelKey: "task", helperKey: "task" },
  { resource: "calendar", labelKey: "calendar", helperKey: "calendar" },
  { resource: "integration", labelKey: "integration", helperKey: "integration" },
];

const advancedWorkAreas: WorkArea[] = [
  { resource: "apiKey", labelKey: "apiKey", helperKey: "apiKey", advanced: true },
  { resource: "oauthApp", labelKey: "oauthApp", helperKey: "oauthApp", advanced: true },
  { resource: "role", labelKey: "role", helperKey: "role", advanced: true },
];

const workRoleTemplates: WorkRoleTemplate[] = [
  {
    id: "owner",
    suggestedName: "owner-operator",
    labelKey: "owner",
    helperKey: "owner",
    permission: {
      organization: ["read", "update", "delete"],
      team: ["create", "read", "update", "delete"],
      member: ["create", "read", "update", "delete"],
      role: ["create", "read", "update", "delete"],
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["create", "read", "update", "delete"],
      property: ["create", "read", "update", "delete"],
      calendar: ["create", "read", "update", "delete"],
      integration: ["create", "read", "update", "delete"],
      apiKey: ["create", "read", "update", "delete"],
      oauthApp: ["create", "read", "update", "delete", "authorize"],
    },
  },
  {
    id: "operations-manager",
    suggestedName: "operations-manager",
    labelKey: "operationsManager",
    helperKey: "operationsManager",
    permission: {
      organization: ["read", "update"],
      team: ["create", "read", "update"],
      member: ["create", "read", "update"],
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["create", "read", "update", "delete"],
      property: ["create", "read", "update", "delete"],
      calendar: ["create", "read", "update", "delete"],
      integration: ["read", "update"],
    },
  },
  {
    id: "project-manager",
    suggestedName: "project-manager",
    labelKey: "projectManager",
    helperKey: "projectManager",
    permission: {
      project: ["create", "read", "update", "delete"],
      property: ["read", "update"],
      client: ["read", "update"],
      task: ["read", "update"],
      calendar: ["create", "read", "update"],
      member: ["read"],
      team: ["read"],
    },
  },
  {
    id: "property-manager",
    suggestedName: "property-manager",
    labelKey: "propertyManager",
    helperKey: "propertyManager",
    permission: {
      property: ["create", "read", "update", "delete"],
      project: ["read", "update"],
      client: ["read", "update"],
      task: ["read", "update"],
      calendar: ["create", "read", "update"],
      member: ["read"],
    },
  },
  {
    id: "crm-sales",
    suggestedName: "crm-sales",
    labelKey: "crmSales",
    helperKey: "crmSales",
    permission: {
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      property: ["read"],
      project: ["read"],
      calendar: ["create", "read", "update"],
    },
  },
  {
    id: "calendar-coordinator",
    suggestedName: "calendar-coordinator",
    labelKey: "calendarCoordinator",
    helperKey: "calendarCoordinator",
    permission: {
      calendar: ["create", "read", "update", "delete"],
      client: ["read"],
      task: ["read", "update"],
      project: ["read"],
      property: ["read"],
      member: ["read"],
    },
  },
  {
    id: "viewer",
    suggestedName: "viewer",
    labelKey: "viewer",
    helperKey: "viewer",
    permission: {
      organization: ["read"],
      team: ["read"],
      member: ["read"],
      client: ["read"],
      task: ["read"],
      project: ["read"],
      property: ["read"],
      calendar: ["read"],
      integration: ["read"],
    },
  },
];

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AN";
}

function isOwner(role: string) {
  return role.split(",").map((part) => part.trim()).includes("owner");
}

function formatDate(value: Date | string | number) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function normalizeRole(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function memberName(member: OrganizationMember) {
  return member.user?.name || member.user?.email || member.userId;
}

function memberEmail(member: OrganizationMember) {
  return member.user?.email || member.userId;
}

function roleOptions(customRoles: OrganizationRole[]) {
  const custom = customRoles.map((role) => role.role).filter((role) => !defaultRoleNames.includes(role as (typeof defaultRoleNames)[number]));
  return Array.from(new Set([...defaultRoleNames, ...custom]));
}

function formatCustomRoleName(role: string) {
  return role
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRoleName(role: string, defaultLabels: Record<(typeof defaultRoleNames)[number], string>) {
  if (role === "owner" || role === "admin" || role === "member") {
    return defaultLabels[role];
  }

  return formatCustomRoleName(role);
}

function emptyPermission(): Partial<Record<PermissionResource, string[]>> {
  return {};
}

export function OrganizationScreen() {
  const t = useTranslations("Organization");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const account = useAccountContext();
  const organizationId = account.organization.id ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteMode, setInviteMode] = useState<InviteMode>("link");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState("");
  const [createdInviteLinkId, setCreatedInviteLinkId] = useState<string | null>(null);
  const [memberAction, setMemberAction] = useState<{ member: OrganizationMember; type: "remove" | "role"; role?: string } | null>(null);

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
  const inviteLinks = useConvexQuery(
    api.organizations.inviteLinks.read.listPending,
    organizationId ? { organizationId } : "skip",
  );

  const members = membersQuery.data ?? [];
  const customRoles = rolesQuery.data ?? [];
  const availableRoles = roleOptions(customRoles);
  const defaultRoleLabels = {
    owner: t("roles.defaultLabels.owner"),
    admin: t("roles.defaultLabels.admin"),
    member: t("roles.defaultLabels.member"),
  };
  const ownerCount = members.filter((member) => isOwner(member.role)).length;
  const pendingInviteLinks = inviteLinks ?? [];
  const capabilities = capabilitiesQuery.data;
  const canUpdateOrganization = capabilities?.canUpdateOrganization ?? false;
  const canInviteMembers = capabilities?.canInviteMembers ?? false;
  const canUpdateMembers = capabilities?.canUpdateMembers ?? false;
  const canRemoveMembers = capabilities?.canRemoveMembers ?? false;
  const canManageRoles = Boolean(capabilities?.canCreateRoles || capabilities?.canUpdateRoles || capabilities?.canDeleteRoles);
  const canReadAgentLinks = capabilities?.canReadApiKeys ?? false;
  const canCreateAgentLinks = capabilities?.canCreateApiKeys ?? false;
  const canDeleteAgentLinks = capabilities?.canDeleteApiKeys ?? false;

  const updateProfile = useUpdateOrganizationProfileMutation(organizationId);
  const refreshOrganizationData = () => {
    queryClient.invalidateQueries({ queryKey: ["organization-members", organizationId] });
    queryClient.invalidateQueries({ queryKey: ["organization-invitations", organizationId] });
    queryClient.invalidateQueries({ queryKey: ["organization-roles", organizationId] });
    queryClient.invalidateQueries({ queryKey: ["organization-capabilities", organizationId] });
  };

  const authOrgMutation = useMutation({
    mutationFn: (name: string) => updateAuthOrganization(organizationId, { name }),
  });
  const inviteMutation = useMutation({
    mutationFn: (input: { email: string; role: string }) => createOrganizationInvitation(organizationId, input),
    onSuccess: () => {
      handleInviteDialogOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["organization-invitations", organizationId] });
      toast({ title: t("toasts.inviteCreatedTitle"), description: t("toasts.inviteEmailCreatedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const inviteLinkMutation = useMutation({
    mutationFn: (input: { role: string; locale: string }) => createOrganizationInviteLink(organizationId, input),
    onSuccess: async (result) => {
      setCreatedInviteUrl(result.inviteUrl);
      setCreatedInviteLinkId(result.inviteLink.id);
      try {
        await navigator.clipboard?.writeText(result.inviteUrl);
      } catch {
        // The generated link stays visible if browser clipboard access is blocked.
      }
      setCopiedInviteId(result.inviteLink.id);
      setTimeout(() => setCopiedInviteId(null), 2000);
      toast({ title: t("toasts.inviteCreatedTitle"), description: t("toasts.inviteLinkCreatedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const cancelInviteMutation = useMutation({
    mutationFn: (invitationId: string) => cancelOrganizationInvitation(organizationId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-invitations", organizationId] });
      toast({ title: t("toasts.inviteCanceledTitle"), description: t("toasts.inviteCanceledDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const cancelInviteLinkMutation = useMutation({
    mutationFn: (inviteLinkId: string) => cancelOrganizationInviteLink(organizationId, inviteLinkId),
    onSuccess: () => {
      toast({ title: t("toasts.inviteCanceledTitle"), description: t("toasts.inviteLinkCanceledDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const memberRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) => updateOrganizationMemberRole(organizationId, memberId, role),
    onSuccess: () => {
      setMemberAction(null);
      queryClient.invalidateQueries({ queryKey: ["organization-members", organizationId] });
      toast({ title: t("toasts.memberRoleTitle"), description: t("toasts.memberRoleDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeOrganizationMember(organizationId, memberId),
    onSuccess: () => {
      setMemberAction(null);
      queryClient.invalidateQueries({ queryKey: ["organization-members", organizationId] });
      toast({ title: t("toasts.memberRemovedTitle"), description: t("toasts.memberRemovedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdateOrganizationProfileValues>({
    resolver: zodResolver(updateOrganizationProfileSchema),
    defaultValues: {
      name: account.organization.name,
      legalName: account.organization.legalName ?? "",
      type: account.organization.type ?? "",
      email: account.organization.email ?? "",
      phone: account.organization.phone ?? "",
      website: account.organization.website ?? "",
      address: account.organization.address ?? "",
    },
    values: {
      name: account.organization.name,
      legalName: account.organization.legalName ?? "",
      type: account.organization.type ?? "",
      email: account.organization.email ?? "",
      phone: account.organization.phone ?? "",
      website: account.organization.website ?? "",
      address: account.organization.address ?? "",
    },
  });

  const saveOrg = handleSubmit(async (data) => {
    if (!organizationId) {
      toast({ title: t("toasts.actionFailed"), description: t("errors.noOrganization"), type: "error" });
      return;
    }

    try {
      await authOrgMutation.mutateAsync(data.name);
      await updateProfile.mutateAsync(data);
      toast({ title: t("toasts.profileSavedTitle"), description: t("toasts.profileSavedDesc"), type: "success" });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t("toasts.profileSaveFailed");
      toast({ title: t("toasts.actionFailed"), description: message, type: "error" });
    }
  });

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "profile", label: t("tabs.profile"), icon: Building2 },
    { id: "members", label: t("tabs.members"), icon: Users },
    { id: "agentLinks", label: t("tabs.agentLinks"), icon: Bot },
  ];

  function makeInviteLink(invite: OrganizationInvitation) {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/${locale}/accept-invite?invitationId=${encodeURIComponent(invite.id)}`;
  }

  async function copyInviteLink(invite: OrganizationInvitation) {
    const link = makeInviteLink(invite);
    await navigator.clipboard?.writeText(link);
    setCopiedInviteId(invite.id);
    setTimeout(() => setCopiedInviteId(null), 2000);
  }

  function resetGeneratedInviteLink() {
    setCreatedInviteUrl("");
    setCreatedInviteLinkId(null);
    setCopiedInviteId(null);
  }

  function handleInviteDialogOpenChange(open: boolean) {
    setInviteDialogOpen(open);
    if (!open) {
      setInviteEmail("");
      setInviteMode("link");
      resetGeneratedInviteLink();
    }
  }

  function changeInviteMode(mode: InviteMode) {
    setInviteMode(mode);
    resetGeneratedInviteLink();
  }

  async function copyGeneratedInviteLink() {
    if (!createdInviteUrl) return;
    await navigator.clipboard?.writeText(createdInviteUrl);
    setCopiedInviteId(createdInviteLinkId ?? "created-link");
    setTimeout(() => setCopiedInviteId(null), 2000);
    toast({ title: t("invites.copied"), description: t("invites.generatedLinkHint"), type: "success" });
  }

  function generateInviteLink() {
    if (inviteLinkMutation.isPending || createdInviteUrl) return;
    if (!organizationId) {
      toast({ title: t("toasts.actionFailed"), description: t("errors.noOrganization"), type: "error" });
      return;
    }
    inviteLinkMutation.mutate({ role: inviteRole, locale });
  }

  function sendEmailInvite() {
    if (inviteMutation.isPending || !inviteEmail) return;
    if (!organizationId) {
      toast({ title: t("toasts.actionFailed"), description: t("errors.noOrganization"), type: "error" });
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  }

  const isBusy = isSubmitting || updateProfile.isPending || authOrgMutation.isPending;
  const initials = getInitials(account.organization.name);

  if (account.isPending) {
    return <OrganizationSettingsSkeleton label={t("noOrganization.loading")} />;
  }

  if (!organizationId) {
    return (
      <NoOrganizationState
        title={t("noOrganization.title")}
        description={t("noOrganization.description")}
        action={t("noOrganization.action")}
        href={`/${locale}/choose-org`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0A0A0A]">
      <div className="border-b border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111111]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {organizationId ? (
              <OrganizationLogoUploader
                organizationId={organizationId}
                name={account.organization.name}
                logo={account.organization.logo}
                initials={initials}
                onSaved={refreshOrganizationData}
                labels={{
                  upload: t("logo.upload"),
                  remove: t("logo.remove"),
                  cropTitle: t("logo.cropTitle"),
                  apply: t("logo.apply"),
                  cancel: t("logo.cancel"),
                  zoom: t("logo.zoom"),
                  chooseImage: t("logo.chooseImage"),
                  savedTitle: t("logo.savedTitle"),
                  savedDescription: t("logo.savedDescription"),
                  removedTitle: t("logo.removedTitle"),
                  removedDescription: t("logo.removedDescription"),
                  uploadFailed: t("logo.uploadFailed"),
                }}
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-zinc-100 text-2xl font-black text-zinc-400 dark:bg-zinc-800">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="truncate text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                {account.organization.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={account.organization.status || t("stats.verified")} tone="success" />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  <Users className="h-3 w-3" />
                  {members.length} {t("stats.members")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  <Mail className="h-3 w-3" />
                  {(invitationsQuery.data ?? []).filter((invite) => invite.status === "pending").length} {t("stats.pendingInvites")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  <ShieldCheck className="h-3 w-3" />
                  {availableRoles.length} {t("stats.roles")}
                </span>
              </div>
            </div>

            <Button
              onClick={saveOrg}
              disabled={isBusy || !organizationId || !canUpdateOrganization}
              className="h-11 shrink-0 rounded-[22px] bg-zinc-900 px-6 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {isBusy ? <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" /> : <Save className="me-2 h-3.5 w-3.5" />}
              {t("saveBtn")}
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                  activeTab === tab.id
                    ? "border-zinc-900 bg-zinc-50/80 text-zinc-900 dark:border-white dark:bg-white/[0.03] dark:text-white"
                    : "border-transparent text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-white/[0.02] dark:hover:text-zinc-300",
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {activeTab === "profile" && (
          <div className="space-y-8">
            <AccessSummary
              loading={capabilitiesQuery.isLoading}
              labels={{
                title: t("access.title"),
                description: t("access.description"),
                allowed: t("access.allowed"),
                blocked: t("access.blocked"),
              }}
              items={[
                { label: t("access.profile"), allowed: canUpdateOrganization },
                { label: t("access.invite"), allowed: canInviteMembers },
                { label: t("access.members"), allowed: canUpdateMembers || canRemoveMembers },
                { label: t("access.roles"), allowed: canManageRoles },
                { label: t("access.agentLinks"), allowed: canReadAgentLinks || canCreateAgentLinks },
              ]}
            />

            <Section title={t("sections.workspaceData")} description={t("sections.workspaceDataDesc")}>
              <div className="grid gap-4 md:grid-cols-3">
                <OrgDataCard icon={Building2} label={t("labels.orgId")} value={organizationId || "-"} />
                <OrgDataCard icon={ShieldCheck} label={t("labels.slug")} value={account.organization.slug || "-"} />
                <OrgDataCard icon={Users} label={t("labels.members")} value={members.length.toString()} />
              </div>
            </Section>

            <Section title={t("sections.legal")} description={t("sections.legalDesc")}>
              <div className="grid gap-5 md:grid-cols-2">
                <OrgField id="name" label={t("labels.displayName")} registration={register("name")} error={errors.name?.message} />
                <OrgField id="legalName" label={t("labels.legalName")} registration={register("legalName")} error={errors.legalName?.message} />
                <OrgField id="type" label={t("labels.type")} registration={register("type")} error={errors.type?.message} />
                <OrgField id="address" label={t("labels.address")} registration={register("address")} error={errors.address?.message} />
              </div>
            </Section>

            <Section title={t("sections.contact")} description={t("sections.contactDesc")}>
              <div className="grid gap-5 md:grid-cols-2">
                <OrgField id="email" label={t("labels.email")} type="email" registration={register("email")} error={errors.email?.message} />
                <OrgField id="phone" label={t("labels.phone")} type="tel" registration={register("phone")} error={errors.phone?.message} />
                <OrgField id="website" label={t("labels.website")} type="url" registration={register("website")} error={errors.website?.message} />
              </div>
            </Section>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-8">
            <Section title={t("members.title")} description={t("members.description")}>
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111]">
                <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">{t("members.tableTitle")}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("members.tableDesc")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={!canInviteMembers} onClick={() => setInviteDialogOpen(true)} className="h-10 rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black disabled:opacity-50">
                      <Plus className="me-2 h-3.5 w-3.5" />
                      {t("invites.open")}
                    </Button>
                    <Button nativeButton={false} variant="outline" render={<Link href={`/${locale}/settings/organization/custom-permissions`} />} className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck className="me-2 h-3.5 w-3.5" />
                      {t("roles.manageWorkRoles")}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {membersQuery.isLoading && <LoadingRow label={t("members.loading")} />}
                  {!membersQuery.isLoading && members.length === 0 && <EmptyState title={t("members.emptyTitle")} description={t("members.emptyDesc")} />}
                  {members.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      roles={availableRoles}
                      roleLabels={defaultRoleLabels}
                      isCurrentUser={member.userId === account.user.id}
                      isLastOwner={isOwner(member.role) && ownerCount <= 1}
                      canUpdateRole={canUpdateMembers}
                      canRemove={canRemoveMembers}
                      onChangeRole={(role) => setMemberAction({ member, type: "role", role })}
                      onRemove={() => setMemberAction({ member, type: "remove" })}
                      labels={{
                        currentUser: t("members.currentUser"),
                        remove: t("members.remove"),
                        role: t("members.role"),
                        joined: t("members.joined"),
                      }}
                    />
                  ))}
                </div>
              </div>
            </Section>

            <Section title={t("invites.pendingTitle")} description={t("invites.pendingDesc")}>
              <div className="space-y-3">
                {(invitationsQuery.data ?? []).length === 0 && pendingInviteLinks.length === 0 && <EmptyState title={t("invites.emptyTitle")} description={t("invites.emptyDesc")} />}
                {pendingInviteLinks.map((inviteLink) => (
                  <PendingInviteLinkRow
                    key={inviteLink.id}
                    inviteLink={inviteLink}
                    onCancel={() => cancelInviteLinkMutation.mutate(inviteLink.id)}
                    canceling={cancelInviteLinkMutation.isPending || !canInviteMembers}
                    labels={{
                      linkTitle: t("invites.linkTitle"),
                      expires: t("invites.expires"),
                      cancel: t("invites.cancel"),
                    }}
                    roleLabels={defaultRoleLabels}
                  />
                ))}
                {(invitationsQuery.data ?? []).map((invite) => (
                  <PendingInviteRow
                    key={invite.id}
                    invite={invite}
                    copied={copiedInviteId === invite.id}
                    onCopy={() => copyInviteLink(invite)}
                    onCancel={() => cancelInviteMutation.mutate(invite.id)}
                    canceling={cancelInviteMutation.isPending || !canInviteMembers}
                    roleLabels={defaultRoleLabels}
                    labels={{
                      emailTitle: t("invites.emailTitle"),
                      copy: t("invites.copy"),
                      copied: t("invites.copied"),
                      cancel: t("invites.cancel"),
                    }}
                  />
                ))}
              </div>
            </Section>
          </div>
        )}

        {activeTab === "agentLinks" && (
          <AgentLinksPanel
            organizationId={organizationId}
            canRead={canReadAgentLinks}
            canCreate={canCreateAgentLinks}
            canDelete={canDeleteAgentLinks}
          />
        )}
      </div>

      <Dialog open={inviteDialogOpen} onOpenChange={handleInviteDialogOpenChange}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-lg font-black text-zinc-900 dark:text-white">{t("invites.createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-white/5">
              {(["link", "email"] as InviteMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => changeInviteMode(mode)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                    inviteMode === mode ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
                  )}
                >
                  {t(`invites.modes.${mode}`)}
                </button>
              ))}
            </div>
            {inviteMode === "link" && createdInviteUrl ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="generatedInviteUrl" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("invites.generatedLinkLabel")}</Label>
                  <Input
                    id="generatedInviteUrl"
                    readOnly
                    dir="ltr"
                    value={createdInviteUrl}
                    className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-left font-mono text-xs text-zinc-700 selection:bg-zinc-900 selection:text-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                  />
                  <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t("invites.generatedLinkHint")}</p>
                </div>
                <DialogFooter className="mx-0 mb-0 mt-2 flex-row flex-wrap justify-start gap-2 rounded-none border-0 bg-transparent p-0 sm:justify-start">
                  <Button type="button" onClick={copyGeneratedInviteLink} className="bg-zinc-900 text-white hover:bg-black">
                    <Copy className="me-2 h-4 w-4" />
                    {copiedInviteId === (createdInviteLinkId ?? "created-link") ? t("invites.copied") : t("invites.copy")}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetGeneratedInviteLink}>{t("invites.createAnother")}</Button>
                  <Button type="button" variant="ghost" onClick={() => handleInviteDialogOpenChange(false)}>{t("invites.close")}</Button>
                </DialogFooter>
              </div>
            ) : (
                <>
                  {inviteMode === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("invites.emailLabel")}</Label>
                      <Input id="inviteEmail" type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder={t("invites.emailPlaceholder")} className="h-11 rounded-xl text-start" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="inviteRole" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("invites.roleLabel")}</Label>
                      <HelpCircle className="h-3.5 w-3.5 text-zinc-400" aria-label={t("invites.roleHint")} />
                    </div>
                    <select id="inviteRole" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-[#111]">
                      {availableRoles.map((role) => <option key={role} value={role}>{formatRoleName(role, defaultRoleLabels)}</option>)}
                    </select>
                    <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t("invites.roleHint")}</p>
                  </div>
                  {inviteMode === "link" ? (
                    <div className="space-y-2 pt-1">
                      <Button
                        type="button"
                        onClick={generateInviteLink}
                        disabled={inviteLinkMutation.isPending || !canInviteMembers || !organizationId}
                        className="h-11 w-full rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black"
                      >
                        {inviteLinkMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <LinkIcon className="me-2 h-4 w-4" />}
                        {t("invites.createLink")}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => handleInviteDialogOpenChange(false)} className="h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {t("common.cancel")}
                      </Button>
                    </div>
                  ) : (
                    <DialogFooter className="mx-0 mb-0 mt-2 flex-row justify-start rounded-none border-0 bg-transparent p-0 sm:justify-start">
                      <Button type="button" variant="ghost" onClick={() => handleInviteDialogOpenChange(false)}>{t("common.cancel")}</Button>
                      <Button
                        type="button"
                        onClick={sendEmailInvite}
                        disabled={inviteMutation.isPending || !inviteEmail || !canInviteMembers}
                        className="bg-zinc-900 text-white hover:bg-black"
                      >
                        {inviteMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Mail className="me-2 h-4 w-4" />}
                        {t("invites.sendEmail")}
                      </Button>
                    </DialogFooter>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(memberAction)} onOpenChange={(open) => !open && setMemberAction(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{memberAction?.type === "remove" ? t("members.removeTitle") : t("members.roleTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-500">
            {memberAction?.type === "remove"
              ? t("members.removeDesc", { name: memberAction ? memberName(memberAction.member) : "" })
              : t("members.roleDesc", { name: memberAction ? memberName(memberAction.member) : "", role: memberAction?.role ?? "" })}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMemberAction(null)}>{t("common.cancel")}</Button>
            <Button
              className="bg-zinc-900 text-white hover:bg-black"
              disabled={removeMemberMutation.isPending || memberRoleMutation.isPending}
              onClick={() => {
                if (!memberAction) return;
                if (memberAction.type === "remove") {
                  if (memberAction.member.userId === account.user.id) {
                    toast({ title: t("toasts.actionFailed"), description: t("members.selfRemoveBlocked"), type: "error" });
                    setMemberAction(null);
                    return;
                  }
                  if (isOwner(memberAction.member.role) && ownerCount <= 1) {
                    toast({ title: t("toasts.actionFailed"), description: t("members.lastOwnerBlocked"), type: "error" });
                    setMemberAction(null);
                    return;
                  }
                  removeMemberMutation.mutate(memberAction.member.id);
                  return;
                }
                if (isOwner(memberAction.member.role) && ownerCount <= 1 && memberAction.role !== "owner") {
                  toast({ title: t("toasts.actionFailed"), description: t("members.lastOwnerBlocked"), type: "error" });
                  setMemberAction(null);
                  return;
                }
                memberRoleMutation.mutate({ memberId: memberAction.member.id, role: memberAction.role ?? memberAction.member.role });
              }}
            >
              {removeMemberMutation.isPending || memberRoleMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TeamScreen() {
  return <OrganizationScreen />;
}

const agentPermissionAreas: Array<{
  resource: McpPermissionResource;
  icon: typeof Users;
  actions: McpPermissionAction[];
}> = [
  { resource: "client", icon: Users, actions: ["read", "create", "update", "delete"] },
  { resource: "property", icon: Home, actions: ["read", "create", "update", "delete"] },
  { resource: "project", icon: Building2, actions: ["read", "create", "update", "delete"] },
  { resource: "calendar", icon: CalendarDays, actions: ["read", "create", "update", "delete"] },
  { resource: "task", icon: CheckCircle2, actions: ["read", "create", "update", "delete"] },
  { resource: "media", icon: FileText, actions: ["read", "create"] },
];

type AgentPresetId = "client" | "apartment" | "calendar" | "full";

const agentPresets: Array<{ id: AgentPresetId; permissions: McpConnectionPermission[] }> = [
  {
    id: "client",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "create", "update"] },
      { resource: "property", actions: ["read"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read", "create", "update"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
  {
    id: "apartment",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "update"] },
      { resource: "property", actions: ["read", "create", "update"] },
      { resource: "project", actions: ["read", "update"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
  {
    id: "calendar",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "property", actions: ["read"] },
      { resource: "project", actions: ["read"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read", "update"] },
    ],
  },
  {
    id: "full",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "create", "update", "delete"] },
      { resource: "property", actions: ["read", "create", "update", "delete"] },
      { resource: "project", actions: ["read", "create", "update", "delete"] },
      { resource: "calendar", actions: ["read", "create", "update", "delete"] },
      { resource: "task", actions: ["read", "create", "update", "delete"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
];

function clonePermissions(permissions: McpConnectionPermission[]) {
  return permissions.map((permission) => ({
    resource: permission.resource,
    actions: [...permission.actions],
  }));
}

function permissionActions(
  permissions: McpConnectionPermission[],
  resource: McpPermissionResource,
) {
  return permissions.find((permission) => permission.resource === resource)?.actions ?? [];
}

function hasDeletePermission(permissions: McpConnectionPermission[]) {
  return permissions.some((permission) => permission.actions.includes("delete"));
}

function permissionSummary(
  permissions: McpConnectionPermission[],
  labels: {
    resource: (resource: McpPermissionResource) => string;
    action: (action: McpPermissionAction) => string;
  },
) {
  return permissions
    .filter((permission) => permission.resource !== "organization")
    .map((permission) => `${labels.resource(permission.resource)}: ${permission.actions.map(labels.action).join(", ")}`)
    .join(" • ");
}

function AgentLinksPanel({
  organizationId,
  canRead,
  canCreate,
  canDelete,
}: {
  organizationId: string;
  canRead: boolean;
  canCreate: boolean;
  canDelete: boolean;
}) {
  const t = useTranslations("Organization.agentLinks");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agentName, setAgentName] = useState(() => t("presets.client"));
  const [instructions, setInstructions] = useState(() => t("defaults.instructions"));
  const [presetId, setPresetId] = useState<AgentPresetId | "custom">("client");
  const [permissions, setPermissions] = useState<McpConnectionPermission[]>(clonePermissions(agentPresets[0].permissions));
  const [allowDelete, setAllowDelete] = useState(false);
  const [oneTimeLink, setOneTimeLink] = useState("");
  const [oneTimePermissions, setOneTimePermissions] = useState<McpConnectionPermission[]>([]);

  const query = useQuery({
    queryKey: ["organization-mcp-connections", organizationId],
    queryFn: () => listOrganizationMcpConnections(organizationId),
    enabled: Boolean(organizationId && canRead),
  });

  const createMutation = useMutation({
    mutationFn: () => createOrganizationMcpConnection(organizationId, {
      name: agentName,
      instructions,
      permissions,
    }),
    onSuccess: async (result) => {
      setOneTimeLink(result.agentLink);
      setOneTimePermissions(clonePermissions(permissions));
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      await navigator.clipboard?.writeText(result.agentLink).catch(() => undefined);
      toast({ title: t("toasts.readyTitle"), description: t("toasts.readyDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ connection, status }: { connection: OrganizationMcpConnection; status: "active" | "paused" }) =>
      updateOrganizationMcpConnection(organizationId, connection.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      toast({ title: t("toasts.updatedTitle"), description: t("toasts.updatedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const revokeMutation = useMutation({
    mutationFn: (connection: OrganizationMcpConnection) => revokeOrganizationMcpConnection(organizationId, connection.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      toast({ title: t("toasts.revokedTitle"), description: t("toasts.revokedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const rotateMutation = useMutation({
    mutationFn: (connection: OrganizationMcpConnection) => rotateOrganizationMcpConnection(organizationId, connection.id),
    onSuccess: async (result) => {
      setOneTimeLink(result.agentLink);
      setOneTimePermissions(clonePermissions(result.connection.permissions));
      setDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      await navigator.clipboard?.writeText(result.agentLink).catch(() => undefined);
      toast({ title: t("toasts.rotatedTitle"), description: t("toasts.rotatedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  function applyPreset(id: string) {
    setPresetId(id as AgentPresetId | "custom");
    const preset = agentPresets.find((item) => item.id === id);
    if (!preset) return;
    setPermissions(clonePermissions(preset.permissions));
    setAgentName(t(`presets.${preset.id}`));
    setAllowDelete(false);
  }

  function openNewAgentLinkDialog() {
    const defaultPreset = agentPresets[0];
    setPresetId(defaultPreset.id);
    setPermissions(clonePermissions(defaultPreset.permissions));
    setAgentName(t(`presets.${defaultPreset.id}`));
    setInstructions(t("defaults.instructions"));
    setAllowDelete(false);
    setOneTimeLink("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function togglePermission(resource: McpPermissionResource, action: McpPermissionAction) {
    setPresetId("custom");
    setPermissions((current) => {
      const existing = current.find((permission) => permission.resource === resource);
      const nextActions = existing?.actions.includes(action)
        ? existing.actions.filter((item) => item !== action)
        : [...(existing?.actions ?? []), action];
      const without = current.filter((permission) => permission.resource !== resource);
      if (nextActions.length === 0) return without;
      return [...without, { resource, actions: nextActions }];
    });
  }

  async function copyOneTimeLink() {
    if (!oneTimeLink) return;
    await navigator.clipboard?.writeText(oneTimeLink);
    toast({ title: t("toasts.copiedTitle"), description: t("toasts.copiedDescription"), type: "success" });
  }

  const requiresDeleteConfirmation = hasDeletePermission(permissions);
  const canSubmit = canCreate && agentName.trim() && permissions.length > 0 && (!requiresDeleteConfirmation || allowDelete);
  const connections = query.data ?? [];
  const oneTimePermissionSummary = permissionSummary(oneTimePermissions, {
    resource: (resource) => t(`resources.${resource}`),
    action: (action) => t(`actions.${action}`),
  });

  return (
    <div className="space-y-8">
      <Section title={t("title")} description={t("description")}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <OrgDataCard icon={KeyRound} label={t("stats.active")} value={connections.filter((item) => item.status === "active").length.toString()} />
            <OrgDataCard icon={Bot} label={t("stats.calls")} value={connections.reduce((sum, item) => sum + item.usageCount, 0).toString()} />
            <OrgDataCard icon={ShieldCheck} label={t("stats.access")} value={canCreate ? t("stats.canCreate") : canRead ? t("stats.canView") : t("stats.blocked")} />
          </div>
          <Button
            disabled={!canCreate}
            onClick={openNewAgentLinkDialog}
            className="h-11 rounded-xl bg-zinc-900 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black"
          >
            <Plus className="me-2 h-4 w-4" />
            {t("newButton")}
          </Button>
        </div>
      </Section>

      <Section title={t("existingTitle")} description={t("existingDescription")}>
        <div className="space-y-3">
          {!canRead && <EmptyState title={t("empty.noAccessTitle")} description={t("empty.noAccessDescription")} />}
          {canRead && query.isLoading && <LoadingRow label={t("empty.loading")} />}
          {canRead && !query.isLoading && connections.length === 0 && <EmptyState title={t("empty.noLinksTitle")} description={t("empty.noLinksDescription")} />}
          {connections.map((connection) => (
            <div key={connection.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-zinc-900 dark:text-white">{connection.name}</p>
                    <StatusPill label={t(`status.${connection.status}`)} tone={connection.status === "active" ? "success" : connection.status === "paused" ? "warning" : "neutral"} />
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-500 dark:bg-white/5">{t("labels.keyEnding", { last4: connection.keyLast4 })}</span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {permissionSummary(connection.permissions, {
                      resource: (resource) => t(`resources.${resource}`),
                      action: (action) => t(`actions.${action}`),
                    }) || t("labels.noWork")}
                  </p>
                  <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>{t("labels.used", { count: connection.usageCount })}</span>
                    <span>{t("labels.created", { date: formatDate(connection.createdAt) })}</span>
                    {connection.lastUsedAt ? <span>{t("labels.lastUsed", { date: formatDate(connection.lastUsedAt) })}</span> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {connection.status !== "revoked" && (
                    <Button
                      variant="outline"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ connection, status: connection.status === "active" ? "paused" : "active" })}
                      className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <PauseCircle className="me-2 h-3.5 w-3.5" />
                      {connection.status === "active" ? t("buttons.pause") : t("buttons.resume")}
                    </Button>
                  )}
                  {connection.status !== "revoked" && (
                    <Button
                      variant="outline"
                      disabled={!canCreate || rotateMutation.isPending}
                      onClick={() => rotateMutation.mutate(connection)}
                      className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <RefreshCcw className="me-2 h-3.5 w-3.5" />
                      {t("buttons.rotate")}
                    </Button>
                  )}
                  {connection.status !== "revoked" && (
                    <Button
                      variant="outline"
                      disabled={!canDelete || revokeMutation.isPending}
                      onClick={() => revokeMutation.mutate(connection)}
                      className="rounded-xl border-red-200 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="me-2 h-3.5 w-3.5" />
                      {t("buttons.revoke")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setOneTimeLink("");
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-lg font-black text-zinc-900 dark:text-white">
              {oneTimeLink ? t("modal.readyTitle") : t("modal.newTitle")}
            </DialogTitle>
          </DialogHeader>

          {oneTimeLink ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {t("modal.oneTimeWarning")}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm dark:bg-zinc-900 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-black text-zinc-900 dark:text-white">{t("modal.canDoTitle")}</p>
                    <p className="text-xs leading-6 text-zinc-600 dark:text-zinc-300">
                      {oneTimePermissionSummary || t("labels.noWork")}
                    </p>
                    <p className="text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">{t("modal.canDoDescription")}</p>
                  </div>
                </div>
              </div>
              <Input readOnly dir="ltr" value={oneTimeLink} className="h-12 rounded-xl font-mono text-xs" />
              <DialogFooter className="justify-start">
                <Button onClick={copyOneTimeLink} className="bg-zinc-900 text-white hover:bg-black">
                  <Copy className="me-2 h-4 w-4" />
                  {t("buttons.copy")}
                </Button>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.close")}</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.name")}</Label>
                  <Input id="agentName" value={agentName} onChange={(event) => setAgentName(event.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentPreset" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.startWith")}</Label>
                  <select id="agentPreset" value={presetId} onChange={(event) => applyPreset(event.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-[#111]">
                    {agentPresets.map((preset) => <option key={preset.id} value={preset.id}>{t(`presets.${preset.id}`)}</option>)}
                    <option value="custom">{t("presets.custom")}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentInstructions" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.instructions")}</Label>
                <textarea
                  id="agentInstructions"
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-zinc-900 dark:border-white/10 dark:bg-[#111]"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {agentPermissionAreas.map((area) => {
                  const Icon = area.icon;
                  const activeActions = permissionActions(permissions, area.resource);
                  return (
                    <div key={area.resource} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{t(`resources.${area.resource}`)}</p>
                          <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t(`resourceHelp.${area.resource}`)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {area.actions.map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => togglePermission(area.resource, action)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                              activeActions.includes(action)
                                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 dark:border-white/10 dark:bg-transparent dark:hover:text-white",
                            )}
                          >
                            {t(`actions.${action}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {requiresDeleteConfirmation && (
                <label className="flex cursor-pointer select-none items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900 transition-colors hover:border-red-300 hover:bg-red-100/70 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-100">
                  <input
                    type="checkbox"
                    checked={allowDelete}
                    onChange={(event) => setAllowDelete(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 bg-white shadow-sm transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-red-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-red-50 dark:bg-zinc-950 dark:peer-focus-visible:ring-offset-red-950",
                      allowDelete
                        ? "border-red-600 bg-red-600 text-white dark:border-red-400 dark:bg-red-500"
                        : "border-red-400 text-transparent dark:border-red-300",
                    )}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[4]" />
                  </span>
                  <span className="leading-6">{t("modal.deleteConfirmation")}</span>
                </label>
              )}
              <DialogFooter className="justify-start">
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.cancel")}</Button>
                <Button
                  disabled={!canSubmit || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                  className="bg-zinc-900 text-white hover:bg-black"
                >
                  {createMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <KeyRound className="me-2 h-4 w-4" />}
                  {t("modal.make")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CustomPermissionsScreen() {
  const t = useTranslations("Organization");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const account = useAccountContext();
  const organizationId = account.organization.id ?? "";
  const [roleName, setRoleName] = useState("");
  const [rolePermission, setRolePermission] = useState<Partial<Record<PermissionResource, string[]>>>(emptyPermission);
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
  const [showAdvancedWork, setShowAdvancedWork] = useState(false);
  const [templateId, setTemplateId] = useState("blank");

  const membersQuery = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
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
  const customRoles = rolesQuery.data ?? [];
  const capabilities = capabilitiesQuery.data;
  const canCreateRoles = capabilities?.canCreateRoles ?? false;
  const canUpdateRoles = capabilities?.canUpdateRoles ?? false;
  const canDeleteRoles = capabilities?.canDeleteRoles ?? false;
  const defaultRoleLabels = {
    owner: t("roles.defaultLabels.owner"),
    admin: t("roles.defaultLabels.admin"),
    member: t("roles.defaultLabels.member"),
  };

  const roleMutation = useMutation({
    mutationFn: async () => {
      const nextName = normalizeRole(roleName);
      if (!nextName) throw new Error(t("roles.nameRequired"));
      if (editingRole) {
        return updateOrganizationRole(organizationId, editingRole.id, { roleName: nextName, permission: rolePermission });
      }
      return createOrganizationRole(organizationId, nextName, rolePermission);
    },
    onSuccess: () => {
      setRoleName("");
      setRolePermission(emptyPermission());
      setEditingRole(null);
      setTemplateId("blank");
      queryClient.invalidateQueries({ queryKey: ["organization-roles", organizationId] });
      toast({ title: t("toasts.roleSavedTitle"), description: t("toasts.roleSavedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const deleteRoleMutation = useMutation({
    mutationFn: (role: OrganizationRole) => deleteOrganizationRole(organizationId, role.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-roles", organizationId] });
      toast({ title: t("toasts.roleDeletedTitle"), description: t("toasts.roleDeletedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });

  function beginEditRole(role: OrganizationRole) {
    setEditingRole(role);
    setRoleName(role.role);
    setRolePermission(role.permission);
    setTemplateId("blank");
  }

  function togglePermission(resource: PermissionResource, action: string) {
    setRolePermission((current) => {
      const currentActions = current[resource] ?? [];
      const nextActions = currentActions.includes(action)
        ? currentActions.filter((item) => item !== action)
        : [...currentActions, action];

      return { ...current, [resource]: nextActions };
    });
  }

  function applyTemplate(nextTemplateId: string) {
    setTemplateId(nextTemplateId);
    setEditingRole(null);
    if (nextTemplateId === "blank") {
      setRoleName("");
      setRolePermission(emptyPermission());
      return;
    }

    const template = workRoleTemplates.find((item) => item.id === nextTemplateId);
    if (!template) return;
    setRoleName(template.suggestedName);
    setRolePermission(template.permission);
  }

  if (account.isPending) {
    return <OrganizationSettingsSkeleton label={t("noOrganization.loading")} compact />;
  }

  if (!organizationId) {
    return (
      <NoOrganizationState
        title={t("noOrganization.title")}
        description={t("noOrganization.description")}
        action={t("noOrganization.action")}
        href={`/${locale}/choose-org`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0A0A0A]">
      <div className="border-b border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111111]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Button nativeButton={false} variant="ghost" render={<Link href={`/${locale}/settings/organization`} />} className="mb-5 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest">
            {t("roles.backToOrganization")}
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{t("roles.pageEyebrow")}</p>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t("roles.pageTitle")}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">{t("roles.pageDesc")}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                <HelpCircle className="h-4 w-4" />
                {t("roles.lessIsMoreHint")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <Section title={editingRole ? t("roles.editTitle") : t("roles.createTitle")} description={t("roles.createDesc")}>
          <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#111]">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="roleName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("roles.name")}</Label>
                <Input id="roleName" value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder={t("roles.namePlaceholder")} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleTemplate" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("roles.templateSelect")}</Label>
                <select id="roleTemplate" value={templateId} onChange={(event) => applyTemplate(event.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-[#111]">
                  <option value="blank">{t("roles.templateBlank")}</option>
                  {workRoleTemplates.map((template) => (
                    <option key={template.id} value={template.id}>{t(`roles.templates.${template.labelKey}`)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                {editingRole && (
                  <Button variant="outline" type="button" onClick={() => { setEditingRole(null); setRoleName(""); setRolePermission(emptyPermission()); setTemplateId("blank"); }} className="h-11 rounded-xl">
                    {t("roles.cancelEdit")}
                  </Button>
                )}
                <Button type="button" onClick={() => roleMutation.mutate()} disabled={roleMutation.isPending || !organizationId || (editingRole ? !canUpdateRoles : !canCreateRoles)} className="h-11 rounded-xl bg-zinc-900 text-white hover:bg-black disabled:opacity-50">
                  {roleMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                  {editingRole ? t("roles.update") : t("roles.create")}
                </Button>
              </div>
            </div>

            <WorkRoleGrid
              permission={rolePermission}
              areas={workAreas}
              actionColumns={workActionColumns}
              onToggle={togglePermission}
              labels={{
                area: t("roles.grid.area"),
                allowedWork: t("roles.grid.allowedWork"),
                read: t("roles.actions.read"),
                create: t("roles.actions.create"),
                update: t("roles.actions.update"),
                delete: t("roles.actions.delete"),
                authorize: t("roles.actions.authorize"),
                unavailable: t("roles.grid.unavailable"),
              }}
              getAreaLabel={(key) => t(`roles.workAreas.${key}`)}
              getAreaHelp={(key) => t(`roles.workAreaHelp.${key}`)}
            />

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAdvancedWork((current) => !current)}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-white"
              >
                {showAdvancedWork ? t("roles.hideAdvanced") : t("roles.showAdvanced")}
              </button>
              {showAdvancedWork && (
                <WorkRoleGrid
                  permission={rolePermission}
                  areas={advancedWorkAreas}
                  actionColumns={advancedActionColumns}
                  onToggle={togglePermission}
                  labels={{
                    area: t("roles.grid.area"),
                    allowedWork: t("roles.grid.allowedWork"),
                    read: t("roles.actions.read"),
                    create: t("roles.actions.create"),
                    update: t("roles.actions.update"),
                    delete: t("roles.actions.delete"),
                    authorize: t("roles.actions.authorize"),
                    unavailable: t("roles.grid.unavailable"),
                  }}
                  getAreaLabel={(key) => t(`roles.workAreas.${key}`)}
                  getAreaHelp={(key) => t(`roles.workAreaHelp.${key}`)}
                />
              )}
            </div>
          </div>
        </Section>

        <Section title={t("roles.listTitle")} description={t("roles.listDesc")}>
          <div className="space-y-3">
            {rolesQuery.isLoading && <LoadingRow label={t("roles.loading")} />}
            {defaultRoleNames.map((role) => (
              <RoleRow key={role} role={role} roleLabels={defaultRoleLabels} locked labels={{ builtIn: t("roles.builtIn"), edit: t("roles.edit"), delete: t("roles.delete") }} />
            ))}
            {customRoles.map((role) => {
              const roleInUse = members.some((member) => member.role === role.role);
              return (
                <RoleRow
                  key={role.id}
                  role={role.role}
                  roleLabels={defaultRoleLabels}
                  memberCount={members.filter((member) => member.role === role.role).length}
                  editDisabled={!canUpdateRoles}
                  deleteDisabled={!canDeleteRoles}
                  onEdit={canUpdateRoles ? () => beginEditRole(role) : undefined}
                  onDelete={() => {
                    if (!canDeleteRoles) {
                      toast({ title: t("toasts.actionFailed"), description: t("roles.notAllowed"), type: "error" });
                      return;
                    }
                    if (roleInUse) {
                      toast({ title: t("toasts.actionFailed"), description: t("roles.roleInUse"), type: "error" });
                      return;
                    }
                    deleteRoleMutation.mutate(role);
                  }}
                  labels={{ builtIn: t("roles.custom"), edit: t("roles.edit"), delete: t("roles.delete") }}
                />
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-900 dark:text-white">{title}</h2>
        {description && <p className="mt-1 text-[10px] font-medium text-zinc-400">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function AccessSummary({
  loading,
  labels,
  items,
}: {
  loading: boolean;
  labels: { title: string; description: string; allowed: string; blocked: string };
  items: { label: string; allowed: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <ShieldCheck className="h-4 w-4 text-emerald-500" />}
            {labels.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{labels.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.label}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                item.allowed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-500",
              )}
              title={item.allowed ? labels.allowed : labels.blocked}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrgField({ id, label, type = "text", registration, error }: { id: string; label: string; type?: string; registration: UseFormRegisterReturn; error?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</Label>
      <Input id={id} type={type} className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#111]" aria-invalid={Boolean(error)} {...registration} />
      {error && <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">{error}</p>}
    </div>
  );
}

function OrgDataCard({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#111]">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">{label}</p>
          <p className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white" title={value}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  roles,
  roleLabels,
  isCurrentUser,
  isLastOwner,
  canUpdateRole,
  canRemove,
  onChangeRole,
  onRemove,
  labels,
}: {
  member: OrganizationMember;
  roles: string[];
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  isCurrentUser: boolean;
  isLastOwner: boolean;
  canUpdateRole: boolean;
  canRemove: boolean;
  onChangeRole: (role: string) => void;
  onRemove: () => void;
  labels: { currentUser: string; remove: string; role: string; joined: string };
}) {
  const name = memberName(member);
  const email = memberEmail(member);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111] md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-xs font-black uppercase text-zinc-500 dark:bg-white/5">
          {member.user?.image ? <img src={member.user.image} alt={name} className="h-full w-full object-cover" /> : getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{name} {isCurrentUser && <span className="text-[10px] text-zinc-400">({labels.currentUser})</span>}</p>
          <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-zinc-400">{email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{labels.joined} {formatDate(member.createdAt)}</span>
        <select
          value={member.role}
          disabled={isLastOwner || !canUpdateRole}
          onChange={(event) => onChangeRole(event.target.value)}
          className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-[#111]"
          aria-label={labels.role}
        >
          {roles.map((role) => <option key={role} value={role}>{formatRoleName(role, roleLabels)}</option>)}
        </select>
        <Button variant="outline" disabled={isCurrentUser || isLastOwner || !canRemove} onClick={onRemove} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600">
          <Trash2 className="me-2 h-3.5 w-3.5" />
          {labels.remove}
        </Button>
      </div>
    </div>
  );
}

function PendingInviteRow({
  invite,
  copied,
  onCopy,
  onCancel,
  canceling,
  roleLabels,
  labels,
}: {
  invite: OrganizationInvitation;
  copied: boolean;
  onCopy: () => void;
  onCancel: () => void;
  canceling: boolean;
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  labels: { emailTitle: string; copy: string; copied: string; cancel: string };
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111] md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{invite.email}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{labels.emailTitle} / {formatRoleName(invite.role, roleLabels)} / {invite.status} / {formatDate(invite.expiresAt)}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCopy} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest">
          {copied ? <CheckCircle2 className="me-2 h-3.5 w-3.5" /> : <Copy className="me-2 h-3.5 w-3.5" />}
          {copied ? labels.copied : labels.copy}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={canceling} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600">
          <Trash2 className="me-2 h-3.5 w-3.5" />
          {labels.cancel}
        </Button>
      </div>
    </div>
  );
}

function PendingInviteLinkRow({
  inviteLink,
  onCancel,
  canceling,
  roleLabels,
  labels,
}: {
  inviteLink: OrganizationInviteLink;
  onCancel: () => void;
  canceling: boolean;
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  labels: { linkTitle: string; expires: string; cancel: string };
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111] md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{labels.linkTitle}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{formatRoleName(inviteLink.role, roleLabels)} / {inviteLink.status} / {labels.expires} {formatDate(inviteLink.expiresAt)}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} disabled={canceling} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600">
          <Trash2 className="me-2 h-3.5 w-3.5" />
          {labels.cancel}
        </Button>
      </div>
    </div>
  );
}

function WorkRoleGrid({
  permission,
  areas,
  actionColumns,
  onToggle,
  labels,
  getAreaLabel,
  getAreaHelp,
}: {
  permission: Partial<Record<PermissionResource, string[]>>;
  areas: WorkArea[];
  actionColumns: WorkAction[];
  onToggle: (resource: PermissionResource, action: string) => void;
  labels: Record<WorkAction | "area" | "allowedWork" | "unavailable", string>;
  getAreaLabel: (key: string) => string;
  getAreaHelp: (key: string) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/10">
      <table className="min-w-[760px] w-full border-collapse bg-white text-start dark:bg-[#111]">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/80 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <th className="w-[260px] px-4 py-3 text-start text-[10px] font-black uppercase tracking-widest text-zinc-500">{labels.area}</th>
            {actionColumns.map((action) => (
              <th key={action} className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {labels[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => {
            const actions = organizationPermissionStatement[area.resource] as readonly string[];

            return (
              <tr key={area.resource} className="border-b border-zinc-100 last:border-b-0 dark:border-white/[0.06]">
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-black text-zinc-900 dark:text-white">{getAreaLabel(area.labelKey)}</p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500 dark:text-zinc-400">{getAreaHelp(area.helperKey)}</p>
                </td>
                {actionColumns.map((action) => {
                  const available = actions.includes(action);
                  const checked = (permission[area.resource] ?? []).includes(action);

                  return (
                    <td key={action} className="px-3 py-4 text-center align-top">
                      {available ? (
                        <button
                          type="button"
                          onClick={() => onToggle(area.resource, action)}
                          aria-pressed={checked}
                          title={`${getAreaLabel(area.labelKey)}: ${labels[action]}`}
                          className={cn(
                            "mx-auto flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            checked
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                              : "border-zinc-200 text-zinc-400 hover:border-zinc-500 hover:text-zinc-900 dark:border-white/10 dark:hover:border-white dark:hover:text-white",
                          )}
                        >
                          {checked ? "✓" : ""}
                        </button>
                      ) : (
                        <span title={labels.unavailable} className="mx-auto flex h-8 min-w-8 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-[10px] font-black text-zinc-300 dark:border-white/10 dark:text-zinc-700">
                          -
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:border-white/[0.06] dark:bg-white/[0.02]">
        {labels.allowedWork}
      </div>
    </div>
  );
}

function RoleRow({
  role,
  roleLabels,
  memberCount,
  locked,
  onEdit,
  onDelete,
  editDisabled,
  deleteDisabled,
  labels,
}: {
  role: string;
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  memberCount?: number;
  locked?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  labels: { builtIn: string; edit: string; delete: string };
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111] md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-white/5">
          <UserRoundCog className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-black text-zinc-900 dark:text-white">{formatRoleName(role, roleLabels)}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{labels.builtIn}{typeof memberCount === "number" ? ` / ${memberCount}` : ""}</p>
        </div>
      </div>
      {!locked && (
        <div className="flex gap-2">
          <Button variant="outline" disabled={editDisabled} onClick={onEdit} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest">{labels.edit}</Button>
          <Button variant="outline" disabled={deleteDisabled} onClick={onDelete} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600">{labels.delete}</Button>
        </div>
      )}
    </div>
  );
}

function NoOrganizationState({ title, description, action, href }: { title: string; description: string; action: string; href: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-zinc-50/50 px-6 py-12 dark:bg-[#0A0A0A]">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-white/[0.06] dark:bg-[#111]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
          <Building2 className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
        <Button nativeButton={false} render={<Link href={href} />} className="mt-6 h-11 rounded-xl bg-zinc-900 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black">
          {action}
        </Button>
      </div>
    </div>
  );
}

function OrganizationSettingsSkeleton({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0A0A0A]" aria-busy="true">
      <div className="border-b border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111111]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Skeleton className="h-24 w-24 shrink-0 rounded-[28px]" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{label}</span>
              </div>
              <Skeleton className="h-7 w-64 max-w-full rounded-xl" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-11 w-28 rounded-[22px]" />
          </div>
          <div className="mt-8 flex gap-2">
            <Skeleton className="h-10 w-28 rounded-t-xl" />
            <Skeleton className="h-10 w-28 rounded-t-xl" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-3 w-60 rounded-full" />
          </div>
          {compact ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#111]">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto]">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
              <div className="mt-5 space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-2xl" />
                ))}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm font-bold text-zinc-500 dark:border-white/[0.06] dark:bg-[#111]">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#111]">
      <p className="text-sm font-black text-zinc-900 dark:text-white">{title}</p>
      <p className="mt-1 text-xs font-medium text-zinc-400">{description}</p>
    </div>
  );
}

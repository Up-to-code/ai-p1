"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Bell, Bot, Building2, CalendarDays, Check, CheckCircle2, Clock, Copy, FileText, HelpCircle, Home, KeyRound, LinkIcon, Loader2, Mail, PauseCircle, Plus, RefreshCcw, Save, ShieldCheck, Trash2, UserRoundCog, Users } from "lucide-react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { organizationPermissionStatement } from "@/packages/authz";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { StatusPill } from "@/components/shared/crud-ui";
import { updateOrganizationProfileSchema, type UpdateOrganizationProfileValues } from "../validation/organization.schema";
import { useUpdateOrganizationProfileMutation } from "../api/use-update-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  cancelOrganizationInviteLink,
  cancelOrganizationInvitation,
  createOrganizationApiKey,
  createOrganizationMcpConnection,
  createOrganizationInviteLink,
  createOrganizationInvitation,
  createOrganizationRole,
  deleteOrganizationRole,
  getOrganizationCapabilities,
  listOrganizationApiKeys,
  listOrganizationMcpConnections,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationRoles,
  revokeOrganizationMcpConnection,
  revokeOrganizationApiKey,
  rotateOrganizationMcpConnection,
  rotateOrganizationApiKey,
  removeOrganizationMember,
  updateAuthOrganization,
  updateOrganizationMemberRole,
  updateOrganizationMcpConnection,
  updateOrganizationRole,
  type McpConnectionPermission,
  type McpPermissionAction,
  type McpPermissionResource,
  type OrganizationApiKey,
  type OrganizationApiKeyAction,
  type OrganizationApiKeyExpiry,
  type OrganizationApiKeyPermission,
  type OrganizationApiKeyResource,
  type OrganizationMcpConnection,
  type OrganizationInviteLink,
  type OrganizationInvitation,
  type OrganizationMember,
  type OrganizationRole,
} from "../api/clerk-organization-api";
import { OrganizationLogoUploader } from "./organization-logo-uploader";
import {
  defaultNotificationPreference,
  getOrganizationNotificationPreferences,
  updateOrganizationNotificationPreferences,
  type NotificationCategory,
  type NotificationPreference,
} from "@/domains/notifications/api/notifications";
import {
  advancedActionColumns,
  advancedWorkAreas,
  agentConnectionProjection,
  agentPermissionActions,
  agentPermissionSummary,
  apiKeyStats,
  apiKeyPermissionActions,
  apiKeyPermissionSummary,
  clampAgentPermissionsToGrantable,
  clampApiKeyPermissionsToGrantable,
  cloneAgentPermissions,
  cloneApiKeyPermissions,
  canManageCustomPermissions,
  defaultApiKeyPermissions,
  defaultRoleNames,
  emptyPermission,
  formatDate,
  formatRoleName,
  grantableAgentPermissions,
  grantableApiKeyPermissions,
  getInitials,
  hasAgentDeletePermission,
  isOwner,
  memberEmail,
  memberName,
  memberRoleCount,
  normalizeRole,
  normalizeOrganizationSettingsTab,
  ownerMemberCount,
  pendingInvitationCount,
  roleOptions,
  toggleAgentPermission,
  toggleApiKeyPermission,
  toggleRolePermissionAction,
  workActionColumns,
  workAreas,
  workRoleTemplates,
  type WorkAction,
  type WorkArea,
  type InviteMode,
  type PermissionResource,
  type Tab,
} from "../settings-view-model";

export function OrganizationScreen() {
  const t = useTranslations("Organization");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const account = useAccountContext();
  const organizationId = account.organization.id ?? "";
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteMode, setInviteMode] = useState<InviteMode>("link");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState("");
  const [createdInviteLinkId, setCreatedInviteLinkId] = useState<string | null>(null);
  const [memberAction, setMemberAction] = useState<{ member: OrganizationMember; type: "remove" | "role"; role?: string } | null>(null);
  const [customPermissionsOpen, setCustomPermissionsOpen] = useState(false);

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
  const organizationNotificationQuery = useQuery({
    queryKey: ["organization-notification-settings", organizationId],
    queryFn: () => getOrganizationNotificationPreferences(organizationId),
    enabled: Boolean(
      organizationId &&
      capabilitiesQuery.data?.canUpdateOrganization &&
      capabilitiesQuery.data?.canUpdateCalendarEvents,
    ),
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
  const ownerCount = ownerMemberCount(members);
  const pendingInviteLinks = inviteLinks ?? [];
  const capabilities = capabilitiesQuery.data;
  const currentMemberRole = members.find((member) => member.userId === account.user.id)?.role ?? null;
  const canUpdateOrganization = capabilities?.canUpdateOrganization ?? false;
  const canInviteMembers = capabilities?.canInviteMembers ?? false;
  const canUpdateMembers = capabilities?.canUpdateMembers ?? false;
  const canRemoveMembers = capabilities?.canRemoveMembers ?? false;
  const canReadAgentLinks = capabilities?.canReadOrganization ?? false;
  const canCreateAgentLinks = capabilities?.canReadOrganization ?? false;
  const canDeleteAgentLinks = capabilities?.canReadOrganization ?? false;
  const canReadApiKeys = capabilities?.canReadApiKeys ?? false;
  const canCreateApiKeys = capabilities?.canCreateApiKeys ?? false;
  const canUpdateApiKeys = capabilities?.canUpdateApiKeys ?? false;
  const canDeleteApiKeys = capabilities?.canDeleteApiKeys ?? false;
  const canManageOrganizationNotifications = Boolean(
    capabilities?.canUpdateOrganization && capabilities.canUpdateCalendarEvents,
  );
  const organizationNotificationPreference = useMemo<NotificationPreference>(() => {
    return organizationNotificationQuery.data?.preference ?? {
      ...defaultNotificationPreference,
      organizationId,
      principalType: "organization",
      principalKey: "organization",
    };
  }, [organizationId, organizationNotificationQuery.data?.preference]);
  const canOpenCustomPermissions =
    !membersQuery.isLoading &&
    !capabilitiesQuery.isLoading &&
    canManageCustomPermissions({ capabilities, currentMemberRole });
  const activeTab = normalizeOrganizationSettingsTab(searchParams.get("tab"));

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
  const updateOrganizationNotificationsMutation = useMutation({
    mutationFn: (input: NotificationPreference) => updateOrganizationNotificationPreferences(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-notification-settings", organizationId] });
      toast({ title: t("toasts.notificationSettingsSavedTitle"), description: t("toasts.notificationSettingsSavedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });

  const organizationFormValues = useMemo<UpdateOrganizationProfileValues>(() => ({
    name: account.organization.name,
    legalName: account.organization.legalName ?? "",
    type: account.organization.type ?? "",
    email: account.organization.email ?? "",
    phone: account.organization.phone ?? "",
    website: account.organization.website ?? "",
    address: account.organization.address ?? "",
    logo: account.organization.logo ?? "",
  }), [
    account.organization.address,
    account.organization.email,
    account.organization.legalName,
    account.organization.logo,
    account.organization.name,
    account.organization.phone,
    account.organization.type,
    account.organization.website,
  ]);

  const { register, handleSubmit, reset, getValues, formState: { dirtyFields, errors, isSubmitting } } = useForm<UpdateOrganizationProfileValues>({
    resolver: zodResolver(updateOrganizationProfileSchema),
    defaultValues: organizationFormValues,
  });

  void dirtyFields;

  useEffect(() => {
    reset(organizationFormValues, { keepDirtyValues: true });
  }, [organizationFormValues, reset]);

  const saveOrg = handleSubmit(async (data) => {
    if (!organizationId) {
      toast({ title: t("toasts.actionFailed"), description: t("errors.noOrganization"), type: "error" });
      return;
    }

    try {
      await authOrgMutation.mutateAsync(data.name);
      const profile = await updateProfile.mutateAsync(data);
      reset({
        name: profile.name,
        legalName: profile.legalName,
        type: profile.type,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        address: profile.address,
        logo: profile.logo ?? "",
      });
      toast({ title: t("toasts.profileSavedTitle"), description: t("toasts.profileSavedDesc"), type: "success" });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t("toasts.profileSaveFailed");
      toast({ title: t("toasts.actionFailed"), description: message, type: "error" });
    }
  });

  async function saveOrganizationLogo(logo: string | null) {
    if (!organizationId) return;
    const profile = await updateProfile.mutateAsync({
      ...getValues(),
      logo: logo ?? "",
    });
    reset({
      name: profile.name,
      legalName: profile.legalName,
      type: profile.type,
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      address: profile.address,
      logo: profile.logo ?? "",
    });
    refreshOrganizationData();
  }

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "profile", label: t("tabs.profile"), icon: Building2 },
    { id: "members", label: t("tabs.members"), icon: Users },
    { id: "agentLinks", label: t("tabs.agentLinks"), icon: Bot },
    { id: "apiKeys", label: t("tabs.apiKeys"), icon: KeyRound },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
  ];

  function setActiveOrganizationTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(`/${locale}/settings/organization${query ? `?${query}` : ""}`, { scroll: false });
  }

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
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {organizationId ? (
              <OrganizationLogoUploader
                organizationId={organizationId}
                name={account.organization.name}
                logo={account.organization.logo}
                initials={initials}
                onSaved={saveOrganizationLogo}
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
                  {pendingInvitationCount(invitationsQuery.data ?? [])} {t("stats.pendingInvites")}
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
                onClick={() => setActiveOrganizationTab(tab.id)}
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

      <div className="mx-auto max-w-7xl px-6 py-10">
        {activeTab === "profile" && (
          <div className="space-y-8">
            <div>
              <Section title={t("sections.legal")}>
                <div className="grid gap-5 md:grid-cols-2">
                  <OrgField id="name" label={t("labels.displayName")} registration={register("name")} error={errors.name?.message} disabled={!canUpdateOrganization} />
                  <OrgField id="legalName" label={t("labels.legalName")} registration={register("legalName")} error={errors.legalName?.message} disabled={!canUpdateOrganization} />
                  <OrgField id="type" label={t("labels.type")} registration={register("type")} error={errors.type?.message} disabled={!canUpdateOrganization} />
                  <OrgField id="address" label={t("labels.address")} registration={register("address")} error={errors.address?.message} disabled={!canUpdateOrganization} />
                </div>
              </Section>
            </div>

            <div className="border-t border-zinc-200/60 pt-8 dark:border-white/[0.06]">
              <Section title={t("sections.contact")}>
                <div className="grid gap-5 md:grid-cols-2">
                  <OrgField id="email" label={t("labels.email")} type="email" registration={register("email")} error={errors.email?.message} disabled={!canUpdateOrganization} />
                  <OrgField id="phone" label={t("labels.phone")} type="tel" registration={register("phone")} error={errors.phone?.message} disabled={!canUpdateOrganization} />
                  <OrgField id="website" label={t("labels.website")} type="url" registration={register("website")} error={errors.website?.message} disabled={!canUpdateOrganization} />
                </div>
              </Section>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-8">
            <Section
              title={t("members.title")}
              actions={(
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button disabled={!canInviteMembers} onClick={() => setInviteDialogOpen(true)} className="h-9.5 rounded-lg bg-zinc-900 text-[9px] font-black uppercase tracking-widest text-white hover:bg-black disabled:opacity-50">
                    <Plus className="me-1.5 h-3.5 w-3.5" />
                    {t("invites.open")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canOpenCustomPermissions}
                    onClick={() => setCustomPermissionsOpen(true)}
                    className="h-9.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                  >
                    <ShieldCheck className="me-1.5 h-3.5 w-3.5" />
                    {t("roles.manageWorkRoles")}
                  </Button>
                </div>
              )}
            >
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111]">
                {membersQuery.isLoading ? (
                  <div className="p-4">
                    <LoadingRow label={t("members.loading")} rows={3} />
                  </div>
                ) : members.length === 0 ? (
                  <div className="p-4">
                    <EmptyState title={t("members.emptyTitle")} description={t("members.emptyDesc")} />
                  </div>
                ) : (
                  <div className="px-5 divide-y divide-zinc-100/60 dark:divide-white/[0.04]">
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
                )}
              </div>
            </Section>

            <Section title={t("invites.pendingTitle")} description={t("invites.pendingDesc")}>
              {(invitationsQuery.data ?? []).length === 0 && pendingInviteLinks.length === 0 ? (
                <EmptyState title={t("invites.emptyTitle")} description={t("invites.emptyDesc")} />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white px-5 divide-y divide-zinc-100/60 dark:border-white/[0.06] dark:bg-[#111] dark:divide-white/[0.04]">
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
              )}
            </Section>
          </div>
        )}

        {activeTab === "agentLinks" && (
          <AgentLinksPanel
            organizationId={organizationId}
            canRead={canReadAgentLinks}
            canCreate={canCreateAgentLinks}
            canDelete={canDeleteAgentLinks}
            grantablePermissions={grantableAgentPermissions(capabilities)}
            members={members}
          />
        )}

        {activeTab === "apiKeys" && (
          <ApiKeysPanel
            organizationId={organizationId}
            canRead={canReadApiKeys}
            canCreate={canCreateApiKeys}
            canUpdate={canUpdateApiKeys}
            canDelete={canDeleteApiKeys}
            grantablePermissions={grantableApiKeyPermissions(capabilities)}
          />
        )}

        {activeTab === "notifications" && (
          <OrganizationNotificationsPanel
            preference={organizationNotificationPreference}
            canManage={canManageOrganizationNotifications}
            loading={organizationNotificationQuery.isLoading || capabilitiesQuery.isLoading}
            saving={updateOrganizationNotificationsMutation.isPending}
            onSave={(next) => updateOrganizationNotificationsMutation.mutate(next)}
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
                    <Select value={inviteRole} onValueChange={(value) => value && setInviteRole(value)}>
                      <SelectTrigger
                        id="inviteRole"
                        aria-label={t("invites.roleLabel")}
                        className="h-11 rounded-xl border-zinc-200 bg-white text-sm font-bold dark:border-white/10 dark:bg-[#111]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {formatRoleName(role, defaultRoleLabels)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

      <CustomPermissionsDrawer
        open={customPermissionsOpen}
        onOpenChange={setCustomPermissionsOpen}
      />

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
  { resource: "asset", icon: Home, actions: ["read", "create", "update", "delete"] },
  { resource: "project", icon: Building2, actions: ["read", "create", "update", "delete"] },
  { resource: "calendar", icon: CalendarDays, actions: ["read", "create", "update", "delete"] },
  { resource: "task", icon: CheckCircle2, actions: ["read", "create", "update", "delete"] },
  { resource: "media", icon: FileText, actions: ["read", "create"] },
];

type AgentPresetId = "client" | "asset" | "calendar" | "full";

const agentPresets: Array<{ id: AgentPresetId; permissions: McpConnectionPermission[] }> = [
  {
    id: "client",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "create", "update"] },
      { resource: "asset", actions: ["read"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read", "create", "update"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
  {
    id: "asset",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "update"] },
      { resource: "asset", actions: ["read", "create", "update"] },
      { resource: "project", actions: ["read", "update"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
  {
    id: "calendar",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "asset", actions: ["read"] },
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
      { resource: "asset", actions: ["read", "create", "update", "delete"] },
      { resource: "project", actions: ["read", "create", "update", "delete"] },
      { resource: "calendar", actions: ["read", "create", "update", "delete"] },
      { resource: "task", actions: ["read", "create", "update", "delete"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
];

const notificationCategories: NotificationCategory[] = ["calendar", "task", "manual", "organization"];

function OrganizationNotificationsPanel({
  preference,
  canManage,
  loading,
  saving,
  onSave,
}: {
  preference: NotificationPreference;
  canManage: boolean;
  loading: boolean;
  saving: boolean;
  onSave: (preference: NotificationPreference) => void;
}) {
  const t = useTranslations("Organization.notifications");
  const disabled = !canManage || loading || saving;

  function save(next: NotificationPreference) {
    if (!canManage) return;
    onSave(next);
  }

  return (
    <div className="space-y-6">
      <Section title={t("title")} description={t("description")}>
        <div className="space-y-5">
          {!canManage && <EmptyState title={t("noAccessTitle")} description={t("noAccessDescription")} />}
          {canManage && loading && <LoadingCardGrid label={t("loading")} />}
          {canManage && !loading && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-3">
                <NotificationPolicyRow
                  icon={Bell}
                  label={t("enabled")}
                  note={t("enabledHelp")}
                  enabled={preference.enabled}
                  disabled={disabled}
                  onToggle={() => save({ ...preference, enabled: !preference.enabled })}
                />
                {notificationCategories.map((category) => (
                  <NotificationPolicyRow
                    key={category}
                    icon={category === "calendar" ? CalendarDays : category === "task" ? CheckCircle2 : category === "organization" ? Building2 : Clock}
                    label={t(`categories.${category}`)}
                    note={t(`categoryHelp.${category}`)}
                    enabled={preference.categories[category]}
                    disabled={disabled || !preference.enabled}
                    onToggle={() => save({
                      ...preference,
                      categories: {
                        ...preference.categories,
                        [category]: !preference.categories[category],
                      },
                    })}
                  />
                ))}
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/5 dark:text-zinc-200">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">{t("defaultsTitle")}</p>
                    <p className="mt-1 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">{t("defaultsDescription")}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {preference.reminderRules.map((rule) => (
                    <span
                      key={rule.id}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest",
                        rule.enabled
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.03]",
                      )}
                    >
                      {rule.sourceType === "calendarEvent" ? t("calendarRule") : t("taskRule")}{" "}
                      {rule.trigger === "at_start" ? t("atStart") : t("minutesBefore", { minutes: rule.offsetMinutes })}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">{t("personalOverride")}</p>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function NotificationPolicyRow({
  icon: Icon,
  label,
  note,
  enabled,
  disabled,
  onToggle,
}: {
  icon: typeof Bell;
  label: string;
  note: string;
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-white p-4 text-start transition-colors hover:border-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.06] dark:bg-[#111] dark:hover:border-white/10"
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/5 dark:text-zinc-200">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-zinc-900 dark:text-white">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">{note}</span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
          enabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform dark:bg-zinc-950",
            enabled && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}

function AgentLinksPanel({
  organizationId,
  canRead,
  canCreate,
  canDelete,
  grantablePermissions,
  members,
}: {
  organizationId: string;
  canRead: boolean;
  canCreate: boolean;
  canDelete: boolean;
  grantablePermissions: McpConnectionPermission[];
  members: OrganizationMember[];
}) {
  const t = useTranslations("Organization.agentLinks");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<OrganizationMcpConnection | null>(null);
  const [agentName, setAgentName] = useState(() => t("presets.client"));
  const [instructions, setInstructions] = useState(() => t("defaults.instructions"));
  const [presetId, setPresetId] = useState<AgentPresetId | "custom">("client");
  const [principalType, setPrincipalType] = useState<OrganizationMcpConnection["principalType"]>("user");
  const [agentExpiry, setAgentExpiry] = useState<OrganizationApiKeyExpiry>("30d");
  const [permissions, setPermissions] = useState<McpConnectionPermission[]>(cloneAgentPermissions(agentPresets[0].permissions));
  const [allowDelete, setAllowDelete] = useState(false);
  const [oneTimeLink, setOneTimeLink] = useState("");
  const [oneTimePermissions, setOneTimePermissions] = useState<McpConnectionPermission[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const selectedGrantablePermissions = clampAgentPermissionsToGrantable(permissions, grantablePermissions);
  const memberByUserId = new Map(members.map((member) => [member.userId, member]));

  const query = useQuery({
    queryKey: ["organization-mcp-connections", organizationId],
    queryFn: () => listOrganizationMcpConnections(organizationId),
    enabled: Boolean(organizationId && canRead),
  });

  const createMutation = useMutation({
    mutationFn: () => createOrganizationMcpConnection(organizationId, {
      name: agentName,
      instructions,
      principalType,
      permissions: selectedGrantablePermissions,
      expiresAt: expiryTimestamp(agentExpiry),
    }),
    onSuccess: async (result) => {
      setOneTimeLink(result.agentLink);
      setOneTimePermissions(cloneAgentPermissions(selectedGrantablePermissions));
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      await navigator.clipboard?.writeText(result.agentLink).catch(() => undefined);
      toast({ title: t("toasts.readyTitle"), description: t("toasts.readyDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ connection, input }: {
      connection: OrganizationMcpConnection;
      input: Parameters<typeof updateOrganizationMcpConnection>[2];
    }) => updateOrganizationMcpConnection(organizationId, connection.id, input),
    onSuccess: () => {
      setEditingConnection(null);
      setDialogOpen(false);
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
      setOneTimePermissions(cloneAgentPermissions(result.connection.permissions));
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
    setPermissions(clampAgentPermissionsToGrantable(cloneAgentPermissions(preset.permissions), grantablePermissions));
    setAgentName(t(`presets.${preset.id}`));
    setAllowDelete(false);
  }

  function openNewAgentLinkDialog() {
    const defaultPreset = agentPresets[0];
    setEditingConnection(null);
    setPresetId(defaultPreset.id);
    setPrincipalType("user");
    setAgentExpiry("30d");
    setPermissions(clampAgentPermissionsToGrantable(cloneAgentPermissions(defaultPreset.permissions), grantablePermissions));
    setAgentName(t(`presets.${defaultPreset.id}`));
    setInstructions(t("defaults.instructions"));
    setAllowDelete(false);
    setOneTimeLink("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function openEditAgentLinkDialog(connection: OrganizationMcpConnection) {
    setEditingConnection(connection);
    setPresetId("custom");
    setPrincipalType(connection.principalType);
    setAgentExpiry(connection.expiresAt ? "30d" : "never");
    setPermissions(clampAgentPermissionsToGrantable(cloneAgentPermissions(connection.permissions), grantablePermissions));
    setAgentName(connection.name);
    setInstructions(connection.instructions ?? "");
    setAllowDelete(hasAgentDeletePermission(connection.permissions));
    setOneTimeLink("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function togglePermission(resource: McpPermissionResource, action: McpPermissionAction) {
    setPresetId("custom");
    setPermissions((current) => toggleAgentPermission(current, grantablePermissions, resource, action));
  }

  async function copyOneTimeLink() {
    if (!oneTimeLink) return;
    await navigator.clipboard?.writeText(oneTimeLink);
    toast({ title: t("toasts.copiedTitle"), description: t("toasts.copiedDescription"), type: "success" });
  }

  const requiresDeleteConfirmation = hasAgentDeletePermission(selectedGrantablePermissions);
  const canSubmit = canCreate && agentName.trim() && selectedGrantablePermissions.length > 0 && (!requiresDeleteConfirmation || allowDelete);
  const isEditing = Boolean(editingConnection);
  const connections = query.data ?? [];
  const {
    draftConnections,
    visibleConnections,
    stats: agentStats,
  } = agentConnectionProjection(connections, showDrafts);
  const oneTimePermissionSummary = agentPermissionSummary(oneTimePermissions, {
    resource: (resource) => t(`resources.${resource}`),
    action: (action) => t(`actions.${action}`),
  });
  const connectionCard = (connection: OrganizationMcpConnection) => {
    const creator = memberByUserId.get(connection.createdByUserId);
    const creatorName = creator ? memberName(creator) : connection.createdByUserId;
    const creatorEmail = creator ? memberEmail(creator) : connection.createdByUserId;
    const creatorImage = creator?.user?.image;
    const isDraft = connection.status === "draft";

    return (
      <div key={connection.id} className={cn("rounded-2xl border border-zinc-100 bg-white p-4.5 transition-all dark:border-white/[0.04] dark:bg-[#111]", isDraft && "border-sky-200/60 bg-sky-500/5 dark:border-sky-500/10")}>
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusPill label={t(`status.${connection.status}`)} tone={connection.status === "active" ? "success" : connection.status === "paused" || isDraft ? "warning" : "neutral"} />
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-500 dark:bg-white/5">{t("labels.keyEnding", { last4: connection.keyLast4 })}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-black text-zinc-500 dark:bg-white/5">{t(`principal.${connection.principalType}.title`)}</span>
              </div>
              <p className="mt-2.5 truncate text-sm font-black text-zinc-800 dark:text-zinc-200">{connection.name}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50/50 px-2.5 py-1.5 dark:bg-white/[0.01]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-[9px] font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {creatorImage ? (
                <span
                  aria-label={creatorName}
                  role="img"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${creatorImage})` }}
                />
              ) : getInitials(creatorName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black text-zinc-900 dark:text-white">{creatorName}</p>
              <p className="truncate text-[9px] font-bold text-zinc-400">{t("labels.createdBy", { email: creatorEmail })}</p>
            </div>
          </div>
          
          <p className="line-clamp-2 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
            {agentPermissionSummary(connection.permissions, {
              resource: (resource) => t(`resources.${resource}`),
              action: (action) => t(`actions.${action}`),
            }) || t("labels.noWork")}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>{t("labels.used", { count: connection.usageCount })}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>{t("labels.created", { date: formatDate(connection.createdAt) })}</span>
            {connection.lastUsedAt && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span>{t("labels.lastUsed", { date: formatDate(connection.lastUsedAt) })}</span>
              </>
            )}
          </div>

          <div className="mt-auto flex flex-wrap gap-1.5 border-t border-zinc-100/60 pt-3 dark:border-white/[0.04]">
            {connection.status !== "revoked" && (
              <Button
                variant="outline"
                disabled={!canCreate || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ connection, input: { status: connection.status === "active" ? "paused" : "active" } })}
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5"
              >
                <PauseCircle className="me-1.5 h-3.5 w-3.5" />
                {connection.status === "active" ? t("buttons.pause") : t("buttons.resume")}
              </Button>
            )}
            {connection.status !== "revoked" && (
              <Button
                variant="outline"
                disabled={!canCreate || updateMutation.isPending}
                onClick={() => openEditAgentLinkDialog(connection)}
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5"
              >
                <Save className="me-1.5 h-3.5 w-3.5" />
                {t("buttons.edit")}
              </Button>
            )}
            {connection.status !== "revoked" && !isDraft && (
              <Button
                variant="outline"
                disabled={!canCreate || rotateMutation.isPending}
                onClick={() => rotateMutation.mutate(connection)}
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5"
              >
                <RefreshCcw className="me-1.5 h-3.5 w-3.5" />
                {t("buttons.rotate")}
              </Button>
            )}
            {connection.status !== "revoked" && !isDraft && (
              <Button
                variant="outline"
                disabled={!canDelete || revokeMutation.isPending}
                onClick={() => revokeMutation.mutate(connection)}
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 text-sky-700 border-sky-100 bg-sky-500/5 hover:bg-sky-500/10 dark:border-sky-500/15"
              >
                <Trash2 className="me-1.5 h-3.5 w-3.5" />
                {t("buttons.moveToDraft")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Section
        title={t("title")}
        description={t("description")}
        actions={(
          <Button
            disabled={!canCreate}
            onClick={openNewAgentLinkDialog}
            className="h-10 rounded-lg bg-zinc-900 px-4 text-[9px] font-black uppercase tracking-widest text-white hover:bg-black"
          >
            <Plus className="me-1.5 h-3.5 w-3.5" />
            {t("newButton")}
          </Button>
        )}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-zinc-400">
            <span>{t("stats.active")}: <strong className="text-zinc-700 dark:text-zinc-300">{agentStats.active}</strong></span>
            <span className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span>{t("stats.calls")}: <strong className="text-zinc-700 dark:text-zinc-300">{agentStats.calls}</strong></span>
            <span className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span>{t("stats.drafts")}: <strong className="text-zinc-700 dark:text-zinc-300">{agentStats.drafts}</strong></span>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {!canRead && <EmptyState title={t("empty.noAccessTitle")} description={t("empty.noAccessDescription")} />}
            {canRead && query.isLoading && <LoadingCardGrid label={t("empty.loading")} />}
            {canRead && !query.isLoading && visibleConnections.length === 0 && <EmptyState title={t("empty.noLinksTitle")} description={t("empty.noLinksDescription")} />}
            {visibleConnections.map(connectionCard)}
          </div>
          
          {canRead && draftConnections.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowDrafts((current) => !current)}
                className="h-8.5 rounded-full px-4 text-[9px] font-black uppercase tracking-widest"
              >
                {showDrafts ? t("buttons.hideDrafts") : t("buttons.showDrafts", { count: draftConnections.length })}
              </Button>
            </div>
          )}
        </div>
      </Section>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingConnection(null);
          setOneTimeLink("");
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-lg font-black text-zinc-900 dark:text-white">
              {oneTimeLink ? t("modal.readyTitle") : isEditing ? t("modal.editTitle") : t("modal.newTitle")}
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.name")}</Label>
                  <Input id="agentName" value={agentName} onChange={(event) => setAgentName(event.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.startWith")}</Label>
                  <Select value={presetId} onValueChange={(value) => {
                    if (value) applyPreset(value);
                  }}>
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white text-sm font-bold dark:border-white/10 dark:bg-[#111]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                      {agentPresets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {t(`presets.${preset.id}`)}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">{t("presets.custom")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.expiry")}</Label>
                  <Select value={agentExpiry} onValueChange={(value) => {
                    if (value) setAgentExpiry(value);
                  }}>
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white text-sm font-bold dark:border-white/10 dark:bg-[#111]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                      {apiKeyExpiryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {t(`expiry.${option}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  const activeActions = agentPermissionActions(permissions, area.resource);
                  const allowedActions = agentPermissionActions(grantablePermissions, area.resource);
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
                            disabled={!allowedActions.includes(action)}
                            onClick={() => togglePermission(area.resource, action)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                              activeActions.includes(action) && allowedActions.includes(action)
                                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-transparent dark:hover:text-white",
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
                  disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}
                  onClick={() => {
                    if (editingConnection) {
                      updateMutation.mutate({
                        connection: editingConnection,
                        input: {
                          name: agentName,
                          instructions,
                          permissions: selectedGrantablePermissions,
                          expiresAt: agentExpiry === "never" ? null : expiryTimestamp(agentExpiry),
                        },
                      });
                      return;
                    }
                    createMutation.mutate();
                  }}
                  className="bg-zinc-900 text-white hover:bg-black"
                >
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <KeyRound className="me-2 h-4 w-4" />}
                  {isEditing ? t("modal.save") : t("modal.make")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const apiKeyPermissionAreas: Array<{
  resource: OrganizationApiKeyResource;
  icon: typeof Users;
  actions: OrganizationApiKeyAction[];
}> = [
  { resource: "organization", icon: Building2, actions: ["read", "create", "update", "delete"] },
  { resource: "client", icon: Users, actions: ["read", "create", "update", "delete"] },
  { resource: "asset", icon: Home, actions: ["read", "create", "update", "delete"] },
  { resource: "project", icon: Building2, actions: ["read", "create", "update", "delete"] },
  { resource: "calendar", icon: CalendarDays, actions: ["read", "create", "update", "delete"] },
  { resource: "task", icon: CheckCircle2, actions: ["read", "create", "update", "delete"] },
  { resource: "media", icon: FileText, actions: ["read", "create", "update", "delete"] },
];

const apiKeyExpiryOptions: OrganizationApiKeyExpiry[] = ["5h", "14d", "30d", "never"];

function expiryTimestamp(expiry: OrganizationApiKeyExpiry) {
  if (expiry === "never") return undefined;
  const now = Date.now();
  if (expiry === "5h") return now + 5 * 60 * 60 * 1000;
  if (expiry === "14d") return now + 14 * 24 * 60 * 60 * 1000;
  return now + 30 * 24 * 60 * 60 * 1000;
}

function organizationApiBaseUrl(organizationId: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/api/v1/partner/organizations/${encodeURIComponent(organizationId)}`;
}

function organizationApiStarterRequest(apiBaseUrl: string, apiKey: string) {
  return `curl -H "Authorization: Bearer ${apiKey}" "${apiBaseUrl}/me"`;
}

function ApiKeysPanel({
  organizationId,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
  grantablePermissions,
}: {
  organizationId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  grantablePermissions: OrganizationApiKeyPermission[];
}) {
  const t = useTranslations("Organization.apiKeys");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rotatingKey, setRotatingKey] = useState<OrganizationApiKey | null>(null);
  const [keyName, setKeyName] = useState("");
  const [expiry, setExpiry] = useState<OrganizationApiKeyExpiry>("30d");
  const [permissions, setPermissions] = useState<OrganizationApiKeyPermission[]>(defaultApiKeyPermissions(grantablePermissions));
  const [oneTimeKey, setOneTimeKey] = useState("");
  const [oneTimePermissions, setOneTimePermissions] = useState<OrganizationApiKeyPermission[]>([]);
  const selectedPermissions = clampApiKeyPermissionsToGrantable(permissions, grantablePermissions);

  const query = useQuery({
    queryKey: ["organization-api-keys", organizationId],
    queryFn: () => listOrganizationApiKeys(organizationId),
    enabled: Boolean(organizationId && canRead),
  });

  const createMutation = useMutation({
    mutationFn: () => createOrganizationApiKey(organizationId, {
      name: keyName,
      expiry,
      permissions: selectedPermissions,
    }),
    onSuccess: async (result) => {
      setOneTimeKey(result.apiKey);
      setOneTimePermissions(cloneApiKeyPermissions(selectedPermissions));
      queryClient.invalidateQueries({ queryKey: ["organization-api-keys", organizationId] });
      await navigator.clipboard?.writeText(result.apiKey).catch(() => undefined);
      toast({ title: t("toasts.readyTitle"), description: t("toasts.readyDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const rotateMutation = useMutation({
    mutationFn: () => {
      if (!rotatingKey) throw new Error(t("toasts.failedDescription"));
      return rotateOrganizationApiKey(organizationId, rotatingKey.id, { expiry });
    },
    onSuccess: async (result) => {
      setOneTimeKey(result.apiKey);
      setOneTimePermissions(cloneApiKeyPermissions(result.key.permissions));
      queryClient.invalidateQueries({ queryKey: ["organization-api-keys", organizationId] });
      await navigator.clipboard?.writeText(result.apiKey).catch(() => undefined);
      toast({ title: t("toasts.rotatedTitle"), description: t("toasts.rotatedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const revokeMutation = useMutation({
    mutationFn: (key: OrganizationApiKey) => revokeOrganizationApiKey(organizationId, key.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-api-keys", organizationId] });
      toast({ title: t("toasts.revokedTitle"), description: t("toasts.revokedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  function openCreateDialog() {
    setRotatingKey(null);
    setKeyName(t("defaults.name"));
    setExpiry("30d");
    setPermissions(defaultApiKeyPermissions(grantablePermissions));
    setOneTimeKey("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function openRotateDialog(key: OrganizationApiKey) {
    setRotatingKey(key);
    setKeyName(key.name);
    setExpiry("30d");
    setPermissions(cloneApiKeyPermissions(key.permissions));
    setOneTimeKey("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function togglePermission(resource: OrganizationApiKeyResource, action: OrganizationApiKeyAction) {
    setPermissions((current) => toggleApiKeyPermission(current, grantablePermissions, resource, action));
  }

  async function copyOneTimeKey() {
    if (!oneTimeKey) return;
    await navigator.clipboard?.writeText(oneTimeKey);
    toast({ title: t("toasts.copiedTitle"), description: t("toasts.copiedDescription"), type: "success" });
  }

  const keys = query.data ?? [];
  const stats = apiKeyStats(keys);
  const canSubmit = rotatingKey ? canUpdate : canCreate && keyName.trim() && selectedPermissions.length > 0;
  const oneTimePermissionSummary = apiKeyPermissionSummary(oneTimePermissions, {
    resource: (resource) => t(`resources.${resource}`),
    action: (action) => t(`actions.${action}`),
  });
  const oneTimeApiBaseUrl = organizationApiBaseUrl(organizationId);
  const oneTimeStarterRequest = organizationApiStarterRequest(oneTimeApiBaseUrl, oneTimeKey);

  return (
    <div className="space-y-6">
      <Section
        title={t("title")}
        description={t("description")}
        actions={(
          <Button
            disabled={!canCreate}
            onClick={openCreateDialog}
            className="h-10 rounded-lg bg-zinc-900 px-4 text-[9px] font-black uppercase tracking-widest text-white hover:bg-black"
          >
            <Plus className="me-1.5 h-3.5 w-3.5" />
            {t("newButton")}
          </Button>
        )}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-zinc-400">
            <span>{t("stats.active")}: <strong className="text-zinc-700 dark:text-zinc-300">{stats.active}</strong></span>
            <span className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span>{t("stats.quota")}: <strong className="text-zinc-700 dark:text-zinc-300">{t("stats.quotaValue")}</strong></span>
            <span className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span>{t("stats.calls")}: <strong className="text-zinc-700 dark:text-zinc-300">{stats.calls}</strong></span>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {!canRead && <EmptyState title={t("empty.noAccessTitle")} description={t("empty.noAccessDescription")} />}
            {canRead && query.isLoading && <LoadingCardGrid label={t("empty.loading")} />}
            {canRead && !query.isLoading && keys.length === 0 && <EmptyState title={t("empty.noKeysTitle")} description={t("empty.noKeysDescription")} />}
            {keys.map((key) => (
            <div key={key.id} className="rounded-2xl border border-zinc-100 bg-white p-4.5 transition-all dark:border-white/[0.04] dark:bg-[#111]">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusPill label={t(`status.${key.status}`)} tone={key.status === "active" ? "success" : key.status === "expired" ? "warning" : "neutral"} />
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-500 dark:bg-white/5">{t("labels.keyEnding", { last4: key.keyLast4 })}</span>
                    </div>
                    <p className="mt-2.5 truncate text-sm font-black text-zinc-800 dark:text-zinc-200">{key.name}</p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                </div>
                
                <p className="line-clamp-2 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
                  {apiKeyPermissionSummary(key.permissions, {
                    resource: (resource) => t(`resources.${resource}`),
                    action: (action) => t(`actions.${action}`),
                  }) || t("labels.noWork")}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>{t("labels.used", { count: key.usageCount })}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span>{t("labels.quota", { used: key.quotaUsed, limit: key.quotaLimit })}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span>{key.expiresAt ? t("labels.expires", { date: formatDate(key.expiresAt) }) : t("labels.neverExpires")}</span>
                  {key.lastUsedAt && (
                    <>
                      <span className="h-0.5 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span>{t("labels.lastUsed", { date: formatDate(key.lastUsedAt) })}</span>
                    </>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-zinc-100/60 pt-3 dark:border-white/[0.04]">
                  {key.status !== "revoked" && (
                    <Button
                      variant="outline"
                      disabled={!canUpdate || rotateMutation.isPending}
                      onClick={() => openRotateDialog(key)}
                      className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5"
                    >
                      <RefreshCcw className="me-1.5 h-3.5 w-3.5" />
                      {t("buttons.rotate")}
                    </Button>
                  )}
                  {key.status !== "revoked" && (
                    <Button
                      variant="outline"
                      disabled={!canDelete || revokeMutation.isPending}
                      onClick={() => revokeMutation.mutate(key)}
                      className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 text-red-600 border-red-100 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/15"
                    >
                      <Trash2 className="me-1.5 h-3.5 w-3.5" />
                      {t("buttons.revoke")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </Section>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setOneTimeKey("");
          setRotatingKey(null);
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-lg font-black text-zinc-900 dark:text-white">
              {oneTimeKey ? t("modal.readyTitle") : rotatingKey ? t("modal.rotateTitle") : t("modal.newTitle")}
            </DialogTitle>
          </DialogHeader>

          {oneTimeKey ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {t("modal.oneTimeWarning")}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                <p className="text-sm font-black text-zinc-900 dark:text-white">{t("modal.canDoTitle")}</p>
                <p className="mt-1 text-xs leading-6 text-zinc-600 dark:text-zinc-300">{oneTimePermissionSummary}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeyBaseUrl" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.apiUrl")}</Label>
                <Input id="apiKeyBaseUrl" readOnly dir="ltr" value={oneTimeApiBaseUrl} className="h-12 rounded-xl font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeyExampleRequest" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.exampleRequest")}</Label>
                <textarea
                  id="apiKeyExampleRequest"
                  readOnly
                  dir="ltr"
                  value={oneTimeStarterRequest}
                  className="min-h-24 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-3 font-mono text-xs leading-5 text-zinc-900 shadow-sm outline-none dark:border-white/10 dark:bg-[#111] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeySecret" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.secret")}</Label>
                <Input id="apiKeySecret" readOnly dir="ltr" value={oneTimeKey} className="h-12 rounded-xl font-mono text-xs" />
              </div>
              <DialogFooter className="justify-start">
                <Button onClick={copyOneTimeKey} className="bg-zinc-900 text-white hover:bg-black">
                  <Copy className="me-2 h-4 w-4" />
                  {t("buttons.copy")}
                </Button>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.close")}</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              {!rotatingKey && (
                <div className="space-y-2">
                  <Label htmlFor="apiKeyName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.name")}</Label>
                  <Input id="apiKeyName" value={keyName} onChange={(event) => setKeyName(event.target.value)} className="h-11 rounded-xl" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="apiKeyExpiry" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("modal.expiry")}</Label>
                <select id="apiKeyExpiry" value={expiry} onChange={(event) => setExpiry(event.target.value as OrganizationApiKeyExpiry)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-[#111]">
                  {apiKeyExpiryOptions.map((option) => <option key={option} value={option}>{t(`expiry.${option}`)}</option>)}
                </select>
              </div>
              {!rotatingKey && (
                <div className="grid gap-3 md:grid-cols-2">
                  {apiKeyPermissionAreas.map((area) => {
                    const Icon = area.icon;
                    const activeActions = apiKeyPermissionActions(permissions, area.resource);
                    const allowedActions = apiKeyPermissionActions(grantablePermissions, area.resource);
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
                              disabled={!allowedActions.includes(action)}
                              onClick={() => togglePermission(area.resource, action)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                                activeActions.includes(action) && allowedActions.includes(action)
                                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                  : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-transparent dark:hover:text-white",
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
              )}
              <DialogFooter className="justify-start">
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.cancel")}</Button>
                <Button
                  disabled={!canSubmit || createMutation.isPending || rotateMutation.isPending}
                  onClick={() => rotatingKey ? rotateMutation.mutate() : createMutation.mutate()}
                  className="bg-zinc-900 text-white hover:bg-black"
                >
                  {createMutation.isPending || rotateMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <KeyRound className="me-2 h-4 w-4" />}
                  {rotatingKey ? t("modal.rotate") : t("modal.make")}
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
  return <RoleManagementPanel />;
}

function CustomPermissionsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Organization");
  const locale = useLocale();
  const side = locale === "ar" ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="!w-[min(96vw,1120px)] !max-w-none border-zinc-200 bg-zinc-50/95 p-0 shadow-2xl dark:border-white/10 dark:bg-[#0A0A0A]"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b border-zinc-200 bg-white px-6 py-6 pe-14 dark:border-white/[0.06] dark:bg-[#111111]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
              {t("roles.pageEyebrow")}
            </p>
            <SheetTitle className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              {t("roles.pageTitle")}
            </SheetTitle>
            <SheetDescription className="max-w-3xl text-xs font-medium leading-5 text-zinc-500 dark:text-zinc-400">
              {t("roles.pageDesc")}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <RoleManagementPanel surface="drawer" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RoleManagementPanel({ surface = "page" }: { surface?: "page" | "drawer" }) {
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
    setRolePermission((current) => toggleRolePermissionAction(current, resource, action));
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

  const content = (
    <div className={surface === "drawer" ? "space-y-8" : "mx-auto max-w-5xl space-y-8 px-6 py-10"}>
      <Section title={editingRole ? t("roles.editTitle") : t("roles.createTitle")} description={t("roles.createDesc")}>
        <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#111]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="roleName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("roles.name")}</Label>
              <Input id="roleName" value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder={t("roles.namePlaceholder")} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleTemplate" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("roles.templateSelect")}</Label>
              <Select value={templateId} onValueChange={(value) => value && applyTemplate(value)}>
                <SelectTrigger
                  id="roleTemplate"
                  size="sm"
                  className="h-11 rounded-xl border-zinc-200 bg-white px-3 text-sm font-extrabold text-zinc-950 hover:bg-zinc-50 focus:bg-white dark:border-white/10 dark:bg-[#111] dark:text-white dark:hover:bg-white/[0.07] dark:focus:bg-white/[0.07]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  sideOffset={8}
                  className="rounded-xl border-zinc-200 bg-white p-1.5 dark:border-white/10 dark:bg-[#111]"
                >
                  <SelectItem value="blank" className="rounded-lg py-2.5 text-sm font-bold">
                    {t("roles.templateBlank")}
                  </SelectItem>
                  {workRoleTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="rounded-lg py-2.5 text-sm font-bold">
                      {t(`roles.templates.${template.labelKey}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          {rolesQuery.isLoading && <LoadingRow label={t("roles.loading")} rows={2} />}
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
                memberCount={memberRoleCount(members, role.role)}
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
  );

  if (surface === "drawer") {
    return content;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0A0A0A]">
      <div className="border-b border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111111]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Link href={`/${locale}/settings/organization?tab=members`} className={cn(buttonVariants({ variant: "ghost" }), "mb-5 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest")}>
            {t("roles.backToOrganization")}
          </Link>
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

      {content}
    </div>
  );
}

function Section({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-900 dark:text-white">{title}</h2>
          {description && <p className="mt-1 max-w-3xl text-[10px] font-medium leading-5 text-zinc-400">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

function OrgField({ id, label, type = "text", registration, error, disabled }: { id: string; label: string; type?: string; registration: UseFormRegisterReturn; error?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">{label}</Label>
      <Input
        id={id}
        type={type}
        disabled={disabled}
        className="h-10 rounded-lg border-zinc-200 bg-white/50 text-xs font-semibold shadow-none transition-colors focus-visible:border-zinc-400 focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-zinc-100/60 disabled:text-zinc-400 dark:border-white/10 dark:bg-[#0c0c0c] dark:disabled:bg-white/[0.03] dark:focus-visible:border-zinc-700"
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error && <p className="text-[9px] font-bold uppercase tracking-wider text-red-500">{error}</p>}
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
    <div className="flex flex-col gap-4 py-4.5 border-b border-zinc-100/60 dark:border-white/[0.04] last:border-b-0 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-xs font-black uppercase text-zinc-500 dark:bg-white/5">
          {member.user?.image ? <img src={member.user.image} alt={name} className="h-full w-full object-cover" /> : getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-zinc-900 dark:text-white">
            {name} {isCurrentUser && <span className="text-[9px] font-bold text-zinc-400">({labels.currentUser})</span>}
          </p>
          <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-widest text-zinc-400">{email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{labels.joined} {formatDate(member.createdAt)}</span>
        <select
          value={member.role}
          disabled={isLastOwner || !canUpdateRole}
          onChange={(event) => onChangeRole(event.target.value)}
          className="h-8.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-bold transition-colors dark:border-white/10 dark:bg-[#111]"
          aria-label={labels.role}
        >
          {roles.map((role) => <option key={role} value={role}>{formatRoleName(role, roleLabels)}</option>)}
        </select>
        <Button variant="outline" disabled={isCurrentUser || isLastOwner || !canRemove} onClick={onRemove} className="h-8.5 rounded-lg border-red-100 bg-red-500/5 px-3 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-500/10 dark:border-red-500/15">
          <Trash2 className="me-1.5 h-3.5 w-3.5" />
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
    <div className="flex flex-col gap-4 py-4.5 border-b border-zinc-100/60 dark:border-white/[0.04] last:border-b-0 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-zinc-900 dark:text-white">{invite.email}</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
          {labels.emailTitle} &bull; {formatRoleName(invite.role, roleLabels)} &bull; {invite.status} &bull; {formatDate(invite.expiresAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCopy} className="h-8.5 rounded-lg text-[9px] font-black uppercase tracking-widest px-3">
          {copied ? <CheckCircle2 className="me-1.5 h-3.5 w-3.5 text-emerald-500" /> : <Copy className="me-1.5 h-3.5 w-3.5" />}
          {copied ? labels.copied : labels.copy}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={canceling} className="h-8.5 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 text-red-600 border-red-100 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/15">
          <Trash2 className="me-1.5 h-3.5 w-3.5" />
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
    <div className="flex flex-col gap-4 py-4.5 border-b border-zinc-100/60 dark:border-white/[0.04] last:border-b-0 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-zinc-900 dark:text-white">{labels.linkTitle}</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
          {formatRoleName(inviteLink.role, roleLabels)} &bull; {inviteLink.status} &bull; {labels.expires} {formatDate(inviteLink.expiresAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCancel} disabled={canceling} className="h-8.5 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 text-red-600 border-red-100 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/15">
          <Trash2 className="me-1.5 h-3.5 w-3.5" />
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
            const Icon = workAreaIcon(area.resource);

            return (
              <tr key={area.resource} className="border-b border-zinc-100 last:border-b-0 dark:border-white/[0.06]">
                <td className="px-4 py-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-zinc-900 dark:text-white">{getAreaLabel(area.labelKey)}</p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500 dark:text-zinc-400">{getAreaHelp(area.helperKey)}</p>
                    </div>
                  </div>
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

function workAreaIcon(resource: PermissionResource) {
  const icons: Record<PermissionResource, typeof Users> = {
    organization: Building2,
    team: Users,
    member: Users,
    project: Building2,
    asset: Home,
    client: Users,
    task: CheckCircle2,
    calendar: CalendarDays,
    media: FileText,
    visibility: ShieldCheck,
    integration: LinkIcon,
    apiKey: KeyRound,
    oauthApp: LinkIcon,
    role: UserRoundCog,
  };

  return icons[resource];
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
        <Link href={href} className={cn(buttonVariants(), "mt-6 h-11 rounded-xl bg-zinc-900 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black")}>
          {action}
        </Link>
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

function LoadingRow({ label, rows = 1 }: { label: string; rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#111]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full rounded-full" />
              <Skeleton className="h-3 w-56 max-w-full rounded-full" />
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingCardGrid({ label }: { label: string }) {
  return (
    <div className="contents" role="status" aria-label={label}>
      {[0, 1].map((item) => (
        <div key={item} className="rounded-2xl border border-zinc-100 bg-white p-4.5 dark:border-white/[0.04] dark:bg-[#111]">
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40 max-w-full rounded-full" />
              </div>
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/[0.05]">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
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

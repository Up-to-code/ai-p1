"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Bell, Building2, CreditCard, Copy, HelpCircle, KeyRound, LinkIcon, Loader2, Mail, Plus, Save, ShieldCheck, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuthSession } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link as LocaleLink } from "@/i18n/routing";
import {
  defaultNotificationPreference,
  getOrganizationNotificationPreferences,
  updateOrganizationNotificationPreferences,
  type NotificationPreference,
} from "@/domains/notifications/api/notifications";
import { updateOrganizationProfileSchema, type UpdateOrganizationProfileValues } from "../../validation/organization.schema";
import { useUpdateOrganizationProfileMutation } from "../../api/use-update-profile";
import {
  cancelOrganizationInviteLink,
  cancelOrganizationInvitation,
  createOrganizationInviteLink,
  createOrganizationInvitation,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationRoles,
  getOrganizationCapabilities,
  removeOrganizationMember,
  updateAuthOrganization,
  updateOrganizationMemberRole,
  type OrganizationInvitation,
  type OrganizationMember,
} from "../../api";
import {
  canManageCustomPermissions,
  formatRoleName,
  getInitials,
  grantableApiKeyPermissions,
  isOwner,
  memberName,
  normalizeOrganizationSettingsTab,
  ownerMemberCount,
  pendingInvitationCount,
  roleOptions,
  type InviteMode,
  type Tab,
} from "../../settings-view-model";
import { invalidateOrganizationSettings, organizationSettingsKeys } from "../../settings-cache";
import { OrganizationLogoUploader } from "../organization-logo-uploader";
import {
  EmptyState,
  LoadingRow,
  MemberRow,
  NoOrganizationState,
  OrgField,
  OrganizationSettingsSkeleton,
  PendingInviteLinkRow,
  PendingInviteRow,
  Section,
} from "../shared";
import { AgentLinksPanel } from "../panels/agent-links-panel";
import { ApiKeysPanel } from "../panels/api-keys-panel";
import { OrganizationBillingPanel } from "../panels/organization-billing-panel";
import { OrganizationNotificationsPanel } from "../panels/organization-notifications-panel";
import { CustomPermissionsDrawer } from "./custom-permissions-screen";

export function OrganizationScreen() {
  const t = useTranslations("Organization");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useAuthSession();
  const organizationId = session.organization.id ?? "";
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
    queryKey: organizationSettingsKeys.members(organizationId),
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: Boolean(organizationId),
  });
  const invitationsQuery = useQuery({
    queryKey: organizationSettingsKeys.invitations(organizationId),
    queryFn: () => listOrganizationInvitations(organizationId),
    enabled: Boolean(organizationId),
  });
  const rolesQuery = useQuery({
    queryKey: organizationSettingsKeys.roles(organizationId),
    queryFn: () => listOrganizationRoles(organizationId),
    enabled: Boolean(organizationId),
  });
  const capabilitiesQuery = useQuery({
    queryKey: organizationSettingsKeys.capabilities(organizationId),
    queryFn: () => getOrganizationCapabilities(organizationId),
    enabled: Boolean(organizationId),
  });
  const organizationNotificationQuery = useQuery({
    queryKey: organizationSettingsKeys.notifications(organizationId),
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
  const currentMemberRole = members.find((member) => member.userId === session.user.id)?.role ?? null;
  const canUpdateOrganization = capabilities?.canUpdateOrganization ?? false;
  const canInviteMembers = capabilities?.canInviteMembers ?? false;
  const canUpdateMembers = capabilities?.canUpdateMembers ?? false;
  const canRemoveMembers = capabilities?.canRemoveMembers ?? false;

  // Billing: single plan, no hard member cap — seats scale via DodoPayments add-ons
  const atMemberLimit = false; // no fixed cap on the single plan
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
    void invalidateOrganizationSettings(queryClient, organizationId, ["members", "invitations", "roles", "capabilities"]);
  };

  const authOrgMutation = useMutation({
    mutationFn: (name: string) => updateAuthOrganization(organizationId, { name }),
  });
  const inviteMutation = useMutation({
    mutationFn: (input: { email: string; role: string }) => createOrganizationInvitation(organizationId, input),
    onSuccess: () => {
      handleInviteDialogOpenChange(false);
      void invalidateOrganizationSettings(queryClient, organizationId, ["invitations"]);
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
      void invalidateOrganizationSettings(queryClient, organizationId, ["invitations"]);
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
      void invalidateOrganizationSettings(queryClient, organizationId, ["members"]);
      toast({ title: t("toasts.memberRoleTitle"), description: t("toasts.memberRoleDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeOrganizationMember(organizationId, memberId),
    onSuccess: () => {
      setMemberAction(null);
      void invalidateOrganizationSettings(queryClient, organizationId, ["members"]);
      toast({ title: t("toasts.memberRemovedTitle"), description: t("toasts.memberRemovedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const updateOrganizationNotificationsMutation = useMutation({
    mutationFn: (input: NotificationPreference) => updateOrganizationNotificationPreferences(organizationId, input),
    onSuccess: () => {
      void invalidateOrganizationSettings(queryClient, organizationId, ["notifications"]);
      toast({ title: t("toasts.notificationSettingsSavedTitle"), description: t("toasts.notificationSettingsSavedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });

  const organizationFormValues = useMemo<UpdateOrganizationProfileValues>(() => ({
    name: session.organization.name,
    legalName: session.organization.legalName ?? "",
    type: session.organization.type ?? "",
    email: session.organization.email ?? "",
    phone: session.organization.phone ?? "",
    website: session.organization.website ?? "",
    address: session.organization.address ?? "",
    logo: session.organization.logo ?? "",
  }), [
    session.organization.address,
    session.organization.email,
    session.organization.legalName,
    session.organization.logo,
    session.organization.name,
    session.organization.phone,
    session.organization.type,
    session.organization.website,
  ]);

  const { register, handleSubmit, reset, getValues, formState: { dirtyFields, errors, isSubmitting } } = useForm<UpdateOrganizationProfileValues>({
    resolver: zodResolver(updateOrganizationProfileSchema as any),
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
    { id: "apiKeys", label: t("tabs.apiKeys"), icon: KeyRound },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
    { id: "billing", label: t("tabs.billing"), icon: CreditCard },
  ];

  function setActiveOrganizationTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.push(`/${locale}/organization${query ? `?${query}` : ""}`, { scroll: false });
  }

  function getInvitationId(invite: OrganizationInvitation) {
    return invite.id || invite._id || "";
  }

  function makeInviteLink(invite: OrganizationInvitation) {
    const invitationId = getInvitationId(invite);
    if (!invitationId) return "";

    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/${locale}/accept-invite?invitationId=${encodeURIComponent(invitationId)}`;
  }

  async function copyInviteLink(invite: OrganizationInvitation) {
    const link = makeInviteLink(invite);
    if (!link) return;

    await navigator.clipboard?.writeText(link);
    setCopiedInviteId(getInvitationId(invite) || null);
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
  const initials = getInitials(session.organization.name);

  if (session.isPending) {
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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {organizationId ? (
              <OrganizationLogoUploader
                organizationId={organizationId}
                name={session.organization.name}
                logo={session.organization.logo}
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
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-card text-2xl font-semibold text-muted-foreground">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {session.organization.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <LocaleLink href={`/${locale}/dashboard`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                    <span>{t("stats.workspace")}</span>
                  </LocaleLink>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{members.length} {t("stats.members")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{pendingInvitationCount(invitationsQuery.data ?? [])} {t("stats.pendingInvites")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{availableRoles.length} {t("stats.roles")}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={saveOrg}
              disabled={isBusy || !organizationId || !canUpdateOrganization}
              className="h-10 shrink-0 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("saveBtn")}
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveOrganizationTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
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

            <div className="border-t border-border/60 pt-8">
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
          <div className="space-y-8 mt-8">
            <Section
              title={t("members.title")}
              actions={(
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {atMemberLimit ? (
                    <LocaleLink href="/organization?tab=billing">
                      <Button className="h-9.5 rounded-lg bg-amber-500 text-sm font-medium text-white hover:bg-amber-600">
                        <CreditCard className="mr-1.5 h-4 w-4" />
                        {t("invites.open")}
                      </Button>
                    </LocaleLink>
                  ) : (
                    <Button disabled={!canInviteMembers} onClick={() => setInviteDialogOpen(true)} className="h-9.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                      <Plus className="mr-1.5 h-4 w-4" />
                      {t("invites.open")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canOpenCustomPermissions}
                    onClick={() => setCustomPermissionsOpen(true)}
                    className="h-9.5 rounded-lg text-sm font-medium"
                  >
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    {t("roles.manageWorkRoles")}
                  </Button>
                </div>
              )}
            >
              <div className="overflow-hidden rounded-2xl border border-border">
                {membersQuery.isLoading ? (
                  <div className="p-4">
                    <LoadingRow label={t("members.loading")} rows={3} />
                  </div>
                ) : members.length === 0 ? (
                  <div className="p-4">
                    <EmptyState title={t("members.emptyTitle")} description={t("members.emptyDesc")} />
                  </div>
                ) : (
                  <div className="px-5 divide-y divide-border">
                    {members.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        roles={availableRoles}
                        roleLabels={defaultRoleLabels}
                        isCurrentUser={member.userId === session.user.id}
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
                <div className="overflow-hidden rounded-2xl border border-border px-5 divide-y divide-border">
                  {pendingInviteLinks.map((inviteLink, index) => (
                    <PendingInviteLinkRow
                      key={`link:${inviteLink.id || inviteLink.createdAt || index}`}
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
                  {(invitationsQuery.data ?? []).map((invite, index) => (
                    <PendingInviteRow
                      key={`email:${invite.id || invite.email || index}:${invite.createdAt || index}`}
                      invite={invite}
                      copied={copiedInviteId === getInvitationId(invite)}
                      onCopy={() => copyInviteLink(invite)}
                      onCancel={() => {
                        const invitationId = getInvitationId(invite);
                        if (invitationId) cancelInviteMutation.mutate(invitationId);
                      }}
                      canceling={cancelInviteMutation.isPending || !canInviteMembers || !getInvitationId(invite)}
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

        {activeTab === "apiKeys" && (
          <div className="mt-8">
            <ApiKeysPanel
              organizationId={organizationId}
              canRead={canReadApiKeys}
              canCreate={canCreateApiKeys}
              canUpdate={canUpdateApiKeys}
              canDelete={canDeleteApiKeys}
              grantablePermissions={grantableApiKeyPermissions(capabilities)}
            />
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="mt-8">
            <OrganizationNotificationsPanel
              preference={organizationNotificationPreference}
              canManage={canManageOrganizationNotifications}
              loading={organizationNotificationQuery.isLoading || capabilitiesQuery.isLoading}
              saving={updateOrganizationNotificationsMutation.isPending}
              onSave={(next) => updateOrganizationNotificationsMutation.mutate(next)}
            />
          </div>
        )}

        {activeTab === "billing" && (
          <div className="mt-8">
            <OrganizationBillingPanel
              organizationId={organizationId}
              locale={locale as "en" | "ar"}
              memberCount={members.length}
            />
          </div>
        )}
      </div>

      <Dialog open={inviteDialogOpen} onOpenChange={handleInviteDialogOpenChange}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-lg font-semibold text-foreground">{t("invites.createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
              {(["link", "email"] as InviteMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => changeInviteMode(mode)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    inviteMode === mode ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`invites.modes.${mode}`)}
                </button>
              ))}
            </div>
            {inviteMode === "link" && createdInviteUrl ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="generatedInviteUrl" className="text-sm font-medium text-muted-foreground">{t("invites.generatedLinkLabel")}</Label>
                  <Input
                    id="generatedInviteUrl"
                    readOnly
                    dir="ltr"
                    value={createdInviteUrl}
                    className="h-11 rounded-xl border-border bg-muted text-left font-mono text-sm text-muted-foreground selection:bg-primary selection:text-primary-foreground"
                  />
                  <p className="text-sm text-muted-foreground">{t("invites.generatedLinkHint")}</p>
                </div>
                <DialogFooter className="mx-0 mb-0 mt-2 flex-row flex-wrap justify-start gap-2 rounded-none border-0 bg-transparent p-0 sm:justify-start">
                  <Button type="button" onClick={copyGeneratedInviteLink} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Copy className="mr-2 h-4 w-4" />
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
                      <Label htmlFor="inviteEmail" className="text-sm font-medium text-muted-foreground">{t("invites.emailLabel")}</Label>
                      <Input id="inviteEmail" type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder={t("invites.emailPlaceholder")} className="h-11 rounded-xl text-start" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="inviteRole" className="text-sm font-medium text-muted-foreground">{t("invites.roleLabel")}</Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" aria-label={t("invites.roleHint")} />
                    </div>
                    <Select value={inviteRole} onValueChange={(value: string | null) => value && setInviteRole(value)}>
                      <SelectTrigger
                        id="inviteRole"
                        aria-label={t("invites.roleLabel")}
                        className="h-11 rounded-xl border-border bg-background text-sm font-medium"
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
                    <p className="text-sm text-muted-foreground">{t("invites.roleHint")}</p>
                  </div>
                  {inviteMode === "link" ? (
                    <div className="space-y-2 pt-1">
                      <Button
                        type="button"
                        onClick={generateInviteLink}
                        disabled={inviteLinkMutation.isPending || !canInviteMembers || !organizationId}
                        className="h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        {inviteLinkMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                        {t("invites.createLink")}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => handleInviteDialogOpenChange(false)} className="h-9 w-full rounded-xl text-sm font-medium">
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
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {inviteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
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
          <p className="text-sm text-muted-foreground">
            {memberAction?.type === "remove"
              ? t("members.removeDesc", { name: memberAction ? memberName(memberAction.member) : "" })
              : t("members.roleDesc", { name: memberAction ? memberName(memberAction.member) : "", role: memberAction?.role ?? "" })}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMemberAction(null)}>{t("common.cancel")}</Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={removeMemberMutation.isPending || memberRoleMutation.isPending}
              onClick={() => {
                if (!memberAction) return;
                if (memberAction.type === "remove") {
                  if (memberAction.member.userId === session.user.id) {
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

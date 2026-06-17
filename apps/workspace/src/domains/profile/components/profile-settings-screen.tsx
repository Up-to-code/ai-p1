"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  Upload,
  User,
} from "lucide-react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountContext } from "@/domains/auth";
import {
  profileSchema,
  type ProfileFormValues,
} from "../validation/profile.schema";
import { updateProfileRequest } from "../api/update-profile";
import {
  profileFormValues,
  profileInitials,
  profileRolePresentation,
  profileTabs,
  type ProfileTab,
} from "../profile-view-model";
import { useOperationState } from "@/lib/utils/operation-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProfilePictureUploader } from "@/components/custom/profile-picture-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  defaultNotificationPreference,
  getMyNotificationPreferences,
  getPushDeviceStatus,
  updateMyNotificationPreferences,
  type NotificationCategory,
  type NotificationPreference,
} from "@/domains/notifications/api/notifications";

const tabIcons = {
  profile: User,
  account: Briefcase,
  notifications: Bell,
  security: Lock,
} satisfies Record<(typeof profileTabs)[number]["icon"], typeof User>;

export function ProfileSettingsScreen() {
  const t = useTranslations("Profile");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const organizationId = account.organization.id ?? "";
  const formValues = useMemo(
    () => profileFormValues(account.user),
    [account.user],
  );
  const pushDeviceQuery = useQuery({
    queryKey: ["profile", "push-devices"],
    queryFn: getPushDeviceStatus,
  });
  const notificationSettingsQuery = useQuery({
    queryKey: ["notification-settings", organizationId, "me"],
    queryFn: () => getMyNotificationPreferences(organizationId),
    enabled: Boolean(organizationId),
  });
  const notificationPreference = useMemo<NotificationPreference>(() => {
    return notificationSettingsQuery.data?.preference ?? {
      ...defaultNotificationPreference,
      organizationId,
      principalType: "user",
      principalKey: `user:${account.user.id}`,
      principalUserId: account.user.id,
    };
  }, [account.user.id, notificationSettingsQuery.data?.preference, organizationId]);
  const updateNotificationsMutation = useMutation({
    mutationFn: (input: NotificationPreference) => updateMyNotificationPreferences(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings", organizationId, "me"] });
    },
  });
  const saveNotificationPreference = (next: NotificationPreference) => {
    if (!organizationId) return;
    updateNotificationsMutation.mutate(next);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema as any),
    defaultValues: formValues,
  });

  const saveOperation = useOperationState({
    errorMessage: t("saveOperationError"),
  });

  useEffect(() => {
    reset(formValues, { keepDirtyValues: true });
  }, [formValues, reset]);

  const saveProfile = handleSubmit(async (data) => {
    await saveOperation.run(async () => {
      const userProfile = await updateProfileRequest({
        name: data.name,
        phone: data.phone,
        role: data.role,
        language: data.language,
        timezone: data.timezone,
        notifications: account.user.profile.notifications,
      }, t("saveOperationError"));

      reset({
        name: userProfile.name ?? data.name,
        phone: userProfile.phone ?? "",
        role: userProfile.role ?? data.role,
        language: userProfile.language ?? data.language,
        timezone: userProfile.timezone ?? data.timezone,
      });

      return userProfile;
    }, {
      successMessage: t("saveOperationSuccess"),
    });
  });

  const initials = profileInitials(account.user.name);
  const { roleKey, roleColor, permissionKeys } = profileRolePresentation(
    account.user.profile.role,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Top Row: avatar + identity + save */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Avatar with drag-drop */}
            <ProfilePictureUploader
              image={account.user.image}
              initials={initials}
              name={account.user.name}
              uploadLabel={t("form.avatarUpload")}
              cropTitle={t("form.avatarCropTitle")}
              labels={{
                apply: t("form.avatarApply"),
                cancel: t("form.avatarCancel"),
                zoom: t("form.avatarZoom"),
                chooseImage: t("form.avatarChooseImage"),
                cropPrepareError: t("form.avatarCropPrepareError"),
                cropExportError: t("form.avatarCropExportError"),
                saveError: t("form.avatarSaveError"),
                uploadMissingUrl: t("form.avatarUploadMissingUrl"),
                uploadFailed: t("form.avatarUploadFailed"),
                remove: t("form.avatarRemove"),
                uploadSavedTitle: t("form.avatarUploadSavedTitle"),
                uploadSavedDescription: t("form.avatarUploadSavedDescription"),
                removeSavedTitle: t("form.avatarRemoveSavedTitle"),
                removeSavedDescription: t("form.avatarRemoveSavedDescription"),
              }}
            />

            {/* Identity */}
            <div className="flex-1 min-w-0 space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground truncate">
                {account.user.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {/* Role badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                    roleColor,
                  )}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {t(`roles.${roleKey}`)}
                </span>
                {/* Email */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Mail className="h-3 w-3" />
                  <span
                    className="max-w-[16rem] truncate"
                    title={account.user.email}
                  >
                    {account.user.email}
                  </span>
                </span>
                {/* Org */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Briefcase className="h-3 w-3" />
                  <span
                    className="max-w-[16rem] truncate"
                    title={account.organization.name}
                  >
                    {account.organization.name}
                  </span>
                </span>
              </div>

              {/* Permissions strip */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {permissionKeys.map((pk) => (
                  <span
                    key={pk}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted dark:bg-muted border border-border dark:border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted-foreground"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                    {t(`permissions.${pk}`)}
                  </span>
                ))}
              </div>
            </div>

            {/* Save */}
            <Button
              onClick={saveProfile}
              disabled={saveOperation.isRunning || isSubmitting}
              className="shrink-0 h-11 px-6 rounded-[22px] bg-foreground text-background hover:opacity-90 font-black uppercase tracking-widest text-[10px] dark:bg-white dark:text-zinc-900 dark:hover:bg-muted transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saveOperation.isRunning ? (
                <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="me-2 h-3.5 w-3.5" />
              )}
              {t("saveBtn")}
            </Button>
          </div>

          {/* Photo upload hint */}
          <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            <Upload className="inline h-2.5 w-2.5 me-1" />
            {t("form.avatarUpload")} · {t("form.avatarDesc")}
          </p>

          {/* Tabs */}
          <div className="-mb-px mt-8 flex items-center gap-1 overflow-x-auto border-b border-border dark:border-border">
            {profileTabs.map((tab) => {
              const TabIcon = tabIcons[tab.icon];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-150",
                    activeTab === tab.id
                      ? "border-foreground text-foreground dark:border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-secondary-foreground dark:hover:text-muted-foreground",
                  )}
                >
                  <TabIcon className="h-3 w-3" />
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              <Section
                title={t("sections.personal")}
                description={t("sections.personalDesc")}
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <ProfileField
                    id="name"
                    label={t("form.nameLabel")}
                    type="text"
                    autoComplete="name"
                    registration={register("name")}
                    error={errors.name?.message}
                  />
                  <LockedProfileField
                    id="email"
                    label={t("form.emailLabel")}
                    value={account.user.email}
                  />
                  <ProfileField
                    id="phone"
                    label={t("form.phoneLabel")}
                    type="tel"
                    autoComplete="tel"
                    registration={register("phone")}
                    error={errors.phone?.message}
                    tooltip={t("form.phoneTooltip")}
                  />
                </div>
              </Section>
            </div>

            <div className="space-y-8 border-t border-border pt-8 dark:border-border xl:border-t-0 xl:border-s xl:pt-0 xl:ps-8">
              <Section
                title={t("sections.rolePerms")}
                description={t("sections.rolePermsDesc")}
              >
                <RolePermissionsList
                  roleColor={roleColor}
                  roleLabel={t(`roles.${roleKey}`)}
                  activeLabel={t("roles.active")}
                  currentRoleLabel={t("roles.currentRole")}
                  permissionsLabel={t("permissions.title")}
                  adminNote={t("roles.adminNote")}
                  permissionLabels={permissionKeys.map((pk) =>
                    t(`permissions.${pk}`),
                  )}
                />
              </Section>
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === "account" && (
          <div className="max-w-3xl space-y-8">
            <Section
              title={t("sections.accountData")}
              description={t("sections.accountDataDesc")}
            >
              <div className="divide-y divide-border border-y border-border dark:divide-border dark:border-border">
                <AccountDataRow
                  icon={User}
                  label={t("account.name")}
                  value={account.user.name}
                />
                <AccountDataRow
                  icon={Mail}
                  label={t("account.email")}
                  value={account.user.email}
                />
                <AccountDataRow
                  icon={Briefcase}
                  label={t("account.organization")}
                  value={account.organization.name}
                />
                <BrandDataRow
                  label={t("account.brand")}
                  value={
                    account.organization.brandColor || t("account.defaultBrand")
                  }
                  name={account.organization.name}
                  initials={account.organization.initials}
                  logo={account.organization.logo}
                  brandColor={account.organization.brandColor}
                />
              </div>
            </Section>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Section
              title={t("sections.mobileNotifications")}
              description={t("sections.mobileNotificationsDesc")}
            >
              <div className="divide-y divide-border border-y border-border dark:divide-border dark:border-border">
                <NotificationSwitchRow
                  icon={Bell}
                  label={t("notifications.enabled")}
                  note={t("notifications.enabledHelp")}
                  enabled={notificationPreference.enabled}
                  pending={updateNotificationsMutation.isPending || notificationSettingsQuery.isLoading}
                  onToggle={() =>
                    saveNotificationPreference({
                      ...notificationPreference,
                      enabled: !notificationPreference.enabled,
                    })
                  }
                />
                {(["calendar", "task", "manual", "organization"] as NotificationCategory[]).map((category) => (
                  <NotificationSwitchRow
                    key={category}
                    icon={category === "calendar" ? Clock : Bell}
                    label={t(`notifications.categories.${category}`)}
                    note={t(`notifications.categoryHelp.${category}`)}
                    enabled={notificationPreference.categories[category]}
                    pending={updateNotificationsMutation.isPending || notificationSettingsQuery.isLoading}
                    onToggle={() =>
                      saveNotificationPreference({
                        ...notificationPreference,
                        categories: {
                          ...notificationPreference.categories,
                          [category]: !notificationPreference.categories[category],
                        },
                      })
                    }
                  />
                ))}
              </div>
            </Section>

            <div className="space-y-8 border-t border-border pt-8 dark:border-border xl:border-t-0 xl:border-s xl:pt-0 xl:ps-8">
              <Section
                title={t("sections.mobileDevice")}
                description={t("sections.mobileDeviceDesc")}
              >
                <div className="border-y border-border py-5 dark:border-border">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-muted">
                        <Smartphone className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground dark:text-foreground">
                          {pushDeviceQuery.data?.hasActiveDevice ? t("notifications.deviceConnected") : t("notifications.deviceMissing")}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                          {pushDeviceQuery.data?.hasActiveDevice
                            ? t("notifications.deviceConnectedHelp")
                            : t("notifications.deviceMissingHelp")}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest",
                      pushDeviceQuery.data?.hasActiveDevice
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
                    )}>
                      {pushDeviceQuery.data?.hasActiveDevice ? t("notifications.on") : t("notifications.off")}
                    </span>
                  </div>
                </div>
              </Section>
              <Section
                title={t("sections.defaultReminders")}
                description={t("sections.defaultRemindersDesc")}
              >
                <div className="flex flex-wrap gap-2 border-y border-border py-5 dark:border-border">
                  {notificationPreference.reminderRules.map((rule) => (
                    <span
                      key={rule.id}
                      className={cn(
                        "rounded-full border px-3 py-1 text-[10px] font-bold",
                        rule.enabled
                          ? "border-border text-secondary-foreground dark:border-border dark:text-muted-foreground"
                          : "border-border text-muted-foreground line-through dark:border-border dark:text-muted-foreground",
                      )}
                    >
                      {rule.sourceType === "calendarEvent" ? t("notifications.calendarRule") : t("notifications.taskRule")} · {rule.trigger === "at_start" ? t("notifications.atStart") : `${rule.offsetMinutes}m`}
                    </span>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Section
              title={t("sections.accountIdentity")}
              description={t("sections.accountIdentityDesc")}
            >
              <div className="divide-y divide-border border-y border-border dark:divide-border dark:border-border">
                <SecurityRow
                  icon={User}
                  label={t("security.fullName")}
                  value={account.user.name}
                  note={t("security.fullNameNote")}
                />
                <SecurityRow
                  icon={Mail}
                  label={t("security.emailAddress")}
                  value={account.user.email}
                  note={t("security.emailNote")}
                />
                <SecurityRow
                  icon={Phone}
                  label={t("security.phoneNumber")}
                  value={account.user.profile.phone || "—"}
                  note={t("security.phoneNote")}
                />
              </div>
            </Section>
            <div className="space-y-8 border-t border-border pt-8 dark:border-border xl:border-t-0 xl:border-s xl:pt-0 xl:ps-8">
              <Section
                title={t("sections.accessSecurity")}
                description={t("sections.accessSecurityDesc")}
              >
                <div className="space-y-4">
                  <SecurityRow
                    icon={ShieldCheck}
                    label={t("security.authMethod")}
                    value={t("security.googleAuth")}
                    note={t("security.googleNote")}
                    action={{
                      label: t("security.manageBtn"),
                      onClick: () =>
                        window.open(
                          "https://myaccount.google.com/security",
                          "_blank",
                        ),
                    }}
                  />
                  <div className="border-s border-blue-300 px-4 py-2 dark:border-blue-500/40">
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <p className="text-[10px] font-medium leading-relaxed text-blue-800 dark:text-blue-300">
                        {t("security.oauthSafetyNote")}
                      </p>
                    </div>
                  </div>
                </div>
              </Section>
              <Section
                title={t("sections.activeSessions")}
                description={t("sections.activeSessionsDesc")}
              >
                <div className="flex items-center justify-between gap-4 border-y border-border py-4 dark:border-border">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground dark:text-foreground">
                      {t("security.thisDevice")}
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium text-muted-foreground">
                      {t("security.deviceDetail")}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t("security.current")}
                  </span>
                </div>
              </Section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground dark:text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[10px] font-medium text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function LockedProfileField({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="email"
        value={value}
        disabled
        aria-readonly="true"
        className="h-12 cursor-not-allowed rounded-xl border-border bg-muted font-medium text-muted-foreground disabled:opacity-100 dark:border-border dark:bg-muted dark:text-muted-foreground"
      />
    </div>
  );
}

// ── Form field ─────────────────────────────────────────────────────────────────
function ProfileField({
  id,
  label,
  type = "text",
  autoComplete,
  registration,
  error,
  tooltip,
  readOnly,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  tooltip?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label
          htmlFor={id}
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="inline-flex cursor-help">
              <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-secondary-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        className="h-12 rounded-xl border-border bg-card font-medium focus-visible:ring-blue-600/20 dark:border-border dark:bg-card"
        aria-invalid={Boolean(error)}
        readOnly={readOnly}
        disabled={disabled}
        data-readonly={readOnly ? "" : undefined}
        {...registration}
      />
      {error && (
        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}

function RolePermissionsList({
  roleColor,
  roleLabel,
  activeLabel,
  currentRoleLabel,
  permissionsLabel,
  adminNote,
  permissionLabels,
}: {
  roleColor: string;
  roleLabel: string;
  activeLabel: string;
  currentRoleLabel: string;
  permissionsLabel: string;
  adminNote: string;
  permissionLabels: string[];
}) {
  return (
    <div className="space-y-5 border-y border-border py-5 dark:border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-muted">
            <ShieldCheck className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              {currentRoleLabel}
            </p>
            <p className="truncate text-sm font-black text-foreground dark:text-foreground">
              {roleLabel}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest",
            roleColor,
          )}
        >
          {activeLabel}
        </span>
      </div>
      <div>
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
          {permissionsLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {permissionLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] font-bold text-secondary-foreground dark:border-border dark:text-muted-foreground"
            >
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[9px] font-medium text-muted-foreground">{adminNote}</p>
    </div>
  );
}

function NotificationSwitchRow({
  icon: Icon,
  label,
  note,
  enabled,
  pending,
  onToggle,
}: {
  icon: typeof User;
  label: string;
  note: string;
  enabled: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground dark:text-foreground">
              {label}
            </p>
            <p className="mt-1 text-[10px] font-medium text-muted-foreground">
              {note}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={pending}
          onClick={onToggle}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-60",
            enabled
              ? "border-foreground bg-foreground dark:border-foreground dark:bg-white"
              : "border-border bg-muted dark:border-border dark:bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-background shadow-sm transition-transform dark:bg-background",
              enabled ? "translate-x-5" : "translate-x-1",
            )}
          />
        </button>
      </div>
    </div>
  );
}

function AccountDataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <p
            className="mt-1 truncate text-sm font-black text-foreground dark:text-foreground"
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandDataRow({
  label,
  value,
  name,
  initials,
  logo,
  brandColor,
}: {
  label: string;
  value: string;
  name: string;
  initials: string;
  logo?: string | null;
  brandColor?: string | null;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-black uppercase text-white"
          style={{ backgroundColor: brandColor || "#18181b" }}
        >
          {logo ? (
            <span
              role="img"
              aria-label={name}
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${logo})` }}
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <p
            className="mt-1 truncate text-sm font-black text-foreground dark:text-foreground"
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Security row ───────────────────────────────────────────────────────────────
function SecurityRow({
  icon: Icon,
  label,
  value,
  note,
  action,
  warn,
}: {
  icon: typeof User;
  label: string;
  value: string;
  note?: string;
  action?: { label: string; onClick: () => void };
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            warn
              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-bold text-foreground dark:text-foreground">
            {value}
          </p>
          {note && (
            <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
              {note}
            </p>
          )}
        </div>
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className={cn(
            "h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
            warn
              ? "border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              : "border-border dark:border-border hover:border-foreground dark:hover:border-foreground",
          )}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

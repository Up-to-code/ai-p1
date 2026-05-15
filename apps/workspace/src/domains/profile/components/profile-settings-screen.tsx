"use client";

import { useState } from "react";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccountContext } from "@/domains/auth";
import { useProfileStore } from "@/domains/profile";
import {
  profileSchema,
  type ProfileFormValues,
} from "../validation/profile.schema";
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

type Tab = "profile" | "notifications" | "security";

// Role → permission keys mapping
const ROLE_PERM_KEYS: Record<string, string[]> = {
  "Organization Admin": [
    "manageMembers",
    "editOrganization",
    "viewBilling",
    "apiAccess",
    "allProjects",
  ],
  "Project Manager": [
    "createProjects",
    "assignTasks",
    "viewReports",
    "inviteMembers",
  ],
  "Project Editor": ["editProjects", "uploadDocuments", "addComments"],
  Viewer: ["viewProjects", "downloadReports"],
};

const ROLE_COLOR: Record<string, string> = {
  "Organization Admin":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Project Manager":
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  "Project Editor":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Viewer:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
};

const ROLE_I18N_KEYS: Record<string, string> = {
  "Organization Admin": "organizationAdmin",
  "Project Manager": "projectManager",
  "Project Editor": "projectEditor",
  Viewer: "viewer",
};

export function ProfileSettingsScreen() {
  const t = useTranslations("Profile");
  const account = useAccountContext();
  const { profile, updateProfile, updateNotification } = useProfileStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: account.user.name,
      email: account.user.email,
      phone: profile.phone,
      role: profile.role,
      language: profile.language,
      timezone: profile.timezone,
    },
    values: {
      name: account.user.name,
      email: account.user.email,
      phone: profile.phone,
      role: profile.role,
      language: profile.language,
      timezone: profile.timezone,
    },
  });

  const saveOperation = useOperationState({
    errorMessage: t("saveOperationError"),
  });
  const notificationOperation = useOperationState({
    errorMessage: t("notifOperationError"),
  });

  const saveProfile = handleSubmit((data) => {
    saveOperation.run(() => updateProfile(data), {
      successMessage: t("saveOperationSuccess"),
    });
  });

  const initials = account.user.name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const roleKey = ROLE_I18N_KEYS[profile.role] || "viewer";
  const roleColor = ROLE_COLOR[profile.role] ?? ROLE_COLOR["Viewer"];
  const permKeys = ROLE_PERM_KEYS[profile.role] ?? ROLE_PERM_KEYS["Viewer"];

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: t("tabs.profile"), icon: User },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
    { id: "security", label: t("tabs.security"), icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0A0A0A]">
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-[#111111]">
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
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white truncate">
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
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  <Mail className="h-3 w-3" />
                  <span
                    className="max-w-[16rem] truncate"
                    title={account.user.email}
                  >
                    {account.user.email}
                  </span>
                </span>
                {/* Org */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
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
                {permKeys.map((pk) => (
                  <span
                    key={pk}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
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
              className="shrink-0 h-11 px-6 rounded-[22px] bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-[10px] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-50"
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
          <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            <Upload className="inline h-2.5 w-2.5 me-1" />
            {t("form.avatarUpload")} · {t("form.avatarDesc")}
          </p>

          {/* Tabs */}
          <div className="-mb-px mt-8 flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-t-xl border-b-2 transition-all duration-150",
                  activeTab === tab.id
                    ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white bg-zinc-50/80 dark:bg-white/[0.03]"
                    : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.02]",
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
            <div className="space-y-6">
              <Section
                title={t("sections.personal")}
                description={t("sections.personalDesc")}
              >
                <Panel>
                  <div className="grid gap-5 lg:grid-cols-2">
                    <ProfileField
                      id="name"
                      label={t("form.nameLabel")}
                      type="text"
                      autoComplete="name"
                      registration={register("name")}
                      error={errors.name?.message}
                    />
                    <ProfileField
                      id="email"
                      label={t("form.emailLabel")}
                      type="email"
                      autoComplete="email"
                      registration={register("email")}
                      error={errors.email?.message}
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
                </Panel>
              </Section>

              <Section
                title={t("sections.work")}
                description={t("sections.workDesc")}
              >
                <Panel>
                  <div className="grid gap-5 lg:grid-cols-2">
                    <ProfileField
                      id="role"
                      label={t("form.roleLabel")}
                      type="text"
                      autoComplete="organization-title"
                      registration={register("role")}
                      error={errors.role?.message}
                      tooltip={t("form.roleTooltip")}
                    />
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {t("form.orgType")}
                      </Label>
                      <div className="flex h-12 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 dark:border-white/10 dark:bg-white/[0.02]">
                        <span className="truncate text-sm font-bold text-zinc-400 dark:text-zinc-500">
                          {account.organization.type || "—"}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                        {t("roles.setByAdmin")}
                      </p>
                    </div>
                  </div>
                </Panel>
              </Section>
            </div>

            <div className="space-y-6">
              <Section
                title={t("sections.rolePerms")}
                description={t("sections.rolePermsDesc")}
              >
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111]">
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-white/[0.04]">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5">
                        <ShieldCheck className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">
                          {t("roles.currentRole")}
                        </p>
                        <p className="truncate text-sm font-black text-zinc-900 dark:text-white">
                          {t(`roles.${roleKey}`)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                        roleColor,
                      )}
                    >
                      {t("roles.active")}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <p className="mb-3 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">
                      {t("permissions.title")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {permKeys.map((pk) => (
                        <span
                          key={pk}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] font-bold text-zinc-600 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-300"
                        >
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                          {t(`permissions.${pk}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-50/60 px-5 py-3 dark:bg-white/[0.01]">
                    <p className="text-[9px] font-medium text-zinc-400">
                      {t("roles.adminNote")}
                    </p>
                  </div>
                </div>
              </Section>

              <Section
                title={t("sections.accountData")}
                description={t("sections.accountDataDesc")}
              >
                <div className="grid gap-3">
                  <AccountDataCard
                    icon={User}
                    label={t("account.name")}
                    value={account.user.name}
                  />
                  <AccountDataCard
                    icon={Mail}
                    label={t("account.email")}
                    value={account.user.email}
                  />
                  <AccountDataCard
                    icon={Briefcase}
                    label={t("account.organization")}
                    value={account.organization.name}
                  />
                  <AccountDataCard
                    icon={ShieldCheck}
                    label={t("account.workspaceStatus")}
                    value={account.organization.status}
                  />
                  <AccountDataCard
                    icon={User}
                    label={t("account.userId")}
                    value={account.user.id || "—"}
                  />
                  <BrandDataCard
                    label={t("account.brand")}
                    value={
                      account.organization.brandColor ||
                      t("account.defaultBrand")
                    }
                    name={account.organization.name}
                    initials={account.organization.initials}
                    logo={account.organization.logo}
                    brandColor={account.organization.brandColor}
                  />
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div>
            <Section
              title={t("sections.notifPrefs")}
              description={t("sections.notifPrefsDesc")}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(profile.notifications).map(([key, enabled]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={enabled}
                    disabled={notificationOperation.isRunning}
                    onClick={() =>
                      notificationOperation.run(
                        () =>
                          updateNotification(
                            key as keyof typeof profile.notifications,
                            !enabled,
                          ),
                        {
                          successMessage: t("notifOperationSuccess"),
                        },
                      )
                    }
                    className={cn(
                      "group flex min-h-24 w-full items-center justify-between rounded-[18px] border p-4 text-start transition-all duration-200 disabled:opacity-60",
                      enabled
                        ? "border-emerald-500/20 bg-emerald-500/[0.02] dark:border-emerald-500/30 dark:bg-emerald-500/[0.04]"
                        : "border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-[#111] hover:border-zinc-300",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                          enabled
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-100 dark:bg-white/5 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-700",
                        )}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-white">
                          {t(`notifications.${key}`)}
                        </span>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                          {enabled
                            ? t("notifications.enabledNote")
                            : t("notifications.disabledNote")}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        enabled
                          ? "bg-emerald-500"
                          : "bg-zinc-200 dark:bg-white/10",
                      )}
                    />
                  </button>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Section
              title={t("sections.accountIdentity")}
              description={t("sections.accountIdentityDesc")}
            >
              <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-1">
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
                  value={profile.phone || "—"}
                  note={t("security.phoneNote")}
                />
              </div>
            </Section>
            <div className="space-y-6">
              <Section
                title={t("sections.accessSecurity")}
                description={t("sections.accessSecurityDesc")}
              >
                <div className="space-y-3">
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
                  <div className="rounded-[18px] border border-blue-100 bg-blue-50/50 px-5 py-4 dark:border-blue-500/10 dark:bg-blue-500/5">
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
                <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-white/[0.06] dark:bg-[#111]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-white">
                        {t("security.thisDevice")}
                      </p>
                      <p className="mt-0.5 text-[9px] font-medium text-zinc-400">
                        {t("security.deviceDetail")}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t("security.current")}
                    </span>
                  </div>
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
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[10px] font-medium text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
      {children}
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
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
  error?: string;
  tooltip?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label
          htmlFor={id}
          className="text-[10px] font-black uppercase tracking-widest text-zinc-500"
        >
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="inline-flex cursor-help">
              <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-700 transition-colors" />
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
        className="h-12 rounded-xl border-zinc-200 bg-white font-medium focus-visible:ring-blue-600/20 dark:border-white/10 dark:bg-[#111]"
        aria-invalid={Boolean(error)}
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

function AccountDataCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#111]">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">
            {label}
          </p>
          <p
            className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white"
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandDataCard({
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#111]">
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xs font-black uppercase text-white"
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
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">
            {label}
          </p>
          <p
            className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white"
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
    <div className="flex items-center justify-between rounded-[18px] border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-[#111] px-5 py-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            warn
              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
          {note && (
            <p className="text-[9px] font-medium text-zinc-400 mt-0.5">
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
              : "border-zinc-200 dark:border-white/10 hover:border-zinc-900 dark:hover:border-white",
          )}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

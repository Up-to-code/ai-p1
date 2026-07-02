"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/domains/auth";
import { profileSchema, type ProfileFormValues } from "../validation/profile.schema";
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
import {
  defaultNotificationPreference,
  getMyNotificationPreferences,
  getPushDeviceStatus,
  updateMyNotificationPreferences,
  type NotificationPreference,
} from "@/domains/notifications/api/notifications";
import { ProfileSettingsHeader } from "./profile-settings-header";
import { ProfileTabPanel } from "./tabs/profile-tab-panel";
import { AccountTabPanel } from "./tabs/account-tab-panel";
import { NotificationsTabPanel } from "./tabs/notifications-tab-panel";
import { SecurityTabPanel } from "./tabs/security-tab-panel";

export function ProfileSettingsScreen() {
  const t = useTranslations("Profile");
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const organizationId = session.organization.id ?? "";
  const formValues = useMemo(() => profileFormValues(session.user), [session.user]);

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
      principalKey: `user:${session.user.id}`,
      principalUserId: session.user.id,
    };
  }, [session.user.id, notificationSettingsQuery.data?.preference, organizationId]);

  const updateNotificationsMutation = useMutation({
    mutationFn: (input: NotificationPreference) =>
      updateMyNotificationPreferences(organizationId, input),
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

  const saveOperation = useOperationState({ errorMessage: t("saveOperationError") });

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
        notifications: session.user.profile.notifications,
      }, t("saveOperationError"));

      reset({
        name: userProfile.name ?? data.name,
        phone: userProfile.phone ?? "",
        role: userProfile.role ?? data.role,
        language: userProfile.language ?? data.language,
        timezone: userProfile.timezone ?? data.timezone,
      });

      return userProfile;
    }, { successMessage: t("saveOperationSuccess") });
  });

  const initials = profileInitials(session.user.name);
  const { roleKey, roleColor, permissionKeys } = profileRolePresentation(session.user.profile.role);
  const tabLabels = useMemo(
    () => Object.fromEntries(profileTabs.map((tab) => [tab.id, t(tab.labelKey)])) as Record<ProfileTab, string>,
    [t],
  );

  return (
    <div className="min-h-screen bg-background">
      <ProfileSettingsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        initials={initials}
        userName={session.user.name}
        userEmail={session.user.email}
        userImage={session.user.image}
        organizationName={session.organization.name}
        roleKey={roleKey}
        roleColor={roleColor}
        permissionKeys={permissionKeys}
        permissionLabel={(pk) => t(`permissions.${pk}`)}
        roleLabel={t(`roles.${roleKey}`)}
        saveLabel={t("saveBtn")}
        isSaving={saveOperation.isRunning || isSubmitting}
        onSave={saveProfile}
        uploadLabel={t("form.avatarUpload")}
        avatarDesc={t("form.avatarDesc")}
        tabLabels={tabLabels}
        avatarLabels={{
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

      <div className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "profile" && (
          <div className="mt-8">
            <ProfileTabPanel
              register={register}
              errors={errors}
              email={session.user.email}
              labels={{
                personalTitle: t("sections.personal"),
                personalDesc: t("sections.personalDesc"),
                nameLabel: t("form.nameLabel"),
                emailLabel: t("form.emailLabel"),
                phoneLabel: t("form.phoneLabel"),
                phoneTooltip: t("form.phoneTooltip"),
                rolePermsTitle: t("sections.rolePerms"),
                rolePermsDesc: t("sections.rolePermsDesc"),
                roleLabel: t(`roles.${roleKey}`),
                currentRoleLabel: t("roles.currentRole"),
                permissionsLabel: t("permissions.title"),
                permissionLabels: permissionKeys.map((pk) => t(`permissions.${pk}`)),
                roleColor,
              }}
            />
          </div>
        )}

        {activeTab === "account" && (
          <div className="mt-8">
            <AccountTabPanel
              labels={{
                title: t("sections.accountData"),
                desc: t("sections.accountDataDesc"),
                name: t("account.name"),
                email: t("account.email"),
                organization: t("account.organization"),
                brand: t("account.brand"),
                defaultBrand: t("account.defaultBrand"),
                userName: session.user.name,
                userEmail: session.user.email,
                organizationName: session.organization.name,
                brandColor: session.organization.brandColor ?? undefined,
                organizationInitials: session.organization.initials,
                organizationLogo: session.organization.logo,
              }}
            />
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="mt-8">
            <NotificationsTabPanel
              notificationPreference={notificationPreference}
              hasActiveDevice={Boolean(pushDeviceQuery.data?.hasActiveDevice)}
              isPending={updateNotificationsMutation.isPending || notificationSettingsQuery.isLoading}
              onToggleEnabled={() =>
                saveNotificationPreference({
                  ...notificationPreference,
                  enabled: !notificationPreference.enabled,
                })
              }
              onToggleCategory={(category) =>
                saveNotificationPreference({
                  ...notificationPreference,
                  categories: {
                    ...notificationPreference.categories,
                    [category]: !notificationPreference.categories[category],
                  },
                })
              }
              labels={{
                mobileNotificationsTitle: t("sections.mobileNotifications"),
                mobileNotificationsDesc: t("sections.mobileNotificationsDesc"),
                enabled: t("notifications.enabled"),
                enabledHelp: t("notifications.enabledHelp"),
                categoryLabel: (category) => t(`notifications.categories.${category}`),
                categoryHelp: (category) => t(`notifications.categoryHelp.${category}`),
                mobileDeviceTitle: t("sections.mobileDevice"),
                mobileDeviceDesc: t("sections.mobileDeviceDesc"),
                deviceConnected: t("notifications.deviceConnected"),
                deviceMissing: t("notifications.deviceMissing"),
                deviceConnectedHelp: t("notifications.deviceConnectedHelp"),
                deviceMissingHelp: t("notifications.deviceMissingHelp"),
                on: t("notifications.on"),
                off: t("notifications.off"),
                defaultRemindersTitle: t("sections.defaultReminders"),
                defaultRemindersDesc: t("sections.defaultRemindersDesc"),
                calendarRule: t("notifications.calendarRule"),
                taskRule: t("notifications.taskRule"),
                atStart: t("notifications.atStart"),
              }}
            />
          </div>
        )}

        {activeTab === "security" && (
          <div className="mt-8">
            <SecurityTabPanel
              labels={{
                accountIdentityTitle: t("sections.accountIdentity"),
                accountIdentityDesc: t("sections.accountIdentityDesc"),
                fullName: t("security.fullName"),
                fullNameNote: t("security.fullNameNote"),
                emailAddress: t("security.emailAddress"),
                emailNote: t("security.emailNote"),
                phoneNumber: t("security.phoneNumber"),
                phoneNote: t("security.phoneNote"),
                userName: session.user.name,
                userEmail: session.user.email,
                userPhone: session.user.profile.phone || "—",
                accessSecurityTitle: t("sections.accessSecurity"),
                accessSecurityDesc: t("sections.accessSecurityDesc"),
                authMethod: t("security.authMethod"),
                googleAuth: t("security.googleAuth"),
                googleNote: t("security.googleNote"),
                manageBtn: t("security.manageBtn"),
                activeSessionsTitle: t("sections.activeSessions"),
                activeSessionsDesc: t("sections.activeSessionsDesc"),
                thisDevice: t("security.thisDevice"),
                deviceDetail: t("security.deviceDetail"),
                current: t("security.current"),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

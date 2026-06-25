"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProfileFormValues } from "../../validation/profile.schema";
import { ProfileField, LockedProfileField, RolePermissionsList, Section } from "../shared/profile-settings-fields";

export function ProfileTabPanel({
  register,
  errors,
  email,
  labels,
}: {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  email: string;
  labels: {
    personalTitle: string;
    personalDesc: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    phoneTooltip: string;
    rolePermsTitle: string;
    rolePermsDesc: string;
    roleLabel: string;
    activeLabel: string;
    currentRoleLabel: string;
    permissionsLabel: string;
    adminNote: string;
    permissionLabels: string[];
    roleColor: string;
  };
}) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">
        <Section title={labels.personalTitle} description={labels.personalDesc}>
          <div className="grid gap-5 lg:grid-cols-2">
            <ProfileField
              id="name"
              label={labels.nameLabel}
              type="text"
              autoComplete="name"
              registration={register("name")}
              error={errors.name?.message}
            />
            <LockedProfileField id="email" label={labels.emailLabel} value={email} />
            <ProfileField
              id="phone"
              label={labels.phoneLabel}
              type="tel"
              autoComplete="tel"
              registration={register("phone")}
              error={errors.phone?.message}
              tooltip={labels.phoneTooltip}
            />
          </div>
        </Section>
      </div>

      <div className="space-y-8 border-t border-border pt-8 dark:border-border xl:border-t-0 xl:border-s xl:pt-0 xl:ps-8">
        <Section title={labels.rolePermsTitle} description={labels.rolePermsDesc}>
          <RolePermissionsList
            roleColor={labels.roleColor}
            roleLabel={labels.roleLabel}
            activeLabel={labels.activeLabel}
            currentRoleLabel={labels.currentRoleLabel}
            permissionsLabel={labels.permissionsLabel}
            adminNote={labels.adminNote}
            permissionLabels={labels.permissionLabels}
          />
        </Section>
      </div>
    </div>
  );
}

"use client";

import {
  Bell,
  Briefcase,
  Loader2,
  Lock,
  Mail,
  Save,
  Upload,
  User,
} from "lucide-react";
import { ProfilePictureUploader } from "@/components/custom/profile-picture-uploader";
import { Button } from "@/components/ui/button";
import { profileTabs, type ProfileTab } from "../profile-view-model";
import { cn } from "@/lib/utils";

const tabIcons = {
  profile: User,
  account: Briefcase,
  notifications: Bell,
  security: Lock,
} satisfies Record<(typeof profileTabs)[number]["icon"], typeof User>;

export function ProfileSettingsHeader({
  activeTab,
  onTabChange,
  initials,
  userName,
  userEmail,
  userImage,
  organizationName,
  roleKey,
  roleColor,
  permissionKeys,
  permissionLabel,
  roleLabel,
  saveLabel,
  isSaving,
  onSave,
  uploadLabel,
  avatarDesc,
  avatarLabels,
  tabLabels,
}: {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  initials: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  organizationName: string;
  roleKey: string;
  roleColor: string;
  permissionKeys: string[];
  permissionLabel: (key: string) => string;
  roleLabel: string;
  saveLabel: string;
  isSaving: boolean;
  onSave: () => void;
  uploadLabel: string;
  avatarDesc: string;
  avatarLabels: Parameters<typeof ProfilePictureUploader>[0]["labels"];
  tabLabels: Record<ProfileTab, string>;
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <ProfilePictureUploader
            image={userImage}
            initials={initials}
            name={userName}
            uploadLabel={uploadLabel}
            cropTitle={uploadLabel}
            labels={avatarLabels}
          />

          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {userName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="truncate" title={organizationName}>
                    {organizationName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                  roleColor,
                )}
              >
                {roleLabel}
              </span>
              {permissionKeys.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {permissionKeys.slice(0, 3).map((pk) => (
                    <span
                      key={pk}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground"
                    >
                      {permissionLabel(pk)}
                    </span>
                  ))}
                  {permissionKeys.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      +{permissionKeys.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={onSave}
            disabled={isSaving}
            className="shrink-0 h-10 px-6 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saveLabel}
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-1">
          {profileTabs.map((tab) => {
            const TabIcon = tabIcons[tab.icon];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <TabIcon className="h-4 w-4" />
                {tabLabels[tab.id]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  Bell,
  Briefcase,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
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
  userImage?: string | null;
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
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <ProfilePictureUploader
            image={userImage}
            initials={initials}
            name={userName}
            uploadLabel={uploadLabel}
            cropTitle={avatarLabels.cropTitle ?? uploadLabel}
            labels={avatarLabels}
          />

          <div className="flex-1 min-w-0 space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground truncate">
              {userName}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                  roleColor,
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                {roleLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <Mail className="h-3 w-3" />
                <span className="max-w-[16rem] truncate" title={userEmail}>
                  {userEmail}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <Briefcase className="h-3 w-3" />
                <span className="max-w-[16rem] truncate" title={organizationName}>
                  {organizationName}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {permissionKeys.map((pk) => (
                <span
                  key={pk}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted dark:bg-muted border border-border dark:border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted-foreground"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                  {permissionLabel(pk)}
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={onSave}
            disabled={isSaving}
            className="shrink-0 h-11 px-6 rounded-[22px] bg-foreground text-background hover:opacity-90 font-black uppercase tracking-widest text-[10px] dark:hover:bg-muted transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="me-2 h-3.5 w-3.5" />
            )}
            {saveLabel}
          </Button>
        </div>

        <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          <Upload className="inline h-2.5 w-2.5 me-1" />
          {uploadLabel} · {avatarDesc}
        </p>

        <div className="-mb-px mt-8 flex items-center gap-1 overflow-x-auto border-b border-border dark:border-border">
          {profileTabs.map((tab) => {
            const TabIcon = tabIcons[tab.icon];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-150",
                  activeTab === tab.id
                    ? "border-foreground text-foreground dark:border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-secondary-foreground dark:hover:text-muted-foreground",
                )}
              >
                <TabIcon className="h-3 w-3" />
                {tabLabels[tab.id]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

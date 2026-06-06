import type { ProfileSettings } from "./store/profile.types";
import type { ProfileFormValues } from "./validation/profile.schema";

export type ProfileTab = "profile" | "account" | "security";

export type ProfileTabSpec = {
  id: ProfileTab;
  labelKey: "tabs.profile" | "tabs.account" | "tabs.security";
  icon: "profile" | "account" | "security";
};

export type ProfileRolePresentation = {
  roleKey: string;
  roleColor: string;
  permissionKeys: string[];
};

const rolePermissionKeys: Record<string, string[]> = {
  "Workspace Owner": [
    "manageMembers",
    "editOrganization",
    "viewBilling",
    "apiAccess",
    "allProjects",
  ],
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

const roleColors: Record<string, string> = {
  "Workspace Owner":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Organization Admin":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Project Manager":
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  "Project Editor":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Viewer:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
};

const roleI18nKeys: Record<string, string> = {
  "Workspace Owner": "workspaceOwner",
  "Organization Admin": "organizationAdmin",
  "Project Manager": "projectManager",
  "Project Editor": "projectEditor",
  Viewer: "viewer",
};

export const profileTabs: ProfileTabSpec[] = [
  { id: "profile", labelKey: "tabs.profile", icon: "profile" },
  { id: "account", labelKey: "tabs.account", icon: "account" },
  { id: "security", labelKey: "tabs.security", icon: "security" },
];

export function profileInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function profileFormValues(
  user: {
    name: string;
    email: string;
    profile?: Omit<ProfileSettings, "name" | "email">;
  },
  profile?: ProfileSettings,
): ProfileFormValues {
  return {
    name: user.name,
    phone: user.profile?.phone ?? profile?.phone ?? "",
    role: user.profile?.role ?? profile?.role ?? "Workspace Owner",
    language: user.profile?.language ?? profile?.language ?? "en",
    timezone: user.profile?.timezone ?? profile?.timezone ?? "Africa/Cairo",
  };
}

export function profileRolePresentation(role: string): ProfileRolePresentation {
  return {
    roleKey: roleI18nKeys[role] || "viewer",
    roleColor: roleColors[role] ?? roleColors.Viewer,
    permissionKeys: rolePermissionKeys[role] ?? rolePermissionKeys.Viewer,
  };
}

export function profileNotificationEntries(profile: ProfileSettings) {
  return Object.entries(profile.notifications) as Array<[
    keyof ProfileSettings["notifications"],
    boolean,
  ]>;
}

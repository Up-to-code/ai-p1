import {
  AppWindow,
  Bell,
  Bot,
  Box,
  CalendarClock,
  CreditCard,
  Database,
  FileClock,
  HardDrive,
  Import,
  KeyRound,
  Mail,
  Palette,
  Puzzle,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  Trash2,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const SETTINGS_SECTIONS = [
  "general",
  "people",
  "teams",
  "billing",
  "ai-usage",
  "security",
  "audit",
  "trash",
  "custom-fields",
  "tag-manager",
  "templates",
  "automations",
  "ai-notetaker",
  "spaces",
  "task-types",
  "work-schedule",
  "app-center",
  "imports",
  "api",
  "email",
  "preferences",
  "profile",
  "notifications",
  "workspaces",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number];

export type SettingsNavItem = {
  label: string;
  icon: LucideIcon;
  section: SettingsSectionId;
};

export type SettingsNavGroup = {
  title: string;
  items: SettingsNavItem[];
};

export const settingsNavGroups: SettingsNavGroup[] = [
  {
    title: "Admin",
    items: [
      { label: "General", icon: SlidersHorizontal, section: "general" },
      { label: "People", icon: UsersRound, section: "people" },
      { label: "Teams", icon: ShieldCheck, section: "teams" },
      { label: "Security & Permissions", icon: KeyRound, section: "security" },
      { label: "Audit Logs", icon: FileClock, section: "audit" },
      { label: "Trash", icon: Trash2, section: "trash" },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Memberships", icon: CreditCard, section: "billing" },
      { label: "AI Credits", icon: Bot, section: "ai-usage" },
    ],
  },
  {
    title: "Features",
    items: [
      { label: "Custom Field Manager", icon: Tags, section: "custom-fields" },
      { label: "Tag Manager", icon: Tags, section: "tag-manager" },
      { label: "Template Center", icon: Box, section: "templates" },
      { label: "Automations Manager", icon: Workflow, section: "automations" },
      { label: "AI Notetaker", icon: Bot, section: "ai-notetaker" },
      { label: "Spaces", icon: Puzzle, section: "spaces" },
      { label: "Task Types", icon: Database, section: "task-types" },
      { label: "Work Schedule", icon: CalendarClock, section: "work-schedule" },
    ],
  },
  {
    title: "Integrations & ClickApps",
    items: [
      { label: "App Center", icon: AppWindow, section: "app-center" },
      { label: "Imports / Exports", icon: Import, section: "imports" },
      { label: "Qentrah API", icon: KeyRound, section: "api" },
      { label: "Email Integration", icon: Mail, section: "email" },
    ],
  },
  {
    title: "My Settings",
    items: [
      { label: "Preferences", icon: Palette, section: "preferences" },
      { label: "Profile", icon: UsersRound, section: "profile" },
      { label: "Notifications", icon: Bell, section: "notifications" },
      { label: "Workspaces", icon: HardDrive, section: "workspaces" },
    ],
  },
];

export function isSettingsSection(value: string): value is SettingsSectionId {
  return SETTINGS_SECTIONS.includes(value as SettingsSectionId);
}

export function settingsSectionTitle(section: SettingsSectionId) {
  for (const group of settingsNavGroups) {
    const match = group.items.find((item) => item.section === section);
    if (match) return match.label;
  }
  return "General";
}

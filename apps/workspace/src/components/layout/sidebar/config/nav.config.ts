import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Bot,
  Building2,
  CalendarDays,
  FileText,
  FolderGit2,
  KanbanSquare,
  ListTodo,
  Plug,
  UserRound,
  Workflow,
} from "lucide-react";

export type SidebarNavItem = {
  name: string;
  href?: string;
  icon: LucideIcon;
  label?: string;
};

/** Primary workspace navigation entries. */
export const sidebarPrimaryNav: SidebarNavItem[] = [
  { name: "dashboard", href: "/dashboard", icon: Bot, label: "AI Assistant" },
  { name: "clients", href: "/clients", icon: UserRound },
  { name: "opportunities", href: "/opportunities", icon: KanbanSquare },
  { name: "deals", href: "/deals", icon: BadgeDollarSign },
  { name: "projects", href: "/projects", icon: FolderGit2 },
  { name: "tasks", href: "/tasks", icon: ListTodo },
  { name: "docs", href: "/docs", icon: FileText },
  { name: "calendar", href: "/calendar", icon: CalendarDays },
];

/** Navigation entries shown as coming soon. */
export const sidebarComingSoonNav: SidebarNavItem[] = [
  { name: "automations", icon: Workflow },
  { name: "integrations", icon: Plug },
];

/** Organization settings navigation. */
export const sidebarOrganizationNav: SidebarNavItem[] = [
  { name: "organization", href: "/settings/organization", icon: Building2 },
];

export const sidebarVisibleThreadLimit = 5;
export const sidebarOrganizationListLimit = 4;

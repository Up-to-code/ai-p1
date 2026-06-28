import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Bot,
  Building2,
  CalendarDays,
  FileText,
  FolderGit2,
  Home,
  Inbox,
  KanbanSquare,
  ListTodo,
  Plug,
  UserRound,
  Workflow,
  LayoutDashboard,
  Users,
  Settings,
  Layers,
  Shield,
} from "lucide-react";

export type SidebarNavItem = {
  name: string;
  href?: string;
  icon: LucideIcon;
  label?: string;
  /** If true, clicking opens the secondary panel instead of navigating. */
  opensPanel?: boolean;
};

/** Static top-section navigation entries (always visible, personal). */
export const sidebarStaticNav: SidebarNavItem[] = [
  { name: "home", href: "/ws", icon: Home, label: "Home", opensPanel: true },
  { name: "inbox", href: "/inbox", icon: Inbox, label: "Inbox" },
];

/** Primary workspace-level navigation entries. */
export const sidebarPrimaryNav: SidebarNavItem[] = [
  { name: "ai", href: "/ai", icon: Bot, label: "AI" },
  { name: "spaces", href: "/spaces", icon: Layers, label: "Spaces" },
  { name: "clients", href: "/clients", icon: UserRound },
  { name: "opportunities", href: "/opportunities", icon: KanbanSquare },
  { name: "deals", href: "/deals", icon: BadgeDollarSign },
  { name: "tasks", href: "/tasks", icon: ListTodo },
  { name: "calendar", href: "/calendar", icon: CalendarDays },
  { name: "docs", href: "/docs", icon: FileText },
];

/** Space-level navigation (when a space is selected, no project). */
export const sidebarSpaceNav: SidebarNavItem[] = [
  { name: "projects", href: "/spaces", icon: FolderGit2 },
  { name: "teams", href: "/spaces/teams", icon: Users },
  { name: "members", href: "/spaces/members", icon: Shield },
];

/** Project-level navigation (when a project is selected). */
export const sidebarProjectNav: SidebarNavItem[] = [
  { name: "overview", icon: LayoutDashboard },
  { name: "tasks", icon: ListTodo },
  { name: "calendar", icon: CalendarDays },
  { name: "files", icon: FileText },
  { name: "team", icon: Users },
];

/** Navigation entries shown as coming soon. */
export const sidebarComingSoonNav: SidebarNavItem[] = [
  { name: "automations", icon: Workflow },
  { name: "integrations", icon: Plug },
];

/** Workspace settings navigation. */
export const sidebarWorkspaceNav: SidebarNavItem[] = [
  { name: "organization", href: "/settings/organization", icon: Building2 },
  { name: "workspaceSettings", href: "/settings/workspace", icon: Settings },
];

export const sidebarVisibleThreadLimit = 3;
export const sidebarOrganizationListLimit = 4;

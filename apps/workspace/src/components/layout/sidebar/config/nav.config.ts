import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Bot,
  Building2,
  Inbox,
  Plug,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import {
  BarChartFilledIcon,
  CalendarIcon,
  DocumentLinesIcon,
  FolderIcon,
  HomeIcon,
  KanbanIcon,
  ListLinesIcon,
  SettingsIcon,
  StatsIcon,
} from "../components/clickup-icons";

export type SidebarNavItem = {
  name: string;
  href?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label?: string;
  /** If true, clicking opens the secondary panel instead of navigating. */
  opensPanel?: boolean;
};

/** Static top-section navigation entries (always visible, personal). */
export const sidebarStaticNav: SidebarNavItem[] = [
  { name: "home", href: "/ws", icon: HomeIcon, label: "Home", opensPanel: true },
  { name: "inbox", href: "/inbox", icon: Inbox, label: "Inbox" },
];

/** Primary workspace-level navigation entries. */
export const sidebarPrimaryNav: SidebarNavItem[] = [
  { name: "ai", href: "/ai", icon: Bot, label: "AI" },
  { name: "spaces", href: "/spaces", icon: FolderIcon, label: "Spaces" },
  { name: "clients", href: "/clients", icon: UserRound },
  { name: "opportunities", href: "/opportunities", icon: KanbanIcon },
  { name: "deals", href: "/deals", icon: BadgeDollarSign },
  { name: "tasks", href: "/tasks", icon: ListLinesIcon },
  { name: "calendar", href: "/calendar", icon: CalendarIcon },
  { name: "docs", href: "/docs", icon: DocumentLinesIcon },
];

/** Space-level navigation (when a space is selected, no project). */
export const sidebarSpaceNav: SidebarNavItem[] = [
  { name: "projects", href: "/spaces", icon: FolderIcon },
  { name: "teams", href: "/spaces/teams", icon: Users },
  { name: "members", href: "/spaces/members", icon: Shield },
];

/** Project-level navigation (when a project is selected). */
export const sidebarProjectNav: SidebarNavItem[] = [
  { name: "overview", icon: BarChartFilledIcon },
  { name: "tasks", icon: ListLinesIcon },
  { name: "calendar", icon: CalendarIcon },
  { name: "files", icon: DocumentLinesIcon },
  { name: "team", icon: Users },
];

/** Navigation entries shown as coming soon. */
export const sidebarComingSoonNav: SidebarNavItem[] = [
  { name: "automations", icon: StatsIcon },
  { name: "integrations", icon: Plug },
];

/** Workspace settings navigation. */
export const sidebarWorkspaceNav: SidebarNavItem[] = [
  { name: "organization", href: "/settings/organization", icon: Building2 },
  { name: "workspaceSettings", href: "/settings/workspace", icon: SettingsIcon },
];

export const sidebarVisibleThreadLimit = 3;
export const sidebarOrganizationListLimit = 4;

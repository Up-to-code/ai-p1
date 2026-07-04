import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Bot,
  Building2,
  Clock,
  Lightbulb,
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
import { InboxIcon } from "../components/clickup-icons";

export type SidebarNavItem = {
  name: string;
  href?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label?: string;
  /** If true, clicking opens the secondary panel instead of navigating. */
  opensPanel?: boolean;
  /** Optional group label for organizing items */
  group?: string;
};

export type SidebarNavGroup = {
  id: string;
  label: string;
  items: SidebarNavItem[];
};

/** Static top-section navigation entries (always visible, personal). */
export const sidebarStaticNav: SidebarNavItem[] = [
  { name: "home", href: "/ws", icon: HomeIcon, label: "Home", opensPanel: true },
  { name: "inbox", href: "/inbox", icon: InboxIcon, label: "Inbox", opensPanel: true },
];

/** Primary workspace-level navigation entries. */
export const sidebarPrimaryNav: SidebarNavItem[] = [
  { name: "ai", href: "/ai", icon: Bot, label: "AI", group: "workspace" },
  { name: "clients", href: "/clients", icon: UserRound, group: "crm" },
  { name: "opportunities", href: "/opportunities", icon: KanbanIcon, group: "crm" },
  { name: "deals", href: "/deals", icon: BadgeDollarSign, group: "crm" },
  { name: "tasks", href: "/tasks", icon: ListLinesIcon, group: "productivity" },
  { name: "calendar", href: "/calendar", icon: CalendarIcon, group: "productivity" },
  { name: "theories", href: "/theories", icon: Lightbulb, group: "productivity" },
  { name: "docs", href: "/docs", icon: DocumentLinesIcon, group: "productivity" },
  { name: "team", href: "/team", icon: Users, group: "team" },
  { name: "time-tracking", href: "/time-tracking", icon: Clock, group: "productivity" },
];

/** Grouped navigation for sidebar */
export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: sidebarPrimaryNav.filter(item => item.group === "workspace"),
  },
  {
    id: "crm",
    label: "CRM",
    items: sidebarPrimaryNav.filter(item => item.group === "crm"),
  },
  {
    id: "productivity",
    label: "Productivity",
    items: sidebarPrimaryNav.filter(item => item.group === "productivity"),
  },
  {
    id: "team",
    label: "Team",
    items: sidebarPrimaryNav.filter(item => item.group === "team"),
  },
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
  { name: "organization", href: "/organization", icon: Building2 },
  { name: "workspaceSettings", href: "/settings", icon: SettingsIcon },
];

export const sidebarVisibleThreadLimit = 3;
export const sidebarOrganizationListLimit = 4;

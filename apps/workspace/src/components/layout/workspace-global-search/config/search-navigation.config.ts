import type { LucideIcon } from "lucide-react";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  BadgeDollarSign,
  ListTodo,
  Plug,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";

export const globalSearchPageSize = 5;

export type GlobalSearchNavigationAction = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export type GlobalSearchResult = {
  id: string;
  type: "project" | "client";
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

type SidebarLabels = {
  dashboard: string;
  clients: string;
  deals: string;
  projects: string;
  tasks: string;
  calendar: string;
  team: string;
  integrations: string;
  settings: string;
};

/** Static navigation targets shown in the global search dialog. */
export function buildGlobalSearchNavigationActions(labels: SidebarLabels): GlobalSearchNavigationAction[] {
  return [
    { id: "workspace", label: "Workspace", href: "/ws", icon: Building2 },
    { id: "ai", label: "AI", href: "/ai", icon: Bot },
    { id: "clients", label: labels.clients, href: "/clients", icon: UserRound },
    { id: "deals", label: labels.deals, href: "/deals", icon: BadgeDollarSign },
    { id: "projects", label: labels.projects, href: "/projects", icon: BriefcaseBusiness },
    { id: "tasks", label: labels.tasks, href: "/tasks", icon: ListTodo },
    { id: "calendar", label: labels.calendar, href: "/calendar", icon: CalendarDays },
    { id: "team", label: labels.team, href: "/team", icon: UsersRound },
    { id: "integrations", label: labels.integrations, href: "/web-apps", icon: Plug },
    { id: "settings", label: labels.settings, href: "/organization", icon: Settings },
  ];
}

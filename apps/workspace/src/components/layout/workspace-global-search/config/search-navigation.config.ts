import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  KanbanSquare,
  ListTodo,
  Plug,
  Settings,
  UserRound,
  UsersRound,
  Workflow,
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
  opportunities: string;
  projects: string;
  tasks: string;
  calendar: string;
  automations: string;
  team: string;
  integrations: string;
  settings: string;
};

/** Static navigation targets shown in the global search dialog. */
export function buildGlobalSearchNavigationActions(labels: SidebarLabels): GlobalSearchNavigationAction[] {
  return [
    { id: "dashboard", label: labels.dashboard, href: "/dashboard", icon: Building2 },
    { id: "clients", label: labels.clients, href: "/clients", icon: UserRound },
    { id: "opportunities", label: labels.opportunities, href: "/opportunities", icon: KanbanSquare },
    { id: "projects", label: labels.projects, href: "/projects", icon: BriefcaseBusiness },
    { id: "tasks", label: labels.tasks, href: "/tasks", icon: ListTodo },
    { id: "calendar", label: labels.calendar, href: "/calendar", icon: CalendarDays },
    { id: "automations", label: labels.automations, href: "/automations", icon: Workflow },
    { id: "team", label: labels.team, href: "/team", icon: UsersRound },
    { id: "integrations", label: labels.integrations, href: "/web-apps", icon: Plug },
    { id: "settings", label: labels.settings, href: "/settings/organization", icon: Settings },
  ];
}

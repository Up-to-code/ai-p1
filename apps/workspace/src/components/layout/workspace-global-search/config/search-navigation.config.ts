import { createElement, type ComponentType } from "react";
import {
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

type SearchIcon = ComponentType<{ className?: string }>;

function QentrahAiIcon({ className }: { className?: string }) {
  return createElement("img", {
    src: "/ai/logo.png",
    alt: "",
    className,
  });
}

export type GlobalSearchNavigationAction = {
  id: string;
  label: string;
  href: string;
  icon: SearchIcon;
};

export type GlobalSearchResult = {
  id: string;
  type: "project" | "client" | "task" | "document";
  title: string;
  description: string;
  href: string;
  icon: SearchIcon;
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
    { id: "ai", label: "AI", href: "/ai", icon: QentrahAiIcon },
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

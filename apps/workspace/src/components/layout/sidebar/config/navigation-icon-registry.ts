import type { ComponentType, SVGAttributes } from "react";
import {
  Bot,
  LayoutGrid,
  Settings,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  CalendarIcon,
  DocumentLinesIcon,
  FolderIcon,
  HomeIcon,
  ListLinesIcon,
} from "../components/clickup-icons";
import { InboxIcon } from "../components/clickup-icons";

export type NavigationIcon = ComponentType<SVGAttributes<SVGElement> & { className?: string }>;

const navigationIcons: Readonly<Record<string, NavigationIcon>> = {
  home: HomeIcon,
  inbox: InboxIcon,
  spaces: LayoutGrid,
  projects: FolderIcon,
  tasks: ListLinesIcon,
  docs: DocumentLinesIcon,
  calendar: CalendarIcon,
  crm: UsersRound,
  automations: Workflow,
  ai: Bot,
  admin: Settings,
};

export function navigationIcon(iconId: string): NavigationIcon {
  return navigationIcons[iconId] ?? LayoutGrid;
}

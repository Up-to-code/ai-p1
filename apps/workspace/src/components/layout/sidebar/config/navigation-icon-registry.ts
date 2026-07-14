import type { ComponentType, SVGAttributes } from "react";
import {
  Bot,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  FileStack,
  Hash,
  LayoutGrid,
  Link2,
  Plug,
  ShieldCheck,
  Settings,
  UserRoundCheck,
  UserRoundX,
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
  overview: LayoutGrid,
  "my-work": CircleUserRound,
  attention: BellRing,
  channels: Hash,
  assigned: UserRoundCheck,
  unassigned: UserRoundX,
  overdue: Clock3,
  upcoming: CalendarClock,
  completed: CheckCircle2,
  shared: Link2,
  recent: Clock3,
  templates: FileStack,
  clients: UsersRound,
  deals: BriefcaseBusiness,
  permissions: ShieldCheck,
  members: UsersRound,
  integrations: Plug,
  mcp: Link2,
  billing: BriefcaseBusiness,
  usage: LayoutGrid,
};

export function navigationIcon(iconId: string): NavigationIcon {
  return navigationIcons[iconId] ?? LayoutGrid;
}

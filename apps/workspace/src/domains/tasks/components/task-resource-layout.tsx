"use client";

import {
  Columns3,
  CalendarDays,
  GanttChart,
  LayoutDashboard,
  List,
  Plus,
  Table2,
} from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  ResourceWorkspaceLayout,
  type ResourceViewCatalogItem,
  type ResourceWorkspaceConfig,
} from "@/components/shared";
import { useTaskWorkspace } from "./task-workspace-provider";

const TASK_VIEWS = [
  {
    id: "table",
    label: "Table",
    href: "/tasks/table",
    icon: <Table2 className="h-3.5 w-3.5" />,
  },
  {
    id: "board",
    label: "Board",
    href: "/tasks/board",
    icon: <Columns3 className="h-3.5 w-3.5" />,
  },
  {
    id: "list",
    label: "List",
    href: "/tasks/list",
    icon: <List className="h-3.5 w-3.5" />,
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "/tasks/calendar",
    icon: <CalendarDays className="h-3.5 w-3.5" />,
  },
  {
    id: "timeline",
    label: "Timeline",
    href: "/tasks/timeline",
    icon: <GanttChart className="h-3.5 w-3.5" />,
  },
] as const;

const TASK_VIEW_CATALOG: ResourceViewCatalogItem[] = [
  {
    id: "list",
    label: "List",
    description: "Grouped rows with drag and drop",
    icon: <List className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "board",
    label: "Board – Kanban",
    description: "Move tasks between columns",
    icon: <Columns3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "table",
    label: "Table",
    description: "Structured task fields",
    icon: <Table2 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Review task deadlines by month",
    icon: <CalendarDays className="h-4 w-4" />,
    section: "more",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Plan work by start and due date",
    icon: <GanttChart className="h-4 w-4" />,
    section: "more",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Track task metrics",
    icon: <LayoutDashboard className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
];

function activeTaskView(pathname: string) {
  if (pathname.includes("/tasks/calendar")) return "calendar";
  if (pathname.includes("/tasks/timeline")) return "timeline";
  if (pathname.includes("/tasks/board")) return "board";
  if (pathname.includes("/tasks/list")) return "list";
  return "table";
}

export function TaskResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspace = useTaskWorkspace();
  const activeViewId = activeTaskView(pathname);
  const query = searchParams.toString();
  const withViewState = (href: string) => query ? `${href}?${query}` : href;
  const config: ResourceWorkspaceConfig = {
    resourceId: "tasks",
    title: "Tasks",
    count: `${workspace.tasks.length} task${workspace.tasks.length === 1 ? "" : "s"}`,
    activeViewId,
    views: TASK_VIEWS.map((view) => ({ ...view, href: withViewState(view.href) })),
    actions: [
      {
        id: "new-task",
        label: "New task",
        icon: <Plus className="h-3.5 w-3.5" />,
        onClick: workspace.openCreateTask,
        variant: "primary",
      },
    ],
    viewCatalog: TASK_VIEW_CATALOG,
    onAddView: (view) => {
      if (["table", "board", "list", "calendar", "timeline"].includes(view.id))
        router.push(withViewState(`/tasks/${view.id}`));
    },
  };

  return (
    <ResourceWorkspaceLayout config={config}>
      {children}
    </ResourceWorkspaceLayout>
  );
}

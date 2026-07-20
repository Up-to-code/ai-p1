"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Columns3,
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
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { logger } from "@/lib/logger";
import { SurfaceTabDialogs } from "@/domains/surfaces";
import { useTaskWorkspace } from "./task-workspace-provider";
import {
  useCreateTaskViewTab,
  useDetachTaskViewTab,
  useDuplicateTaskViewTab,
  useRenameTaskViewTab,
  useReorderTaskViewTabs,
  useTaskWorkspaceSurface,
} from "../api/task-workspace";
import {
  defaultTaskViewConfig,
  isTaskViewType,
  taskViewRoute,
  type TaskViewType,
  type TaskWorkspaceSurfaceTab,
} from "../workspace/task-workspace";

const VIEW_ICON = {
  table: Table2,
  list: List,
  board: Columns3,
  calendar: CalendarDays,
  timeline: GanttChart,
  dashboard: LayoutDashboard,
} satisfies Record<TaskViewType, typeof Table2>;

const TASK_VIEW_CATALOG: ResourceViewCatalogItem[] = [
  { id: "table", label: "Table", description: "Structured task fields", icon: <Table2 className="h-4 w-4" />, section: "popular" },
  { id: "list", label: "List", description: "Grouped task rows", icon: <List className="h-4 w-4" />, section: "popular" },
  { id: "board", label: "Board", description: "Move tasks between columns", icon: <Columns3 className="h-4 w-4" />, section: "popular" },
  { id: "calendar", label: "Calendar", description: "Review task deadlines", icon: <CalendarDays className="h-4 w-4" />, section: "more" },
  { id: "timeline", label: "Timeline", description: "Plan work by dates", icon: <GanttChart className="h-4 w-4" />, section: "more" },
  { id: "dashboard", label: "Dashboard", description: "Track task metrics", icon: <LayoutDashboard className="h-4 w-4" />, section: "more" },
];

function viewTypeFromPath(pathname: string): TaskViewType {
  const segment = pathname.split("/").find((part) => isTaskViewType(part));
  return segment && isTaskViewType(segment) ? segment : "table";
}

export function TaskResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const workspace = useTaskWorkspace();
  const organizationId = session.workspace.organizationId ?? undefined;
  const surfaceQuery = useTaskWorkspaceSurface(organizationId);
  const createView = useCreateTaskViewTab();
  const renameView = useRenameTaskViewTab();
  const duplicateView = useDuplicateTaskViewTab();
  const detachView = useDetachTaskViewTab();
  const reorderViews = useReorderTaskViewTabs();
  const [renameTab, setRenameTab] = useState<TaskWorkspaceSurfaceTab | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [shareTab, setShareTab] = useState<TaskWorkspaceSurfaceTab | null>(null);
  const activeType = viewTypeFromPath(pathname);
  const query = searchParams.toString();
  const withViewState = (href: string) => query ? `${href}?${query}` : href;
  const isCollectionRoute = pathname.split("/").some((part) => isTaskViewType(part));
  const projection = surfaceQuery.data;
  const activeTab = projection?.tabs.find((tab) => pathname.includes(tab.savedView.id))
    ?? projection?.tabs.find((tab) => tab.savedView.isSystemDefault && tab.savedView.viewType === activeType);

  const views = useMemo(() => {
    const tabs = projection?.tabs ?? [];
    const projected = tabs.map((tab, tabIndex) => {
      const Icon = VIEW_ICON[tab.savedView.viewType];
      const moveTo = async (targetIndex: number) => {
        if (!organizationId || !projection || targetIndex < 0 || targetIndex >= tabs.length) return;
        const orderedTabIds = tabs.map((candidate) => candidate.id);
        [orderedTabIds[tabIndex], orderedTabIds[targetIndex]] = [
          orderedTabIds[targetIndex],
          orderedTabIds[tabIndex],
        ];
        try {
          await reorderViews.mutateAsync({
            organizationId,
            surfaceId: projection.surface.id,
            orderedTabIds,
          });
        } catch (error) {
          logger.error("task_view.reorder_failed", { error, tabId: tab.id });
          toast({ title: "Views could not be reordered", type: "error" });
        }
      };
      const actions = [
        tab.capabilities.canRename ? { id: "rename", label: "Rename", onSelect: () => { setRenameTab(tab); setRenameValue(tab.label); } } : null,
        tab.capabilities.canReorder && tabIndex > 0 ? { id: "move-left", label: "Move left", onSelect: () => moveTo(tabIndex - 1) } : null,
        tab.capabilities.canReorder && tabIndex < tabs.length - 1 ? { id: "move-right", label: "Move right", onSelect: () => moveTo(tabIndex + 1) } : null,
        tab.capabilities.canDuplicate ? { id: "duplicate", label: "Duplicate", onSelect: async () => {
          if (!organizationId) return;
          try {
            const created = await duplicateView.mutateAsync({ organizationId, tabId: tab.id });
            router.push(created.canonicalRoute);
          } catch (error) {
            logger.error("task_view.duplicate_failed", { error, tabId: tab.id });
            toast({ title: "View could not be duplicated", type: "error" });
          }
        } } : null,
        tab.capabilities.canShare ? { id: "share", label: "Share", onSelect: () => setShareTab(tab) } : null,
        tab.capabilities.canRemove ? { id: "remove", label: "Remove", destructive: true, onSelect: async () => {
          if (!organizationId) return;
          try {
            await detachView.mutateAsync({ organizationId, tabId: tab.id });
            if (activeTab?.id === tab.id) router.push(projection?.tabs.find((candidate) => candidate.id !== tab.id)?.canonicalRoute ?? withViewState("/tasks/table"));
          } catch (error) {
            logger.error("task_view.detach_failed", { error, tabId: tab.id });
            toast({ title: "View could not be removed", description: error instanceof Error ? error.message : undefined, type: "error" });
          }
        } } : null,
      ].filter((action): action is NonNullable<typeof action> => action !== null);
      return { id: tab.id, label: tab.label, href: tab.canonicalRoute, icon: <Icon className="h-3.5 w-3.5" />, actions };
    });
    if (!projected.some((view) => view.href === withViewState(taskViewRoute(activeType)))) {
      const Icon = VIEW_ICON[activeType];
      projected.push({ id: `base:${activeType}` as never, label: activeType[0].toUpperCase() + activeType.slice(1), href: withViewState(taskViewRoute(activeType)), icon: <Icon className="h-3.5 w-3.5" />, actions: [] });
    }
    return projected;
  }, [activeTab, activeType, detachView, duplicateView, organizationId, projection, reorderViews, router, toast, withViewState]);

  const config: ResourceWorkspaceConfig = {
    resourceId: "tasks",
    title: "Tasks",
    count: `${workspace.tasks.length} task${workspace.tasks.length === 1 ? "" : "s"}`,
    activeViewId: activeTab?.id ?? `base:${activeType}`,
    views,
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
    onAddView: async (item) => {
      if (!organizationId || !projection || !isTaskViewType(item.id)) return;
      try {
        const created = await createView.mutateAsync({
          organizationId,
          surfaceId: projection.surface.id,
          viewType: item.id,
          name: item.label,
          config: defaultTaskViewConfig(item.id),
        });
        router.push(created.canonicalRoute);
      } catch (error) {
        logger.error("task_view.create_failed", { error, viewType: item.id });
        toast({ title: "View could not be created", type: "error" });
      }
    },
  };

  async function submitRename() {
    if (!organizationId || !renameTab) return;
    try {
      await renameView.mutateAsync({ organizationId, tabId: renameTab.id, name: renameValue });
      setRenameTab(null);
    } catch (error) {
      logger.error("task_view.rename_failed", { error, tabId: renameTab.id });
      toast({ title: "View could not be renamed", type: "error" });
    }
  }

  if (!isCollectionRoute) return <>{children}</>;

  return (
    <>
      <ResourceWorkspaceLayout config={config}>
        {children}
      </ResourceWorkspaceLayout>
      <SurfaceTabDialogs
        renameTab={renameTab}
        onRenameClose={() => setRenameTab(null)}
        onRenameSubmit={() => void submitRename()}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        renamePending={renameView.isPending}
        shareTab={shareTab}
        onShareClose={() => setShareTab(null)}
        organizationId={organizationId}
      />
    </>
  );
}

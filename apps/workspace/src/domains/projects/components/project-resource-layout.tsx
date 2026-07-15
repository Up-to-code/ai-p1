"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  ResourceWorkspaceLayout,
  type ResourceViewCatalogItem,
  type ResourceWorkspaceConfig,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import type { SavedViewRecord } from "@/domains/views";
import { logger } from "@/lib/logger";
import { SavedViewSharingDialog } from "@/domains/tasks/components/saved-view-sharing-dialog";
import { CreateProjectForm } from "./create-project-form";
import {
  useCreateProjectViewTab,
  useDetachProjectViewTab,
  useDuplicateProjectViewTab,
  useProjectWorkspaceSurface,
  useRenameProjectViewTab,
  useReorderProjectViewTabs,
} from "../api/project-workspace";
import { useProjectsIndexQuery } from "../api/projects";
import {
  defaultProjectViewConfig,
  isProjectViewType,
  projectViewRoute,
  type ProjectViewType,
  type ProjectWorkspaceSurfaceTab,
} from "../workspace/project-workspace";

const VIEW_ICON = {
  table: Table2,
  list: List,
  board: Columns3,
  calendar: CalendarDays,
  timeline: GanttChart,
  dashboard: LayoutDashboard,
} satisfies Record<ProjectViewType, typeof Table2>;

const PROJECT_VIEW_CATALOG: ResourceViewCatalogItem[] = [
  { id: "table", label: "Table", description: "Configurable project fields", icon: <Table2 className="h-4 w-4" />, section: "popular" },
  { id: "list", label: "List", description: "Grouped project rows", icon: <List className="h-4 w-4" />, section: "popular" },
  { id: "board", label: "Board", description: "Move projects between statuses", icon: <Columns3 className="h-4 w-4" />, section: "popular" },
  { id: "calendar", label: "Calendar", description: "Plan project date ranges", icon: <CalendarDays className="h-4 w-4" />, section: "more" },
  { id: "timeline", label: "Timeline", description: "Review progress across time", icon: <GanttChart className="h-4 w-4" />, section: "more" },
  { id: "dashboard", label: "Dashboard", description: "Track project metrics", icon: <LayoutDashboard className="h-4 w-4" />, section: "more" },
];

function viewTypeFromPath(pathname: string): ProjectViewType {
  const segment = pathname.split("/").find((part) => isProjectViewType(part));
  return segment && isProjectViewType(segment) ? segment : "table";
}

function savedViewForSharing(tab: ProjectWorkspaceSurfaceTab): SavedViewRecord {
  return {
    _id: tab.savedView.id,
    _creationTime: 0,
    userId: "",
    name: tab.savedView.name,
    resourceType: "project",
    viewType: tab.savedView.viewType,
    scope: "workspace",
    config: tab.savedView.config,
    sharingMode: tab.savedView.sharingMode,
    revision: tab.savedView.revision,
    canConfigure: tab.capabilities.canRename,
    canShare: tab.capabilities.canShare,
    canDelete: tab.capabilities.canRemove,
    canSetDefault: false,
    createdAt: 0,
    updatedAt: 0,
  };
}

export function ProjectResourceLayout({ children }: { children: React.ReactNode }) {
  const session = useAuthSession();
  const t = useTranslations("Projects.workspace");
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const organizationId = session.workspace.organizationId ?? undefined;
  const surfaceQuery = useProjectWorkspaceSurface(organizationId);
  const projectIndex = useProjectsIndexQuery(organizationId);
  const createView = useCreateProjectViewTab();
  const renameView = useRenameProjectViewTab();
  const duplicateView = useDuplicateProjectViewTab();
  const detachView = useDetachProjectViewTab();
  const reorderViews = useReorderProjectViewTabs();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [renameTab, setRenameTab] = useState<ProjectWorkspaceSurfaceTab | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [shareTab, setShareTab] = useState<ProjectWorkspaceSurfaceTab | null>(null);
  const activeType = viewTypeFromPath(pathname);
  const isCollectionRoute = pathname.split("/").some((part) => isProjectViewType(part));
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
          logger.error("project_view.reorder_failed", { error, tabId: tab.id });
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
            logger.error("project_view.duplicate_failed", { error, tabId: tab.id });
            toast({ title: "View could not be duplicated", type: "error" });
          }
        } } : null,
        tab.capabilities.canShare ? { id: "share", label: "Share", onSelect: () => setShareTab(tab) } : null,
        tab.capabilities.canRemove ? { id: "remove", label: "Remove", destructive: true, onSelect: async () => {
          if (!organizationId) return;
          try {
            await detachView.mutateAsync({ organizationId, tabId: tab.id });
            if (activeTab?.id === tab.id) router.push(projection?.tabs.find((candidate) => candidate.id !== tab.id)?.canonicalRoute ?? "/projects/table");
          } catch (error) {
            logger.error("project_view.detach_failed", { error, tabId: tab.id });
            toast({ title: "View could not be removed", description: error instanceof Error ? error.message : undefined, type: "error" });
          }
        } } : null,
      ].filter((action): action is NonNullable<typeof action> => action !== null);
      return { id: tab.id, label: tab.label, href: tab.canonicalRoute, icon: <Icon className="h-3.5 w-3.5" />, actions };
    });
    if (!projected.some((view) => view.href === projectViewRoute(activeType))) {
      const Icon = VIEW_ICON[activeType];
      projected.push({ id: `base:${activeType}` as never, label: activeType[0].toUpperCase() + activeType.slice(1), href: projectViewRoute(activeType), icon: <Icon className="h-3.5 w-3.5" />, actions: [] });
    }
    return projected;
  }, [activeTab, activeType, detachView, duplicateView, organizationId, projection, reorderViews, router, toast]);

  const config: ResourceWorkspaceConfig = {
    resourceId: "projects",
    title: "Projects",
    count: projectIndex.queryStatus === "loading"
      ? t("loadingProjects")
      : t("projectCount", { count: projectIndex.stats?.total ?? projectIndex.results.length }),
    activeViewId: activeTab?.id ?? `base:${activeType}`,
    views,
    actions: [{ id: "new-project", label: "New project", icon: <Plus className="h-3.5 w-3.5" />, onClick: () => setCreateProjectOpen(true), variant: "primary" }],
    viewCatalog: PROJECT_VIEW_CATALOG,
    onAddView: async (item) => {
      if (!organizationId || !projection || !isProjectViewType(item.id)) return;
      try {
        const created = await createView.mutateAsync({
          organizationId,
          surfaceId: projection.surface.id,
          viewType: item.id,
          name: item.label,
          config: defaultProjectViewConfig(item.id),
        });
        router.push(created.canonicalRoute);
      } catch (error) {
        logger.error("project_view.create_failed", { error, viewType: item.id });
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
      logger.error("project_view.rename_failed", { error, tabId: renameTab.id });
      toast({ title: "View could not be renamed", type: "error" });
    }
  }

  if (!isCollectionRoute) return <>{children}</>;

  return (
    <>
      <ResourceWorkspaceLayout config={config}>{children}</ResourceWorkspaceLayout>
      <CreateProjectForm isOpen={createProjectOpen} onCancel={() => setCreateProjectOpen(false)} onSuccess={() => setCreateProjectOpen(false)} />
      <Dialog open={Boolean(renameTab)} onOpenChange={(open) => !open && setRenameTab(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename view</DialogTitle>
            <DialogDescription>Change the tab label for this Project view.</DialogDescription>
          </DialogHeader>
          <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submitRename(); }} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTab(null)}>Cancel</Button>
            <Button onClick={() => void submitRename()} disabled={!renameValue.trim() || renameView.isPending}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SavedViewSharingDialog view={shareTab ? savedViewForSharing(shareTab) : null} organizationId={organizationId} open={Boolean(shareTab)} onOpenChange={(open) => !open && setShareTab(null)} />
    </>
  );
}

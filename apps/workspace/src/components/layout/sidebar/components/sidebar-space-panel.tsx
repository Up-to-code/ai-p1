"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  Check,
  Plus,
  FolderGit2,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  KanbanSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { getOrganizationCapabilities } from "@/domains/organization/api";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { SpacesPanelSkeleton } from "@/components/loading-ui";

function SpaceItem({
  space,
  isActive,
  onSelect,
}: {
  space: { id: string; name: string; slug: string; color?: string; projectId: string };
  isActive: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(space.slug)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-start transition-colors hover:bg-accent/30",
        isActive && "bg-accent/30",
      )}
    >
      <div
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: space.color ?? "#6b7280" }}
      />
      <span
        className={cn(
          "flex-1 truncate text-sm",
          isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground",
        )}
      >
        {space.name}
      </span>
      {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-foreground" strokeWidth={2.5} />}
    </button>
  );
}

/** All-spaces view — flat list of all spaces across projects */
function AllSpacesView({
  spaceList,
  spaceSlug,
  onSelect,
}: {
  spaceList: { id: string; name: string; slug: string; color?: string; projectId: string }[];
  spaceSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  const [hoveredSpace, setHoveredSpace] = useState<string | null>(null);

  if (spaceList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <Layers className="mb-2 h-8 w-8 text-text-muted/40" strokeWidth={1.5} />
        <p className="text-xs font-semibold text-text-muted">No spaces yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {spaceList.map((space) => {
        const isActive = space.slug === spaceSlug;
        const isHovered = hoveredSpace === space.id;
        return (
          <div
            key={space.id}
            className="group/space relative"
            onMouseEnter={() => setHoveredSpace(space.id)}
            onMouseLeave={() => setHoveredSpace(null)}
          >
            <SpaceItem space={space} isActive={isActive} onSelect={onSelect} />
            {isHovered && !isActive && (
              <button
                type="button"
                className="absolute end-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-text-muted opacity-0 group-hover/space:opacity-100 hover:bg-accent/50 hover:text-text-primary transition-opacity"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Active-space view — shows the space + projects tree */
function ActiveSpaceView({
  spaceList,
  activeSpace,
  spaceSlug,
  projectId,
  level,
  onSelect,
}: {
  spaceList: { id: string; name: string; slug: string; color?: string; projectId: string }[];
  activeSpace: { id: string; name: string; slug: string; color?: string; projectId: string };
  spaceSlug: string | null;
  projectId: string | null;
  level: string;
  onSelect: (slug: string) => void;
}) {
  const account = useAccountContext();
  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  const projectsResult = useProjectsIndexQuery(orgId);
  const projects = projectsResult?.results ?? [];

  const projectMap = useMemo(() => {
    const map = new Map<string, typeof spaceList>();
    for (const s of spaceList) {
      const existing = map.get(s.projectId) ?? [];
      existing.push(s);
      map.set(s.projectId, existing);
    }
    return map;
  }, [spaceList]);

  const parentProject = projects.find((p) => p.id === activeSpace.projectId);
  const siblingSpaces = projectMap.get(activeSpace.projectId) ?? [];

  const [projectsExpanded, setProjectsExpanded] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none">
        {parentProject && (
          <div>
            <button
              type="button"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-foreground transition-colors"
            >
              {projectsExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <FolderGit2 className="h-3.5 w-3.5" />
              <span className="truncate">{parentProject.name}</span>
            </button>

            {projectsExpanded && (
              <div className="flex flex-col">
                {siblingSpaces.map((space) => (
                  <SpaceItem
                    key={space.id}
                    space={space}
                    isActive={space.slug === spaceSlug}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mx-4 my-2 h-px bg-border/50" />

        <div className="px-4 py-1">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            Quick links
          </p>
          <div className="flex flex-col gap-0.5">
            <WorkspaceLink
              href="/tasks"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[9px] font-bold">
                T
              </span>
              Tasks
            </WorkspaceLink>
          </div>
      </div>
    </div>
  );
}

function CreateMenu({ orgId, canCreate }: { orgId?: string; canCreate: boolean }) {
  const [open, setOpen] = useState(false);

  if (!canCreate) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent/50 hover:text-text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={4} className="w-48 p-1.5">
        <div className="flex flex-col gap-0.5">
          <WorkspaceLink
            href="/projects/new"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
            New Project
          </WorkspaceLink>
          <WorkspaceLink
            href={orgId ? `/spaces/new` : "#"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <KanbanSquare className="h-4 w-4 text-muted-foreground" />
            New Space
          </WorkspaceLink>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────

export function SidebarSpacePanel() {
  const t = useTranslations("Sidebar");
  const account = useAccountContext();
  const { spaceSlug, setSpace, projectId, level } = useNavigation();

  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  const capabilitiesQuery = useQuery({
    queryKey: ["organization-capabilities", orgId],
    queryFn: () => getOrganizationCapabilities(orgId!),
    enabled: Boolean(orgId),
  });
  const canCreate = capabilitiesQuery.data?.canCreateProjects ?? false;

  const spaces = useWorkspaceSpacesQuery(orgId);
  const spaceList = spaces ?? [];
  const isLoadingSpaces = spaces === undefined;

  const activeSpace = spaceSlug ? spaceList.find((s) => s.slug === spaceSlug) ?? null : null;

  function handleSpaceSelect(slug: string) {
    setSpace(slug);
  }

  const showActiveView = activeSpace && (level === "space" || level === "project");

  if (isLoadingSpaces) {
    return <SpacesPanelSkeleton />;
  }

  return (
    <SidebarPanelLayout
      title={showActiveView && activeSpace ? activeSpace.name : t("spaces")}
      navbarActions={<CreateMenu orgId={orgId} canCreate={canCreate} />}
    >
      {showActiveView && activeSpace ? (
        <ActiveSpaceView
          spaceList={spaceList}
          activeSpace={activeSpace}
          spaceSlug={spaceSlug}
          projectId={projectId}
          level={level}
          onSelect={handleSpaceSelect}
        />
      ) : (
        <AllSpacesView spaceList={spaceList} spaceSlug={spaceSlug} onSelect={handleSpaceSelect} />
      )}
    </SidebarPanelLayout>
  );
}

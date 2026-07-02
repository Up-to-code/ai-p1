"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewSwitcher } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import type { Space } from "@/domains/projects/api/spaces";
import type { CSSProperties } from "react";

function ClickUpIcon({ path, size = 14, color }: { path: string; size?: number; color?: string }) {
  return (
    <span
      role="img"
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? "currentColor",
        WebkitMaskImage: `url(${path})`,
        maskImage: `url(${path})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      } as CSSProperties}
    />
  );
}

const iconFor = (key: string | undefined): string | null => {
  if (!key) return null;
  const k = key.toLowerCase();
  if (k.includes("list")) return "/icons/clickup/list.svg";
  if (k.includes("gantt")) return "/icons/clickup/bar-chart.svg";
  if (k.includes("calendar")) return "/icons/clickup/calendar.svg";
  if (k.includes("board") || k.includes("kanban")) return "/icons/clickup/kanban.svg";
  if (k.includes("doc")) return "/icons/clickup/file-text.svg";
  if (k.includes("form")) return "/icons/clickup/clipboard-check.svg";
  if (k.includes("dash")) return "/icons/clickup/bar-chart-filled.svg";
  if (k.includes("table")) return "/icons/clickup/table.svg";
  if (k.includes("whiteboard")) return "/icons/clickup/expand-arrows.svg";
  if (k.includes("timeline")) return "/icons/clickup/clock.svg";
  if (k.includes("activity")) return "/icons/clickup/activity.svg";
  if (k.includes("map")) return "/icons/clickup/folder.svg";
  return null;
};

const visibilityLabel = (v: Space["visibility"]): string => {
  switch (v) {
    case "private":
      return "Private";
    case "public":
      return "Public";
    case "request_only":
      return "Request Only";
    default:
      return v;
  }
};

export function ProjectsPageRedesigned() {
  const session = useAuthSession();
  const { setSpace } = useNavigation();
  const t = useTranslations("Spaces");

  const [activeView, setActiveView] = useState<ViewMode>('table');

  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const spaces = useWorkspaceSpacesQuery(orgId);
  const projectsQuery = useProjectsIndexQuery(orgId);
  const projects = projectsQuery.results ?? [];

  const isLoading = spaces === undefined;
  const spaceList = spaces ?? [];

  const projectsBySpace = (() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      const spaceId = (project as { spaceId?: string }).spaceId;
      if (spaceId) {
        map.set(spaceId, (map.get(spaceId) ?? 0) + 1);
      }
    }
    return map;
  })();

  const columns: QentrahColumnDef<Space>[] = [
    {
      headerName: "Name",
      field: "name",
      flex: 1.5,
      minWidth: 220,
      cellRenderer: (p: any) => {
        if (p.data?.__groupKey) return null;
        const color = p.data?.color;
        const icon = iconFor(p.data?.icon) ?? iconFor(p.data?.name);
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
              style={{ background: color ? `color-mix(in srgb, ${color} 14%, transparent)` : "var(--q-bg-secondary)" } as CSSProperties}
            >
              {icon ? (
                <ClickUpIcon path={icon} size={14} color={color ?? "var(--q-text-muted)"} />
              ) : (
                <ClickUpIcon path="/icons/clickup/folder.svg" size={14} color="var(--q-text-muted)" />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-foreground">{p.data?.name}</div>
              <div className="truncate text-[11px] text-muted-foreground/80">/{p.data?.slug}</div>
            </div>
          </div>
        );
      },
    },
    {
      headerName: "Projects",
      field: "id",
      width: 110,
      cellRenderer: (p: any) => {
        if (p.data?.__groupKey) return null;
        const n = projectsBySpace.get(p.data?.id) ?? 0;
        return (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground/80">{n}</span>
            <span className="opacity-60">project{n !== 1 ? "s" : ""}</span>
          </span>
        );
      },
    },
    {
      headerName: "Visibility",
      field: "visibility",
      width: 150,
      cellRenderer: (p: any) => {
        if (p.data?.__groupKey) return null;
        const isPublic = p.value === "public";
        const isPrivate = p.value === "private";
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
              isPublic
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300/90 border-border/60"
                : isPrivate
                ? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300/80 border-border/60"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300/90 border-border/60"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isPublic ? "bg-emerald-600 dark:bg-emerald-300" : isPrivate ? "bg-zinc-500 dark:bg-zinc-300" : "bg-amber-500 dark:bg-amber-300"
              )}
            />
            {visibilityLabel(p.value)}
          </span>
        );
      },
    },
    {
      headerName: "Created",
      field: "createdAt",
      width: 140,
      valueFormatter: (p: any) => {
        if (!p.value) return "—";
        return new Date(p.value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
  ];

  const actions: HeaderAction[] = [
    {
      label: "Create Space",
      icon: <Plus className="w-4 h-4" />,
      onClick: () => console.log("Create space"),
      variant: "primary",
    },
  ];

  const availableViews: ViewMode[] = ['table', 'board', 'calendar', 'timeline', 'dashboard', 'widgets'];

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Projects"
          currentSection="All Spaces"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 relative">
          <ViewLoading style="table" message="Loading spaces..." />
        </div>
      </div>
    );
  }

  if (spaceList.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Projects"
          currentSection="All Spaces"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ClickUpIcon path="/icons/clickup/folder.svg" size={48} color="var(--q-text-muted)" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">{t("noSpaces")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <DomainHeader
        domain="Projects"
        currentSection={`${spaceList.length} space${spaceList.length !== 1 ? "s" : ""}`}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* View content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'table' && (
          <div className="h-full p-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
              <QentrahTable
                rows={spaceList}
                columns={columns}
                density="compact"
                height="100%"
                rowSelection="single"
                getRowId={(row) => row.id}
                onRowClicked={(p) => {
                  if (p.data?.slug) setSpace(p.data.slug);
                }}
              />
            </div>
          </div>
        )}

        {activeView === 'board' && (
          <div className="h-full p-6">
            <ViewLoading style="board" message="Board view coming soon" />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="h-full p-6">
            <ViewLoading style="calendar" message="Calendar view coming soon" />
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="h-full p-6">
            <ViewLoading style="table" message="Timeline view coming soon" />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Dashboard view coming soon" />
          </div>
        )}

        {activeView === 'widgets' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Widgets view coming soon" />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { AppPageHeader, AppPageShell } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import type { Space } from "@/domains/projects/api/spaces";

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
  )
}

const iconFor = (key: string | undefined): string | null => {
  if (!key) return null
  const k = key.toLowerCase()
  if (k.includes("list")) return "/icons/clickup/list.svg"
  if (k.includes("gantt")) return "/icons/clickup/bar-chart.svg"
  if (k.includes("calendar")) return "/icons/clickup/calendar.svg"
  if (k.includes("board") || k.includes("kanban")) return "/icons/clickup/kanban.svg"
  if (k.includes("doc")) return "/icons/clickup/file-text.svg"
  if (k.includes("form")) return "/icons/clickup/clipboard-check.svg"
  if (k.includes("dash")) return "/icons/clickup/bar-chart-filled.svg"
  if (k.includes("table")) return "/icons/clickup/table.svg"
  if (k.includes("whiteboard")) return "/icons/clickup/expand-arrows.svg"
  if (k.includes("timeline")) return "/icons/clickup/clock.svg"
  if (k.includes("activity")) return "/icons/clickup/activity.svg"
  if (k.includes("map")) return "/icons/clickup/folder.svg"
  return null
}

const visibilityLabel = (v: Space["visibility"]): string => {
  switch (v) {
    case "private":
      return "Private"
    case "public":
      return "Public"
    case "request_only":
      return "Request Only"
    default:
      return v
  }
}

export function SpacesListView() {
  const session = useAuthSession();
  const { setSpace } = useNavigation();
  const t = useTranslations("Spaces");

  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const spaces = useWorkspaceSpacesQuery(orgId);
  const projectsQuery = useProjectsIndexQuery(orgId);
  const projects = projectsQuery.results ?? [];

  const isLoading = spaces === undefined;
  const spaceList = spaces ?? [];

  const projectsBySpace = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      const spaceId = (project as { spaceId?: string }).spaceId;
      if (spaceId) {
        map.set(spaceId, (map.get(spaceId) ?? 0) + 1);
      }
    }
    return map;
  }, [projects]);

  const columns: QentrahColumnDef<Space>[] = useMemo(
    () => [
      {
        headerName: "Name",
        field: "name",
        flex: 1.5,
        minWidth: 220,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          const color = p.data?.color
          const icon = iconFor(p.data?.icon) ?? iconFor(p.data?.name)
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
          )
        },
      },
      {
        headerName: "Projects",
        field: "id",
        width: 110,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          const n = projectsBySpace.get(p.data?.id) ?? 0
          return (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground/80">{n}</span>
              <span className="opacity-60">project{n !== 1 ? "s" : ""}</span>
            </span>
          )
        },
      },
      {
        headerName: "Visibility",
        field: "visibility",
        width: 150,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          const isPublic = p.value === "public"
          const isPrivate = p.value === "private"
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
          )
        },
      },
      {
        headerName: "Created",
        field: "createdAt",
        width: 140,
        valueFormatter: (p: any) => {
          if (!p.value) return "—"
          return new Date(p.value).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        },
      },
    ],
    [projectsBySpace],
  )

  const title = t("title")
  const createButton = (
    <button className="flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm">
      <Plus className="h-4 w-4" />
      {t("createSpace")}
    </button>
  )

  if (isLoading) {
    return (
      <AppPageShell>
        <AppPageHeader title={title} subtitle="Loading…" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </AppPageShell>
    )
  }

  if (spaceList.length === 0) {
    return (
      <AppPageShell>
        <AppPageHeader title={title} subtitle="0 spaces" actions={createButton} />
        <div className="flex flex-col items-center justify-center py-16">
          <ClickUpIcon path="/icons/clickup/folder.svg" size={48} color="var(--q-text-muted)" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t("noSpaces")}</p>
        </div>
      </AppPageShell>
    )
  }

  return (
    <AppPageShell>
      <AppPageHeader
        title={title}
        subtitle={`${spaceList.length} space${spaceList.length !== 1 ? "s" : ""}`}
        actions={createButton}
      />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <QentrahTable
          rows={spaceList}
          columns={columns}
          density="compact"
          height="100%"
          rowSelection="single"
          getRowId={(row) => row.id}
          onRowClicked={(p) => {
            if (p.data?.slug) setSpace(p.data.slug)
          }}
        />
      </div>
    </AppPageShell>
  )
}

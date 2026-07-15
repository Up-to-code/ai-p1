"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  Check,
  Columns3,
  Search,
} from "lucide-react";
import { StatusPill, type StatusPillTone } from "@qentrah/ui";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import type { OrganizationMember } from "@/domains/organization/api/types";
import { useUpdateProjectViewConfig } from "../../api/project-workspace";
import { useProjectCollectionView } from "../../hooks/use-project-collection-view";
import type { Project, ProjectHealth, ProjectStatus } from "../../store/projects.types";
import { ProjectViewEmpty, ProjectViewError, ProjectViewLoading } from "./project-view-states";

const AVAILABLE_FIELDS = [
  "name",
  "status",
  "health",
  "progress",
  "ownerUserId",
  "startDate",
  "endDate",
  "budget",
  "currency",
  "tags",
  "updatedAt",
] as const;

type ProjectField = (typeof AVAILABLE_FIELDS)[number];

const STATUS_TONES: Record<ProjectStatus, StatusPillTone> = {
  planned: "neutral",
  active: "info",
  paused: "warning",
  completed: "success",
  archived: "neutral",
};

const HEALTH_TONES: Record<ProjectHealth, StatusPillTone> = {
  onTrack: "success",
  atRisk: "warning",
  blocked: "danger",
};

const STATUS_LABEL_KEYS = {
  planned: "statusPlanned",
  active: "statusActive",
  paused: "statusPaused",
  completed: "statusCompleted",
  archived: "statusArchived",
} as const;

const HEALTH_LABEL_KEYS = {
  onTrack: "healthOnTrack",
  atRisk: "healthAtRisk",
  blocked: "healthBlocked",
} as const;

function memberId(member: OrganizationMember) {
  return member.userId || member.user?.id || member.id;
}

function initials(value: string) {
  return value
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

function dateLabel(value: string | number | undefined) {
  if (value == null || value === "") return "—";
  const date = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function currencyLabel(project: Project) {
  if (project.budget == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: project.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(project.budget);
}

function projectField(value: string): value is ProjectField {
  return AVAILABLE_FIELDS.includes(value as ProjectField);
}

function uniqueFields(configured: string[]) {
  return configured.filter((field, index) => projectField(field) && configured.indexOf(field) === index) as ProjectField[];
}

function OwnerCell({
  project,
  members,
  currentUser,
  fallback,
  you,
}: {
  project: Project;
  members: Map<string, OrganizationMember>;
  currentUser: { id: string; name: string; email: string; image?: string | null };
  fallback: string;
  you: string;
}) {
  const member = project.ownerUserId ? members.get(project.ownerUserId) : undefined;
  const isCurrentUser = project.ownerUserId === currentUser.id;
  const label = isCurrentUser
    ? currentUser.name || currentUser.email
    : member?.user?.name || member?.user?.email || fallback;
  const image = isCurrentUser ? currentUser.image : member?.user?.image;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm">
        {image ? <AvatarImage src={image} alt="" /> : null}
        <AvatarFallback>{initials(label) || "?"}</AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block max-w-40 truncate text-xs font-medium text-foreground">{label}</span>
        {isCurrentUser ? <span className="block text-[10px] text-muted-foreground">{you}</span> : null}
      </span>
    </div>
  );
}

export function ProjectTableView({ savedViewId }: { savedViewId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const session = useAuthSession();
  const { toast } = useToast();
  const t = useTranslations("Projects.workspace");
  const tForm = useTranslations("Projects.form");
  const view = useProjectCollectionView("table", savedViewId);
  const updateView = useUpdateProjectViewConfig();
  const membersQuery = useQuery({
    queryKey: ["organization-members", view.organizationId],
    queryFn: () => listOrganizationMembers(view.organizationId!),
    enabled: Boolean(view.organizationId),
  });
  const members = useMemo(
    () => new Map((membersQuery.data ?? []).map((member) => [memberId(member), member])),
    [membersQuery.data],
  );

  function updateParams(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  async function toggleColumn(field: ProjectField) {
    if (!view.organizationId || !view.tab?.capabilities.canRename) return;
    const currentlyVisible = view.config.columnVisibility?.[field] !== false;
    try {
      await updateView.mutateAsync({
        organizationId: view.organizationId,
        viewId: view.tab.savedView.id,
        config: {
          ...view.config,
          columnOrder: uniqueFields([
            ...(view.config.columnOrder ?? view.config.project?.visibleFields ?? []),
            ...AVAILABLE_FIELDS,
          ]),
          columnVisibility: {
            ...view.config.columnVisibility,
            [field]: !currentlyVisible,
          },
        },
      });
    } catch (error) {
      logger.error("project_table.columns_update_failed", { error, field });
      toast({ title: t("customizeColumns"), description: error instanceof Error ? error.message : undefined, type: "error" });
    }
  }

  if (view.queryStatus === "loading" || view.queryStatus === "idle") return <ProjectViewLoading />;
  if (view.queryStatus === "error") return <ProjectViewError message={view.errorMessage} />;

  const configured = uniqueFields(
    view.config.columnOrder ??
      view.config.project?.visibleFields ??
      ["name", "status", "health", "progress", "ownerUserId", "updatedAt"],
  );
  const fields = configured.length > 0 ? configured : ["name", "status", "health"];
  const visible = fields.filter((field) => view.config.columnVisibility?.[field] !== false);
  const canCustomize = Boolean(view.tab?.capabilities.canRename);

  return (
    <div className="flex min-h-0 min-w-full flex-1 flex-col bg-background">
      <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-border/60 px-4 py-1.5">
        <label className="flex h-8 min-w-48 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 focus-within:ring-2 focus-within:ring-ring sm:max-w-72">
          <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <input
            value={view.search}
            onChange={(event) => updateParams({ search: event.target.value || undefined })}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </label>
        <select
          value={view.filterStatus ?? ""}
          onChange={(event) => updateParams({ status: event.target.value || undefined })}
          aria-label={t("allStatuses")}
          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("allStatuses")}</option>
          {(Object.keys(STATUS_LABEL_KEYS) as ProjectStatus[]).map((status) => (
            <option key={status} value={status}>{tForm(STATUS_LABEL_KEYS[status])}</option>
          ))}
        </select>
        <Popover>
          <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted/50">
            <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("columns")}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <PopoverHeader>
              <PopoverTitle>{t("customizeColumns")}</PopoverTitle>
              {!canCustomize ? <PopoverDescription>{t("systemViewColumns")}</PopoverDescription> : null}
            </PopoverHeader>
            <div className="grid gap-0.5">
              {AVAILABLE_FIELDS.map((field) => {
                const isVisible = view.config.columnVisibility?.[field] !== false && visible.includes(field);
                return (
                  <button
                    key={field}
                    type="button"
                    disabled={!canCustomize || (field === "name" && isVisible)}
                    onClick={() => void toggleColumn(field)}
                    className="flex h-8 items-center justify-between rounded-md px-2 text-xs text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t(`columnsLabel.${field}`)}
                    {isVisible ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
        <span className="ms-auto text-[11px] tabular-nums text-muted-foreground">{t("projectCount", { count: view.projects.length })}</span>
      </div>

      {view.projects.length === 0 ? (
        <ProjectViewEmpty />
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-4 pt-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[860px] border-collapse text-start text-xs">
              <thead className="sticky top-0 z-10 bg-muted/80 text-muted-foreground backdrop-blur">
                <tr>
                  {visible.map((field) => {
                    const activeSort = view.sortBy === field;
                    return (
                      <th
                        key={field}
                        aria-sort={activeSort ? (view.sortDirection === "asc" ? "ascending" : "descending") : "none"}
                        className="border-b border-border px-3 py-2 text-start font-semibold"
                        style={{ width: view.config.columnWidths?.[field] }}
                      >
                        <button
                          type="button"
                          onClick={() => updateParams({ sort: field, direction: activeSort && view.sortDirection === "asc" ? "desc" : "asc" })}
                          className="inline-flex items-center gap-1.5 hover:text-foreground"
                        >
                          {t(`columnsLabel.${field}`)}
                          {activeSort ? (view.sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : null}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {view.projects.map((project) => (
                  <tr
                    key={project.id}
                    tabIndex={0}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    onKeyDown={(event) => { if (event.key === "Enter") router.push(`/projects/${project.id}`); }}
                    className={cn(
                      "group cursor-pointer border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:outline-none",
                      view.config.density === "compact" ? "h-10" : "h-12",
                    )}
                  >
                    {visible.map((field) => (
                      <td key={field} className="px-3 py-1.5">
                        {field === "name" ? (
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                              <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block max-w-72 truncate font-semibold text-foreground">{project.name}</span>
                              {project.reference ? <span className="block text-[10px] text-muted-foreground">{project.reference}</span> : null}
                            </span>
                          </div>
                        ) : field === "status" ? (
                          <StatusPill tone={STATUS_TONES[project.status]} label={tForm(STATUS_LABEL_KEYS[project.status])} size="sm" />
                        ) : field === "health" ? (
                          <StatusPill tone={HEALTH_TONES[project.health]} label={tForm(HEALTH_LABEL_KEYS[project.health])} size="sm" variant="outline" />
                        ) : field === "progress" ? (
                          <div className="flex min-w-28 items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, project.progress ?? 0))}%` }} />
                            </div>
                            <span className="w-8 text-end tabular-nums text-muted-foreground">{project.progress ?? 0}%</span>
                          </div>
                        ) : field === "ownerUserId" ? (
                          <OwnerCell project={project} members={members} currentUser={session.user} fallback={t("teamMember")} you={t("you")} />
                        ) : field === "startDate" || field === "endDate" ? (
                          <span className="whitespace-nowrap text-muted-foreground">{project[field] ? dateLabel(project[field]) : t("unscheduled")}</span>
                        ) : field === "budget" ? (
                          <span className="whitespace-nowrap font-medium tabular-nums text-foreground">{currencyLabel(project)}</span>
                        ) : field === "currency" ? (
                          <span className="font-mono text-[11px] text-muted-foreground">{project.currency ?? "—"}</span>
                        ) : field === "tags" ? (
                          project.tags?.length ? <div className="flex max-w-56 gap-1 overflow-hidden">{project.tags.slice(0, 2).map((tag) => <span key={tag} className="truncate rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>)}</div> : <span className="text-muted-foreground">{t("noTags")}</span>
                        ) : field === "updatedAt" ? (
                          <span className="whitespace-nowrap text-muted-foreground">{dateLabel(project.updatedAt)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {view.status === "CanLoadMore" || view.status === "LoadingMore" ? (
            <div className="flex justify-center py-4">
              <Button type="button" variant="outline" size="sm" disabled={view.status === "LoadingMore"} onClick={view.loadMore}>
                {view.status === "LoadingMore" ? t("loadingMore") : t("loadMore")}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

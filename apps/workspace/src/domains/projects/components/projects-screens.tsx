"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { BarChart3, Building2, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Copy, Edit, FileText, FolderOpen, History, Landmark, Layers3, LayoutGrid, List, Loader2, MapPin, MoreHorizontal, Plus, Trash2, TrendingUp, UserRound, type LucideIcon } from "lucide-react";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppSection,
  AppStatsGrid,
  AppTabsList,
  AppThumbnailCell,
  AppToolbar,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import { getOrganizationCapabilities } from "@/domains/organization/api/clerk-organization-api";
import type { Project, ProjectStatus } from "../store/projects.types";
import { projectOfferingTypes, projectSchema, type ProjectFormValues } from "../validation/project.schema";
import {
  addProjectPriceRow,
  calendarDaysForMonth,
  compactProjectDetailRows,
  formatIsoDate,
  matchesProjectSearch,
  monthFormatter,
  nextProjectCalendarMonth,
  parseIsoDate,
  projectDateDisplayLabel,
  projectDocumentAssets,
  projectFilters,
  projectFormDefaults,
  projectInventoryMetrics,
  projectLocationLabel,
  projectMovementWidth,
  projectViews,
  projectWeekdayLabels,
  removeProjectPriceRow,
  statusTone,
  toggleProjectAssetType,
  updateProjectPriceRow,
  weekdayFormatter,
} from "../project-view-model";
import { createProjectRequest, deleteProjectRequest, PROJECTS_PAGE_SIZE, updateProjectRequest, useProjectQuery, useProjectsIndexQuery } from "../api/projects";
import { useProjectAssetsQuery } from "@/domains/assets/api/assets";
import { ResourceMediaUploader } from "@/domains/media/components/resource-media-uploader";
import { ResourceMediaBrowser } from "@/domains/media/components/resource-media-browser";
import { uploadAndAttachMedia, useResourceMediaQuery } from "@/domains/media/api/media";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import type { TaskRecord } from "@/domains/tasks/tasks.types";
import { useOperationState } from "@/lib/utils/operation-state";
import { SearchBox, StatusPill, TextInput, DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormErrorSummary, HttpQueryState, ProgressiveLoadingState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const workspaceProjectTypes = ["Residential", "Commercial", "Mixed Use", "Workspace item", "Record", "Asset", "Apartment", "Studio", "Villa", "Townhouse", "Penthouse", "Priority item", "Compound", "Office", "Retail", "workspace"] as const;

function projectTypeLabel(t: ReturnType<typeof useTranslations<"Projects">>, type: string | null | undefined) {
  if (!type || type === "undefined") return t("types.workspace");
  return workspaceProjectTypes.includes(type as (typeof workspaceProjectTypes)[number]) ? t(`types.${type}`) : type;
}

function ProjectTile({
  project,
  onDelete,
  openTaskCount,
}: {
  project: Project;
  onDelete: (project: Project) => void;
  openTaskCount: number;
}) {
  const t = useTranslations('Projects');
  const [menuOpen, setMenuOpen] = useState(false);
  const typeLabel = projectTypeLabel(t, project.type);
  const ownerLabel = project.developer || t("card.unassigned");
  const nextAction = project.description || t("card.noNextAction");
  const dueLabel = project.regaExpiresAt ? projectDateDisplayLabel(project.regaExpiresAt, t("card.noDue")) : t("card.noDue");
  const progress = project.status === "approved" ? 100 : project.status === "pending" ? 62 : project.status === "rejected" ? 20 : 34;

  return (
    <article className="group relative w-full max-w-[420px] overflow-hidden rounded-[18px] border border-zinc-200 bg-white p-4 text-start transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-[#0A0A0A] dark:hover:border-white/20 sm:w-[min(100%,420px)]">
      <Link
        href={`/projects/${project.id}`}
        className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} />
              <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] font-black text-zinc-500 dark:border-white/10 dark:text-zinc-400">{typeLabel}</span>
            </div>
            <h3 className="mt-4 line-clamp-2 text-base font-black leading-tight text-zinc-950 dark:text-white">{project.name}</h3>
            <p className="mt-2 truncate text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">{project.reference}</p>
          </div>
          <div className="relative z-20 shrink-0" dir="ltr">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label={t("card.actions")}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setMenuOpen((value) => !value);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute end-0 mt-2 w-36 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 text-zinc-900 shadow-lg dark:border-white/10 dark:bg-zinc-950 dark:text-white" dir="rtl">
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-zinc-100 dark:hover:bg-white/10"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpen(false);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                  {t("card.edit")}
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-start text-xs font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setMenuOpen(false);
                    onDelete(project);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("card.delete")}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-zinc-500 dark:text-zinc-400">{nextAction}</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <ProjectCardFact icon={UserRound} label={t("card.owner")} value={ownerLabel} />
          <ProjectCardFact icon={Layers3} label={t("card.resources")} value={project.assetCount} />
          <ProjectCardFact icon={List} label={t("card.openTasks")} value={openTaskCount} />
          <ProjectCardFact icon={CalendarDays} label={t("card.due")} value={dueLabel} />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("card.progress")}</span>
            <span className="text-[10px] font-black tabular-nums text-zinc-600 dark:text-zinc-300">{progress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-zinc-900 dark:bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Link>
    </article>
  );
}

function ProjectCardFact({ icon: Icon, label, value }: { icon: LucideIcon; label: ReactNode; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-white/[0.035]">
      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-400">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <p className="mt-1.5 truncate text-xs font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function ProjectPortfolioStrip({
  stats,
}: {
  stats?: { total?: number; approved?: number; pending?: number; draft?: number };
}) {
  const t = useTranslations("Projects");
  const items = [
    { label: t("stats.size"), value: stats?.total ?? "...", icon: FolderOpen },
    { label: t("stats.approved"), value: stats?.approved ?? "...", dotClassName: "bg-emerald-500" },
    { label: t("stats.review"), value: stats?.pending ?? "...", dotClassName: "bg-amber-500" },
    { label: t("stats.drafts"), value: stats?.draft ?? "...", icon: Copy },
  ];

  return (
    <section className="grid overflow-hidden rounded-[22px] border border-zinc-100 bg-zinc-100 gap-px dark:border-white/5 dark:bg-white/5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="flex min-h-20 items-center justify-between gap-4 bg-white px-5 py-4 dark:bg-[#0A0A0A]">
            <div className="min-w-0">
              <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black uppercase tracking-tight text-zinc-950 dark:text-white">{item.value}</p>
            </div>
            {Icon ? (
              <Icon className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
            ) : (
              <span className={cn("h-2 w-2 shrink-0 rounded-full", item.dotClassName)} />
            )}
          </div>
        );
      })}
    </section>
  );
}

export function ProjectsWorkspace() {
  const t = useTranslations('Projects');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const [filter, setFilter] = useState<(typeof projectFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<(typeof projectViews)[number]>("grid");
  const [deleting, setDeleting] = useState<Project | null>(null);
  const deleteOperation = useOperationState({ errorMessage: "Project delete failed." });

  useUrlListState({
    filter,
    search,
    view,
    setFilter,
    setSearch,
    setView: (next) => setView(next as (typeof projectViews)[number]),
    defaultFilter: "all",
    defaultView: "grid",
    validFilters: projectFilters,
    validViews: projectViews,
  });

  const projectsQuery = useProjectsIndexQuery(workspaceOrganizationId, {
    status: filter === "all" ? undefined : filter,
    search,
  });
  const stats = projectsQuery.stats;
  const projects = useMemo(() => projectsQuery.results as Project[], [projectsQuery.results]);
  const isLoading = isWorkspaceReady && projectsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || projectsQuery.queryStatus === "error";
  const rawProjectTasks = useTasksQuery(workspaceOrganizationId, { status: "all", search: "" });
  const projectTasks = useMemo(() => rawProjectTasks ?? [], [rawProjectTasks]);
  const openTaskCountByProjectId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of projectTasks) {
      if (!task.projectId || task.status === "done" || task.status === "canceled") {
        continue;
      }
      counts[task.projectId] = (counts[task.projectId] ?? 0) + 1;
    }
    return counts;
  }, [projectTasks]);

  const filteredProjects = useMemo(() => projects.filter((project) => matchesProjectSearch(project, search)), [projects, search]);

  const columns: AppDataTableColumn<Project>[] = [
    {
      key: "name",
      header: t('form.nameLabel'),
      render: (project) => (
        <AppThumbnailCell src={project.coverImageUrl} alt={project.name} title={project.name} meta={<span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{project.city}</span>} />
      ),
    },
    { key: "reference", header: t('detail.labels.ref') },
    { key: "status", header: t('form.statusLabel'), render: (project) => <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} /> },
    {
      key: "type",
      header: t('detail.labels.type'),
      render: (project) => projectTypeLabel(t, project.type),
    },
    { key: "assetCount", header: t('detail.labels.assetCount') },
    { key: "priceRange", header: t('detail.labels.value') },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (project) => (
        <div className="flex justify-end gap-1">
          <Link href={`/projects/${project.id}/edit`} aria-label={`Edit ${project.name}`} className="p-2 text-zinc-300 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:text-white"><Edit className="h-3.5 w-3.5" aria-hidden="true" /></Link>
          <button type="button" aria-label={`Delete ${project.name}`} onClick={(event) => { event.stopPropagation(); setDeleting(project); }} className="p-2 text-zinc-300 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button>
        </div>
      ),
    },
  ];

  return (
    <AppPageShell maxWidth="full" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t('eyebrow')}
        subtitle={t('subtitle')}
        title={t('title')}
        actions={<Link href="/projects/create"><AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{t('add')}</AppPrimaryButton></Link>}
      />
      <ProjectPortfolioStrip stats={stats} />
      <AppToolbar
        filters={[
          { value: "all", label: t('toolbar.filters.all') },
          { value: "approved", label: t('toolbar.filters.approved') },
          { value: "pending", label: t('toolbar.filters.pending') },
          { value: "draft", label: t('toolbar.filters.draft') },
          { value: "rejected", label: t('toolbar.filters.rejected') },
        ]}
        activeFilter={filter}
        onFilterChange={(next) => setFilter(next as "all" | ProjectStatus)}
        view={view}
        onViewChange={(next) => setView(next as (typeof projectViews)[number])}
        sortLabel={t('toolbar.newest')}
        trailing={<SearchBox value={search} onChange={setSearch} placeholder={t('toolbar.search')} name="project-search" ariaLabel="Search projects" />}
      />

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant={view === "grid" ? "grid" : "table"} />
      ) : isQueryBlocked ? (
        <HttpQueryState query={projectsQuery} variant={view === "grid" ? "grid" : "table"} />
      ) : view === "grid" ? (
        <div className="flex flex-wrap gap-4">
          {filteredProjects.map((project) => (
            <ProjectTile
              key={project.id}
              project={project}
              onDelete={setDeleting}
              openTaskCount={openTaskCountByProjectId[project.id] ?? 0}
            />
          ))}
        </div>
      ) : (
        <AppDataTable columns={columns} data={filteredProjects} getRowKey={(project) => project.id} />
      )}

      {isWorkspaceReady && !isQueryBlocked && filteredProjects.length === 0 && <EmptyWorkspace icon={FolderOpen} title={t('empty.title')} description={t('empty.desc')} />}
      {isWorkspaceReady && !isQueryBlocked && filteredProjects.length > 0 && (
        <InfiniteScrollSentinel
          status={projectsQuery.status}
          loadMore={projectsQuery.loadMore}
          pageSize={PROJECTS_PAGE_SIZE}
        />
      )}
      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            deleteOperation.clearError();
            setDeleting(null);
          }
        }}
        title={t('delete.title')}
        description={t('delete.desc', { name: deleting?.name ?? "..." })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!deleting || !projects.some((project) => project.id === deleting.id)) {
            throw new Error("This project is no longer available.");
          }
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deleteProjectRequest(account.organization.id, deleting.id);
        }, {
          successMessage: "Project deleted.",
          onSuccess: () => setDeleting(null),
        })}
      />
    </AppPageShell>
  );
}

export function ProjectDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Projects');
  const td = useTranslations('ProjectDetails');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const project = useProjectQuery(workspaceOrganizationId, id) as Project | null | undefined;
  const assetsQuery = useProjectAssetsQuery(workspaceOrganizationId, project ? id : undefined);
  const assets = useMemo(() => assetsQuery ?? [], [assetsQuery]);
  const mediaQuery = useResourceMediaQuery(workspaceOrganizationId, "project", project?.id);
  const projectMedia = useMemo(() => mediaQuery ?? [], [mediaQuery]);
  const documentAssets = useMemo(() => projectDocumentAssets(projectMedia), [projectMedia]);
  const projectTaskRows = useTasksQuery(workspaceOrganizationId, { status: "all", search: "" });
  const projectTasks = useMemo(() => (projectTaskRows ?? []).filter((task) => task.projectId === id), [id, projectTaskRows]);
  const [inventoryView, setInventoryView] = useState<"cards" | "table">("cards");
  const assetColumns = useMemo((): AppDataTableColumn<(typeof assets)[0]>[] => [
    { key: "reference", header: td('inventory.cols.ref') },
    { key: "type", header: td('inventory.cols.type') },
    { key: "status", header: td('inventory.cols.status'), render: (u) => <StatusPill label={u.status} tone={u.status === "available" ? "success" : "warning"} /> },
    { key: "price", header: td('inventory.cols.price') },
    { key: "area", header: td('inventory.cols.area') },
    { key: "updated", header: td('inventory.cols.updated') },
  ], [td]);
  const inventoryMetrics = useMemo(() => projectInventoryMetrics(assets, project?.assetCount ?? 0), [project?.assetCount, assets]);
  const {
    plannedAssets,
    inventoryCoverage,
    availableAssets,
    reservedAssets,
    soldAssets,
    pendingAssets,
    liveAssetCount,
  } = inventoryMetrics;
  const salesStats = useMemo(() => [
    { label: td('sales.metrics.totalAssets'), value: liveAssetCount, icon: Layers3 },
    { label: td('sales.metrics.availableAssets'), value: availableAssets, icon: Landmark, iconClassName: "text-emerald-500" },
    { label: td('sales.metrics.reservedAssets'), value: reservedAssets, icon: TrendingUp, iconClassName: "text-blue-500" },
    { label: td('sales.metrics.soldAssets'), value: soldAssets, icon: BarChart3 },
  ], [availableAssets, liveAssetCount, reservedAssets, soldAssets, td]);
  
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const deleteOperation = useOperationState({ errorMessage: "Project delete failed." });
  const queryDebug = {
    resourceType: "project",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };

  if (workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} variant="detail" /></AppPageShell>;
  }

  if (project === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} variant="detail" /></AppPageShell>;
  }

  if (project === null) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/projects" backLabel={t('detail.back')} /></AppPageShell>;
  }

  const locationLabel = projectLocationLabel(project);
  const projectType = projectTypeLabel(t, project.type);
  const projectProgress = project.status === "approved" ? 100 : project.status === "pending" ? 62 : project.status === "rejected" ? 20 : 34;
  const openProjectTasks = projectTasks.filter((task) => task.status !== "done" && task.status !== "canceled").length;
  const optionalCoreDetailRows: Array<[ReactNode, ReactNode | null | undefined | ""]> = [
    [t('detail.labels.type'), projectType],
    [t('detail.labels.developer'), project.developer],
    [t('detail.labels.city'), project.city],
    [t('detail.labels.area'), project.area],
    [td('rega.authNo'), project.regaAuthorizationNo],
    [td('registry.planNo'), project.planNumber],
    [td('registry.plotNo'), project.plotNumber],
    ...(documentAssets.length > 0 ? [[td('documents.count'), String(documentAssets.length)] as [ReactNode, ReactNode]] : []),
  ];
  const coreDetailRows = compactProjectDetailRows(optionalCoreDetailRows);

  return (
    <AppPageShell contentClassName="space-y-6 pb-14">
      <Tabs defaultValue="overview" className="space-y-6">
        <section className="space-y-5 text-start">
          <div className="grid gap-4 border-b border-zinc-100 pb-5 dark:border-white/5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="min-w-0 max-w-5xl">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} />
                {locationLabel && <ProjectMetaPill icon={MapPin}>{locationLabel}</ProjectMetaPill>}
                {project.developer && <ProjectMetaPill icon={Building2}>{project.developer}</ProjectMetaPill>}
                <ProjectMetaPill icon={Layers3}>{projectType}</ProjectMetaPill>
              </div>
              <h1 className="mt-4 max-w-4xl text-2xl font-black leading-tight text-zinc-950 dark:text-white md:text-4xl">{project.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                <span>{project.reference}</span>
                <span>{project.assetCount} {t('card.assetCount')}</span>
                {project.regaAuthorizationNo && <span>{project.regaAuthorizationNo}</span>}
              </div>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-zinc-600 dark:text-zinc-300">{project.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Link href={`/projects/${project.id}/edit`}>
                <AppPrimaryButton>
                  <Edit className="me-2 h-3.5 w-3.5" />
                  {t('detail.edit')}
                </AppPrimaryButton>
              </Link>
              <Button variant="outline" aria-label={t('detail.delete')} onClick={() => setDeleting(true)} className="h-10 rounded-xl border-red-200 px-3 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-500/20 dark:hover:bg-red-950/25">
                <Trash2 className="me-2 h-3.5 w-3.5" />
                {t('detail.delete')}
              </Button>
            </div>
          </div>

          <AppTabsList
            className="gap-8"
            tabs={[
              { value: "overview", label: td('tabs.overview'), icon: LayoutGrid },
              { value: "inventory", label: td('tabs.inventory'), icon: Layers3 },
              { value: "documents", label: td('tabs.documents'), icon: FileText },
              { value: "sales", label: td('tabs.sales'), icon: TrendingUp },
              { value: "activity", label: td('tabs.activity'), icon: History },
            ]}
          />
        </section>

        <TabsContent value="overview" className="space-y-6">
          <AppStatsGrid stats={[
            { label: td("work.status"), value: t(`toolbar.filters.${project.status}`), icon: CheckCircle2 },
            { label: td("work.progress"), value: `${projectProgress}%`, icon: TrendingUp },
            { label: td("work.openTasks"), value: openProjectTasks, icon: List },
            { label: td("work.resources"), value: project.assetCount, icon: Layers3 },
          ]} />
          <section className="grid gap-6 text-start xl:grid-cols-[minmax(0,1fr)_380px]">
            <AppSection
              tone="muted"
              title={td('overview.mediaTitle')}
              description={td('overview.mediaDesc')}
              contentClassName="min-w-0"
            >
              <ResourceMediaBrowser
                organizationId={workspaceOrganizationId}
                resourceType="project"
                resourceId={project.id}
                mode="gallery"
                title={td('gallery.title')}
                description={td('gallery.description')}
                addLabel={td('gallery.add')}
                emptyTitle={td('gallery.emptyTitle')}
                emptyDescription={td('gallery.emptyDesc')}
                uploadTitle={td('gallery.uploadTitle')}
                uploadDescription={td('gallery.uploadDesc')}
                uploadPick={td('gallery.uploadPick')}
                unsupported={t('form.galleryUnsupported')}
                openLabel={td('actions.view')}
                coverLabel={td('gallery.cover')}
                deleteLabel={td('actions.delete')}
                statusQueued={td('uploadStatus.queued')}
                statusUploading={td('uploadStatus.uploading')}
                statusUploaded={td('uploadStatus.uploaded')}
                statusFailed={td('uploadStatus.failed')}
                removeLabel={td('actions.delete')}
                retryLabel={td('uploadStatus.retry')}
                imageLimit={t('form.galleryImageLimit')}
                previewLimit={5}
              />
            </AppSection>

            <div className="grid content-start gap-5">
              <AppSection title={td('overview.registryTitle')}>
                <RegistryRows rows={coreDetailRows} />
              </AppSection>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <AppSection
            title={td('inventory.title')}
            description={td('inventory.subtitle')}
            actions={(
              <div className="flex items-center gap-2">
                <Button type="button" variant={inventoryView === "cards" ? "default" : "outline"} size="icon" onClick={() => setInventoryView("cards")} className="h-9 w-9 rounded-xl" aria-label={td('inventory.cards')}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant={inventoryView === "table" ? "default" : "outline"} size="icon" onClick={() => setInventoryView("table")} className="h-9 w-9 rounded-xl" aria-label={td('inventory.table')}>
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Link href="/assets/create">
                  <AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{td('inventory.addUnit')}</AppPrimaryButton>
                </Link>
              </div>
            )}
          >
            <div className="mb-5 max-w-sm">
              <ReadinessBar label={td('metrics.inventoryCoverage')} value={inventoryCoverage} />
            </div>
            {assets.length === 0 ? (
              <EmptyWorkspace icon={Layers3} title={td('inventory.emptyTitle')} description={td('inventory.emptyDesc')} />
            ) : inventoryView === "table" ? (
              <AppDataTable columns={assetColumns} data={assets} getRowKey={(asset) => asset.id} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {assets.map((asset) => <ProjectAssetCard key={asset.id} asset={asset} />)}
              </div>
            )}
          </AppSection>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <AppSection tone="muted" contentClassName="min-w-0">
            <ResourceMediaBrowser
              organizationId={workspaceOrganizationId}
              resourceType="project"
              resourceId={project.id}
              mode="documents"
              title={td('documents.title')}
              description={td('documents.subtitle')}
              addLabel={td('documents.upload')}
              emptyTitle={td('documents.emptyTitle')}
              emptyDescription={td('documents.emptyDesc')}
              uploadTitle={td('documents.uploadModalTitle')}
              uploadDescription={td('documents.uploadModalDesc')}
              uploadPick={t('form.documentsPick')}
              unsupported={t('form.documentsUnsupported')}
              openLabel={td('actions.view')}
              coverLabel={td('gallery.cover')}
              deleteLabel={td('actions.delete')}
              statusQueued={td('uploadStatus.queued')}
              statusUploading={td('uploadStatus.uploading')}
              statusUploaded={td('uploadStatus.uploaded')}
              statusFailed={td('uploadStatus.failed')}
              removeLabel={td('actions.delete')}
              retryLabel={td('uploadStatus.retry')}
            />
          </AppSection>
        </TabsContent>

        <TabsContent value="sales" className="space-y-5">
          <AppSection
            title={td('sales.title')}
            description={td('sales.pipelineTitle')}
            actions={(
              <Link href="/assets/create" className="inline-flex h-9 items-center rounded-lg bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-zinc-950">
                <Plus className="me-2 h-3.5 w-3.5" />
                {td('inventory.addUnit')}
              </Link>
            )}
          >
            <AppStatsGrid className="rounded-[20px]" stats={salesStats.map((stat) => ({
              label: String(stat.label),
              value: stat.value,
              icon: stat.icon,
              iconClassName: stat.iconClassName,
            }))} />
          </AppSection>

          {assets.length === 0 ? (
            <EmptyWorkspace icon={BarChart3} title={td('sales.emptyTitle')} description={td('sales.emptyDesc')} />
          ) : (
            <AppSection contentClassName="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-black text-zinc-950 dark:text-white">{td('sales.pipelineTitle')}</h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{liveAssetCount} / {plannedAssets}</span>
                </div>
                <div className="space-y-2">
                  <MiniMovement label={td('sales.status.available')} value={availableAssets} total={liveAssetCount} className="bg-emerald-500" />
                  <MiniMovement label={td('sales.status.reserved')} value={reservedAssets} total={liveAssetCount} className="bg-blue-500" />
                  <MiniMovement label={td('sales.status.sold')} value={soldAssets} total={liveAssetCount} className="bg-zinc-400" />
                  <MiniMovement label={td('sales.status.pending')} value={pendingAssets} total={liveAssetCount} className="bg-amber-500" />
                </div>
              </div>
              <aside className="border-t border-zinc-100 pt-5 dark:border-white/5 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{td('sales.nextTitle')}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">{td('sales.nextDesc')}</p>
                <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden bg-zinc-200/70 dark:bg-white/10">
                  <CompactFact label={td('sales.status.reserved')} value={reservedAssets} />
                  <CompactFact label={td('sales.status.pending')} value={pendingAssets} />
                </div>
              </aside>
            </AppSection>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <AppSection tone="muted">
            {projectTasks.length === 0 ? (
              <EmptyWorkspace icon={History} title={td('activity.emptyTitle')} description={td('activity.emptyDesc')} />
            ) : (
              <div className="grid gap-3">
                {projectTasks.map((task) => <ProjectTaskRow key={task.id} task={task} />)}
              </div>
            )}
          </AppSection>
        </TabsContent>
      </Tabs>

      <DeleteRecordDialog
        open={deleting}
        onOpenChange={(open) => {
          if (!open) deleteOperation.clearError();
          setDeleting(open);
        }}
        title={t('delete.title')}
        description={t('delete.desc', { name: project.name })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!workspaceOrganizationId) throw new Error("Select an organization first.");
          return deleteProjectRequest(workspaceOrganizationId, project.id);
        }, {
          successMessage: "Project deleted.",
          onSuccess: () => {
            setDeleting(false);
            router.push("/projects");
          },
        })}
      />
    </AppPageShell>
  );
}

function ProjectTaskRow({ task }: { task: TaskRecord }) {
  return (
    <Link href={`/tasks/${task.id}`} className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-start transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-[#0A0A0A] dark:hover:border-white/20">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-zinc-950 dark:text-white">{task.title}</p>
        <p className="mt-1 truncate text-xs font-semibold text-zinc-500 dark:text-zinc-400">{task.description || task.assigneeUserId || task.createdByUserId}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusPill label={task.status} tone={task.status === "done" ? "success" : task.status === "waiting" ? "warning" : "info"} />
        <span className="text-[10px] font-black text-zinc-400">{task.dueDate || "No date"}</span>
      </div>
    </Link>
  );
}

function ProjectMetaPill({ icon: Icon, children }: { icon: typeof Building2; children: ReactNode }) {
  return (
    <span className="inline-flex h-8 min-w-0 max-w-full items-center gap-2 rounded-full bg-zinc-100 px-3 text-xs font-bold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function ProjectAssetCard({ asset }: { asset: { id: string; title: string; reference: string; type: string; status: string; price: string; area: string; bedrooms?: number | string; bathrooms?: number | string; city?: string; image?: string; coverImageUrl?: string } }) {
  const rooms = [asset.bedrooms, asset.bathrooms].filter((value) => typeof value === "number").join(" / ");

  return (
    <Link
      href={`/assets/${asset.id}`}
      className="block rounded-[18px] border border-zinc-200 bg-white p-4 text-start shadow-none transition-colors hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-white/5 dark:bg-[#0A0A0A] dark:hover:border-white/15 dark:hover:bg-white/[0.025]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">{asset.reference}</p>
          <h3 className="mt-2 line-clamp-2 text-sm font-black leading-snug text-zinc-950 dark:text-white">{asset.title}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{asset.city || asset.reference}</span>
          </p>
        </div>
        <div className="shrink-0">
          <StatusPill label={asset.status} tone={asset.status === "available" ? "success" : asset.status === "sold" ? "neutral" : "warning"} />
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-white/5">
        <p className="truncate text-sm font-black text-zinc-950 dark:text-white">{asset.price}</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <AssetMiniFact label="Type" value={asset.type} />
          <AssetMiniFact label="Area" value={asset.area} />
          <AssetMiniFact label="Rooms" value={rooms || "—"} />
        </div>
      </div>
    </Link>
  );
}

function AssetMiniFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">{value}</p>
    </div>
  );
}

function ReadinessBar({ label, value }: { label: ReactNode; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="text-[10px] font-black tabular-nums text-zinc-900 dark:text-white">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden bg-zinc-100 dark:bg-white/10">
        <div className="h-full bg-zinc-900 dark:bg-white" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MiniMovement({ label, value, total, className }: { label: ReactNode; value: number; total: number; className: string }) {
  const width = projectMovementWidth(value, total);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="text-xs font-black tabular-nums text-zinc-950 dark:text-white">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
        <div className={cn("h-full rounded-full", className)} style={{ width }} />
      </div>
    </div>
  );
}

function CompactFact({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="min-w-0 bg-white p-4 dark:bg-[#080808]">
      <p className="truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-3 truncate text-sm font-black text-zinc-950 dark:text-white">{value}</p>
    </div>
  );
}

function RegistryRows({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <table className={cn("w-full text-[11px]", className)}>
      <tbody className="divide-y divide-zinc-200/70 font-semibold text-zinc-600 dark:divide-white/10 dark:text-zinc-300">
        {rows.map(([label, value], index) => (
          <tr key={index}>
            <td className="py-2.5 pe-4 text-zinc-400">{label}</td>
            <td className="py-2.5 text-end font-black text-zinc-900 dark:text-white">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ProjectFormScreen({ id }: { id?: string }) {
  const t = useTranslations('Projects');
  const common = useTranslations('Common');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const existing = useProjectQuery(workspaceOrganizationId, id ?? "") as Project | null | undefined;
  const router = useRouter();
  const [pendingMediaFiles, setPendingMediaFiles] = useState<File[]>([]);
  const [pendingDocumentFiles, setPendingDocumentFiles] = useState<File[]>([]);
  const queryDebug = {
    resourceType: "project",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };
  
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const capabilitiesQuery = useReactQuery({
    queryKey: ["organization-capabilities", workspaceOrganizationId],
    queryFn: () => getOrganizationCapabilities(workspaceOrganizationId!),
    enabled: Boolean(workspaceOrganizationId),
  });
  const canManageVisibility = capabilitiesQuery.data?.canManageVisibility ?? false;

  const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectFormValues>,
    defaultValues: projectFormDefaults(existing),
  });

  const form = useWatch({ control }) as ProjectFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ProjectFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Project save failed." });

  useEffect(() => {
    if (!existing) return;
    reset(projectFormDefaults(existing));
  }, [existing, reset]);

  const setField = (key: keyof ProjectFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };

  const toggleAssetType = (value: ProjectFormValues["assetTypes"][number]) => {
    const next = toggleProjectAssetType(form.assetTypes, value);
    setValue("assetTypes", next, { shouldDirty: true, shouldValidate: Boolean(fieldErrors.assetTypes) });
    saveOperation.clearError();
  };

  const updateProjectPrice = (rowId: string, key: "label" | "price", value: string) => {
    const next = updateProjectPriceRow(form.projectPrices, rowId, key, value);
    setValue("projectPrices", next, { shouldDirty: true, shouldValidate: Boolean(fieldErrors.projectPrices) });
    saveOperation.clearError();
  };

  const addProjectPrice = () => {
    setValue("projectPrices", addProjectPriceRow(form.projectPrices), { shouldDirty: true });
    saveOperation.clearError();
  };

  const removeProjectPrice = (rowId: string) => {
    setValue("projectPrices", removeProjectPriceRow(form.projectPrices, rowId), { shouldDirty: true, shouldValidate: Boolean(fieldErrors.projectPrices) });
    saveOperation.clearError();
  };

  const stepForProjectError = (key: keyof ProjectFormValues) => {
    if (["name", "developer", "city", "area", "assetCount", "averagePrice", "projectPrices", "priceRange"].includes(key)) return 1;
    if (["regaAuthorizationNo", "regaExpiresAt", "planNumber", "plotNumber", "postalIdentity"].includes(key)) return 3;
    return 5;
  };

  const onInvalidSubmit = (invalidErrors: FieldErrors<ProjectFormValues>) => {
    const firstError = Object.keys(invalidErrors)[0] as keyof ProjectFormValues | undefined;
    if (firstError) setStep(stepForProjectError(firstError));
  };

  const onSubmit = handleSubmit(async (data) => {
    await saveOperation.run(async () => {
      if (!workspaceOrganizationId) throw new Error("Select an organization first.");
      const result = existing
        ? await updateProjectRequest(workspaceOrganizationId, existing.id, data)
        : await createProjectRequest(workspaceOrganizationId, data);
      const nextId = result.project.id;
      if (pendingMediaFiles.length > 0) {
        await uploadAndAttachMedia({
          organizationId: workspaceOrganizationId,
          resourceType: "project",
          resourceId: nextId,
          files: pendingMediaFiles,
        });
      }
      if (pendingDocumentFiles.length > 0) {
        await uploadAndAttachMedia({
          organizationId: workspaceOrganizationId,
          resourceType: "project",
          resourceId: nextId,
          files: pendingDocumentFiles,
        });
      }
      return nextId;
    }, {
      successMessage: existing ? "Project saved." : "Project created.",
      onSuccess: (nextId) => router.push(`/projects/${nextId}`),
    });
  }, onInvalidSubmit);

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else onSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  if (id && workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} variant="detail" /></AppPageShell>;
  }

  if (id && existing === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} variant="detail" /></AppPageShell>;
  }

  if (id && existing === null) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/projects" backLabel={t('detail.back')} /></AppPageShell>;
  }

  return (
    <AppPageShell maxWidth="wide" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t("form.eyebrow")}
        title={existing ? t("form.editTitle") : t("form.createTitle")}
        subtitle={t("form.subtitle")}
        className="pb-7"
      />

      <form
        className="mx-auto w-full max-w-4xl"
        onSubmit={(event) => {
          event.preventDefault();
          nextStep();
        }}
      >
        <section className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-none dark:border-white/10 dark:bg-[#0B0B0B] md:p-7">
          <ProjectFormProgress step={step} labels={[t("form.stepInformation"), t("form.stepGallery"), t("form.stepLegal"), t("form.stepDocuments"), t("form.stepDetails")]} />
          <FormErrorSummary errors={fieldErrors} />

          <div className="mt-8 min-h-[410px]">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectWizardPanel title={t("form.informationTitle")} description={t("form.informationDesc")}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <TextInput name="name" label={t("form.nameLabel")} value={form.name} onChange={(value) => setField("name", value)} placeholder="Al Madinah Residences…" error={fieldErrors.name} />
                    <TextInput name="developer" label={t("form.devLabel")} value={form.developer} onChange={(value) => setField("developer", value)} placeholder="Acme Development…" error={fieldErrors.developer} />
                    <TextInput name="city" label={t("form.cityLabel")} value={form.city} onChange={(value) => setField("city", value)} placeholder="Riyadh…" error={fieldErrors.city} />
                    <TextInput name="area" label={t("form.areaLabel")} value={form.area} onChange={(value) => setField("area", value)} placeholder="Al Malqa…" error={fieldErrors.area} />
                    <TextInput name="assetCount" label={t("form.assetCountLabel")} type="number" inputMode="numeric" value={form.assetCount} onChange={(value) => setField("assetCount", value)} error={fieldErrors.assetCount} />
                    <ProjectPricingSection
                      averagePrice={form.averagePrice}
                      rows={form.projectPrices ?? []}
                      onAveragePriceChange={(value) => setField("averagePrice", value)}
                      onRowChange={updateProjectPrice}
                      onAddRow={addProjectPrice}
                      onRemoveRow={removeProjectPrice}
                      error={fieldErrors.averagePrice}
                      labels={{
                        section: t("form.pricingSectionTitle"),
                        sectionHelp: t("form.pricingSectionHelp"),
                        average: t("form.averagePriceLabel"),
                        averageHelp: t("form.averagePriceHelp"),
                        averagePlaceholder: t("form.averagePricePlaceholder"),
                        prices: t("form.projectPricesLabel"),
                        pricesHelp: t("form.projectPricesHelp"),
                        itemLabel: t("form.projectPriceLabelPlaceholder"),
                        itemPrice: t("form.projectPriceValuePlaceholder"),
                        add: t("form.addProjectPrice"),
                        remove: t("form.removeProjectPrice"),
                      }}
                    />
                  </div>
                </ProjectWizardPanel>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectWizardPanel title={t("form.galleryTitle")} description={t("form.galleryDesc")}>
                  <ResourceMediaUploader
                    organizationId={workspaceOrganizationId}
                    resourceType="project"
                    resourceId={existing?.id}
                    pendingFiles={pendingMediaFiles}
                    onPendingFilesChange={setPendingMediaFiles}
                    allowedKinds={["image", "video"]}
                    maxVideos={1}
                    variant="review"
                    labels={{
                      title: t("form.galleryUploaderTitle"),
                      description: t("form.galleryUploaderDesc"),
                      pick: t("form.galleryPick"),
                      queued: t("form.galleryQueued"),
                      videoLimit: t("form.galleryVideoLimit"),
                      imageLimit: t("form.galleryImageLimit"),
                      unsupported: t("form.galleryUnsupported"),
                      statusQueued: t("form.uploadStatusQueued"),
                      statusUploading: t("form.uploadStatusUploading"),
                      statusUploaded: t("form.uploadStatusUploaded"),
                      statusFailed: t("form.uploadStatusFailed"),
                      remove: t("form.uploadRemove"),
                      retry: t("form.uploadRetry"),
                    }}
                    className="border-zinc-100 bg-zinc-50/40 shadow-none dark:border-white/[0.06] dark:bg-white/[0.01]"
                  />
                </ProjectWizardPanel>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectWizardPanel title={t("form.legalTitle")} description={t("form.legalDesc")}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput name="regaAuthorizationNo" label={t("form.regaAuthorizationNoLabel")} value={form.regaAuthorizationNo ?? ""} onChange={(value) => setField("regaAuthorizationNo", value)} placeholder={t("form.regaAuthorizationNoPlaceholder")} error={fieldErrors.regaAuthorizationNo} />
                    <ProjectDatePicker
                      label={t("form.regaExpiresAtLabel")}
                      value={form.regaExpiresAt ?? ""}
                      onChange={(value) => setField("regaExpiresAt", value)}
                      error={fieldErrors.regaExpiresAt}
                      placeholder={t("form.regaExpiresAtPlaceholder")}
                      help={t("form.regaExpiresAtHelp")}
                    />
                    <TextInput name="planNumber" label={t("form.planNumberLabel")} value={form.planNumber ?? ""} onChange={(value) => setField("planNumber", value)} placeholder={t("form.planNumberPlaceholder")} error={fieldErrors.planNumber} />
                    <TextInput name="plotNumber" label={t("form.plotNumberLabel")} value={form.plotNumber ?? ""} onChange={(value) => setField("plotNumber", value)} placeholder={t("form.plotNumberPlaceholder")} error={fieldErrors.plotNumber} />
                    <TextInput name="postalIdentity" label={t("form.postalIdentityLabel")} value={form.postalIdentity ?? ""} onChange={(value) => setField("postalIdentity", value)} placeholder={t("form.postalIdentityPlaceholder")} error={fieldErrors.postalIdentity} />
                  </div>
                </ProjectWizardPanel>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectWizardPanel title={t("form.documentsTitle")} description={t("form.documentsDesc")}>
                  <ResourceMediaUploader
                    organizationId={workspaceOrganizationId}
                    resourceType="project"
                    resourceId={existing?.id}
                    pendingFiles={pendingDocumentFiles}
                    onPendingFilesChange={setPendingDocumentFiles}
                    allowedKinds={["document"]}
                    variant="review"
                    labels={{
                      title: t("form.documentsUploaderTitle"),
                      description: t("form.documentsUploaderDesc"),
                      pick: t("form.documentsPick"),
                      queued: t("form.documentsQueued"),
                      unsupported: t("form.documentsUnsupported"),
                      statusQueued: t("form.uploadStatusQueued"),
                      statusUploading: t("form.uploadStatusUploading"),
                      statusUploaded: t("form.uploadStatusUploaded"),
                      statusFailed: t("form.uploadStatusFailed"),
                      remove: t("form.uploadRemove"),
                      retry: t("form.uploadRetry"),
                    }}
                    className="border-zinc-100 bg-zinc-50/40 shadow-none dark:border-white/[0.06] dark:bg-white/[0.01]"
                  />
                </ProjectWizardPanel>
              </div>
            )}

            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectWizardPanel title={t("form.detailsTitle")} description={t("form.detailsDesc")}>
                  <div className="space-y-7">
                    <ProjectInlineChoice
                      id="type"
                      label={t("form.typeLabel")}
                      value={form.type}
                      onChange={(value) => setField("type", value)}
                      options={[{ value: "Residential", label: t("types.Residential") }, { value: "Commercial", label: t("types.Commercial") }, { value: "Mixed Use", label: t("types.Mixed Use") }]}
                      error={fieldErrors.type}
                    />
                    <OfferingMixGrid value={form.assetTypes ?? []} onToggle={toggleAssetType} label={t("form.offeringMixLabel")} />
                    <ProjectInlineChoice
                      id="status"
                      label={t("form.statusLabel")}
                      value={form.status}
                      onChange={(value) => setField("status", value)}
                      options={[{ value: "draft", label: t("toolbar.filters.draft") }, { value: "pending", label: t("toolbar.filters.pending") }, { value: "approved", label: t("toolbar.filters.approved") }, { value: "rejected", label: t("toolbar.filters.rejected") }]}
                      error={fieldErrors.status}
                    />
                    {canManageVisibility && (
                      <ProjectInlineChoice
                        id="visibility"
                        label={t("form.visibilityLabel")}
                        value={form.visibility ?? "private"}
                        onChange={(value) => setField("visibility", value)}
                        options={[
                          { value: "private", label: t("form.visibilityPrivate") },
                          { value: "public", label: t("form.visibilityPublic") },
                        ]}
                        error={fieldErrors.visibility}
                      />
                    )}
                    <div className="grid gap-2">
                      <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.descLabel")}</label>
                      <Textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={(event) => setField("description", event.target.value)}
                        aria-invalid={Boolean(fieldErrors.description)}
                        aria-describedby={fieldErrors.description ? "description-error" : undefined}
                        className="min-h-[150px] rounded-3xl border-zinc-100 bg-zinc-50/50 p-5 text-sm font-medium transition-all focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-white/5 dark:bg-white/[0.02]"
                      />
                      {fieldErrors.description && <p id="description-error" className="text-[10px] font-bold text-red-600 rtl:text-right">{fieldErrors.description}</p>}
                    </div>
                  </div>
                </ProjectWizardPanel>
              </div>
            )}
          </div>

          <ProjectWizardActions
            onBack={prevStep}
            nextLabel={step === totalSteps ? common("save") : common("next")}
            backLabel={common("back")}
            isFirstStep={step === 1}
            isSubmitting={saveOperation.isRunning || isSubmitting}
          />
        </section>
      </form>
    </AppPageShell>
  );
}

function ProjectFormProgress({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="rounded-[24px] border border-zinc-100 bg-zinc-50/70 p-2 dark:border-white/10 dark:bg-white/[0.025]">
      <div className="grid gap-2 md:grid-cols-5">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = index + 1 < step;
          const isActive = index + 1 === step;
          return (
            <div
              key={label}
              className={cn(
                "rounded-[18px] px-3 py-3 transition-colors",
                isActive ? "bg-white text-zinc-950 shadow-none dark:bg-white/[0.06] dark:text-white" : "text-zinc-400",
              )}
            >
              <div className="flex items-center gap-3 rtl:flex-row-reverse">
                <span className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-colors",
                  isActive ? "bg-[#0B5CFF] text-white" : isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-400",
                )}>
                  {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : stepNumber}
                </span>
                <span className={cn("min-w-0 truncate text-[11px] font-black uppercase tracking-[0.14em]", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400")}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectWizardPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-7 max-w-2xl">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">{title}</h2>
        <p className="mt-2 max-w-xl text-sm font-semibold leading-7 text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ProjectWizardActions({
  onBack,
  nextLabel,
  backLabel,
  isFirstStep,
  isSubmitting,
}: {
  onBack: () => void;
  nextLabel: string;
  backLabel: string;
  isFirstStep: boolean;
  isSubmitting: boolean;
}) {
  return (
    <div className="mt-7 flex flex-col gap-3 border-t border-zinc-100 pt-5 dark:border-white/10 sm:flex-row sm:items-center">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting}
        className={cn(
          "h-12 flex-1 rounded-2xl border-zinc-200 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 shadow-none hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white",
          isFirstStep && "sm:max-w-40",
        )}
      >
        {backLabel}
      </Button>
      <AppPrimaryButton
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="h-12 flex-[1.4] rounded-2xl bg-[#0B5CFF] shadow-none transition-colors hover:bg-[#084AD6] active:bg-[#063DAF] dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
        {nextLabel}
      </AppPrimaryButton>
    </div>
  );
}

function ProjectPricingSection({
  averagePrice,
  rows,
  onAveragePriceChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
  error,
  labels,
}: {
  averagePrice: string;
  rows: ProjectFormValues["projectPrices"];
  onAveragePriceChange: (value: string) => void;
  onRowChange: (rowId: string, key: "label" | "price", value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  error?: string;
  labels: {
    section: string;
    sectionHelp: string;
    average: string;
    averageHelp: string;
    averagePlaceholder: string;
    prices: string;
    pricesHelp: string;
    itemLabel: string;
    itemPrice: string;
    add: string;
    remove: string;
  };
}) {
  return (
    <div className="space-y-5 border-t border-zinc-100 pt-5 dark:border-white/10 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HelpLabel label={labels.section} help={labels.sectionHelp} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddRow}
          className="h-9 rounded-2xl border-zinc-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-700 shadow-none hover:border-[#0B5CFF]/30 hover:text-[#0B5CFF] dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" />
          {labels.add}
        </Button>
      </div>

      <div className="grid gap-2 text-start">
        <HelpLabel label={labels.average} help={labels.averageHelp} />
        <Input
          id="averagePrice"
          name="averagePrice"
          value={averagePrice}
          onChange={(event) => onAveragePriceChange(event.target.value)}
          placeholder={labels.averagePlaceholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "averagePrice-error" : undefined}
          className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/50 px-4 text-sm font-black uppercase tracking-tight shadow-none transition-all focus:border-zinc-900/10 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-white/5 dark:bg-white/[0.02] dark:focus:border-white/10 dark:focus:bg-white/[0.04] dark:focus:ring-white/5 rtl:text-right"
        />
        {error && <p id="averagePrice-error" className="text-[10px] font-bold text-red-600 rtl:text-right">{error}</p>}
      </div>

      <div className="grid gap-3">
        <HelpLabel label={labels.prices} help={labels.pricesHelp} />
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-2 border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0 dark:border-white/10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <TextInput
              name={`project-price-label-${row.id}`}
              label={index === 0 ? labels.itemLabel : `${labels.itemLabel} ${index + 1}`}
              value={row.label}
              onChange={(value) => onRowChange(row.id, "label", value)}
              placeholder={labels.itemLabel}
            />
            <TextInput
              name={`project-price-value-${row.id}`}
              label={labels.itemPrice}
              value={row.price}
              onChange={(value) => onRowChange(row.id, "price", value)}
              placeholder={labels.itemPrice}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={() => onRemoveRow(row.id)}
              aria-label={labels.remove}
              className="self-end rounded-2xl text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDatePicker({
  label,
  value,
  onChange,
  error,
  placeholder,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  help?: string;
}) {
  const selectedDate = parseIsoDate(value);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());
  const days = calendarDaysForMonth(visibleMonth);
  const displayValue = projectDateDisplayLabel(value, placeholder);

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => nextProjectCalendarMonth(current, offset));
  };

  return (
    <div className="relative grid gap-2 text-start">
      <HelpLabel label={label} help={help} />
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-black text-zinc-900 outline-none transition-all focus:border-[#0B5CFF]/30 focus:bg-white focus:ring-4 focus:ring-[#0B5CFF]/10 dark:border-white/5 dark:bg-white/[0.02] dark:text-white dark:focus:border-blue-300/20 dark:focus:ring-blue-300/10 rtl:flex-row-reverse",
          !selectedDate && "text-zinc-400 dark:text-zinc-500",
        )}
      >
        <span>{displayValue}</span>
        <CalendarDays className="h-4 w-4 text-zinc-400" />
      </button>
      {isOpen && (
        <div className="absolute top-full z-30 mt-2 w-full min-w-[280px] rounded-[24px] border border-zinc-200 bg-white p-3 shadow-none dark:border-white/10 dark:bg-[#101010]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <p className="text-sm font-black text-zinc-900 dark:text-white">{monthFormatter.format(visibleMonth)}</p>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveMonth(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {projectWeekdayLabels(weekdayFormatter).map((date) => (
              <span key={date.key} className="py-1 text-[10px] font-black uppercase text-zinc-400">{date.label}</span>
            ))}
            {days.map((day, index) => {
              const iso = day ? formatIsoDate(day) : "";
              const selected = iso && iso === value;
              return day ? (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "h-9 rounded-xl text-xs font-black text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white",
                    selected && "bg-[#0B5CFF] text-white hover:bg-[#0B5CFF] hover:text-white",
                  )}
                >
                  {day.getDate()}
                </button>
              ) : <span key={`empty-${index}`} className="h-9" />;
            })}
          </div>
        </div>
      )}
      {error && <p className="text-[10px] font-bold text-red-600 rtl:text-right">{error}</p>}
    </div>
  );
}

function HelpLabel({ label, help }: { label: string; help?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 rtl:flex-row-reverse rtl:justify-end">
      {label}
      {help && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              type="button"
              aria-label={help}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition-colors hover:border-[#0B5CFF]/30 hover:text-[#0B5CFF] focus-visible:ring-2 focus-visible:ring-[#0B5CFF]/20 dark:border-white/10 dark:hover:border-blue-300/30 dark:hover:text-blue-300"
            >
              <CircleHelp className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-64 text-start leading-5">
              {help}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  );
}

function ProjectInlineChoice<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: TValue;
  options: { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
  error?: string;
}) {
  const labelId = `${id}-label`;

  return (
    <div className="grid gap-3 text-start">
      <p id={labelId} className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 rtl:text-right">{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={labelId}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-2xl border px-5 text-xs font-black transition-colors focus-visible:ring-2 focus-visible:ring-[#0B5CFF]/20",
                active
                  ? "border-transparent bg-white text-zinc-950 dark:bg-white dark:text-zinc-950"
                  : "border-white/10 bg-transparent text-zinc-400 hover:border-white/20 hover:text-white",
              )}
            >
              {active && <CheckCircle2 className="me-2 h-3.5 w-3.5 text-[#0B5CFF]" />}
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-[10px] font-bold text-red-600 rtl:text-right">{error}</p>}
    </div>
  );
}

function OfferingMixGrid({
  value,
  onToggle,
  label,
}: {
  value: ProjectFormValues["assetTypes"];
  onToggle: (value: ProjectFormValues["assetTypes"][number]) => void;
  label: string;
}) {
  const t = useTranslations("Projects");

  return (
    <div className="grid gap-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {projectOfferingTypes.map((type) => {
          const active = value.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggle(type)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-black transition-all",
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                  : "border-zinc-100 bg-zinc-50/70 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.025] dark:text-zinc-400 dark:hover:text-white",
              )}
            >
              {active && <CheckCircle2 className="h-3.5 w-3.5" />}
              {t(`types.${type}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

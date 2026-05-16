"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { BarChart3, Building2, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Copy, Edit, FileText, FolderOpen, Gauge, History, ImageIcon, Landmark, Layers3, LayoutGrid, List, Loader2, MapPin, Plus, Share2, Trash2, TrendingUp } from "lucide-react";
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
import { getOrganizationCapabilities } from "@/domains/organization/api/better-auth-organization";
import type { Project, ProjectStatus } from "../store/projects.types";
import { projectCategories, projectOfferingTypes, projectSchema, type ProjectFormValues } from "../validation/project.schema";
import { createProjectRequest, deleteProjectRequest, PROJECTS_PAGE_SIZE, updateProjectRequest, useProjectQuery, useProjectsIndexQuery } from "../api/projects";
import { useProjectPropertiesQuery } from "@/domains/properties/api/properties";
import { ResourceMediaUploader } from "@/domains/media/components/resource-media-uploader";
import { ResourceMediaBrowser } from "@/domains/media/components/resource-media-browser";
import { uploadAndAttachMedia, useResourceMediaQuery } from "@/domains/media/api/media";
import { useOperationState } from "@/lib/utils/operation-state";
import { SearchBox, StatusPill, TextInput, DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormErrorSummary, HttpQueryState, ProgressiveLoadingState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const projectFilters = ["all", "approved", "pending", "draft", "rejected"] as const;
const projectViews = ["grid", "list"] as const;
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function projectPriceId() {
  return `price-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function toProjectPriceRows(project?: Project | null): ProjectFormValues["projectPrices"] {
  if (project?.projectPrices?.length) {
    return project.projectPrices.map((item) => ({ id: item.id, label: item.label, price: item.price }));
  }
  return [{ id: projectPriceId(), label: "", price: "" }];
}

function projectPriceDisplay(form: Pick<ProjectFormValues, "averagePrice" | "projectPrices" | "priceRange">) {
  const prices = (form.projectPrices ?? []).map((item) => item.price).filter(Boolean);
  if (prices.length > 0) return prices.join(" - ");
  return form.averagePrice || form.priceRange || "850K SAR";
}

function parseIsoDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function useFirstImagePreviewUrl(files: File[]) {
  const firstImage = useMemo(() => files.find((file) => file.type.startsWith("image/")) ?? null, [files]);
  const previewUrl = useMemo(() => (firstImage ? URL.createObjectURL(firstImage) : null), [firstImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return previewUrl;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calendarDaysForMonth(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstDay = start.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let index = 0; index < firstDay; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function statusTone(status: ProjectStatus) {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "danger";
  return "neutral";
}

function ProjectTile({ project, onDelete }: { project: Project; onDelete: (project: Project) => void }) {
  const t = useTranslations('Projects');
  return (
    <article className="group overflow-hidden rounded-[24px] border border-zinc-100 bg-white transition-colors hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]">
      <Link href={`/projects/${project.id}`} className="relative block h-44 w-full overflow-hidden bg-zinc-100 text-start focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:bg-white/5">
        {project.coverImageUrl ? (
          <Image src={project.coverImageUrl} alt={project.name} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover opacity-80 grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Building2 className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="truncate text-sm font-black uppercase tracking-tight text-white">{project.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/60">
            <MapPin className="h-3 w-3" />
            {project.city}
          </p>
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{project.reference}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.units')}</p>
            <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{project.units}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.value')}</p>
            <p className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white">{project.priceRange}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/5">
          <Link href={`/projects/${project.id}/edit`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:bg-white/5 dark:hover:text-white">
            <Edit className="h-3.5 w-3.5" />
            {t('card.edit')}
          </Link>
          <button type="button" aria-label={`Delete ${project.name}`} onClick={() => onDelete(project)} className="text-zinc-300 transition-colors hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
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

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const q = search.trim().toLowerCase();
    return !q || [project.name, project.reference, project.city, project.developer].some((value) => value.toLowerCase().includes(q));
  }), [projects, search]);

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
    { key: "type", header: t('detail.labels.type'), render: (project) => t(`types.${project.type}`) },
    { key: "units", header: t('detail.labels.units') },
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
    <AppPageShell>
      <AppPageHeader
        eyebrow={t('eyebrow')}
        title={t('title') + "."}
        actions={<Link href="/projects/create"><AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{t('add')}</AppPrimaryButton></Link>}
      />
      <AppStatsGrid stats={[
        { label: t('stats.size'), value: stats?.total ?? "...", icon: FolderOpen },
        { label: t('stats.approved'), value: stats?.approved ?? "...", dotClassName: "bg-emerald-500" },
        { label: t('stats.review'), value: stats?.pending ?? "...", dotClassName: "bg-amber-500" },
        { label: t('stats.drafts'), value: stats?.draft ?? "...", icon: Copy },
      ]} />
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => <ProjectTile key={project.id} project={project} onDelete={setDeleting} />)}
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
  const unitsQuery = useProjectPropertiesQuery(workspaceOrganizationId, project ? id : undefined);
  const units = useMemo(() => unitsQuery ?? [], [unitsQuery]);
  const mediaQuery = useResourceMediaQuery(workspaceOrganizationId, "project", project?.id);
  const projectMedia = useMemo(() => mediaQuery ?? [], [mediaQuery]);
  const documentAssets = useMemo(() => projectMedia.filter((asset) => asset.kind === "document"), [projectMedia]);
  const [inventoryView, setInventoryView] = useState<"cards" | "table">("cards");
  const unitColumns = useMemo((): AppDataTableColumn<(typeof units)[0]>[] => [
    { key: "reference", header: td('inventory.cols.ref') },
    { key: "type", header: td('inventory.cols.type') },
    { key: "status", header: td('inventory.cols.status'), render: (u) => <StatusPill label={u.status} tone={u.status === "available" ? "success" : "warning"} /> },
    { key: "price", header: td('inventory.cols.price') },
    { key: "area", header: td('inventory.cols.area') },
    { key: "updated", header: td('inventory.cols.updated') },
  ], [td]);
  const plannedUnits = project?.units ?? 0;
  const inventoryCoverage = plannedUnits > 0 ? Math.min(100, Math.round((units.length / plannedUnits) * 100)) : 0;
  const availableUnits = units.filter((unit) => String(unit.status).toLowerCase() === "available").length;
  const reservedUnits = units.filter((unit) => String(unit.status).toLowerCase() === "reserved").length;
  const soldUnits = units.filter((unit) => String(unit.status).toLowerCase() === "sold").length;
  const pendingUnits = units.filter((unit) => String(unit.status).toLowerCase() === "pending").length;
  const liveUnitCount = units.length;
  const launchReadiness = project?.status === "approved" ? 92 : project?.status === "pending" ? 68 : project?.status === "rejected" ? 32 : 48;
  const salesStats = useMemo(() => [
    { label: td('sales.metrics.totalUnits'), value: liveUnitCount, icon: Layers3 },
    { label: td('sales.metrics.availableUnits'), value: availableUnits, icon: Landmark, iconClassName: "text-emerald-500" },
    { label: td('sales.metrics.reservedUnits'), value: reservedUnits, icon: TrendingUp, iconClassName: "text-blue-500" },
    { label: td('sales.metrics.soldUnits'), value: soldUnits, icon: BarChart3 },
  ], [availableUnits, liveUnitCount, reservedUnits, soldUnits, td]);
  
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

  return (
    <AppPageShell contentClassName="space-y-8 pb-14">
      <Tabs defaultValue="details" className="space-y-8">
        <section className="space-y-5 text-start">
          <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 dark:border-white/5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 max-w-4xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{project.developer}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-zinc-950 dark:text-white md:text-5xl">{project.name}</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-zinc-600 dark:text-zinc-300">{project.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} />
                <ProjectMetaPill icon={Copy}>{project.reference}</ProjectMetaPill>
                <ProjectMetaPill icon={MapPin}>{project.city}</ProjectMetaPill>
                <ProjectMetaPill icon={Building2}>{t(`types.${project.type}`)}</ProjectMetaPill>
                <ProjectMetaPill icon={Layers3}>{project.units} {t('card.units')}</ProjectMetaPill>
                <ProjectMetaPill icon={Landmark}>{project.priceRange}</ProjectMetaPill>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Button variant="outline" size="icon-lg" aria-label={td('share')} className="rounded-xl border-zinc-200 dark:border-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
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

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[24px] border border-zinc-100 bg-zinc-100 dark:border-white/5 dark:bg-white/[0.04]">
              {project.coverImageUrl ? (
                <Image src={project.coverImageUrl} alt={project.name} fill sizes="(max-width: 1280px) 100vw, 900px" className="object-cover" priority />
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center bg-zinc-200 text-zinc-400 dark:bg-white/[0.05] dark:text-white/25">
                  <Building2 className="h-12 w-12" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/85 to-transparent p-5 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-xs font-black text-zinc-950">{project.priceRange}</span>
                  <span className="inline-flex h-8 items-center rounded-full bg-white/15 px-3 text-xs font-black text-white">{project.units} {t('card.units')}</span>
                  <span className="inline-flex h-8 items-center rounded-full bg-emerald-500/20 px-3 text-xs font-black text-emerald-100">{td('metrics.ready')} {launchReadiness}%</span>
                </div>
              </div>
            </div>

            <aside className="rounded-[24px] border border-zinc-100 bg-white p-6 dark:border-white/5 dark:bg-[#0A0A0A]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{td('metrics.launchReadiness')}</p>
                  <p className="mt-2 text-4xl font-black text-zinc-950 dark:text-white">{launchReadiness}%</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                  <Gauge className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-5 space-y-4">
                <ReadinessBar label={td('metrics.inventoryCoverage')} value={inventoryCoverage} />
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-zinc-200/70 dark:bg-white/10">
                  <CompactFact label={td('metrics.live')} value={liveUnitCount} />
                  <CompactFact label={td('metrics.available')} value={availableUnits} />
                </div>
                <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-white/5">
                  <MiniMovement label={td('sales.status.available')} value={availableUnits} total={Math.max(liveUnitCount, 1)} className="bg-emerald-500" />
                  <MiniMovement label={td('sales.status.reserved')} value={reservedUnits} total={Math.max(liveUnitCount, 1)} className="bg-blue-500" />
                  <MiniMovement label={td('sales.status.sold')} value={soldUnits} total={Math.max(liveUnitCount, 1)} className="bg-zinc-400" />
                </div>
                <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-white/5">
                  <ProjectMetaPill icon={MapPin}>{project.area}</ProjectMetaPill>
                  <ProjectMetaPill icon={FileText}>{project.regaAuthorizationNo || td('empty.value')}</ProjectMetaPill>
                </div>
              </div>
            </aside>
          </div>

          <AppStatsGrid stats={[
            { label: String(t('detail.labels.units')), value: project.units, icon: Layers3, iconClassName: "text-blue-500" },
            { label: String(td('metrics.live')), value: liveUnitCount, icon: FolderOpen },
            { label: String(td('metrics.available')), value: availableUnits, icon: Landmark, iconClassName: "text-emerald-500" },
            { label: String(td('metrics.ready')), value: `${launchReadiness}%`, icon: Gauge, iconClassName: "text-amber-500" },
          ]} />

          <AppTabsList
            className="gap-8"
            tabs={[
              { value: "details", label: td('tabs.details'), icon: Building2 },
              { value: "inventory", label: td('tabs.inventory'), icon: Layers3 },
              { value: "documents", label: td('tabs.documents'), icon: FileText },
              { value: "sales", label: td('tabs.sales'), icon: TrendingUp },
              { value: "activity", label: td('tabs.activity'), icon: History },
            ]}
          />
        </section>

        <TabsContent value="details" className="space-y-5">
          <section className="grid gap-6 text-start xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0">
              <AppSection tone="muted" contentClassName="min-w-0">
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
            </div>

            <div className="grid content-start gap-5">
              <AppSection>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{td('registry.title')}</p>
                    <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-white">{project.reference}</h2>
                  </div>
                  <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} />
                </div>
                <div className="mt-5 space-y-5">
                  <ReadinessBar label={td('metrics.launchReadiness')} value={launchReadiness} />
                  <ReadinessBar label={td('metrics.inventoryCoverage')} value={inventoryCoverage} />
                  <RegistryRows rows={[
                    [t('detail.labels.type'), t(`types.${project.type}`)],
                    [t('detail.labels.developer'), project.developer],
                    [t('detail.labels.city'), project.city],
                    [t('detail.labels.area'), project.area],
                    [td('rega.authNo'), project.regaAuthorizationNo || td('empty.value')],
                    [td('registry.planNo'), project.planNumber || td('empty.value')],
                    [td('registry.plotNo'), project.plotNumber || td('empty.value')],
                    [td('registry.postalIdentity'), project.postalIdentity || td('empty.value')],
                    [td('rega.title'), project.regaExpiresAt ? td('rega.expires', { date: project.regaExpiresAt }) : td('empty.value')],
                  ]} />
                </div>
              </AppSection>

              <AppSection title={td('documents.title')}>
                <RegistryRows rows={[
                  [td('documents.count'), String(documentAssets.length)],
                  [td('documents.latest'), documentAssets[0]?.name ?? td('documents.none')],
                ]} />
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
                <Link href="/properties/create">
                  <AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{td('inventory.addUnit')}</AppPrimaryButton>
                </Link>
              </div>
            )}
          >
            {units.length === 0 ? (
              <EmptyWorkspace icon={Layers3} title={td('inventory.emptyTitle')} description={td('inventory.emptyDesc')} />
            ) : inventoryView === "table" ? (
              <AppDataTable columns={unitColumns} data={units} getRowKey={(u) => u.id} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {units.map((unit) => <ProjectUnitCard key={unit.id} unit={unit} />)}
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
              <Link href="/properties/create" className="inline-flex h-9 items-center rounded-lg bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-zinc-950">
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

          {units.length === 0 ? (
            <EmptyWorkspace icon={BarChart3} title={td('sales.emptyTitle')} description={td('sales.emptyDesc')} />
          ) : (
            <AppSection contentClassName="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-black text-zinc-950 dark:text-white">{td('sales.pipelineTitle')}</h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{liveUnitCount} / {plannedUnits}</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: td('sales.status.available'), value: availableUnits, className: "bg-emerald-500" },
                    { label: td('sales.status.reserved'), value: reservedUnits, className: "bg-blue-500" },
                    { label: td('sales.status.sold'), value: soldUnits, className: "bg-zinc-400" },
                    { label: td('sales.status.pending'), value: pendingUnits, className: "bg-amber-500" },
                  ].map((row) => (
                    <SalesMovementRow key={row.label} label={row.label} value={row.value} total={Math.max(liveUnitCount, 1)} className={row.className} />
                  ))}
                </div>
              </div>
              <aside className="border-t border-zinc-100 pt-5 dark:border-white/5 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{td('sales.nextTitle')}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">{td('sales.nextDesc')}</p>
                <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden bg-zinc-200/70 dark:bg-white/10">
                  <CompactFact label={td('sales.status.reserved')} value={reservedUnits} />
                  <CompactFact label={td('sales.status.pending')} value={pendingUnits} />
                </div>
              </aside>
            </AppSection>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <AppSection tone="muted">
            <EmptyWorkspace icon={History} title={td('activity.emptyTitle')} description={td('activity.emptyDesc')} />
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

function ProjectMetaPill({ icon: Icon, children }: { icon: typeof Building2; children: ReactNode }) {
  return (
    <span className="inline-flex h-8 min-w-0 max-w-full items-center gap-2 rounded-full bg-zinc-100 px-3 text-xs font-bold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function ProjectUnitCard({ unit }: { unit: { id: string; title: string; reference: string; type: string; status: string; price: string; area: string; bedrooms?: number | string; bathrooms?: number | string } }) {
  return (
    <Link href={`/properties/${unit.reference || unit.id}`} className="block border border-zinc-200/70 bg-zinc-50/50 p-4 text-start transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{unit.reference}</p>
          <h3 className="mt-2 line-clamp-2 text-sm font-black text-zinc-950 dark:text-white">{unit.title}</h3>
        </div>
        <StatusPill label={unit.status} tone={unit.status === "available" ? "success" : unit.status === "sold" ? "neutral" : "warning"} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
        <span>{unit.type}</span>
        <span className="text-end">{unit.area}</span>
        <span className="text-zinc-950 dark:text-white">{unit.price}</span>
        <span className="text-end">{[unit.bedrooms, unit.bathrooms].filter((value) => typeof value === "number").join(" / ")}</span>
      </div>
    </Link>
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
  const width = `${Math.max(value > 0 ? 8 : 0, Math.round((value / total) * 100))}%`;
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

function SalesMovementRow({ label, value, total, className }: { label: ReactNode; value: number; total: number; className: string }) {
  const width = `${Math.max(value > 0 ? 8 : 0, Math.round((value / total) * 100))}%`;

  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3">
      <span className="text-end text-sm font-black tabular-nums text-zinc-950 dark:text-white">{value}</span>
      <div className="min-w-0">
        <div className="relative h-8 overflow-hidden bg-zinc-100 dark:bg-white/[0.06]">
          <div className={cn("absolute inset-y-0 end-0", className)} style={{ width }} />
          <span className="absolute inset-0 flex items-center justify-end px-3 text-[10px] font-black uppercase tracking-widest text-white mix-blend-difference">
            {label}
          </span>
        </div>
      </div>
    </div>
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
  const existingType = projectCategories.includes(existing?.type as ProjectFormValues["type"]) ? existing?.type as ProjectFormValues["type"] : "Residential";
  const existingUnitTypes = (existing?.unitTypes ?? []).filter((type): type is ProjectFormValues["unitTypes"][number] =>
    projectOfferingTypes.includes(type as ProjectFormValues["unitTypes"][number]),
  );
  const capabilitiesQuery = useReactQuery({
    queryKey: ["organization-capabilities", workspaceOrganizationId],
    queryFn: () => getOrganizationCapabilities(workspaceOrganizationId!),
    enabled: Boolean(workspaceOrganizationId),
  });
  const canManageVisibility = capabilitiesQuery.data?.canManageVisibility ?? false;
  const pendingCoverPreviewUrl = useFirstImagePreviewUrl(pendingMediaFiles);

  const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectFormValues>,
    defaultValues: {
      name: existing?.name ?? "",
      developer: existing?.developer ?? "",
      city: existing?.city ?? "",
      area: existing?.area ?? "",
      type: existingType,
      unitTypes: existingUnitTypes,
      status: existing?.status ?? "draft" as ProjectStatus,
      visibility: existing?.visibility ?? "private",
      units: String(existing?.units ?? 0),
      averagePrice: existing?.averagePrice ?? existing?.priceRange ?? "",
      projectPrices: toProjectPriceRows(existing),
      priceRange: existing?.priceRange ?? "",
      regaAuthorizationNo: existing?.regaAuthorizationNo ?? "",
      regaExpiresAt: existing?.regaExpiresAt ?? "",
      planNumber: existing?.planNumber ?? "",
      plotNumber: existing?.plotNumber ?? "",
      postalIdentity: existing?.postalIdentity ?? "",
      description: existing?.description ?? "",
    },
  });

  const form = useWatch({ control }) as ProjectFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ProjectFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Project save failed." });

  useEffect(() => {
    if (!existing) return;
    reset({
      name: existing.name ?? "",
      developer: existing.developer ?? "",
      city: existing.city ?? "",
      area: existing.area ?? "",
      type: projectCategories.includes(existing.type as ProjectFormValues["type"]) ? existing.type as ProjectFormValues["type"] : "Residential",
      unitTypes: (existing.unitTypes ?? []).filter((type): type is ProjectFormValues["unitTypes"][number] =>
        projectOfferingTypes.includes(type as ProjectFormValues["unitTypes"][number]),
      ),
      status: existing.status ?? "draft",
      visibility: existing.visibility ?? "private",
      units: String(existing.units ?? 0),
      averagePrice: existing.averagePrice ?? existing.priceRange ?? "",
      projectPrices: toProjectPriceRows(existing),
      priceRange: existing.priceRange ?? "",
      regaAuthorizationNo: existing.regaAuthorizationNo ?? "",
      regaExpiresAt: existing.regaExpiresAt ?? "",
      planNumber: existing.planNumber ?? "",
      plotNumber: existing.plotNumber ?? "",
      postalIdentity: existing.postalIdentity ?? "",
      description: existing.description ?? "",
    });
  }, [existing, reset]);

  const setField = (key: keyof ProjectFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };

  const toggleUnitType = (value: ProjectFormValues["unitTypes"][number]) => {
    const current = form.unitTypes ?? [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    setValue("unitTypes", next, { shouldDirty: true, shouldValidate: Boolean(fieldErrors.unitTypes) });
    saveOperation.clearError();
  };

  const updateProjectPrice = (rowId: string, key: "label" | "price", value: string) => {
    const next = (form.projectPrices ?? []).map((item) => item.id === rowId ? { ...item, [key]: value } : item);
    setValue("projectPrices", next, { shouldDirty: true, shouldValidate: Boolean(fieldErrors.projectPrices) });
    saveOperation.clearError();
  };

  const addProjectPrice = () => {
    setValue("projectPrices", [...(form.projectPrices ?? []), { id: projectPriceId(), label: "", price: "" }], { shouldDirty: true });
    saveOperation.clearError();
  };

  const removeProjectPrice = (rowId: string) => {
    const next = (form.projectPrices ?? []).filter((item) => item.id !== rowId);
    setValue("projectPrices", next.length ? next : [{ id: projectPriceId(), label: "", price: "" }], { shouldDirty: true, shouldValidate: Boolean(fieldErrors.projectPrices) });
    saveOperation.clearError();
  };

  const stepForProjectError = (key: keyof ProjectFormValues) => {
    if (["name", "developer", "city", "area", "units", "averagePrice", "projectPrices", "priceRange"].includes(key)) return 1;
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
        className="mx-auto grid w-full max-w-[1160px] gap-6 xl:grid-cols-[minmax(0,760px)_minmax(280px,340px)] xl:items-start xl:justify-center"
        onSubmit={(event) => {
          event.preventDefault();
          nextStep();
        }}
      >
        <ProjectFormPreview form={form} pendingMediaCount={pendingMediaFiles.length} pendingDocumentCount={pendingDocumentFiles.length} pendingCoverPreviewUrl={pendingCoverPreviewUrl} existing={existing} />

        <section className="order-1 rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-none dark:border-white/10 dark:bg-[#0B0B0B] md:p-7">
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
                    <TextInput name="units" label={t("form.unitsLabel")} type="number" inputMode="numeric" value={form.units} onChange={(value) => setField("units", value)} error={fieldErrors.units} />
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
                    <OfferingMixGrid value={form.unitTypes ?? []} onToggle={toggleUnitType} label={t("form.offeringMixLabel")} />
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
  const displayValue = selectedDate ? selectedDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : placeholder;

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
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
            {Array.from({ length: 7 }, (_, index) => new Date(2026, 0, 4 + index)).map((date) => (
              <span key={date.toISOString()} className="py-1 text-[10px] font-black uppercase text-zinc-400">{weekdayFormatter.format(date)}</span>
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
  value: ProjectFormValues["unitTypes"];
  onToggle: (value: ProjectFormValues["unitTypes"][number]) => void;
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

function ProjectFormPreview({
  form,
  pendingMediaCount,
  pendingDocumentCount,
  pendingCoverPreviewUrl,
  existing,
}: {
  form: ProjectFormValues;
  pendingMediaCount: number;
  pendingDocumentCount: number;
  pendingCoverPreviewUrl?: string | null;
  existing?: Project | null;
}) {
  const t = useTranslations("Projects");
  const previewImageUrl = pendingCoverPreviewUrl || existing?.coverImageUrl || "";
  const checklist = [
    [t("form.nameLabel"), form.name],
    [t("form.cityLabel"), form.city],
    [t("form.unitsLabel"), form.units],
    [t("form.offeringMixLabel"), form.unitTypes?.length ? String(form.unitTypes.length) : ""],
    [t("form.legalChecklist"), form.regaAuthorizationNo || form.planNumber || form.plotNumber || form.postalIdentity],
    [t("form.previewMedia"), pendingMediaCount ? String(pendingMediaCount) : ""],
    [t("form.previewDocuments"), pendingDocumentCount ? String(pendingDocumentCount) : ""],
    [t("form.descLabel"), form.description],
  ];

  return (
    <aside className="order-2 space-y-5 xl:sticky xl:top-24">
      <article className="space-y-4">
        <div className="relative h-44 overflow-hidden rounded-[24px] border border-zinc-200/70 bg-zinc-950 dark:border-white/10">
          {previewImageUrl ? (
            <Image
              src={previewImageUrl}
              alt={form.name || existing?.name || t("form.previewName")}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              unoptimized={previewImageUrl.startsWith("blob:")}
              className="object-cover opacity-80 grayscale"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_45%)]" />
          )}
          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white/70 backdrop-blur">{form.type || t("types.Residential")}</span>
            <StatusPill label={t(`toolbar.filters.${form.status || "draft"}`)} tone={form.status === "approved" ? "success" : form.status === "pending" ? "warning" : form.status === "rejected" ? "danger" : "neutral"} />
          </div>
          <div className="flex h-full w-full items-center justify-center text-white/15">
            <Building2 className="h-9 w-9" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/45">{form.city || t("form.previewCity")}</p>
            <h2 className="mt-1.5 line-clamp-2 text-lg font-black uppercase tracking-tight text-white">{form.name || t("form.previewName")}</h2>
            <p className="mt-2 truncate text-xs font-bold text-white/60">{form.developer || t("form.previewDeveloper")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <PreviewMetric label={t("card.units")} value={form.units || "0"} />
            <PreviewMetric label={t("card.value")} value={projectPriceDisplay(form)} />
          </div>
          {form.unitTypes?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.unitTypes.slice(0, 4).map((type) => (
                <span key={type} className="rounded-full bg-zinc-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                  {t(`types.${type}`)}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {pendingMediaCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <ImageIcon className="h-3 w-3" />
                {pendingMediaCount}
              </span>
            )}
            {pendingDocumentCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">
                <FileText className="h-3 w-3" />
                {pendingDocumentCount}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold leading-6 text-zinc-500 dark:text-zinc-400">{form.description || t("form.previewDescription")}</p>
        </div>
      </article>

      <div className="border-t border-zinc-200/70 pt-4 dark:border-white/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.previewChecklist")}</p>
        <div className="mt-4 grid gap-1">
          {checklist.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{label}</span>
              <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full", value ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-200 text-zinc-400 dark:bg-white/10")}>
                {value ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-zinc-200/70 py-2.5 dark:border-white/10">
      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-2 truncate text-sm font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

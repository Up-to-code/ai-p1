"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { BarChart3, Building2, CheckCircle2, Copy, Edit, FileText, FolderOpen, Gauge, History, ImageIcon, Landmark, Layers3, LayoutGrid, List, MapPin, Plus, Share2, Trash2, TrendingUp } from "lucide-react";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppStatsGrid,
  AppTabsList,
  AppThumbnailCell,
  AppToolbar,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { SearchBox, StatusPill, TextInput, ChoiceGrid, DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormErrorSummary, HttpQueryState, ProgressiveLoadingState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const projectFilters = ["all", "approved", "pending", "draft", "rejected"] as const;
const projectViews = ["grid", "list"] as const;

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
    <AppPageShell contentClassName="space-y-6 pb-14">
      <Tabs defaultValue="details" className="space-y-6">
        <section className="border-b border-zinc-200/70 pb-4 text-start dark:border-white/10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                <span>{project.reference}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-400/70" />
                <span>{project.developer}</span>
              </div>
              <h1 className="max-w-5xl text-2xl font-black leading-tight text-zinc-950 dark:text-white md:text-3xl">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} />
                <StatusPill label={t(`types.${project.type}`)} tone="neutral" />
                <span className="inline-flex h-8 items-center rounded-full bg-zinc-950 px-3 text-xs font-black text-white dark:bg-white dark:text-zinc-950">{project.priceRange}</span>
                <span className="inline-flex h-8 items-center rounded-full bg-zinc-100 px-3 text-xs font-black text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">{project.units} {t('card.units')}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 xl:justify-end">
              <Button variant="outline" size="icon-lg" aria-label={td('share')} className="rounded-xl border-zinc-200 dark:border-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
              <Link href={`/projects/${project.id}/edit`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:hover:bg-white/5">
                <Edit className="h-3.5 w-3.5" />
                {t('detail.edit')}
              </Link>
              <Button variant="ghost" aria-label={t('detail.delete')} onClick={() => setDeleting(true)} className="h-10 rounded-xl px-3 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/25">
                <Trash2 className="me-2 h-3.5 w-3.5" />
                {t('detail.delete')}
              </Button>
            </div>
          </div>

          <div className="mt-6">
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
          </div>
        </section>

        <TabsContent value="details" className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
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
                previewLimit={8}
              />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProjectSignal label={t('detail.labels.units')} value={project.units} icon={Layers3} tone="blue" />
                <ProjectSignal label={td('metrics.live')} value={liveUnitCount} icon={FolderOpen} tone="zinc" />
                <ProjectSignal label={td('metrics.available')} value={availableUnits} icon={Landmark} tone="emerald" />
                <ProjectSignal label={td('metrics.ready')} value={`${launchReadiness}%`} icon={Gauge} tone="amber" />
              </div>
              <section className="border-t border-zinc-200/70 pt-5 text-start dark:border-white/10">
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{td('narrative.title')}</p>
                <p className="mt-2 max-w-4xl text-sm font-semibold leading-7 text-zinc-700 dark:text-zinc-300">{project.description}</p>
              </section>
            </div>
            <aside className="self-start rounded-xl border border-zinc-200/70 bg-zinc-50/70 text-start dark:border-white/10 dark:bg-white/[0.025]">
              <div className="border-b border-zinc-200/70 p-4 dark:border-white/10">
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{td('registry.title')}</p>
                <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-white">{project.reference}</h2>
              </div>
              <div className="space-y-5 p-4">
                <ReadinessBar label={td('metrics.launchReadiness')} value={launchReadiness} />
                <ReadinessBar label={td('metrics.inventoryCoverage')} value={inventoryCoverage} />
                <table className="w-full text-[11px]">
                  <tbody className="divide-y divide-zinc-200/70 font-semibold text-zinc-600 dark:divide-white/10 dark:text-zinc-300">
                    <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.labels.type')}</td><td className="py-2 font-black text-zinc-900 dark:text-white">{t(`types.${project.type}`)}</td></tr>
                    <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.labels.developer')}</td><td className="py-2">{project.developer}</td></tr>
                    <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.labels.city')}</td><td className="py-2">{project.city}</td></tr>
                    <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.labels.area')}</td><td className="py-2">{project.area}</td></tr>
                    <tr><td className="py-2 pe-3 text-zinc-400">{td('rega.authNo')}</td><td className="py-2">{project.regaAuthorizationNo || td('empty.value')}</td></tr>
                  </tbody>
                </table>
              </div>
            </aside>
          </section>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CompactFact label={td('registry.planNo')} value={project.planNumber || td('empty.value')} />
            <CompactFact label={td('registry.plotNo')} value={project.plotNumber || td('empty.value')} />
            <CompactFact label={td('registry.postalIdentity')} value={project.postalIdentity || td('empty.value')} />
            <CompactFact label={td('rega.title')} value={project.regaExpiresAt ? td('rega.expires', { date: project.regaExpiresAt }) : td('empty.value')} />
          </div>
          <div className="border-t border-zinc-200/70 pt-4 dark:border-white/10">
            <table className="w-full text-start text-xs">
              <tbody className="divide-y divide-zinc-200/70 dark:divide-white/10">
                <tr><td className="py-3 pe-4 font-black text-zinc-400">{td('documents.count')}</td><td className="py-3 font-semibold text-zinc-900 dark:text-white">{documentAssets.length}</td></tr>
                <tr><td className="py-3 pe-4 font-black text-zinc-400">{td('documents.latest')}</td><td className="py-3 font-semibold text-zinc-900 dark:text-white">{documentAssets[0]?.name ?? td('documents.none')}</td></tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-zinc-950 dark:text-white">{td('inventory.title')}</h2>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{td('inventory.subtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10">
                  <button type="button" onClick={() => setInventoryView("cards")} className={cn("flex h-full w-9 items-center justify-center", inventoryView === "cards" ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-400 hover:text-zinc-950 dark:hover:text-white")} aria-label={td('inventory.cards')}>
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setInventoryView("table")} className={cn("flex h-full w-9 items-center justify-center", inventoryView === "table" ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-400 hover:text-zinc-950 dark:hover:text-white")} aria-label={td('inventory.table')}>
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Link href="/properties/create">
                  <AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{td('inventory.addUnit')}</AppPrimaryButton>
                </Link>
              </div>
            </div>
            {units.length === 0 ? (
              <EmptyWorkspace icon={Layers3} title={td('inventory.emptyTitle')} description={td('inventory.emptyDesc')} />
            ) : inventoryView === "table" ? (
              <AppDataTable columns={unitColumns} data={units} getRowKey={(u) => u.id} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {units.map((unit) => <ProjectUnitCard key={unit.id} unit={unit} />)}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <AppStatsGrid stats={salesStats} />
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <h2 className="text-base font-black text-zinc-950 dark:text-white">{td('sales.pipelineTitle')}</h2>
              {units.length === 0 ? (
                <EmptyWorkspace icon={BarChart3} title={td('sales.emptyTitle')} description={td('sales.emptyDesc')} />
              ) : (
                <div className="divide-y divide-zinc-200/70 border-y border-zinc-200/70 dark:divide-white/10 dark:border-white/10">
                  {[
                    { label: td('sales.status.available'), value: availableUnits, tone: "success" as const },
                    { label: td('sales.status.reserved'), value: reservedUnits, tone: "warning" as const },
                    { label: td('sales.status.sold'), value: soldUnits, tone: "neutral" as const },
                    { label: td('sales.status.pending'), value: pendingUnits, tone: "warning" as const },
                  ].map((row) => (
                    <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                      <StatusPill label={row.label} tone={row.tone} />
                      <span className="text-lg font-black text-zinc-950 dark:text-white">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <aside className="space-y-3 border-t border-zinc-200/70 pt-4 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0 dark:border-white/10">
              <h2 className="text-base font-black text-zinc-950 dark:text-white">{td('sales.nextTitle')}</h2>
              <p className="text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">
                {units.length > 0 ? td('sales.nextDesc') : td('sales.nextEmptyDesc')}
              </p>
              <Link href="/properties/create" className="inline-flex h-9 items-center rounded-lg bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-zinc-950">
                <Plus className="me-2 h-3.5 w-3.5" />
                {td('inventory.addUnit')}
              </Link>
            </aside>
          </section>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <EmptyWorkspace icon={History} title={td('activity.emptyTitle')} description={td('activity.emptyDesc')} />
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

function ProjectSignal({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  icon: typeof Building2;
  tone: "emerald" | "blue" | "amber" | "zinc";
}) {
  const toneClassName = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    zinc: "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", toneClassName)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="truncate text-2xl font-black uppercase tracking-tight text-zinc-950 dark:text-white">{value}</p>
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
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-zinc-900 dark:bg-white" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CompactFact({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-zinc-950 dark:text-white">{value}</p>
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

  const onSubmit = handleSubmit((data) => {
    saveOperation.run(async () => {
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
  });

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
    <AppPageShell maxWidth="wide" contentClassName="space-y-6">
      <AppPageHeader
        eyebrow={t("form.eyebrow")}
        title={existing ? t("form.editTitle") : t("form.createTitle")}
        subtitle={t("form.subtitle")}
        className="pb-8"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,760px)_380px] xl:items-start xl:justify-center">
        <ProjectFormPreview form={form} pendingMediaCount={pendingMediaFiles.length} pendingDocumentCount={pendingDocumentFiles.length} />

        <section className="order-1 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm shadow-zinc-950/[0.03] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none md:p-6">
          <ProjectFormProgress step={step} labels={[t("form.stepInformation"), t("form.stepGallery"), t("form.stepLegal"), t("form.stepDocuments"), t("form.stepDetails")]} />
          <FormErrorSummary errors={fieldErrors} />

          <div className="mt-6 min-h-[360px]">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectWizardPanel title={t("form.informationTitle")} description={t("form.informationDesc")}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput name="name" label={t("form.nameLabel")} value={form.name} onChange={(value) => setField("name", value)} placeholder="Al Madinah Residences…" error={fieldErrors.name} />
                    <TextInput name="developer" label={t("form.devLabel")} value={form.developer} onChange={(value) => setField("developer", value)} placeholder="Acme Development…" error={fieldErrors.developer} />
                    <TextInput name="city" label={t("form.cityLabel")} value={form.city} onChange={(value) => setField("city", value)} placeholder="Riyadh…" error={fieldErrors.city} />
                    <TextInput name="area" label={t("form.areaLabel")} value={form.area} onChange={(value) => setField("area", value)} placeholder="Al Malqa…" error={fieldErrors.area} />
                    <TextInput name="units" label={t("form.unitsLabel")} type="number" inputMode="numeric" value={form.units} onChange={(value) => setField("units", value)} error={fieldErrors.units} />
                    <TextInput name="priceRange" label={t("form.priceLabel")} value={form.priceRange} onChange={(value) => setField("priceRange", value)} placeholder="850K SAR…" error={fieldErrors.priceRange} />
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
                    immediate={Boolean(existing)}
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
                    <TextInput name="regaExpiresAt" label={t("form.regaExpiresAtLabel")} type="date" value={form.regaExpiresAt ?? ""} onChange={(value) => setField("regaExpiresAt", value)} error={fieldErrors.regaExpiresAt} />
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
                    immediate={Boolean(existing)}
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
                  <div className="space-y-6">
                    <ChoiceGrid id="type" label={t("form.typeLabel")} value={form.type} onChange={(value) => setField("type", value)} columns="grid-cols-3" options={[{ value: "Residential", label: t("types.Residential") }, { value: "Commercial", label: t("types.Commercial") }, { value: "Mixed Use", label: t("types.Mixed Use") }]} error={fieldErrors.type} />
                    <OfferingMixGrid value={form.unitTypes ?? []} onToggle={toggleUnitType} label={t("form.offeringMixLabel")} />
                    <ChoiceGrid id="status" label={t("form.statusLabel")} value={form.status} onChange={(value) => setField("status", value)} columns="grid-cols-2 md:grid-cols-4" options={[{ value: "draft", label: t("toolbar.filters.draft") }, { value: "pending", label: t("toolbar.filters.pending") }, { value: "approved", label: t("toolbar.filters.approved") }, { value: "rejected", label: t("toolbar.filters.rejected") }]} error={fieldErrors.status} />
                    {canManageVisibility && (
                      <ChoiceGrid
                        id="visibility"
                        label={t("form.visibilityLabel")}
                        value={form.visibility ?? "private"}
                        onChange={(value) => setField("visibility", value)}
                        columns="grid-cols-2"
                        options={[
                          { value: "private", label: t("form.visibilityPrivate") },
                          { value: "public", label: t("form.visibilityPublic") },
                        ]}
                        error={fieldErrors.visibility}
                      />
                    )}
                    <div className="grid gap-2">
                      <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.descLabel")}</label>
                      <Textarea id="description" name="description" value={form.description} onChange={(event) => setField("description", event.target.value)} className="min-h-[150px] rounded-3xl border-zinc-100 bg-zinc-50/50 p-5 text-sm font-medium transition-all focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-white/5 dark:bg-white/[0.02]" />
                    </div>
                  </div>
                </ProjectWizardPanel>
              </div>
            )}
          </div>

          <ProjectWizardActions
            onNext={nextStep}
            onBack={prevStep}
            nextLabel={step === totalSteps ? common("finish") : common("next")}
            backLabel={common("back")}
            isFirstStep={step === 1}
            isSubmitting={saveOperation.isRunning || isSubmitting}
          />
        </section>
      </div>
    </AppPageShell>
  );
}

function ProjectFormProgress({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025]">
      <div className="grid gap-2 sm:grid-cols-5">
        {labels.map((label, index) => {
          const isDone = index + 1 < step;
          const isActive = index + 1 === step;
          return (
            <div key={label} className={cn("rounded-lg px-3 py-2 transition-all", isActive ? "bg-white shadow-sm shadow-zinc-950/[0.03] dark:bg-[#0A0A0A]" : "bg-transparent")}>
              <div className="flex items-center gap-2 rtl:flex-row-reverse">
                <span className={cn(
                  "inline-flex h-2.5 w-2.5 shrink-0 rounded-full transition-all",
                  isActive ? "scale-125 bg-zinc-900 dark:bg-white" : isDone ? "bg-emerald-500" : "bg-zinc-300 dark:bg-white/15",
                )} />
                <span className={cn("truncate text-[10px] font-black uppercase tracking-widest", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400")}>{label}</span>
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
      <div className="mb-6 max-w-2xl">
        <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ProjectWizardActions({
  onNext,
  onBack,
  nextLabel,
  backLabel,
  isFirstStep,
  isSubmitting,
}: {
  onNext: () => void;
  onBack: () => void;
  nextLabel: string;
  backLabel: string;
  isFirstStep: boolean;
  isSubmitting: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-white/10 sm:flex-row sm:items-center">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className={cn(
          "h-12 flex-1 rounded-[20px] border-zinc-200 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 shadow-none hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white",
          isFirstStep && "sm:max-w-40",
        )}
      >
        {backLabel}
      </Button>
      <AppPrimaryButton
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="h-12 flex-[1.4] rounded-[20px] shadow-none transition-all hover:scale-[1.005] active:scale-[0.995]"
      >
        {nextLabel}
      </AppPrimaryButton>
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
}: {
  form: ProjectFormValues;
  pendingMediaCount: number;
  pendingDocumentCount: number;
}) {
  const t = useTranslations("Projects");

  return (
    <aside className="order-2 space-y-4 xl:sticky xl:top-24">
      <article className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm shadow-zinc-950/[0.03] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none">
        <div className="relative h-72 bg-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_45%)]" />
          <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/70 backdrop-blur">{form.type || t("types.Residential")}</span>
            <StatusPill label={form.status || "draft"} tone={form.status === "approved" ? "success" : form.status === "pending" ? "warning" : form.status === "rejected" ? "danger" : "neutral"} />
          </div>
          <div className="flex h-full w-full items-center justify-center text-white/15">
            <Building2 className="h-12 w-12" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/45">{form.city || t("form.previewCity")}</p>
            <h2 className="mt-2 line-clamp-2 text-3xl font-black uppercase tracking-tight text-white">{form.name || t("form.previewName")}</h2>
            <p className="mt-2 truncate text-xs font-bold text-white/60">{form.developer || t("form.previewDeveloper")}</p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <PreviewMetric label={t("card.units")} value={form.units || "0"} />
            <PreviewMetric label={t("card.value")} value={form.priceRange || "850K SAR"} />
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
          <p className="min-h-16 text-sm font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">{form.description || t("form.previewDescription")}</p>
        </div>
      </article>

      <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm shadow-zinc-950/[0.02] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.previewChecklist")}</p>
        <div className="mt-4 grid gap-2">
          {[
            [t("form.nameLabel"), form.name],
            [t("form.cityLabel"), form.city],
            [t("form.unitsLabel"), form.units],
            [t("form.offeringMixLabel"), form.unitTypes?.length ? String(form.unitTypes.length) : ""],
            [t("form.legalChecklist"), form.regaAuthorizationNo || form.planNumber || form.plotNumber || form.postalIdentity],
            [t("form.previewMedia"), pendingMediaCount ? String(pendingMediaCount) : ""],
            [t("form.previewDocuments"), pendingDocumentCount ? String(pendingDocumentCount) : ""],
            [t("form.descLabel"), form.description],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{label}</span>
              <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full", value ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-200 text-zinc-400 dark:bg-white/10")}>
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
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/[0.025]">
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-2 truncate text-lg font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

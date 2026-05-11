"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Building2, CheckCircle2, Copy, Edit, FileText, FolderOpen, History, MapPin, Plus, Share2, Trash2, TrendingUp } from "lucide-react";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppSection,
  AppStatsGrid,
  AppThumbnailCell,
  AppToolbar,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import type { Project, ProjectStatus } from "../store/projects.types";
import { projectCategories, projectOfferingTypes, projectSchema, type ProjectFormValues } from "../validation/project.schema";
import { createProjectRequest, deleteProjectRequest, PROJECTS_PAGE_SIZE, updateProjectRequest, useProjectQuery, useProjectsPagedQuery, useProjectStatsQuery } from "../api/projects";
import { usePropertiesQuery } from "@/domains/properties/api/properties";
import { ResourceMediaUploader } from "@/domains/media/components/resource-media-uploader";
import { uploadAndAttachMedia } from "@/domains/media/api/media";
import { useOperationState } from "@/lib/utils/operation-state";
import { SearchBox, StatusPill, TextInput, ChoiceGrid, DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormErrorSummary, ProgressiveLoadingState, WorkspaceQueryState } from "@/components/shared/crud-ui";
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

  const projectsQuery = useProjectsPagedQuery(workspaceOrganizationId, {
    status: filter === "all" ? undefined : filter,
    search,
  });
  const stats = useProjectStatsQuery(workspaceOrganizationId);
  const projects = useMemo(() => projectsQuery.results as Project[], [projectsQuery.results]);
  const isLoading = isWorkspaceReady && projectsQuery.status === "LoadingFirstPage";

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
        <WorkspaceQueryState status={workspaceStatus} />
      ) : isLoading ? (
        <ProgressiveLoadingState />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => <ProjectTile key={project.id} project={project} onDelete={setDeleting} />)}
        </div>
      ) : (
        <AppDataTable columns={columns} data={filteredProjects} getRowKey={(project) => project.id} />
      )}

      {isWorkspaceReady && !isLoading && filteredProjects.length === 0 && <EmptyWorkspace icon={FolderOpen} title={t('empty.title')} description={t('empty.desc')} />}
      {isWorkspaceReady && !isLoading && filteredProjects.length > 0 && (
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
  const project = useProjectQuery(account.organization.id ?? undefined, id) as Project | null | undefined;
  const allUnitsQuery = usePropertiesQuery(account.organization.id ?? undefined);
  const allUnits = useMemo(() => allUnitsQuery ?? [], [allUnitsQuery]);
  const units = useMemo(() => allUnits.filter(u => u.projectId === id || u.project === project?.name), [allUnits, id, project?.name]);
  const unitColumns = useMemo((): AppDataTableColumn<(typeof units)[0]>[] => [
    { key: "reference", header: td('inventory.cols.ref') },
    { key: "type", header: td('inventory.cols.type') },
    { key: "status", header: td('inventory.cols.status'), render: (u) => <StatusPill label={u.status} tone={u.status === "available" ? "success" : "warning"} /> },
    { key: "price", header: td('inventory.cols.price') },
    { key: "area", header: td('inventory.cols.area') },
    { key: "updated", header: td('inventory.cols.updated') },
  ], [td]);
  const salesStats = useMemo(() => [
    { label: td('sales.metrics.totalRevenue'), value: "42.8M SAR", icon: TrendingUp },
    { label: td('sales.metrics.avgUnitPrice'), value: "1.2M SAR", icon: Building2 },
    { label: td('sales.metrics.absorptionRate'), value: "64%", icon: BarChart3 },
    { label: td('sales.metrics.leadsConverted'), value: "128", icon: Share2 },
  ].map((stat) => ({
    ...stat,
    iconClassName: stat.label === td('sales.metrics.totalRevenue') ? "text-emerald-500" : stat.label === td('sales.metrics.absorptionRate') ? "text-blue-500" : undefined
  })), [td]);
  
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const deleteOperation = useOperationState({ errorMessage: "Project delete failed." });

  if (project === undefined) {
    return <AppPageShell><EmptyWorkspace icon={FolderOpen} title="Loading project" description="Project data is syncing from Convex." /></AppPageShell>;
  }

  if (!project) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/projects" backLabel={t('detail.back')} /></AppPageShell>;
  }

  return (
    <AppPageShell>
      <AppPageHeader
        eyebrow={project.reference}
        title={`${project.name}.`}
        actions={
          <>
            <Button variant="outline" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-100 dark:border-white/10"><Share2 className="me-2 h-3.5 w-3.5" />{td('share')}</Button>
            <Link href={`/projects/${project.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-100 px-5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:hover:bg-white/5"><Edit className="me-2 h-3.5 w-3.5" />{t('detail.edit')}</Link>
            <Button variant="destructive" onClick={() => setDeleting(true)} className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"><Trash2 className="me-2 h-3.5 w-3.5" />{t('detail.delete')}</Button>
          </>
        }
      />

      <Tabs defaultValue="details" className="space-y-10">
        <TabsList variant="line" className="w-full justify-start border-b border-zinc-100 dark:border-white/5">
          <TabsTrigger value="details" className="px-6">{td('tabs.details')}</TabsTrigger>
          <TabsTrigger value="inventory" className="px-6">{td('tabs.inventory')}</TabsTrigger>
          <TabsTrigger value="documents" className="px-6">{td('tabs.documents')}</TabsTrigger>
          <TabsTrigger value="sales" className="px-6">{td('tabs.sales')}</TabsTrigger>
          <TabsTrigger value="activity" className="px-6">{td('tabs.activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-10">
          <div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-zinc-100 bg-zinc-100 dark:border-white/5">
            {project.coverImageUrl ? (
              <Image src={project.coverImageUrl} alt={project.name} fill priority sizes="100vw" className="object-cover grayscale" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
                <Building2 className="h-12 w-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={statusTone(project.status)} />
              <p className="mt-5 max-w-2xl text-3xl font-black uppercase leading-tight tracking-tight">{project.description}</p>
            </div>
          </div>

          <AppStatsGrid stats={[
            { label: t('detail.labels.city'), value: project.city, icon: MapPin },
            { label: t('detail.labels.type'), value: t(`types.${project.type}`), icon: Building2 },
            { label: t('detail.labels.units'), value: project.units, icon: FolderOpen },
            { label: t('detail.labels.value'), value: project.priceRange, dotClassName: "bg-emerald-500" },
          ]} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <AppSection title={td('narrative.title')} description={td('aiInsights.subtitle')}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    {project.description} This asset represents a prime opportunity in {project.area}, {project.city}. 
                    Developed by {project.developer}, it adheres to the highest standards of architectural excellence.
                  </p>
                </div>
              </AppSection>

              <AppSection title={td('aiInsights.title')}>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: td('aiInsights.roi'), value: "12.4%", icon: TrendingUp, color: "text-emerald-500" },
                    { label: td('aiInsights.velocity'), value: "85%", icon: BarChart3, color: "text-blue-500" },
                    { label: td('aiInsights.confidence'), value: "98%", icon: Share2, color: "text-amber-500" },
                  ].map((insight) => (
                    <div key={insight.label} className="rounded-2xl border border-zinc-100 p-5 dark:border-white/5 bg-zinc-50/30 dark:bg-white/[0.01]">
                      <div className="flex items-center justify-between mb-3">
                        <insight.icon className={cn("h-4 w-4", insight.color)} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{insight.label}</span>
                      </div>
                      <p className="text-xl font-black text-zinc-900 dark:text-white">{insight.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl bg-zinc-900 p-4 dark:bg-white">
                  <p className="text-[10px] font-medium leading-relaxed text-zinc-400 dark:text-zinc-500">
                    {td('aiInsights.summary')}
                  </p>
                </div>
              </AppSection>
            </div>

            <div className="space-y-6 lg:col-span-4">
              <AppSection title={td('registry.title')}>
                <div className="space-y-4">
                  {[
                    { label: td('registry.planNo'), value: "1024/B" },
                    { label: td('registry.plotNo'), value: "42-45" },
                    { label: td('registry.postalIdentity'), value: "12345-6789" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</span>
                      <span className="text-[10px] font-black text-zinc-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </AppSection>

              <AppSection title={td('rega.title')}>
                <div className="rounded-2xl bg-amber-50/50 p-4 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-400">{td('rega.authNo')}</p>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-500">REGA-8829-01</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-amber-600/60">{td('rega.expires', { date: '2027-12-12' })}</p>
                </div>
              </AppSection>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <AppSection title={td('inventory.title')} description={td('inventory.subtitle')} actions={<AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{td('inventory.addUnit')}</AppPrimaryButton>}>
            <AppDataTable columns={unitColumns} data={units} getRowKey={(u) => u.id} />
          </AppSection>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <AppSection title={td('documents.title')} description={td('documents.subtitle')}>
            <ResourceMediaUploader
              organizationId={account.organization.id ?? undefined}
              resourceType="project"
              resourceId={project.id}
              pendingFiles={[]}
              onPendingFilesChange={() => undefined}
              immediate
              labels={{ title: td('documents.title'), description: td('documents.subtitle') }}
            />
          </AppSection>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <AppStatsGrid stats={salesStats} />
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AppSection title={td('sales.reports.title')}>
              <div className="space-y-3">
                {[
                  "Monthly Absorption Report - April 2026",
                  "Revenue Forecast Q3-Q4",
                  "Broker Performance Ledger",
                ].map((report) => (
                  <div key={report} className="flex items-center justify-between rounded-xl border border-zinc-100 p-4 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-zinc-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">{report}</span>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white">{td('actions.view')}</button>
                  </div>
                ))}
              </div>
              <AppPrimaryButton className="mt-6 w-full">{td('sales.reports.downloadAll')}</AppPrimaryButton>
            </AppSection>

            <AppSection title={td('aiInsights.title')} description="Market Sentiment Analysis">
              <div className="flex h-full flex-col justify-center py-8 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-zinc-100 dark:text-white/5" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Sentiment remains strong. Absorption velocity is 12% above market average for {project.area}.
                </p>
              </div>
            </AppSection>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <AppSection title="Lifecycle Events" description={td('activity.subtitle')}>
            <div className="space-y-6">
              {[
                { event: "Inventory Synced", actor: "System", date: "2h ago", icon: History },
                { event: "Price Updated", actor: "Sarah Ahmed", date: "1d ago", icon: Edit },
                { event: "Media Vault Approved", actor: "Institutional Node", date: "3d ago", icon: Share2 },
                { event: "Project Created", actor: account.user.name, date: "1w ago", icon: Plus },
              ].map((log) => (
                <div key={log.event} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/[0.02]">
                    <log.icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="flex-1 border-b border-zinc-50 pb-4 dark:border-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{log.event}</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{log.date}</span>
                    </div>
                    <p className="mt-1 text-[10px] font-medium uppercase text-zinc-500">By {log.actor}</p>
                  </div>
                </div>
              ))}
            </div>
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
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deleteProjectRequest(account.organization.id, project.id);
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

export function ProjectFormScreen({ id }: { id?: string }) {
  const t = useTranslations('Projects');
  const common = useTranslations('Common');
  const account = useAccountContext();
  const existing = useProjectQuery(account.organization.id ?? undefined, id ?? "") as Project | null | undefined;
  const router = useRouter();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const existingType = projectCategories.includes(existing?.type as ProjectFormValues["type"]) ? existing?.type as ProjectFormValues["type"] : "Residential";
  const existingUnitTypes = (existing?.unitTypes ?? []).filter((type): type is ProjectFormValues["unitTypes"][number] =>
    projectOfferingTypes.includes(type as ProjectFormValues["unitTypes"][number]),
  );

  const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: existing?.name ?? "",
      developer: existing?.developer ?? "",
      city: existing?.city ?? "",
      area: existing?.area ?? "",
      type: existingType,
      unitTypes: existingUnitTypes,
      status: existing?.status ?? "draft" as ProjectStatus,
      units: String(existing?.units ?? 0),
      priceRange: existing?.priceRange ?? "",
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
      units: String(existing.units ?? 0),
      priceRange: existing.priceRange ?? "",
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
      if (!account.organization.id) throw new Error("Select an organization first.");
      const result = existing
        ? await updateProjectRequest(account.organization.id, existing.id, data)
        : await createProjectRequest(account.organization.id, data);
      const nextId = result.project.id;
      if (pendingFiles.length > 0) {
        await uploadAndAttachMedia({
          organizationId: account.organization.id,
          resourceType: "project",
          resourceId: nextId,
          files: pendingFiles,
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

  return (
    <AppPageShell maxWidth="wide" contentClassName="space-y-6">
      <AppPageHeader
        eyebrow={t("form.eyebrow")}
        title={existing ? t("form.editTitle") : t("form.createTitle")}
        subtitle={t("form.subtitle")}
        className="pb-8"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,760px)_380px] xl:items-start xl:justify-center">
        <ProjectFormPreview form={form} />

        <section className="order-1 rounded-[32px] border border-zinc-100 bg-white p-4 shadow-sm shadow-zinc-950/[0.03] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none md:p-6">
          <ProjectFormProgress step={step} labels={[t("form.stepInformation"), t("form.stepGallery"), t("form.stepDetails")]} />
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
                    organizationId={account.organization.id ?? undefined}
                    resourceType="project"
                    resourceId={existing?.id}
                    pendingFiles={pendingFiles}
                    onPendingFilesChange={setPendingFiles}
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
                      unsupported: t("form.galleryUnsupported"),
                    }}
                    className="border-zinc-100 bg-zinc-50/40 shadow-none dark:border-white/[0.06] dark:bg-white/[0.01]"
                  />
                </ProjectWizardPanel>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectWizardPanel title={t("form.detailsTitle")} description={t("form.detailsDesc")}>
                  <div className="space-y-6">
                    <ChoiceGrid id="type" label={t("form.typeLabel")} value={form.type} onChange={(value) => setField("type", value)} columns="grid-cols-3" options={[{ value: "Residential", label: t("types.Residential") }, { value: "Commercial", label: t("types.Commercial") }, { value: "Mixed Use", label: t("types.Mixed Use") }]} error={fieldErrors.type} />
                    <OfferingMixGrid value={form.unitTypes ?? []} onToggle={toggleUnitType} label={t("form.offeringMixLabel")} />
                    <ChoiceGrid id="status" label={t("form.statusLabel")} value={form.status} onChange={(value) => setField("status", value)} columns="grid-cols-2 md:grid-cols-4" options={[{ value: "draft", label: t("toolbar.filters.draft") }, { value: "pending", label: t("toolbar.filters.pending") }, { value: "approved", label: t("toolbar.filters.approved") }, { value: "rejected", label: t("toolbar.filters.rejected") }]} error={fieldErrors.status} />
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
    <div className="rounded-[24px] border border-zinc-100 bg-zinc-50/70 p-3 dark:border-white/10 dark:bg-white/[0.025]">
      <div className="grid grid-cols-3 gap-2">
        {labels.map((label, index) => {
          const isDone = index + 1 < step;
          const isActive = index + 1 === step;
          return (
            <div key={label} className={cn("rounded-2xl px-3 py-2 transition-all", isActive ? "bg-white shadow-sm shadow-zinc-950/[0.03] dark:bg-[#0A0A0A]" : "bg-transparent")}>
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

function ProjectFormPreview({ form }: { form: ProjectFormValues }) {
  const t = useTranslations("Projects");

  return (
    <aside className="order-2 space-y-4 xl:sticky xl:top-24">
      <article className="overflow-hidden rounded-[32px] border border-zinc-100 bg-white shadow-sm shadow-zinc-950/[0.03] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none">
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
          <p className="min-h-16 text-sm font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">{form.description || t("form.previewDescription")}</p>
        </div>
      </article>

      <div className="rounded-[28px] border border-zinc-100 bg-white p-5 shadow-sm shadow-zinc-950/[0.02] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.previewChecklist")}</p>
        <div className="mt-4 grid gap-2">
          {[
            [t("form.nameLabel"), form.name],
            [t("form.cityLabel"), form.city],
            [t("form.unitsLabel"), form.units],
            [t("form.offeringMixLabel"), form.unitTypes?.length ? String(form.unitTypes.length) : ""],
            [t("form.descLabel"), form.description],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
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

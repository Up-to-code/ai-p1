"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Building2, Copy, Edit, FileText, FolderOpen, History, MapPin, Plus, Share2, Trash2, TrendingUp, UploadCloud } from "lucide-react";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppSection,
  AppStatsGrid,
  AppThumbnailCell,
  AppToolbar,
  type AppDataTableColumn,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/routing";
import { useProjectsStore } from "@/domains/projects";
import { usePropertiesStore } from "@/domains/properties";
import type { Project, ProjectStatus } from "../store/projects.types";
import { projectSchema, type ProjectFormValues } from "../validation/project.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { SearchBox, StatusPill, TextInput, ChoiceGrid, DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormErrorSummary, WizardActions } from "@/components/shared/crud-ui";
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
        <Image src={project.image} alt={project.name} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover opacity-80 grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" />
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
  const { projects, filter, search, view, setFilter, setSearch, setView, deleteProject } = useProjectsStore();
  const [deleting, setDeleting] = useState<Project | null>(null);
  const deleteOperation = useOperationState({ errorMessage: "Project delete failed." });

  useUrlListState({
    filter,
    search,
    view,
    setFilter,
    setSearch,
    setView,
    defaultFilter: "all",
    defaultView: "grid",
    validFilters: projectFilters,
    validViews: projectViews,
  });

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesFilter = filter === "all" || project.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [project.name, project.reference, project.city, project.developer].some((value) => value.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  }), [projects, filter, search]);

  const columns: AppDataTableColumn<Project>[] = [
    {
      key: "name",
      header: t('form.nameLabel'),
      render: (project) => (
        <AppThumbnailCell src={project.image} alt={project.name} title={project.name} meta={<span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{project.city}</span>} />
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
        { label: t('stats.size'), value: projects.length, icon: FolderOpen },
        { label: t('stats.approved'), value: projects.filter((project) => project.status === "approved").length, dotClassName: "bg-emerald-500" },
        { label: t('stats.review'), value: projects.filter((project) => project.status === "pending").length, dotClassName: "bg-amber-500" },
        { label: t('stats.drafts'), value: projects.filter((project) => project.status === "draft").length, icon: Copy },
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
        onViewChange={setView}
        sortLabel={t('toolbar.newest')}
        trailing={<SearchBox value={search} onChange={setSearch} placeholder={t('toolbar.search')} name="project-search" ariaLabel="Search projects" />}
      />

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => <ProjectTile key={project.id} project={project} onDelete={setDeleting} />)}
        </div>
      ) : (
        <AppDataTable columns={columns} data={filteredProjects} getRowKey={(project) => project.id} />
      )}

      {filteredProjects.length === 0 && <EmptyWorkspace icon={FolderOpen} title={t('empty.title')} description={t('empty.desc')} />}
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
          deleteProject(deleting.id);
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
  const project = useProjectsStore((state) => state.getById(id));
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const allUnits = usePropertiesStore((state) => state.units);
  const units = useMemo(() => allUnits.filter(u => u.project === project?.name), [allUnits, project?.name]);
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
            <Image src={project.image} alt={project.name} fill priority sizes="100vw" className="object-cover grayscale" />
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
          <AppSection title={td('documents.title')} description={td('documents.subtitle')} actions={<UploadDialog />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: 'commercial', label: t('detail.docs.items.commercial'), size: "2.4 MB", type: "PDF" },
                { id: 'titleDeed', label: t('detail.docs.items.titleDeed'), size: "1.8 MB", type: "PDF" },
                { id: 'mediaPack', label: t('detail.docs.items.mediaPack'), size: "450 MB", type: "ZIP" },
                { id: 'architectural', label: "Architectural Plans", size: "12 MB", type: "DWG" },
              ].map((doc) => (
                <div key={doc.id} className="group relative rounded-2xl border border-zinc-100 p-5 dark:border-white/5 transition-all hover:border-zinc-300 dark:hover:border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/[0.02]">
                      <FileText className="h-5 w-5 text-zinc-400" />
                    </div>
                    <StatusPill label={td('documents.readyForDeployment')} tone="success" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{doc.label}</p>
                    <div className="mt-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                { event: "Project Created", actor: "Ahmed Mansour", date: "1w ago", icon: Plus },
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
          deleteProject(project.id);
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

function UploadDialog() {
  const t = useTranslations('Projects');
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"><UploadCloud className="me-2 h-3.5 w-3.5" />{t('detail.docs.upload')}</Button>} />
      <DialogContent className="max-w-lg rounded-[32px] border-zinc-100 bg-white p-8 shadow-none dark:border-white/5 dark:bg-[#0A0A0A]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('upload.title')}</DialogTitle>
          <DialogDescription className="text-xs font-medium uppercase leading-relaxed tracking-tight">{t('upload.desc')}</DialogDescription>
        </DialogHeader>
        <div 
          className="rounded-[24px] border border-dashed border-zinc-200 p-10 text-center dark:border-white/10 transition-colors hover:border-zinc-400 dark:hover:border-white/20"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              console.log(`Dropped ${files.length} files.`);
            }
          }}
        >
          <UploadCloud className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('upload.drop')}</p>
        </div>
        <DialogFooter>
          <AppPrimaryButton>{t('upload.attach')}</AppPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectFormScreen({ id }: { id?: string }) {
  const t = useTranslations('Projects');
  const existing = useProjectsStore((state) => (id ? state.getById(id) : undefined));
  const createProject = useProjectsStore((state) => state.createProject);
  const updateProject = useProjectsStore((state) => state.updateProject);
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: existing?.name ?? "",
      developer: existing?.developer ?? "",
      city: existing?.city ?? "",
      area: existing?.area ?? "",
      type: existing?.type ?? "Residential",
      image: existing?.image ?? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
      status: existing?.status ?? "draft" as ProjectStatus,
      units: String(existing?.units ?? 0),
      priceRange: existing?.priceRange ?? "",
      description: existing?.description ?? "",
    },
  });

  const form = useWatch({ control }) as ProjectFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ProjectFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Project save failed." });

  const setField = (key: keyof ProjectFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };

  const onSubmit = handleSubmit((data) => {
    saveOperation.run(() => {
      const payload = { ...data, units: Number(data.units), syncState: existing?.syncState ?? "draft" as const };
      if (existing) {
        updateProject(existing.id, payload);
        return existing.id;
      }
      return createProject(payload).id;
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
    <AppPageShell maxWidth="default">
      <div className="mx-auto max-w-2xl pt-10">
        <AppPageHeader 
          eyebrow={t('form.eyebrow')} 
          title={existing ? t('form.editTitle') : t('form.createTitle')} 
          subtitle={t('form.subtitle')}
          className="border-none pb-0 mb-12"
        />
        
        {/* Institutional Progress Tracking */}
        <div className="mb-12 flex items-center gap-4">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5">
            <div 
              className="h-full bg-zinc-900 transition-all duration-700 ease-out dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.1)]" 
              style={{ width: `${(step / totalSteps) * 100}%` }} 
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {step} <span className="opacity-30">/</span> {totalSteps}
          </span>
        </div>

        <div className="space-y-12 pb-20">
          <FormErrorSummary errors={fieldErrors} />
          
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AppSection title="Identity & Ownership" description="Define the fundamental metadata for this real estate asset.">
                  <div className="space-y-6">
                    <TextInput name="name" label={t('form.nameLabel')} value={form.name} onChange={(value) => setField("name", value)} placeholder="Al Madinah Residences…" error={fieldErrors.name} />
                    <TextInput name="developer" label={t('form.devLabel')} value={form.developer} onChange={(value) => setField("developer", value)} placeholder="Acme Development…" error={fieldErrors.developer} />
                  </div>
                </AppSection>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AppSection title="Location & Logistics" description="Specify the geographic coordinates and operational scale.">
                  <div className="grid gap-6 md:grid-cols-2">
                    <TextInput name="city" label={t('form.cityLabel')} value={form.city} onChange={(value) => setField("city", value)} placeholder="Riyadh…" error={fieldErrors.city} />
                    <TextInput name="area" label={t('form.areaLabel')} value={form.area} onChange={(value) => setField("area", value)} placeholder="Al Malqa…" error={fieldErrors.area} />
                    <TextInput name="units" label={t('form.unitsLabel')} type="number" inputMode="numeric" value={form.units} onChange={(value) => setField("units", value)} error={fieldErrors.units} />
                    <TextInput name="priceRange" label={t('form.priceLabel')} value={form.priceRange} onChange={(value) => setField("priceRange", value)} placeholder="850K SAR…" error={fieldErrors.priceRange} />
                  </div>
                </AppSection>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AppSection title="Context & Aesthetics" description="Finalize the asset classification and visual representation.">
                  <div className="space-y-8">
                    <ChoiceGrid id="type" label={t('form.typeLabel')} value={form.type} onChange={(value) => setField("type", value)} columns="grid-cols-3" options={[{ value: "Residential", label: t('types.Residential') }, { value: "Commercial", label: t('types.Commercial') }, { value: "Mixed Use", label: t('types.Mixed Use') }]} error={fieldErrors.type} />
                    <ChoiceGrid id="status" label={t('form.statusLabel')} value={form.status} onChange={(value) => setField("status", value)} columns="grid-cols-2 md:grid-cols-4" options={[{ value: "draft", label: t('toolbar.filters.draft') }, { value: "pending", label: t('toolbar.filters.pending') }, { value: "approved", label: t('toolbar.filters.approved') }, { value: "rejected", label: t('toolbar.filters.rejected') }]} error={fieldErrors.status} />
                    <TextInput name="image" label={t('form.imageLabel')} type="url" value={form.image} onChange={(value) => setField("image", value)} placeholder="https://images.unsplash.com/…" error={fieldErrors.image} />
                    <div className="grid gap-2">
                      <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('form.descLabel')}</label>
                      <Textarea id="description" name="description" value={form.description} onChange={(event) => setField("description", event.target.value)} className="min-h-[140px] rounded-3xl border-zinc-100 bg-zinc-50/50 p-6 text-sm font-medium transition-all focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-white/5 dark:bg-white/[0.02]" />
                    </div>
                  </div>
                </AppSection>
              </div>
            )}
          </div>

          <WizardActions 
            onNext={nextStep} 
            onBack={prevStep} 
            isLastStep={step === totalSteps}
            isSubmitting={saveOperation.isRunning || isSubmitting}
            className="mt-12"
          />
        </div>
      </div>
    </AppPageShell>
  );
}

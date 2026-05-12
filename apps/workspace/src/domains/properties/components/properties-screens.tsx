"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { Bath, Bed, Building, CheckCircle2, Edit, FileText, FolderOpen, Home, ImageIcon, Mail, MapPin, Phone, Plus, Ruler, Search, Trash2, UserPlus, Users } from "lucide-react";
import {
  AppTabsList,
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppStatsGrid,
  AppThumbnailCell,
  AppToolbar,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import { getOrganizationCapabilities } from "@/domains/organization/api/better-auth-organization";
import { linkClientUnitRequest, unlinkClientUnitRequest, useClientOptionsQuery, usePropertyClientLinksQuery } from "@/domains/clients/api/clients";
import { createPropertyRequest, deletePropertyRequest, PROPERTIES_PAGE_SIZE, updatePropertyRequest, usePropertiesIndexQuery, usePropertyQuery } from "../api/properties";
import { useProjectOptionsQuery } from "@/domains/projects/api/projects";
import { ResourceMediaUploader } from "@/domains/media/components/resource-media-uploader";
import { uploadAndAttachMedia } from "@/domains/media/api/media";
import type { PropertyStatus, PropertyUnit } from "../store/properties.types";
import { propertySchema, type PropertyFormValues } from "../validation/property.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { ChoiceGrid, DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormErrorSummary, HttpQueryState, ProgressiveLoadingState, SearchBox, StatusPill, TextInput, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Format a price string with SAR currency */
function formatSAR(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat('en-SA', { style: 'decimal', maximumFractionDigits: 0 }).format(num) + ' SAR';
}

const propertyFilters = ["all", "available", "pending", "reserved", "sold", "draft"] as const;
const propertyViews = ["grid", "list"] as const;
const unitLinkStatuses = ["interested", "shortlisted", "viewing", "offer", "rejected"] as const;
const translatedPropertyTypes = ["Apartment", "Studio", "Villa", "Penthouse", "Compound", "Office", "Retail"] as const;

function statusTone(status: PropertyStatus) {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}

function UnitTile({ unit, onDelete }: { unit: PropertyUnit; onDelete: (unit: PropertyUnit) => void }) {
  const t = useTranslations('Properties');
  return (
    <article className="group overflow-hidden rounded-[24px] border border-zinc-100 bg-white transition-colors hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]">
      <Link href={`/properties/${unit.id}`} className="relative block h-40 w-full overflow-hidden bg-zinc-100 text-start focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:bg-white/5">
        {unit.coverImageUrl ? (
          <Image src={unit.coverImageUrl} alt={unit.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover opacity-80 grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Home className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="truncate text-sm font-black uppercase tracking-tight text-white">{unit.title}</h3>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/60">{unit.project}</p>
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{unit.reference}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.area')}</p>
            <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{unit.area}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.layout')}</p>
            <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{unit.bedrooms}{t('card.beds')} / {unit.bathrooms}{t('card.baths')}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/5">
          <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">{formatSAR(unit.price)}</p>
          <div className="flex items-center gap-2">
            <Link href={`/properties/${unit.id}/edit`} aria-label={`Edit ${unit.title}`} className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:bg-white/5 dark:hover:text-white"><Edit className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            <button type="button" aria-label={`Delete ${unit.title}`} onClick={() => onDelete(unit)} className="text-zinc-300 transition-colors hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertiesWorkspace() {
  const t = useTranslations('Properties');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const [filter, setFilter] = useState<(typeof propertyFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<(typeof propertyViews)[number]>("grid");
  const [deleting, setDeleting] = useState<PropertyUnit | null>(null);
  const deleteOperation = useOperationState({ errorMessage: "Unit delete failed." });
  useUrlListState({
    filter,
    search,
    view,
    setFilter,
    setSearch,
    setView: (next) => setView(next as (typeof propertyViews)[number]),
    defaultFilter: "all",
    defaultView: "grid",
    validFilters: propertyFilters,
    validViews: propertyViews,
  });
  const unitsQuery = usePropertiesIndexQuery(workspaceOrganizationId, {
    status: filter === "all" ? undefined : filter,
    search,
  });
  const stats = unitsQuery.stats;
  const units = useMemo(() => unitsQuery.results as PropertyUnit[], [unitsQuery.results]);
  const isLoading = isWorkspaceReady && unitsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || unitsQuery.queryStatus === "error";
  const filteredUnits = useMemo(() => units.filter((unit) => {
    const q = search.trim().toLowerCase();
    return !q || [unit.title, unit.project, unit.city, unit.reference].some((value) => value.toLowerCase().includes(q));
  }), [units, search]);

  const columns: AppDataTableColumn<PropertyUnit>[] = [
    { key: "title", header: t('form.nameLabel'), render: (unit) => <AppThumbnailCell src={unit.coverImageUrl} alt={unit.title} title={unit.title} meta={<span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{unit.city}</span>} /> },
    { key: "reference", header: t('detail.labels.type') !== '' ? 'Ref.' : '' },
    { key: "status", header: t('form.statusLabel'), render: (unit) => <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} /> },
    { key: "project", header: t('detail.labels.project'), render: (unit) => <span className="block max-w-[180px] truncate">{unit.project}</span> },
    { key: "area", header: t('detail.labels.area') },
    { key: "price", header: t('detail.labels.price') },
    { key: "actions", header: "", align: "end", render: (unit) => <div className="flex justify-end gap-1"><Link href={`/properties/${unit.id}/edit`} aria-label={`Edit ${unit.title}`} className="p-2 text-zinc-300 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:text-white"><Edit className="h-3.5 w-3.5" aria-hidden="true" /></Link><button type="button" aria-label={`Delete ${unit.title}`} onClick={(event) => { event.stopPropagation(); setDeleting(unit); }} className="p-2 text-zinc-300 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button></div> },
  ];

  return (
    <AppPageShell>
      <AppPageHeader eyebrow={t('eyebrow')} title={t('title') + "."} actions={<Link href="/properties/create"><AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{t('add')}</AppPrimaryButton></Link>} />
      <AppStatsGrid stats={[
        { label: t('stats.size'), value: stats?.total ?? "...", icon: FolderOpen },
        { label: t('stats.available'), value: stats?.available ?? "...", dotClassName: "bg-emerald-500" },
        { label: t('stats.pending'), value: stats?.pending ?? "...", dotClassName: "bg-amber-500" },
        { label: t('stats.drafts'), value: stats?.draft ?? "...", icon: Home },
      ]} />
      <AppToolbar
        filters={[
          { value: "all", label: t('toolbar.filters.all') },
          { value: "available", label: t('toolbar.filters.available') },
          { value: "pending", label: t('toolbar.filters.pending') },
          { value: "reserved", label: t('toolbar.filters.reserved') },
          { value: "sold", label: t('toolbar.filters.sold') },
          { value: "draft", label: t('toolbar.filters.draft') },
        ]}
        activeFilter={filter}
        onFilterChange={(next) => setFilter(next as "all" | PropertyStatus)}
        view={view}
        onViewChange={(next) => setView(next as (typeof propertyViews)[number])}
        sortLabel={t('toolbar.priceHigh')}
        trailing={<SearchBox value={search} onChange={setSearch} placeholder={t('toolbar.search')} name="unit-search" ariaLabel="Search units" />}
      />
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} />
      ) : isQueryBlocked ? (
        <HttpQueryState query={unitsQuery} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUnits.map((unit) => <UnitTile key={unit.id} unit={unit} onDelete={setDeleting} />)}
        </div>
      ) : (
        <AppDataTable columns={columns} data={filteredUnits} getRowKey={(unit) => unit.id} />
      )}
      {isWorkspaceReady && !isQueryBlocked && filteredUnits.length === 0 && <EmptyWorkspace icon={Home} title={t('empty.title')} description={t('empty.desc')} />}
      {isWorkspaceReady && !isQueryBlocked && filteredUnits.length > 0 && (
        <InfiniteScrollSentinel
          status={unitsQuery.status}
          loadMore={unitsQuery.loadMore}
          pageSize={PROPERTIES_PAGE_SIZE}
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
        description={t('delete.desc', { name: deleting?.title ?? "..." })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!deleting || !units.some((unit) => unit.id === deleting.id)) {
            throw new Error("This unit is no longer available.");
          }
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deletePropertyRequest(account.organization.id, deleting.id);
        }, {
          successMessage: "Unit deleted.",
          onSuccess: () => setDeleting(null),
        })}
      />
    </AppPageShell>
  );
}

export function PropertyDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Properties');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const unit = usePropertyQuery(workspaceOrganizationId, id) as PropertyUnit | null | undefined;
  const propertyClientLinksQuery = usePropertyClientLinksQuery(workspaceOrganizationId, id);
  const propertyClientLinks = useMemo(() => propertyClientLinksQuery ?? [], [propertyClientLinksQuery]);
  const clientOptions = useClientOptionsQuery(workspaceOrganizationId) ?? [];
  const [pendingMediaFiles, setPendingMediaFiles] = useState<File[]>([]);
  const [pendingDocumentFiles, setPendingDocumentFiles] = useState<File[]>([]);
  const [isClientLinkOpen, setIsClientLinkOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientToLink, setClientToLink] = useState("");
  const [clientLinkStatus, setClientLinkStatus] = useState<(typeof unitLinkStatuses)[number]>("interested");
  const [clientLinkNotes, setClientLinkNotes] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const deleteOperation = useOperationState({ errorMessage: "Unit delete failed." });
  const linkOperation = useOperationState({ errorMessage: "Client link failed." });
  const queryDebug = {
    resourceType: "property",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };

  if (workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} /></AppPageShell>;
  }

  if (unit === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} /></AppPageShell>;
  }

  if (unit === null) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/properties" backLabel={t('detail.back')} /></AppPageShell>;
  }

  const recordFields = [
    { label: t('detail.labels.city'), value: unit.city, icon: MapPin },
    { label: t('detail.labels.type'), value: translatedPropertyTypes.includes(unit.type as (typeof translatedPropertyTypes)[number]) ? t(`types.${unit.type}`) : unit.type, icon: Home },
    { label: t('detail.labels.purpose'), value: t(`purposes.${unit.purpose}`), icon: CheckCircle2 },
    { label: t('detail.labels.price'), value: formatSAR(unit.price), icon: FolderOpen },
  ];
  const specFields = [
    { label: t('detail.labels.project'), value: unit.project, icon: Building },
    { label: t('detail.labels.area'), value: unit.area, icon: Ruler },
    { label: t('detail.labels.beds'), value: unit.bedrooms, icon: Bed },
    { label: t('detail.labels.baths'), value: unit.bathrooms, icon: Bath },
  ];
  const linkedClientIds = new Set(propertyClientLinks.map(({ link }) => String(link.clientId)));
  const clientSearchQuery = clientSearch.trim().toLowerCase();
  const availableClients = clientOptions.filter((client) => !linkedClientIds.has(client.id));
  const filteredAvailableClients = clientSearchQuery
    ? availableClients.filter((client) => client.name.toLowerCase().includes(clientSearchQuery))
    : availableClients;
  const selectedClientName = clientOptions.find((client) => client.id === clientToLink)?.name;
  const linkSelectedClient = () => {
    if (!clientToLink) return;
    void linkOperation.run(async () => {
      if (!workspaceOrganizationId) throw new Error("Select an organization first.");
      await linkClientUnitRequest(workspaceOrganizationId, clientToLink, unit.id, clientLinkStatus, clientLinkNotes);
      setClientToLink("");
      setClientSearch("");
      setClientLinkNotes("");
      setIsClientLinkOpen(false);
    }, { successMessage: t('detail.linkedClients.linked') });
  };

  return (
    <AppPageShell contentClassName="space-y-6 pb-16">
      <section className="rounded-[28px] border border-zinc-100 bg-white p-5 text-start dark:border-white/5 dark:bg-[#0A0A0A] md:p-6">
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 dark:border-white/5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-400">
              <span>{unit.reference}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-300" />
              <span>{unit.project}</span>
            </div>
            <h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight text-zinc-950 dark:text-white md:text-4xl">
              {unit.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} />
              <StatusPill label={t(`purposes.${unit.purpose}`)} tone="neutral" />
              <span className="rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:bg-white/[0.04]">{formatSAR(unit.price)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link href={`/properties/${unit.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-100 bg-white px-4 text-xs font-bold text-zinc-900 transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              <Edit className="me-2 h-3.5 w-3.5" />{t('detail.edit')}
            </Link>
            <Button variant="ghost" onClick={() => setDeleting(true)} className="h-10 rounded-xl px-4 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">
              <Trash2 className="me-2 h-3.5 w-3.5" />{t('detail.delete')}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <div className="overflow-hidden rounded-[24px] border border-zinc-100 bg-zinc-50 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="relative aspect-[16/9] min-h-[260px]">
              {unit.coverImageUrl ? (
                <Image src={unit.coverImageUrl} alt={unit.title} fill priority sizes="(max-width: 1280px) 100vw, 720px" className="object-cover grayscale" />
              ) : (
                <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
                  <Home className="h-12 w-12" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                <p className="max-w-3xl text-lg font-black leading-7 md:text-xl">{unit.description}</p>
              </div>
            </div>
          </div>

          <aside className="rounded-[24px] border border-zinc-100 bg-zinc-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-3">
              {specFields.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl bg-white p-4 text-start dark:bg-[#0A0A0A]">
                  <Icon className="h-4 w-4 text-zinc-300" />
                  <p className="mt-4 text-[11px] font-bold text-zinc-400">{label}</p>
                  <p className="mt-1 truncate text-base font-black text-zinc-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-2xl bg-zinc-950 p-4 text-white dark:bg-white dark:text-zinc-950">
              <p className="text-[11px] font-bold opacity-60">{t('detail.valueTitle')}</p>
              <p className="mt-2 text-2xl font-black">{formatSAR(unit.price)}</p>
              <p className="mt-3 text-xs font-semibold leading-5 opacity-60">{t('detail.valueDesc')}</p>
            </div>
          </aside>
        </div>
      </section>

      <Tabs defaultValue="overview" className="space-y-5">
        <AppTabsList tabs={[
          { value: "overview", label: t('detail.tabs.overview'), icon: Home },
          { value: "media", label: t('detail.tabs.media'), icon: ImageIcon },
          { value: "files", label: t('detail.tabs.files'), icon: FileText },
          { value: "clients", label: t('detail.tabs.clients'), icon: Users },
        ]} />

        <TabsContent value="overview" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[24px] border border-zinc-100 bg-white p-5 text-start dark:border-white/5 dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-zinc-400">{t('detail.recordSubtitle')}</p>
                <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">{t('detail.recordTitle')}</h2>
              </div>
              <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {recordFields.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Icon className="h-4 w-4" />
                    <p className="text-[11px] font-bold">{label}</p>
                  </div>
                  <p className="mt-3 truncate text-sm font-black text-zinc-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-zinc-100 bg-white p-5 text-start dark:border-white/5 dark:bg-[#0A0A0A]">
            <p className="text-xs font-bold text-zinc-400">{t('detail.readinessTitle')}</p>
            <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">{t('detail.readinessScore')}</h2>
            <div className="mt-5 space-y-3">
              {[
                [t('detail.readiness.media'), Boolean(unit.coverImageUrl)],
                [t('detail.readiness.description'), Boolean(unit.description)],
                [t('detail.readiness.commercial'), Boolean(unit.price && unit.area)],
              ].map(([label, active]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{label}</span>
                  <span className={cn("h-2.5 w-2.5 rounded-full", active ? "bg-emerald-500" : "bg-zinc-300")} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="rounded-[24px] border border-zinc-100 bg-white p-5 text-start dark:border-white/5 dark:bg-[#0A0A0A]">
          <ResourceMediaUploader
            organizationId={workspaceOrganizationId}
            resourceType="property"
            resourceId={unit.id}
            pendingFiles={pendingMediaFiles}
            onPendingFilesChange={setPendingMediaFiles}
            allowedKinds={["image", "video"]}
            maxVideos={1}
            immediate
            labels={{
              title: t('detail.mediaTitle'),
              description: t('detail.mediaDesc'),
              pick: t('detail.mediaPick'),
              unsupported: t('detail.mediaUnsupported'),
            }}
          />
        </TabsContent>

        <TabsContent value="files" className="rounded-[24px] border border-zinc-100 bg-white p-5 text-start dark:border-white/5 dark:bg-[#0A0A0A]">
          <ResourceMediaUploader
            organizationId={workspaceOrganizationId}
            resourceType="property"
            resourceId={unit.id}
            pendingFiles={pendingDocumentFiles}
            onPendingFilesChange={setPendingDocumentFiles}
            allowedKinds={["document"]}
            immediate
            labels={{
              title: t('detail.filesTitle'),
              description: t('detail.filesDesc'),
              pick: t('detail.filesPick'),
              unsupported: t('detail.filesUnsupported'),
            }}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <section className="rounded-[24px] border border-zinc-100 bg-white p-5 text-start dark:border-white/5 dark:bg-[#0A0A0A]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-400">{t('detail.linkedClients.subtitle')}</p>
                <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">{t('detail.linkedClients.title')}</h2>
              </div>
              <Button type="button" onClick={() => setIsClientLinkOpen(true)} className="h-10 rounded-xl px-4 text-xs font-bold">
                <UserPlus className="me-2 h-3.5 w-3.5" />
                {t('detail.linkedClients.linkClient')}
              </Button>
            </div>

            {linkOperation.error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-950/50 dark:bg-red-950/20">{linkOperation.error}</p>}

            {propertyClientLinksQuery === undefined ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.04]" />)}
              </div>
            ) : propertyClientLinks.length === 0 ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-zinc-200 p-8 text-center dark:border-white/10">
                <Users className="mx-auto h-8 w-8 text-zinc-300" />
                <p className="mt-3 text-sm font-black text-zinc-900 dark:text-white">{t('detail.linkedClients.emptyTitle')}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-400">{t('detail.linkedClients.emptyDesc')}</p>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {propertyClientLinks.map(({ link, client }) => (
                  <article key={link.id} className="rounded-[22px] border border-zinc-100 bg-zinc-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {client ? (
                          <Link href={`/clients/${client.id}`} className="block truncate text-base font-black text-zinc-950 hover:underline dark:text-white">{client.name}</Link>
                        ) : (
                          <p className="text-base font-black text-zinc-400">{t('detail.linkedClients.unavailable')}</p>
                        )}
                        <p className="mt-1 truncate text-xs font-bold text-zinc-400">{client ? client.type : link.clientId}</p>
                      </div>
                      <StatusPill label={t(`detail.linkedClients.statuses.${link.status}`)} tone="info" />
                    </div>
                    {client && (
                      <div className="mt-4 space-y-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        <p className="flex min-w-0 items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0 text-zinc-300" /><span className="truncate">{client.contact}</span></p>
                        <p className="flex min-w-0 items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-zinc-300" /><span className="truncate">{client.phone}</span></p>
                      </div>
                    )}
                    {link.notes && <p className="mt-4 rounded-2xl border border-zinc-100 bg-white p-3 text-xs font-semibold text-zinc-500 dark:border-white/5 dark:bg-[#0A0A0A] dark:text-zinc-400">{link.notes}</p>}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={linkOperation.isRunning}
                      onClick={() => void linkOperation.run(() => {
                        if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                        return unlinkClientUnitRequest(workspaceOrganizationId, link.clientId, unit.id);
                      }, { successMessage: t('detail.linkedClients.unlinked') })}
                      className="mt-4 h-10 w-full rounded-xl text-xs font-bold text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="me-2 h-3.5 w-3.5" />
                      {t('detail.linkedClients.unlink')}
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      <Dialog open={isClientLinkOpen} onOpenChange={(open) => {
        setIsClientLinkOpen(open);
        if (!open) {
          setClientSearch("");
          setClientToLink("");
        }
      }}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-hidden rounded-[28px] border-zinc-100 bg-white p-0 text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
          <DialogHeader className="border-b border-zinc-100 p-5 pe-14 text-start dark:border-white/5">
            <DialogTitle className="text-xl font-black text-zinc-950 dark:text-white">{t('detail.linkedClients.modalTitle')}</DialogTitle>
            <DialogDescription className="text-sm font-semibold text-zinc-400">{t('detail.linkedClients.modalDesc')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 border-b border-zinc-100 p-5 dark:border-white/5 md:grid-cols-[minmax(0,1fr)_180px]">
            <label className="relative block">
              <span className="sr-only">{t('detail.linkedClients.search')}</span>
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder={t('detail.linkedClients.search')}
                className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 ps-10 pe-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:border-white/20"
              />
            </label>
            <label className="block text-start">
              <span className="text-[11px] font-bold text-zinc-400">{t('detail.linkedClients.linkStatus')}</span>
              <select
                value={clientLinkStatus}
                onChange={(event) => setClientLinkStatus(event.target.value as (typeof unitLinkStatuses)[number])}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-sm font-bold text-zinc-900 outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              >
                {unitLinkStatuses.map((status) => <option key={status} value={status}>{t(`detail.linkedClients.statuses.${status}`)}</option>)}
              </select>
            </label>
            <label className="block text-start md:col-span-2">
              <span className="text-[11px] font-bold text-zinc-400">{t('detail.linkedClients.notes')}</span>
              <input
                value={clientLinkNotes}
                onChange={(event) => setClientLinkNotes(event.target.value)}
                placeholder={t('detail.linkedClients.notes')}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-sm font-bold text-zinc-900 outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
            </label>
          </div>

          <div className="max-h-[46vh] overflow-y-auto p-5">
            {clientOptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">{t('detail.linkedClients.noClients')}</div>
            ) : filteredAvailableClients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">{t('detail.linkedClients.noResults')}</div>
            ) : (
              <div className="grid gap-2">
                {filteredAvailableClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setClientToLink(client.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-start transition",
                      clientToLink === client.id
                        ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                        : "border-zinc-100 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/[0.05]",
                    )}
                  >
                    <span className="min-w-0 truncate text-sm font-black">{client.name}</span>
                    <span className="text-[11px] font-bold opacity-50">{client.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 p-5 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="truncate text-xs font-bold text-zinc-400">{selectedClientName ? t('detail.linkedClients.selected', { name: selectedClientName }) : t('detail.linkedClients.noneSelected')}</p>
            <Button type="button" disabled={!clientToLink || linkOperation.isRunning} onClick={linkSelectedClient} className="h-10 rounded-xl px-5 text-xs font-bold">
              <UserPlus className="me-2 h-3.5 w-3.5" />
              {t('detail.linkedClients.link')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteRecordDialog
        open={deleting}
        onOpenChange={(open) => {
          if (!open) deleteOperation.clearError();
          setDeleting(open);
        }}
        title={t('delete.title')}
        description={t('delete.desc', { name: unit.title })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!workspaceOrganizationId) throw new Error("Select an organization first.");
          return deletePropertyRequest(workspaceOrganizationId, unit.id);
        }, {
          successMessage: "Unit deleted.",
          onSuccess: () => {
            setDeleting(false);
            router.push("/properties");
          },
        })}
      />
    </AppPageShell>
  );
}

export function PropertyFormScreen({ id }: { id?: string }) {
  const t = useTranslations('Properties');
  const common = useTranslations('Common');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const existing = usePropertyQuery(workspaceOrganizationId, id ?? "") as PropertyUnit | null | undefined;
  const projects = useProjectOptionsQuery(workspaceOrganizationId) ?? [];
  const router = useRouter();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const queryDebug = {
    resourceType: "property",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const capabilitiesQuery = useReactQuery({
    queryKey: ["organization-capabilities", workspaceOrganizationId],
    queryFn: () => getOrganizationCapabilities(workspaceOrganizationId!),
    enabled: Boolean(workspaceOrganizationId),
  });
  const canManageVisibility = capabilitiesQuery.data?.canManageVisibility ?? false;
  const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyFormValues>,
    defaultValues: {
      title: existing?.title ?? "",
      projectId: existing?.projectId ?? "",
      project: existing?.project ?? "",
      city: existing?.city ?? "",
      type: existing?.type ?? "Apartment",
      status: existing?.status ?? "draft" as PropertyStatus,
      visibility: existing?.visibility ?? "private",
      purpose: existing?.purpose ?? "sale" as PropertyUnit["purpose"],
      price: existing?.price ?? "",
      area: existing?.area ?? "",
      bedrooms: String(existing?.bedrooms ?? 1),
      bathrooms: String(existing?.bathrooms ?? 1),
      description: existing?.description ?? "",
    },
  });
  const form = useWatch({ control }) as PropertyFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof PropertyFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Unit save failed." });

  useEffect(() => {
    if (!existing) return;
    reset({
      title: existing.title ?? "",
      projectId: existing.projectId ?? "",
      project: existing.project ?? "",
      city: existing.city ?? "",
      type: existing.type ?? "Apartment",
      status: existing.status ?? "draft",
      visibility: existing.visibility ?? "private",
      purpose: existing.purpose ?? "sale",
      price: existing.price ?? "",
      area: existing.area ?? "",
      bedrooms: String(existing.bedrooms ?? 1),
      bathrooms: String(existing.bathrooms ?? 1),
      description: existing.description ?? "",
    });
  }, [existing, reset]);

  const setField = (key: keyof PropertyFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };
  const onSubmit = handleSubmit((data) => {
    saveOperation.run(async () => {
      if (!workspaceOrganizationId) throw new Error("Select an organization first.");
      const selectedProject = projects.find((project) => project.id === data.projectId);
      const payload = {
        ...data,
        projectId: selectedProject?.id ?? data.projectId,
        project: selectedProject?.name ?? data.project,
      };
      const result = existing
        ? await updatePropertyRequest(workspaceOrganizationId, existing.id, payload)
        : await createPropertyRequest(workspaceOrganizationId, payload);
      const nextId = result.property.id;
      if (pendingFiles.length > 0) {
        await uploadAndAttachMedia({
          organizationId: workspaceOrganizationId,
          resourceType: "property",
          resourceId: nextId,
          files: pendingFiles,
        });
      }
      return nextId;
    }, {
      successMessage: existing ? "Unit saved." : "Unit created.",
      onSuccess: (nextId) => router.push(`/properties/${nextId}`),
    });
  });

  const selectedProject = projects.find((project) => project.id === form.projectId);
  const previewProjectName = selectedProject?.name ?? form.project;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else onSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  if (id && workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} /></AppPageShell>;
  }

  if (id && existing === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} /></AppPageShell>;
  }

  if (id && existing === null) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/properties" backLabel={t('detail.back')} /></AppPageShell>;
  }

  return (
    <AppPageShell maxWidth="wide" contentClassName="space-y-6">
      <AppPageHeader
        eyebrow={t('form.eyebrow')}
        title={existing ? t('form.editTitle') : t('form.createTitle')}
        subtitle={t('form.subtitle')}
        className="pb-8"
      />
      <form
        className="grid gap-6 xl:grid-cols-[minmax(0,760px)_380px] xl:items-start xl:justify-center"
        onSubmit={(event) => {
          event.preventDefault();
          nextStep();
        }}
      >
        <PropertyFormPreview form={form} projectName={previewProjectName} pendingFileCount={pendingFiles.length} existing={existing} />

        <section className="order-1 rounded-[32px] border border-zinc-100 bg-white p-4 shadow-sm shadow-zinc-950/[0.03] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none md:p-6">
          <PropertyFormProgress step={step} labels={[t("form.stepInformation"), t("form.stepGallery"), t("form.stepDetails")]} />
          <FormErrorSummary errors={fieldErrors} />

          <div className="mt-6 min-h-[360px]">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PropertyWizardPanel title={t("form.informationTitle")} description={t("form.informationDesc")}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput name="title" label={t('form.nameLabel')} value={form.title} onChange={(value) => setField("title", value)} placeholder="Unit A-101…" error={fieldErrors.title} />
                    <div className="grid gap-2">
                      <label htmlFor="project" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('form.projectLabel')}</label>
                      <select
                        id="project"
                        name="project"
                        value={form.projectId || ""}
                        onChange={(e) => {
                          const selected = projects.find((project) => project.id === e.target.value);
                          setField("projectId", e.target.value);
                          setField("project", selected?.name ?? "");
                        }}
                        className="h-12 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-black uppercase tracking-tight text-zinc-900 outline-none transition-all focus:border-zinc-900/10 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-white/5 dark:bg-white/[0.02] dark:text-white dark:focus:border-white/10 dark:focus:bg-white/[0.04] dark:focus:ring-white/5 rtl:text-right"
                        aria-invalid={Boolean(fieldErrors.project)}
                        aria-describedby={fieldErrors.project ? 'project-error' : undefined}
                      >
                        <option value="">— Select project —</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {fieldErrors.project && <p id="project-error" className="text-[10px] font-bold text-red-600 rtl:text-right">{fieldErrors.project}</p>}
                    </div>
                    <TextInput name="city" label={t('form.cityLabel')} value={form.city} onChange={(value) => setField("city", value)} placeholder="Riyadh…" error={fieldErrors.city} />
                    <TextInput name="area" label={t('form.areaLabel')} value={form.area} onChange={(value) => setField("area", value)} placeholder="120 m2…" error={fieldErrors.area} />
                    <TextInput name="price" label={t('form.priceLabel')} value={form.price} onChange={(value) => setField("price", value)} placeholder="850,000…" error={fieldErrors.price} className="md:col-span-2" />
                  </div>
                </PropertyWizardPanel>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PropertyWizardPanel title={t("form.galleryTitle")} description={t("form.galleryDesc")}>
                  <ResourceMediaUploader
                    organizationId={workspaceOrganizationId}
                    resourceType="property"
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
                </PropertyWizardPanel>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PropertyWizardPanel title={t("form.detailsTitle")} description={t("form.detailsDesc")}>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextInput name="bedrooms" label={t('form.bedsLabel')} type="number" inputMode="numeric" value={form.bedrooms} onChange={(value) => setField("bedrooms", value)} error={fieldErrors.bedrooms} />
                      <TextInput name="bathrooms" label={t('form.bathsLabel')} type="number" inputMode="numeric" value={form.bathrooms} onChange={(value) => setField("bathrooms", value)} error={fieldErrors.bathrooms} />
                    </div>
                    <ChoiceGrid id="type" label={t('form.typeLabel')} value={form.type} onChange={(value) => setField("type", value)} columns="grid-cols-2 md:grid-cols-4" options={[{ value: "Apartment", label: t('types.Apartment') }, { value: "Villa", label: t('types.Villa') }, { value: "Penthouse", label: t('types.Penthouse') }, { value: "Office", label: t('types.Office') }]} error={fieldErrors.type} />
                    <ChoiceGrid id="purpose" label={t('form.purposeLabel')} value={form.purpose} onChange={(value) => setField("purpose", value)} columns="grid-cols-2" options={[{ value: "sale", label: t('purposes.sale') }, { value: "rent", label: t('purposes.rent') }]} error={fieldErrors.purpose} />
                    <ChoiceGrid id="status" label={t('form.statusLabel')} value={form.status} onChange={(value) => setField("status", value)} columns="grid-cols-2 md:grid-cols-5" options={[{ value: "draft", label: t('toolbar.filters.draft') }, { value: "available", label: t('toolbar.filters.available') }, { value: "pending", label: t('toolbar.filters.pending') }, { value: "reserved", label: t('toolbar.filters.reserved') }, { value: "sold", label: t('toolbar.filters.sold') }]} error={fieldErrors.status} />
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
                      <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('form.descLabel')}</label>
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
                </PropertyWizardPanel>
              </div>
            )}
          </div>

          <PropertyWizardActions
            onNext={nextStep}
            onBack={prevStep}
            nextLabel={step === totalSteps ? common("finish") : common("next")}
            backLabel={common("back")}
            isFirstStep={step === 1}
            isSubmitting={saveOperation.isRunning || isSubmitting}
          />
        </section>
      </form>
    </AppPageShell>
  );
}

function PropertyFormProgress({ step, labels }: { step: number; labels: string[] }) {
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

function PropertyWizardPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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

function PropertyWizardActions({
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

function PropertyFormPreview({
  form,
  projectName,
  pendingFileCount,
  existing,
}: {
  form: PropertyFormValues;
  projectName?: string;
  pendingFileCount: number;
  existing?: PropertyUnit | null;
}) {
  const t = useTranslations("Properties");
  const previewTitle = form.title || t("form.previewName");
  const previewProject = projectName || t("form.previewProject");
  const previewCity = form.city || t("form.previewCity");
  const mediaReady = pendingFileCount > 0 || Boolean(existing?.coverImageUrl || existing?.image);

  const checklist = [
    { label: t("form.nameLabel"), ready: Boolean(form.title) },
    { label: t("form.projectLabel"), ready: Boolean(projectName || form.project) },
    { label: t("form.priceLabel"), ready: Boolean(form.price) },
    { label: t("form.previewMedia"), ready: mediaReady },
    { label: t("form.descLabel"), ready: Boolean(form.description) },
  ];

  return (
    <aside className="order-2 space-y-4 xl:sticky xl:top-24">
      <article className="overflow-hidden rounded-[32px] border border-zinc-100 bg-white shadow-sm shadow-zinc-950/[0.03] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none">
        <div className="relative h-72 bg-zinc-950">
          {existing?.coverImageUrl || existing?.image ? (
            <Image
              src={existing.coverImageUrl || existing.image || ""}
              alt={existing.title}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              className="object-cover opacity-80 grayscale"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_45%)]" />
          )}
          <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/70 backdrop-blur">{form.type || t("types.Apartment")}</span>
            <StatusPill label={t(`toolbar.filters.${form.status || "draft"}`)} tone={statusTone(form.status || "draft")} />
          </div>
          <div className="flex h-full w-full items-center justify-center text-white/15">
            <Home className="h-12 w-12" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/45">{previewCity}</p>
            <h2 className="mt-2 line-clamp-2 text-3xl font-black uppercase tracking-tight text-white">{previewTitle}</h2>
            <p className="mt-2 truncate text-xs font-bold text-white/60">{previewProject}</p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <PropertyPreviewMetric label={t("detail.labels.price")} value={form.price ? formatSAR(form.price) : "850K SAR"} />
            <PropertyPreviewMetric label={t("detail.labels.area")} value={form.area || "120 m2"} />
            <PropertyPreviewMetric label={t("detail.labels.beds")} value={form.bedrooms || "1"} />
            <PropertyPreviewMetric label={t("detail.labels.baths")} value={form.bathrooms || "1"} />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
              {form.purpose ? t(`purposes.${form.purpose}`) : t("purposes.sale")}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
              {form.type ? t(`types.${form.type}`) : t("types.Apartment")}
            </span>
            {pendingFileCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <ImageIcon className="h-3 w-3" />
                {pendingFileCount}
              </span>
            )}
          </div>
          <p className="min-h-16 text-sm font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">{form.description || t("form.previewDescription")}</p>
        </div>
      </article>

      <div className="rounded-[28px] border border-zinc-100 bg-white p-5 shadow-sm shadow-zinc-950/[0.02] dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.previewChecklist")}</p>
        <div className="mt-4 grid gap-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{item.label}</span>
              <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full", item.ready ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-200 text-zinc-400 dark:bg-white/10")}>
                {item.ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function PropertyPreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/[0.025]">
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-2 truncate text-lg font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

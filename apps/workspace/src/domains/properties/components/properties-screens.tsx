"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { Bath, Bed, Building, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Download, Edit, Eye, FileText, FolderOpen, Home, ImageIcon, Loader2, Mail, MapPin, Phone, Plus, Ruler, Search, Star, Trash2, Unlink, UploadCloud, UserPlus, Users, Video, type LucideIcon } from "lucide-react";
import {
  AppSection,
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import { getOrganizationCapabilities } from "@/domains/organization/api/better-auth-organization";
import { CLIENTS_PAGE_SIZE, linkClientUnitRequest, unlinkClientUnitRequest, useClientsPagedQuery, usePropertyClientLinksQuery } from "@/domains/clients/api/clients";
import { createPropertyRequest, deletePropertyRequest, PROPERTIES_PAGE_SIZE, updatePropertyRequest, usePropertiesIndexQuery, usePropertyQuery } from "../api/properties";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { ResourceMediaUploader } from "@/domains/media/components/resource-media-uploader";
import { deleteMediaRequest, setMediaCoverRequest, uploadAndAttachMedia, useResourceMediaQuery } from "@/domains/media/api/media";
import type { PropertyStatus, PropertyUnit } from "../store/properties.types";
import { propertySchema, type PropertyFormValues } from "../validation/property.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormErrorSummary, HttpQueryState, ProgressiveLoadingState, SearchBox, StatusPill, TextInput, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { UtilityLipsUtility } from "@/lib/utils/utility-lips";

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
type PropertyMediaAsset = NonNullable<ReturnType<typeof useResourceMediaQuery>>[number];

function statusTone(status: PropertyStatus) {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}

function linkStatusTone(status: (typeof unitLinkStatuses)[number]) {
  if (status === "offer") return "success";
  if (status === "viewing" || status === "shortlisted") return "info";
  if (status === "rejected") return "danger";
  return "neutral";
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

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 KB";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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

function PropertyInfoTile({ icon: Icon, label, value }: { icon: LucideIcon; label: ReactNode; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
      <span className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <p className="mt-3 truncate text-sm font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function PropertyLinkedClientCard({
  link,
  client,
  onOpen,
  onEdit,
  onUnlink,
  disabled,
}: {
  link: {
    id: string;
    clientId: string;
    status: (typeof unitLinkStatuses)[number];
    notes?: string | null;
  };
  client?: {
    id: string;
    name: string;
    contact: string;
    phone: string;
    type: string;
  } | null;
  onOpen: () => void;
  onEdit: () => void;
  onUnlink: () => void;
  disabled?: boolean;
}) {
  const t = useTranslations('Properties');
  const initial = client?.name.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <article className="rounded-[24px] border border-zinc-100 bg-white p-4 text-start transition-colors hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpen}
          disabled={!client}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-black uppercase text-white transition-colors enabled:hover:bg-zinc-800 disabled:cursor-default dark:bg-white dark:text-zinc-950 dark:enabled:hover:bg-zinc-200"
        >
          {initial}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={t(`detail.linkedClients.statuses.${link.status}`)} tone={linkStatusTone(link.status)} />
            <span className="rounded-full bg-zinc-50 px-2.5 py-1 text-[10px] font-black text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">
              {client ? client.type : link.clientId}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpen}
            disabled={!client}
            className="mt-3 block max-w-full truncate text-start text-sm font-black text-zinc-950 enabled:hover:underline disabled:cursor-default dark:text-white"
          >
            {client ? client.name : t('detail.linkedClients.unavailable')}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('detail.linkedClients.quickEdit')}
            disabled={disabled}
            onClick={onEdit}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.05] dark:hover:text-white"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('detail.linkedClients.unlink')}
            disabled={disabled}
            onClick={onUnlink}
            className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/25"
          >
            <Unlink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {client && (
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="flex min-w-0 items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-2.5 text-start text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{client.contact}</span>
          </button>
          <button
            type="button"
            onClick={onOpen}
            className="flex min-w-0 items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-2.5 text-start text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{client.phone}</span>
          </button>
        </div>
      )}
      {link.notes && <p className="mt-3 line-clamp-2 border-t border-zinc-100 pt-3 text-xs font-semibold leading-5 text-zinc-500 dark:border-white/5">{link.notes}</p>}
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
        <WorkspaceQueryState status={workspaceStatus} variant={view === "grid" ? "grid" : "table"} />
      ) : isQueryBlocked ? (
        <HttpQueryState query={unitsQuery} variant={view === "grid" ? "grid" : "table"} />
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
  const propertyClientLinksQuery = usePropertyClientLinksQuery(workspaceOrganizationId, unit?.id);
  const propertyClientLinks = useMemo(() => propertyClientLinksQuery ?? [], [propertyClientLinksQuery]);
  const [pendingMediaFiles, setPendingMediaFiles] = useState<File[]>([]);
  const [pendingDocumentFiles, setPendingDocumentFiles] = useState<File[]>([]);
  const [isClientLinkOpen, setIsClientLinkOpen] = useState(false);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState<number | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientToLink, setClientToLink] = useState("");
  const [clientLinkStatus, setClientLinkStatus] = useState<(typeof unitLinkStatuses)[number]>("interested");
  const [clientLinkNotes, setClientLinkNotes] = useState("");
  const [clientLinkEdit, setClientLinkEdit] = useState<{
    clientId: string;
    clientName: string;
    status: (typeof unitLinkStatuses)[number];
    notes: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const mediaQuery = useResourceMediaQuery(workspaceOrganizationId, "property", unit?.id);
  const mediaAssets = useMemo(() => mediaQuery ?? [], [mediaQuery]);
  const galleryAssets = useMemo(() => mediaAssets.filter((asset) => asset.kind === "image" || asset.kind === "video"), [mediaAssets]);
  const documentAssets = useMemo(() => mediaAssets.filter((asset) => asset.kind === "document"), [mediaAssets]);
  const clientCandidatesQuery = useClientsPagedQuery(isClientLinkOpen ? workspaceOrganizationId : undefined, { search: clientSearch });
  const clientCandidates = clientCandidatesQuery.results;
  const router = useRouter();
  const deleteOperation = useOperationState({ errorMessage: "Unit delete failed." });
  const linkOperation = useOperationState({ errorMessage: "Client link failed." });
  const mediaOperation = useOperationState({ errorMessage: "Media action failed." });
  const queryDebug = {
    resourceType: "property",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };

  if (workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} variant="detail" /></AppPageShell>;
  }

  if (unit === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} variant="detail" /></AppPageShell>;
  }

  if (unit === null) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/properties" backLabel={t('detail.back')} /></AppPageShell>;
  }

  const optionItems = [
    { label: t('detail.labels.area'), value: unit.area, icon: Ruler },
    { label: t('detail.labels.beds'), value: unit.bedrooms, icon: Bed },
    { label: t('detail.labels.baths'), value: unit.bathrooms, icon: Bath },
    { label: t('detail.labels.city'), value: unit.city, icon: MapPin },
    { label: t('detail.labels.project'), value: unit.project, icon: Building },
    { label: t('detail.labels.type'), value: translatedPropertyTypes.includes(unit.type as (typeof translatedPropertyTypes)[number]) ? t(`types.${unit.type}`) : unit.type, icon: Home },
    { label: t('detail.labels.price'), value: formatSAR(unit.price), icon: FolderOpen },
    { label: t('form.statusLabel'), value: t(`toolbar.filters.${unit.status}`), icon: CheckCircle2 },
    { label: t('detail.labels.purpose'), value: t(`purposes.${unit.purpose}`), icon: FolderOpen },
  ];
  const linkedClientIds = new Set(propertyClientLinks.map(({ link }) => String(link.clientId)));
  const filteredAvailableClients = clientCandidates.filter((client) => !linkedClientIds.has(client.id));
  const selectedClientName = clientCandidates.find((client) => client.id === clientToLink)?.name;
  const activeMedia = mediaViewerIndex === null ? null : galleryAssets[mediaViewerIndex] ?? null;
  const previewGallery = galleryAssets.slice(0, 5);
  const hiddenGalleryCount = Math.max(0, galleryAssets.length - previewGallery.length);
  const latestDocuments = documentAssets.slice(0, 3);
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
  const saveClientLinkEdit = () => {
    if (!clientLinkEdit) return;
    void linkOperation.run(async () => {
      if (!workspaceOrganizationId) throw new Error("Select an organization first.");
      await linkClientUnitRequest(workspaceOrganizationId, clientLinkEdit.clientId, unit.id, clientLinkEdit.status, clientLinkEdit.notes);
      setClientLinkEdit(null);
    }, { successMessage: t('detail.linkedClients.linked') });
  };
  const openMediaViewer = (asset: PropertyMediaAsset) => {
    const index = galleryAssets.findIndex((item) => item._id === asset._id);
    if (index >= 0) setMediaViewerIndex(index);
  };
  const moveMediaViewer = (direction: -1 | 1) => {
    setMediaViewerIndex((current) => {
      if (current === null || galleryAssets.length === 0) return current;
      return (current + direction + galleryAssets.length) % galleryAssets.length;
    });
  };

  return (
    <AppPageShell contentClassName="space-y-6 pb-14">
      <Tabs defaultValue="overview" className="space-y-6">
        <section className="border-b border-zinc-200/70 pb-4 text-start dark:border-white/10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                <span>{unit.project}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-400/70" />
                <span>{unit.reference}</span>
              </div>
              <h1 className="max-w-5xl text-2xl font-black leading-tight text-zinc-950 dark:text-white md:text-3xl">
                {unit.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} />
                <StatusPill label={t(`purposes.${unit.purpose}`)} tone="neutral" />
                <span className="inline-flex h-8 items-center rounded-full bg-zinc-950 px-3 text-xs font-black text-white dark:bg-white dark:text-zinc-950">{formatSAR(unit.price)}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 xl:justify-end">
              <Link href={`/properties/${unit.id}/edit`} className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-transparent px-3 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5">
                <Edit className="me-2 h-3.5 w-3.5" />{t('detail.edit')}
              </Link>
              <Button variant="ghost" onClick={() => setDeleting(true)} className="h-9 rounded-xl px-3 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/25">
                <Trash2 className="me-2 h-3.5 w-3.5" />{t('detail.delete')}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <AppTabsList
              className="gap-8"
              tabs={[
                { value: "overview", label: t('detail.tabs.overview'), icon: Home },
                { value: "media", label: t('detail.tabs.media'), icon: ImageIcon },
                { value: "files", label: t('detail.tabs.files'), icon: FileText },
                { value: "clients", label: t('detail.tabs.clients'), icon: Users },
              ]}
            />
          </div>
        </section>
        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-5">
            <AppSection contentClassName="space-y-5">
              <PropertyGalleryPreview
                assets={previewGallery}
                hiddenCount={hiddenGalleryCount}
                isLoading={mediaQuery === undefined}
                onOpen={openMediaViewer}
                onAdd={() => setIsMediaUploadOpen(true)}
              />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {optionItems.map(({ label, value, icon }) => (
                  <PropertyInfoTile key={label} icon={icon} label={label} value={value} />
                ))}
              </div>
              <section className="border-t border-zinc-200/70 pt-5 text-start dark:border-white/10" data-property-description-section>
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('form.descLabel')}</p>
                <p className="mt-2 max-w-4xl text-sm font-semibold leading-7 text-zinc-700 dark:text-zinc-300">{unit.description}</p>
              </section>
            </AppSection>
            <PropertyLegalSummary unit={unit} documents={latestDocuments} documentCount={documentAssets.length} />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4" data-property-media-tab>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-start">
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('detail.tabs.media')}</p>
              <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-white">{t('detail.mediaTitle')}</h2>
            </div>
            <Button type="button" onClick={() => setIsMediaUploadOpen(true)} className="h-9 rounded-xl px-3 text-xs font-bold">
              <UploadCloud className="me-2 h-3.5 w-3.5" />
              {t('detail.mediaPick')}
            </Button>
          </div>
          <PropertyMediaGrid assets={galleryAssets} isLoading={mediaQuery === undefined} onOpen={openMediaViewer} onSetCover={(asset) => void mediaOperation.run(() => setMediaCoverRequest(asset.organizationId, asset._id), { successMessage: "Cover updated." })} onDelete={(asset) => void mediaOperation.run(() => deleteMediaRequest(asset.organizationId, asset._id), { successMessage: "Media deleted." })} />
          {mediaOperation.error && <p className="text-xs font-bold text-red-500">{mediaOperation.error}</p>}
        </TabsContent>

        <TabsContent value="files" className="space-y-4" data-property-files-tab>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-start">
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('detail.tabs.files')}</p>
              <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-white">{t('detail.filesTitle')}</h2>
            </div>
            <Button type="button" onClick={() => setIsDocumentUploadOpen(true)} className="h-9 rounded-xl px-3 text-xs font-bold">
              <UploadCloud className="me-2 h-3.5 w-3.5" />
              {t('detail.filesPick')}
            </Button>
          </div>
          <PropertyDocumentList documents={documentAssets} isLoading={mediaQuery === undefined} onDelete={(asset) => void mediaOperation.run(() => deleteMediaRequest(asset.organizationId, asset._id), { successMessage: "Media deleted." })} />
          {mediaOperation.error && <p className="text-xs font-bold text-red-500">{mediaOperation.error}</p>}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <AppSection
            title={t('detail.linkedClients.title')}
            description={t('detail.linkedClients.subtitle')}
            actions={(
              <Button type="button" onClick={() => setIsClientLinkOpen(true)} className="h-9 rounded-xl px-3 text-xs font-bold">
                <UserPlus className="me-2 h-3.5 w-3.5" />
                {t('detail.linkedClients.linkClient')}
              </Button>
            )}
          >

            {linkOperation.error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-950/50 dark:bg-red-950/20">{linkOperation.error}</p>}

            {propertyClientLinksQuery === undefined ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-property-linked-clients-loading>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-44 animate-pulse rounded-[24px] bg-zinc-100 dark:bg-white/[0.04]" />
                ))}
              </div>
            ) : propertyClientLinks.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-zinc-300/80 py-8 text-center dark:border-white/15">
                <Users className="mx-auto h-8 w-8 text-zinc-300" />
                <p className="mt-3 text-sm font-black text-zinc-900 dark:text-white">{t('detail.linkedClients.emptyTitle')}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-400">{t('detail.linkedClients.emptyDesc')}</p>
                <Button type="button" onClick={() => setIsClientLinkOpen(true)} className="mt-5 h-9 rounded-xl px-4 text-xs font-bold">
                  <UserPlus className="me-2 h-3.5 w-3.5" />
                  {t('detail.linkedClients.linkClient')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-property-linked-clients-table>
                {propertyClientLinks.map(({ link, client }) => (
                  <PropertyLinkedClientCard
                    key={link.id}
                    link={{ ...link, clientId: String(link.clientId) }}
                    client={client}
                    disabled={linkOperation.isRunning}
                    onOpen={() => {
                      if (client) router.push(`/clients/${client.id}`);
                    }}
                    onEdit={() => setClientLinkEdit({
                      clientId: String(link.clientId),
                      clientName: client?.name ?? t('detail.linkedClients.unavailable'),
                      status: link.status,
                      notes: link.notes ?? "",
                    })}
                    onUnlink={() => void linkOperation.run(() => {
                      if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                      return unlinkClientUnitRequest(workspaceOrganizationId, link.clientId, unit.id);
                    }, { successMessage: t('detail.linkedClients.unlinked') })}
                  />
                ))}
              </div>
            )}
          </AppSection>
        </TabsContent>
      </Tabs>

      <Dialog open={isClientLinkOpen} onOpenChange={(open) => {
        setIsClientLinkOpen(open);
        if (!open) {
          setClientSearch("");
          setClientToLink("");
        }
      }}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-hidden rounded-2xl border-zinc-200 bg-zinc-50 p-0 text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
          <DialogHeader className="border-b border-zinc-200/80 p-4 pe-14 text-start dark:border-white/10">
            <DialogTitle className="text-lg font-black text-zinc-950 dark:text-white">{t('detail.linkedClients.modalTitle')}</DialogTitle>
            <DialogDescription className="text-xs font-semibold text-zinc-500">{t('detail.linkedClients.modalDesc')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 border-b border-zinc-200/80 p-4 dark:border-white/10">
            <label className="relative block">
              <span className="sr-only">{t('detail.linkedClients.search')}</span>
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder={t('detail.linkedClients.search')}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-100/70 ps-10 pe-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:focus:border-white/20"
              />
            </label>
            <div className="text-start" data-client-link-status-chips>
              <span className="text-[11px] font-bold text-zinc-400">{t('detail.linkedClients.linkStatus')}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {unitLinkStatuses.map((status) => {
                  const tone = linkStatusTone(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setClientLinkStatus(status)}
                      className={cn(
                        "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[11px] font-black transition",
                        clientLinkStatus === status
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                          : "border-zinc-200 bg-transparent text-zinc-500 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/[0.04]",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          tone === "success" && "bg-emerald-500",
                          tone === "info" && "bg-blue-500",
                          tone === "danger" && "bg-red-500",
                          tone === "neutral" && "bg-zinc-400",
                        )}
                      />
                      {t(`detail.linkedClients.statuses.${status}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block text-start">
              <span className="text-[11px] font-bold text-zinc-400">{t('detail.linkedClients.notes')}</span>
              <input
                value={clientLinkNotes}
                onChange={(event) => setClientLinkNotes(event.target.value)}
                placeholder={t('detail.linkedClients.notes')}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-100/70 px-3 text-sm font-bold text-zinc-900 outline-none dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
              />
            </label>
          </div>

          <div className="max-h-[46vh] overflow-y-auto p-4" data-client-candidate-paged-list>
            {clientCandidatesQuery.queryStatus === "loading" ? (
              <div className="grid gap-2">
                {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-lg bg-zinc-200/70 dark:bg-white/10" />)}
              </div>
            ) : clientCandidates.length === 0 ? (
              <div className="border-y border-dashed border-zinc-200 py-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">{t('detail.linkedClients.noClients')}</div>
            ) : filteredAvailableClients.length === 0 ? (
              <div className="border-y border-dashed border-zinc-200 py-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">{t('detail.linkedClients.noResults')}</div>
            ) : (
              <div className="grid gap-2">
                {filteredAvailableClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setClientToLink(client.id)}
                    className={cn(
                      "flex min-h-16 items-center justify-between gap-4 rounded-lg border px-4 py-3 text-start transition",
                      clientToLink === client.id
                        ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                        : "border-zinc-100 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/[0.05]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black">{client.name}</span>
                      <span className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-bold opacity-65">
                        <StatusPill label={t(`types.${client.type}`)} tone="neutral" />
                        <span className="truncate">{client.contact}</span>
                        <span className="truncate">{client.phone}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] font-black opacity-55">{client.status}</span>
                  </button>
                ))}
                <InfiniteScrollSentinel
                  status={clientCandidatesQuery.status}
                  loadMore={clientCandidatesQuery.loadMore}
                  pageSize={CLIENTS_PAGE_SIZE}
                  className="py-2"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-zinc-200/80 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p className="truncate text-xs font-bold text-zinc-400">{selectedClientName ? t('detail.linkedClients.selected', { name: selectedClientName }) : t('detail.linkedClients.noneSelected')}</p>
            <Button type="button" disabled={!clientToLink || linkOperation.isRunning} onClick={linkSelectedClient} className="h-10 rounded-xl px-5 text-xs font-bold">
              <UserPlus className="me-2 h-3.5 w-3.5" />
              {t('detail.linkedClients.link')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(clientLinkEdit)} onOpenChange={(open) => {
        if (!open) setClientLinkEdit(null);
      }}>
        <DialogContent className="max-w-xl rounded-2xl border-zinc-200 bg-zinc-50 p-6 text-zinc-900 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
          <DialogHeader className="pe-10 text-start pb-5">
            <DialogTitle className="text-lg font-black">{t('detail.linkedClients.quickEdit')}</DialogTitle>
            <DialogDescription className="mt-2 max-w-lg text-xs font-semibold leading-6 text-zinc-500">
              {clientLinkEdit?.clientName}
            </DialogDescription>
          </DialogHeader>

          {clientLinkEdit && (
            <div className="space-y-5" data-client-link-quick-edit>
              <div className="text-start">
                <span className="text-[11px] font-bold text-zinc-400">{t('detail.linkedClients.linkStatus')}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unitLinkStatuses.map((status) => {
                    const tone = linkStatusTone(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setClientLinkEdit((current) => current ? { ...current, status } : current)}
                        className={cn(
                          "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[11px] font-black transition",
                          clientLinkEdit.status === status
                            ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                            : "border-zinc-200 bg-transparent text-zinc-500 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            tone === "success" && "bg-emerald-500",
                            tone === "info" && "bg-blue-500",
                            tone === "danger" && "bg-red-500",
                            tone === "neutral" && "bg-zinc-400",
                          )}
                        />
                        {t(`detail.linkedClients.statuses.${status}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block text-start">
                <span className="text-[11px] font-bold text-zinc-400">{t('detail.linkedClients.notes')}</span>
                <Textarea
                  value={clientLinkEdit.notes}
                  onChange={(event) => setClientLinkEdit((current) => current ? { ...current, notes: event.target.value } : current)}
                  className="mt-2 min-h-28 rounded-lg border-zinc-200 bg-white text-sm font-semibold dark:border-white/10 dark:bg-white/[0.035]"
                />
              </label>

              {linkOperation.error && <p className="text-xs font-bold text-red-500">{linkOperation.error}</p>}

              <div className="flex flex-col-reverse gap-2 border-t border-zinc-200/70 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setClientLinkEdit(null)} className="h-10 rounded-lg px-4 text-xs font-bold">
                  {t('detail.back')}
                </Button>
                <Button type="button" onClick={saveClientLinkEdit} disabled={linkOperation.isRunning} className="h-10 rounded-lg px-5 text-xs font-bold">
                  <Edit className="me-2 h-3.5 w-3.5" />
                  {t('detail.edit')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={mediaViewerIndex !== null} onOpenChange={(open) => !open && setMediaViewerIndex(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden rounded-2xl border-zinc-200 bg-zinc-950 p-0 text-white dark:border-white/10" overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-sm">
          {activeMedia && (
            <div data-property-media-viewer>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4 pe-14">
                <div className="min-w-0 text-start">
                  <DialogTitle className="truncate text-base font-black text-white">{activeMedia.name}</DialogTitle>
                  <DialogDescription className="mt-1 text-xs font-bold text-white/45">{mediaViewerIndex! + 1} / {galleryAssets.length}</DialogDescription>
                </div>
              </div>
              <div className="relative flex h-[min(68vh,720px)] items-center justify-center bg-black">
                {activeMedia.kind === "image" ? (
                  <Image src={activeMedia.url} alt={activeMedia.name} fill sizes="90vw" className="object-contain" />
                ) : (
                  <video src={activeMedia.url} controls className="h-full w-full object-contain" />
                )}
                {galleryAssets.length > 1 && (
                  <>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveMediaViewer(-1)} className="absolute start-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20">
                      <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveMediaViewer(1)} className="absolute end-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20">
                      <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isMediaUploadOpen} onOpenChange={(open) => {
        setIsMediaUploadOpen(open);
        if (!open) setPendingMediaFiles([]);
      }}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-2xl border-zinc-200 bg-zinc-50 p-6 text-zinc-900 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
          <DialogHeader className="pe-10 text-start pb-5">
            <DialogTitle className="text-lg font-black">{t('detail.mediaTitle')}</DialogTitle>
            <DialogDescription className="mt-2 max-w-xl text-xs font-semibold leading-6 text-zinc-500">{t('detail.mediaDesc')}</DialogDescription>
          </DialogHeader>
          <ResourceMediaUploader
            organizationId={workspaceOrganizationId}
            resourceType="property"
            resourceId={unit.id}
            pendingFiles={pendingMediaFiles}
            onPendingFilesChange={setPendingMediaFiles}
            allowedKinds={["image", "video"]}
            maxVideos={1}
            immediate
            className="mt-2 rounded-none border-0 bg-transparent p-0 dark:border-0 dark:bg-transparent"
            labels={{
              title: t('detail.mediaTitle'),
              description: t('detail.mediaDesc'),
              hideHeader: true,
              hideDropDescription: true,
              pick: t('detail.mediaPick'),
              unsupported: t('detail.mediaUnsupported'),
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isDocumentUploadOpen} onOpenChange={(open) => {
        setIsDocumentUploadOpen(open);
        if (!open) setPendingDocumentFiles([]);
      }}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-2xl border-zinc-200 bg-zinc-50 p-6 text-zinc-900 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
          <DialogHeader className="pe-10 text-start pb-5">
            <DialogTitle className="text-lg font-black">{t('detail.filesTitle')}</DialogTitle>
            <DialogDescription className="mt-2 max-w-xl text-xs font-semibold leading-6 text-zinc-500">{t('detail.filesDesc')}</DialogDescription>
          </DialogHeader>
          <ResourceMediaUploader
            organizationId={workspaceOrganizationId}
            resourceType="property"
            resourceId={unit.id}
            pendingFiles={pendingDocumentFiles}
            onPendingFilesChange={setPendingDocumentFiles}
            allowedKinds={["document"]}
            immediate
            className="mt-2 rounded-none border-0 bg-transparent p-0 dark:border-0 dark:bg-transparent"
            labels={{
              title: t('detail.filesTitle'),
              description: t('detail.filesDesc'),
              hideHeader: true,
              hideDropDescription: true,
              pick: t('detail.filesPick'),
              unsupported: t('detail.filesUnsupported'),
            }}
          />
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

function PropertyGalleryPreview({
  assets,
  hiddenCount,
  isLoading,
  onOpen,
  onAdd,
}: {
  assets: PropertyMediaAsset[];
  hiddenCount: number;
  isLoading: boolean;
  onOpen: (asset: PropertyMediaAsset) => void;
  onAdd: () => void;
}) {
  if (isLoading) {
    return (
      <section className="grid min-h-[320px] gap-2 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-2 dark:border-white/10 dark:bg-white/[0.025] sm:grid-cols-4" data-property-overview-gallery>
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className={cn("animate-pulse rounded-lg bg-zinc-200/80 dark:bg-white/[0.06]", index === 0 ? "min-h-[300px] sm:col-span-2 sm:row-span-2" : "min-h-36")} />)}
      </section>
    );
  }

  if (assets.length === 0) {
    return (
      <section className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-zinc-300/80 bg-zinc-50/70 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.025]" data-property-overview-gallery>
        <div className="max-w-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm shadow-zinc-950/[0.04] dark:bg-white/[0.06] dark:text-zinc-300 dark:shadow-none">
            <ImageIcon className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-black text-zinc-950 dark:text-white">No gallery media yet</p>
          <p className="mt-1 text-xs font-semibold leading-6 text-zinc-500">Add photos or a short video so the unit record has a usable visual reference.</p>
          <Button type="button" onClick={onAdd} className="mt-5 h-9 rounded-lg px-4 text-xs font-bold">
            <UploadCloud className="me-2 h-3.5 w-3.5" />
            Add media
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid min-h-[320px] gap-2 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-2 dark:border-white/10 dark:bg-white/[0.025] sm:grid-cols-4" data-property-overview-gallery>
      {assets.map((asset, index) => {
        const isLarge = index === 0;
        return (
          <button
            key={asset._id}
            type="button"
            onClick={() => onOpen(asset)}
            className={cn(
              "group relative min-h-36 overflow-hidden rounded-lg bg-zinc-100 text-start outline-none ring-1 ring-zinc-200/70 transition focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:bg-white/[0.04] dark:ring-white/10",
              isLarge && "min-h-[300px] sm:col-span-2 sm:row-span-2",
            )}
          >
            {asset.kind === "image" ? (
              <Image src={asset.url} alt={asset.name} fill sizes={isLarge ? "640px" : "320px"} className="object-cover transition duration-300 group-hover:scale-[1.02]" />
            ) : (
              <div className="flex h-full min-h-32 items-center justify-center bg-zinc-950 text-white">
                <Video className="h-8 w-8 opacity-70" />
              </div>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-black text-white">{asset.name}</span>
            {hiddenCount > 0 && index === assets.length - 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-3xl font-black text-white">+{hiddenCount}</span>
            )}
          </button>
        );
      })}
    </section>
  );
}

function PropertyLegalSummary({
  unit,
  documents,
  documentCount,
}: {
  unit: PropertyUnit;
  documents: PropertyMediaAsset[];
  documentCount: number;
}) {
  const t = useTranslations('Properties');

  return (
    <section className="self-start rounded-xl border border-zinc-200/70 bg-zinc-50/70 text-start dark:border-white/10 dark:bg-white/[0.025]" data-property-legal-summary>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/70 p-4 dark:border-white/10">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('detail.legal.title')}</p>
          <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-white">{unit.reference}</h2>
        </div>
        <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} />
      </div>
      <div className="overflow-hidden p-4">
        <table className="w-full text-[11px]">
          <thead className="font-black uppercase tracking-widest text-zinc-400">
            <tr className="border-b border-zinc-200/70 dark:border-white/10">
              <th className="pb-2 text-start">{t('detail.legal.field')}</th>
              <th className="pb-2 text-start">{t('detail.legal.value')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70 font-semibold text-zinc-600 dark:divide-white/10 dark:text-zinc-300">
            <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.legal.reference')}</td><td className="py-2 font-black text-zinc-900 dark:text-white">{unit.reference}</td></tr>
            <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.legal.status')}</td><td className="py-2">{t(`toolbar.filters.${unit.status}`)}</td></tr>
            <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.legal.documents')}</td><td className="py-2">{documentCount}</td></tr>
            {documents.length === 0 ? (
              <tr><td className="py-2 pe-3 text-zinc-400">{t('detail.legal.latest')}</td><td className="py-2">{t('detail.legal.empty')}</td></tr>
            ) : documents.map((document, index) => (
              <tr key={document._id}><td className="py-2 pe-3 text-zinc-400">{t('detail.legal.latestNumber', { number: index + 1 })}</td><td className="py-2">{document.name}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PropertyMediaGrid({
  assets,
  isLoading,
  onOpen,
  onSetCover,
  onDelete,
}: {
  assets: PropertyMediaAsset[];
  isLoading: boolean;
  onOpen: (asset: PropertyMediaAsset) => void;
  onSetCover: (asset: PropertyMediaAsset) => void;
  onDelete: (asset: PropertyMediaAsset) => void;
}) {
  if (isLoading) {
    return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-white/[0.05]" />)}</div>;
  }

  if (assets.length === 0) {
    return <div className="border-y border-dashed border-zinc-300/80 py-8 text-center text-xs font-bold text-zinc-500 dark:border-white/15">No images or videos uploaded yet.</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {assets.map((asset) => (
        <article key={asset._id} className="overflow-hidden rounded-lg border border-zinc-200/70 bg-zinc-50/60 dark:border-white/10 dark:bg-white/[0.025]">
          <button type="button" onClick={() => onOpen(asset)} className="relative flex aspect-video w-full items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-black/30">
            {asset.kind === "image" ? <Image src={asset.url} alt={asset.name} fill sizes="320px" className="object-cover" /> : <Video className="h-8 w-8" />}
            {asset.isCover && <span className="absolute start-2 top-2 rounded-lg bg-white px-2 py-1 text-[9px] font-black text-zinc-900">Cover</span>}
          </button>
          <div className="flex items-center justify-between gap-2 p-3">
            <p className="min-w-0 truncate text-xs font-black text-zinc-700 dark:text-zinc-200">{asset.name}</p>
            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => onOpen(asset)} aria-label={`Preview ${asset.name}`}><Eye className="h-3.5 w-3.5" /></Button>
              {asset.kind === "image" && !asset.isCover && <Button type="button" variant="ghost" size="icon-xs" onClick={() => onSetCover(asset)} aria-label={`Set ${asset.name} as cover`}><Star className="h-3.5 w-3.5" /></Button>}
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => onDelete(asset)} aria-label={`Delete ${asset.name}`} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function PropertyDocumentList({
  documents,
  isLoading,
  onDelete,
}: {
  documents: PropertyMediaAsset[];
  isLoading: boolean;
  onDelete: (asset: PropertyMediaAsset) => void;
}) {
  if (isLoading) {
    return <div className="divide-y divide-zinc-200/70 dark:divide-white/10">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-14 animate-pulse bg-zinc-100 dark:bg-white/[0.04]" />)}</div>;
  }

  if (documents.length === 0) {
    return <div className="border-y border-dashed border-zinc-300/80 py-8 text-center text-xs font-bold text-zinc-500 dark:border-white/15">No documents uploaded yet.</div>;
  }

  return (
    <div className="divide-y divide-zinc-200/70 border-y border-zinc-200/70 dark:divide-white/10 dark:border-white/10">
      {documents.map((document) => (
        <div key={document._id} className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-white/[0.05]"><FileText className="h-4 w-4" /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-zinc-950 dark:text-white">{document.name}</p>
              <p className="mt-0.5 text-[11px] font-bold text-zinc-500">{document.mimeType} · {formatFileSize(document.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a href={document.url} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.05] dark:hover:text-white" aria-label={`Open ${document.name}`}>
              <Download className="h-3.5 w-3.5" />
            </a>
            <Button type="button" variant="ghost" size="icon-xs" onClick={() => onDelete(document)} aria-label={`Delete ${document.name}`} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      ))}
    </div>
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
  const projectsQuery = useProjectOptionsQueryResult(workspaceOrganizationId, { limit: 200 });
  const projects = projectsQuery.data ?? [];
  const router = useRouter();
  const [pendingMediaFiles, setPendingMediaFiles] = useState<File[]>([]);
  const [pendingDocumentFiles, setPendingDocumentFiles] = useState<File[]>([]);
  const queryDebug = {
    resourceType: "property",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const capabilitiesQuery = useReactQuery({
    queryKey: ["organization-capabilities", workspaceOrganizationId],
    queryFn: () => getOrganizationCapabilities(workspaceOrganizationId!),
    enabled: Boolean(workspaceOrganizationId),
  });
  const canManageVisibility = capabilitiesQuery.data?.canManageVisibility ?? false;
  const pendingCoverPreviewUrl = useFirstImagePreviewUrl(pendingMediaFiles);
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
  const stepForPropertyError = (key: keyof PropertyFormValues) => {
    if (["title", "projectId", "project", "city", "price", "area", "bedrooms", "bathrooms"].includes(key)) return 1;
    return 4;
  };

  const onInvalidSubmit = (invalidErrors: FieldErrors<PropertyFormValues>) => {
    const firstError = Object.keys(invalidErrors)[0] as keyof PropertyFormValues | undefined;
    if (firstError) setStep(stepForPropertyError(firstError));
  };

  const onSubmit = handleSubmit(async (data) => {
    await saveOperation.run(async () => {
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
      if (pendingMediaFiles.length > 0) {
        await uploadAndAttachMedia({
          organizationId: workspaceOrganizationId,
          resourceType: "property",
          resourceId: nextId,
          files: pendingMediaFiles,
        });
      }
      if (pendingDocumentFiles.length > 0) {
        await uploadAndAttachMedia({
          organizationId: workspaceOrganizationId,
          resourceType: "property",
          resourceId: nextId,
          files: pendingDocumentFiles,
        });
      }
      return nextId;
    }, {
      successMessage: existing ? "Unit saved." : "Unit created.",
      onSuccess: (nextId) => router.push(`/properties/${nextId}`),
    });
  }, onInvalidSubmit);

  const selectedProject = projects.find((project) => project.id === form.projectId);
  const previewProjectName = selectedProject?.name ?? form.project ?? t("form.standaloneProject");

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
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/properties" backLabel={t('detail.back')} /></AppPageShell>;
  }

  return (
    <AppPageShell maxWidth="wide" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t('form.eyebrow')}
        title={existing ? t('form.editTitle') : t('form.createTitle')}
        subtitle={t('form.subtitle')}
        className="pb-7"
      />
      <form
        className="mx-auto grid w-full max-w-[1160px] gap-6 xl:grid-cols-[minmax(0,760px)_minmax(280px,340px)] xl:items-start xl:justify-center"
        onSubmit={(event) => {
          event.preventDefault();
          nextStep();
        }}
      >
        <PropertyFormPreview form={form} projectName={previewProjectName} pendingMediaCount={pendingMediaFiles.length} pendingDocumentCount={pendingDocumentFiles.length} pendingCoverPreviewUrl={pendingCoverPreviewUrl} existing={existing} />

        <section className="order-1 rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-none dark:border-white/10 dark:bg-[#0B0B0B] md:p-7">
          <PropertyFormProgress step={step} labels={[t("form.stepInformation"), t("form.stepGallery"), t("form.stepDocuments"), t("form.stepDetails")]} />
          <FormErrorSummary errors={fieldErrors} />

          <div className="mt-8 min-h-[410px]">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PropertyWizardPanel title={t("form.informationTitle")} description={t("form.informationDesc")}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <TextInput name="title" label={t('form.nameLabel')} value={form.title} onChange={(value) => setField("title", value)} placeholder="Unit A-101…" error={fieldErrors.title} />
                    <UnitProjectPicker
                      label={t("form.projectLabel")}
                      help={t("form.projectHelp")}
                      value={form.projectId || ""}
                      projectName={previewProjectName}
                      projects={projects}
                      onChange={(project) => {
                        setField("projectId", project?.id ?? "");
                        setField("project", project?.name ?? "");
                      }}
                      error={fieldErrors.project}
                      searchLabel={t("form.projectSearchLabel")}
                      placeholder={t("form.projectPickerPlaceholder")}
                      emptyLabel={t("form.projectPickerEmpty")}
                      noResultsLabel={t("form.projectPickerNoResults")}
                      clearLabel={t("form.projectPickerStandalone")}
                      loadingLabel={t("form.projectPickerLoading")}
                      errorLabel={t("form.projectPickerError")}
                      queryStatus={projectsQuery.queryStatus}
                    />
                    <TextInput name="city" label={t('form.cityLabel')} value={form.city} onChange={(value) => setField("city", value)} placeholder="Riyadh…" error={fieldErrors.city} />
                    <PropertyHelpInput name="area" label={t('form.areaLabel')} help={t("form.areaHelp")} value={form.area} onChange={(value) => setField("area", value)} placeholder="120 m2…" error={fieldErrors.area} />
                    <PropertyHelpInput name="price" label={t('form.priceLabel')} help={t("form.priceHelp")} value={form.price} onChange={(value) => setField("price", value)} placeholder="850,000…" error={fieldErrors.price} className="md:col-span-2" />
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
                      upload: t("form.uploadMedia"),
                      cover: t("gallery.cover"),
                      videoLimit: t("form.galleryVideoLimit"),
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
                </PropertyWizardPanel>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PropertyWizardPanel title={t("form.documentsTitle")} description={t("form.documentsDesc")}>
                  <ResourceMediaUploader
                    organizationId={workspaceOrganizationId}
                    resourceType="property"
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
                      upload: t("form.uploadDocuments"),
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
                </PropertyWizardPanel>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PropertyWizardPanel title={t("form.detailsTitle")} description={t("form.detailsDesc")}>
                  <div className="space-y-7">
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextInput name="bedrooms" label={t('form.bedsLabel')} type="number" inputMode="numeric" value={form.bedrooms} onChange={(value) => setField("bedrooms", value)} error={fieldErrors.bedrooms} />
                      <TextInput name="bathrooms" label={t('form.bathsLabel')} type="number" inputMode="numeric" value={form.bathrooms} onChange={(value) => setField("bathrooms", value)} error={fieldErrors.bathrooms} />
                    </div>
                    <PropertyInlineChoice id="type" label={t('form.typeLabel')} help={t("form.typeHelp")} value={form.type} onChange={(value) => setField("type", value)} options={translatedPropertyTypes.map((type) => ({ value: type, label: t(`types.${type}`) }))} error={fieldErrors.type} />
                    <PropertyInlineChoice id="purpose" label={t('form.purposeLabel')} help={t("form.purposeHelp")} value={form.purpose} onChange={(value) => setField("purpose", value)} options={[{ value: "sale", label: t('purposes.sale') }, { value: "rent", label: t('purposes.rent') }]} error={fieldErrors.purpose} />
                    <PropertyInlineChoice id="status" label={t('form.statusLabel')} help={t("form.statusHelp")} value={form.status} onChange={(value) => setField("status", value)} options={[{ value: "draft", label: t('toolbar.filters.draft') }, { value: "available", label: t('toolbar.filters.available') }, { value: "pending", label: t('toolbar.filters.pending') }, { value: "reserved", label: t('toolbar.filters.reserved') }, { value: "sold", label: t('toolbar.filters.sold') }]} error={fieldErrors.status} />
                    {canManageVisibility && (
                      <PropertyInlineChoice
                        id="visibility"
                        label={t("form.visibilityLabel")}
                        help={t("form.visibilityHelp")}
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

function PropertyFormProgress({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="rounded-[24px] border border-zinc-100 bg-zinc-50/70 p-2 dark:border-white/10 dark:bg-white/[0.025]">
      <div className="grid gap-2 md:grid-cols-4">
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

function PropertyWizardPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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

function PropertyWizardActions({
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

function UnitProjectPicker({
  label,
  help,
  value,
  projectName,
  projects,
  onChange,
  error,
  searchLabel,
  placeholder,
  emptyLabel,
  noResultsLabel,
  clearLabel,
  loadingLabel,
  errorLabel,
  queryStatus,
}: {
  label: string;
  help?: string;
  value: string;
  projectName?: string;
  projects: Array<{ id: string; name: string }>;
  onChange: (project: { id: string; name: string } | null) => void;
  error?: string;
  searchLabel: string;
  placeholder: string;
  emptyLabel: string;
  noResultsLabel: string;
  clearLabel: string;
  loadingLabel: string;
  errorLabel: string;
  queryStatus: "idle" | "loading" | "success" | "error";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedProject = projects.find((project) => project.id === value);
  const selectedName = selectedProject?.name ?? (value ? projectName : undefined);
  const selectedDisplayName = UtilityLipsUtility(selectedName || placeholder);
  const normalizedSearch = search.trim().toLowerCase();
  const isLoading = queryStatus === "loading" || queryStatus === "idle";
  const hasError = queryStatus === "error";
  const filteredProjects = normalizedSearch
    ? projects.filter((project) => project.name.toLowerCase().includes(normalizedSearch))
    : projects;

  return (
    <div className="relative grid gap-2 text-start">
      <PropertyHelpLabel label={label} help={help} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={error ? "project-error" : undefined}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
          if (event.key === "ArrowDown") setIsOpen(true);
        }}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-black uppercase tracking-tight text-zinc-900 outline-none transition-all focus:border-[#0B5CFF]/30 focus:bg-white focus:ring-4 focus:ring-[#0B5CFF]/10 dark:border-white/5 dark:bg-white/[0.02] dark:text-white dark:focus:border-blue-300/20 dark:focus:bg-white/[0.04] dark:focus:ring-blue-300/10 rtl:flex-row-reverse rtl:text-right",
          !selectedName && "text-zinc-400 dark:text-zinc-500",
        )}
      >
        <span className="min-w-0 truncate" title={selectedName || placeholder}>{selectedDisplayName}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg rounded-[28px] border-zinc-200 bg-white p-0 shadow-none dark:border-white/10 dark:bg-[#101010]">
            <DialogHeader className="border-b border-zinc-100 p-5 text-start dark:border-white/10">
              <DialogTitle className="text-lg font-black text-zinc-950 dark:text-white">{label}</DialogTitle>
              <DialogDescription className="text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">{help}</DialogDescription>
            </DialogHeader>
          <div className="border-b border-zinc-100 p-3 dark:border-white/10">
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/70 px-3 dark:border-white/10 dark:bg-white/[0.03] rtl:flex-row-reverse">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchLabel}
                autoFocus
                className="h-9 border-0 bg-transparent px-0 text-sm font-bold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent rtl:text-right"
              />
            </div>
          </div>
          <div className="max-h-[52vh] overflow-y-auto p-2" role="listbox" aria-label={label}>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange(null);
                setSearch("");
                setIsOpen(false);
              }}
              className={cn(
                "mb-1 flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-start text-xs font-black uppercase tracking-tight transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.05] rtl:flex-row-reverse rtl:text-right",
                !value ? "text-[#0B5CFF]" : "text-zinc-600 dark:text-zinc-300",
              )}
            >
              <span className="min-w-0 truncate" title={clearLabel}>{UtilityLipsUtility(clearLabel)}</span>
              {!value && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            </button>
            {isLoading ? (
              <p className="px-3 py-4 text-center text-xs font-bold text-zinc-400">{loadingLabel}</p>
            ) : hasError ? (
              <p className="px-3 py-4 text-center text-xs font-bold text-red-500">{errorLabel}</p>
            ) : projects.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs font-bold text-zinc-400">{emptyLabel}</p>
            ) : filteredProjects.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs font-bold text-zinc-400">{noResultsLabel}</p>
            ) : (
              filteredProjects.map((project) => {
                const active = project.id === value;
                return (
                  <button
                    key={project.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(project);
                      setSearch("");
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-start text-xs font-black uppercase tracking-tight transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.05] rtl:flex-row-reverse rtl:text-right",
                      active ? "text-[#0B5CFF]" : "text-zinc-600 dark:text-zinc-300",
                    )}
                  >
                    <span className="min-w-0 truncate" title={project.name}>{UtilityLipsUtility(project.name)}</span>
                    {active && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
          </DialogContent>
        </Dialog>
      )}
      {error && <p id="project-error" className="text-[10px] font-bold text-red-600 rtl:text-right">{error}</p>}
    </div>
  );
}

function PropertyHelpLabel({ label, help }: { label: string; help?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 rtl:flex-row-reverse rtl:justify-end">
      <span className="max-w-[18rem] truncate" title={label}>{UtilityLipsUtility(label)}</span>
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
            <TooltipContent side="top" className="max-w-80 whitespace-nowrap text-start leading-5">
              {help}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  );
}

function PropertyHelpInput({
  name,
  label,
  help,
  value,
  onChange,
  placeholder,
  error,
  className,
}: {
  name: string;
  label: string;
  help?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 text-start", className)}>
      <PropertyHelpLabel label={label} help={help} />
      <Input
        id={name}
        name={name}
        value={value}
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/50 px-4 text-sm font-black uppercase tracking-tight shadow-none transition-all focus:border-zinc-900/10 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-white/5 dark:bg-white/[0.02] dark:focus:border-white/10 dark:focus:bg-white/[0.04] dark:focus:ring-white/5 rtl:text-right"
      />
      {error && <p id={`${name}-error`} className="text-[10px] font-bold text-red-600 rtl:text-right">{error}</p>}
    </div>
  );
}

function PropertyInlineChoice<TValue extends string>({
  id,
  label,
  help,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  label: string;
  help?: string;
  value: TValue;
  options: { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
  error?: string;
}) {
  return (
    <div className="grid gap-3 text-start">
      <PropertyHelpLabel label={label} help={help} />
      <div id={id} className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
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
                  : "border-zinc-200/70 bg-transparent text-zinc-500 hover:border-[#0B5CFF]/30 hover:text-[#0B5CFF] dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:text-white",
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

function PropertyFormPreview({
  form,
  projectName,
  pendingMediaCount,
  pendingDocumentCount,
  pendingCoverPreviewUrl,
  existing,
}: {
  form: PropertyFormValues;
  projectName?: string;
  pendingMediaCount: number;
  pendingDocumentCount: number;
  pendingCoverPreviewUrl?: string | null;
  existing?: PropertyUnit | null;
}) {
  const t = useTranslations("Properties");
  const previewTitle = UtilityLipsUtility(form.title || t("form.previewName"));
  const previewProject = UtilityLipsUtility(projectName || t("form.previewProject"));
  const previewCity = UtilityLipsUtility(form.city || t("form.previewCity"));
  const previewImageUrl = pendingCoverPreviewUrl || existing?.coverImageUrl || existing?.image || "";
  const mediaReady = pendingMediaCount > 0 || Boolean(existing?.coverImageUrl || existing?.image);
  const documentsReady = pendingDocumentCount > 0;

  const checklist = [
    { label: t("form.nameLabel"), ready: Boolean(form.title) },
    { label: t("form.projectLabel"), ready: Boolean(projectName || form.project) },
    { label: t("form.priceLabel"), ready: Boolean(form.price) },
    { label: t("form.previewMedia"), ready: mediaReady },
    { label: t("form.previewDocuments"), ready: documentsReady },
    { label: t("form.descLabel"), ready: Boolean(form.description) },
  ];

  return (
    <aside className="order-2 space-y-5 xl:sticky xl:top-24">
      <article className="space-y-4">
        <div className="relative h-44 overflow-hidden rounded-[24px] border border-zinc-200/70 bg-zinc-950 dark:border-white/10">
          {previewImageUrl ? (
            <Image
              src={previewImageUrl}
              alt={form.title || existing?.title || t("form.previewName")}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              unoptimized={previewImageUrl.startsWith("blob:")}
              className="object-cover opacity-80 grayscale"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_45%)]" />
          )}
          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white/70 backdrop-blur">{form.type || t("types.Apartment")}</span>
            <StatusPill label={t(`toolbar.filters.${form.status || "draft"}`)} tone={statusTone(form.status || "draft")} />
          </div>
          <div className="flex h-full w-full items-center justify-center text-white/15">
            <Home className="h-9 w-9" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/45" title={form.city || t("form.previewCity")}>{previewCity}</p>
            <h2 className="mt-1.5 line-clamp-2 text-lg font-black uppercase tracking-tight text-white" title={form.title || t("form.previewName")}>{previewTitle}</h2>
            <p className="mt-2 truncate text-xs font-bold text-white/60" title={projectName || t("form.previewProject")}>{previewProject}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
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
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 py-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{item.label}</span>
              <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full", item.ready ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-200 text-zinc-400 dark:bg-white/10")}>
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
    <div className="border-b border-zinc-200/70 py-2.5 dark:border-white/10">
      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400" title={label}>{UtilityLipsUtility(label)}</p>
      <p className="mt-2 truncate text-sm font-black text-zinc-900 dark:text-white" title={value}>{UtilityLipsUtility(value)}</p>
    </div>
  );
}

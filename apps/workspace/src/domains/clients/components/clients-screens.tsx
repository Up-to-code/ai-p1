"use client";

import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import Image from "next/image";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, CheckCircle2, Copy, Edit, Mail, Phone, Plus, Search, Trash2, User, UserPlus, Users, History as ActivityIcon, FileText as DocsIcon, LayoutDashboard, Building, type LucideIcon } from "lucide-react";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppSection,
  AppStatsGrid,
  AppTabsList,
  AppToolbar,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import {
  CLIENTS_PAGE_SIZE,
  deleteClientRequest,
  linkClientUnitRequest,
  unlinkClientUnitRequest,
  updateClientRequest,
  useClientQuery,
  useClientsIndexQuery,
  useClientUnitLinksQuery,
  useDeleteClientOptimisticMutation,
  useMoveClientInPipelineMutation,
  useUpdateClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import {
  createClientTaskRequest,
  deleteClientTaskRequest,
  updateClientTaskRequest,
  useClientTasksQuery,
} from "@/domains/clients/api/client-tasks";
import { useCalendarEventsQuery, useUpcomingCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import { usePropertiesQuery } from "@/domains/properties/api/properties";
import { getOrganizationCapabilities } from "@/domains/organization/api/better-auth-organization";
import { ClientDocumentsManager } from "@/domains/media/components/client-documents-manager";
import type { Client, ClientType } from "../store/clients.types";
import { useOperationState } from "@/lib/utils/operation-state";
import { DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, HttpQueryState, ProgressiveLoadingState, SearchBox, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ClientForm } from "./client-form";
import { ClientSheet } from "./client-sheet";
import type { PropertyStatus } from "@/domains/properties";
import type { ClientFormValues } from "../validation/client.schema";
import type { ClientTaskPayload } from "@/domains/clients/api/client-tasks";
import { sortPipelineClients } from "@/domains/clients/pipeline-order";

const pipelineStages = ["new", "qualified", "viewing", "negotiation", "closed"] as const;
const activePipelineStages = ["new", "qualified", "viewing", "negotiation"] as const;
const clientFilters = ["all", "Buyer", "Tenant", "Investor", "Broker"] as const;
const clientViews = ["pipeline", "list", "calendar"] as const;
const clientStageFilters = ["all", "active", "closed"] as const;
const clientTypes = ["Buyer", "Tenant", "Investor", "Broker"] as const;
const clientStatuses = ["active", "inactive"] as const;
const clientPriorities = ["normal", "high", "urgent"] as const;
const unitLinkStatuses = ["interested", "shortlisted", "viewing", "offer", "rejected"] as const;
type StatusPillTone = ComponentProps<typeof StatusPill>["tone"];
type PipelineStage = (typeof pipelineStages)[number];

function unitStatusTone(status: PropertyStatus): StatusPillTone {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}

function typeTone(type: ClientType) {
  if (type === "Investor") return "success";
  if (type === "Broker") return "warning";
  if (type === "Tenant") return "info";
  return "neutral";
}

function clientToFormValues(client: Client) {
  return {
    name: client.name,
    type: client.type,
    contact: client.contact,
    phone: client.phone,
    age: String(client.age),
    nationality: client.nationality,
    generation: client.generation,
    budget: client.budget,
    propertyInterest: client.propertyInterest,
    status: client.status,
    visibility: client.visibility ?? "private",
    pipelineStage: client.pipelineStage,
    pipelineOrder: client.pipelineOrder,
    priority: client.priority,
    nextAction: client.nextAction,
    issue: client.issue ?? "",
  };
}

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function clientValuesFromFormData(formData: FormData): ClientFormValues {
  return {
    name: formText(formData, "name"),
    type: formText(formData, "type") as ClientFormValues["type"],
    contact: formText(formData, "contact"),
    phone: formText(formData, "phone"),
    age: formText(formData, "age"),
    nationality: formText(formData, "nationality"),
    generation: formText(formData, "generation"),
    budget: formText(formData, "budget"),
    propertyInterest: formText(formData, "propertyInterest"),
    status: formText(formData, "status") as ClientFormValues["status"],
    visibility: (formText(formData, "visibility") || "private") as ClientFormValues["visibility"],
    pipelineStage: formText(formData, "pipelineStage") as ClientFormValues["pipelineStage"],
    priority: formText(formData, "priority") as ClientFormValues["priority"],
    nextAction: formText(formData, "nextAction"),
    issue: formText(formData, "issue"),
  };
}

function dateInputToTimestamp(value: string) {
  if (!value) return undefined;
  const timestamp = new Date(`${value}T12:00:00`).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function taskPayloadFromFormData(formData: FormData, clientId: string): ClientTaskPayload {
  return {
    clientId,
    title: formText(formData, "title"),
    status: formText(formData, "status") as ClientTaskPayload["status"],
    visibility: (formText(formData, "visibility") || "private") as ClientTaskPayload["visibility"],
    priority: formText(formData, "priority") as ClientTaskPayload["priority"],
    dueAt: dateInputToTimestamp(formText(formData, "dueAt")),
    propertyId: formText(formData, "propertyId") || undefined,
    notes: formText(formData, "notes") || undefined,
  };
}

function ClientDetailField({
  label,
  name,
  defaultValue,
  type = "text",
  className,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: "email" | "number" | "text";
  className?: string;
}) {
  return (
    <label className={cn("block text-start", className)}>
      <span className="text-[11px] font-bold text-zinc-400">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
      />
    </label>
  );
}

function ClientDetailSelect({
  label,
  name,
  defaultValue,
  options,
  className,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <label className={cn("block text-start", className)}>
      <span className="text-[11px] font-bold text-zinc-400">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-zinc-100 bg-white px-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ClientMetaPill({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex h-8 min-w-0 max-w-full items-center gap-2 rounded-full bg-zinc-100 px-3 text-xs font-bold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function ClientInfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: ReactNode; value: ReactNode }) {
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

function CompactClientFact({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
      <p className="text-[11px] font-bold text-zinc-400">{label}</p>
      <p className="mt-2 line-clamp-2 text-sm font-black leading-snug text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function ClientLinkedUnitCard({
  unit,
  linkStatus,
  notes,
}: {
  unit: {
    id: string;
    title: string;
    reference: string;
    project: string;
    coverImageUrl?: string;
    image?: string;
    status: PropertyStatus;
    price: string;
    area: string;
    bedrooms: number | string;
    bathrooms: number;
    updated?: string;
  };
  linkStatus?: string;
  notes?: string | null;
}) {
  const t = useTranslations('Properties');
  const tc = useTranslations('Clients');
  const image = unit.coverImageUrl ?? unit.image;

  return (
    <article className="group overflow-hidden rounded-[24px] border border-zinc-100 bg-white transition-colors hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]">
      <Link href={`/properties/${unit.id}`} className="relative block h-32 w-full overflow-hidden bg-zinc-100 text-start focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:bg-white/5">
        {image ? (
          <Image src={image} alt={unit.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover opacity-80 grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Building className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="truncate text-sm font-black uppercase tracking-tight text-white">{unit.title}</h3>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/60">{unit.project}</p>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={unitStatusTone(unit.status)} />
          {linkStatus && <StatusPill label={tc(`detail.units.statuses.${linkStatus}`)} tone="info" />}
          <span className="ms-auto text-[9px] font-black uppercase tracking-widest text-zinc-300">{unit.reference}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CompactClientFact label={t('card.area')} value={unit.area} />
          <CompactClientFact label={t('card.layout')} value={`${unit.bedrooms}${t('card.beds')} / ${unit.bathrooms}${t('card.baths')}`} />
        </div>
        {notes && <p className="line-clamp-2 rounded-xl bg-zinc-50 p-3 text-xs font-semibold leading-5 text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-400">{notes}</p>}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/5">
          <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">{unit.price}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{unit.updated ?? ""}</p>
        </div>
      </div>
    </article>
  );
}

function ClientMiniCard({
  client,
  onDelete,
  onMarkClosed,
  isClosing,
}: {
  client: Client;
  onDelete: (client: Client) => void;
  onMarkClosed: (client: Client) => void;
  isClosing: boolean;
}) {
  const t = useTranslations('Clients');
  return (
    <article
      className="group rounded-[24px] border border-zinc-100 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]"
    >
      <div className="flex items-start justify-between gap-4">
        <Link href={`/clients/${client.id}`} className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/15">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black uppercase text-white dark:bg-white dark:text-zinc-900">
            {client.name.charAt(0)}
          </div>
          <div className="min-w-0 text-start">
            <h3 className="truncate text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{client.name}</h3>
            <p className="mt-1 truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{client.contact}</p>
          </div>
        </Link>
        <Link
          href={`/clients/${client.id}/edit`}
          aria-label={`Edit ${client.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-300 opacity-0 transition-opacity hover:bg-zinc-50 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 group-hover:opacity-100 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <Edit className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusPill label={t(`types.${client.type}`)} tone={typeTone(client.type)} />
        <StatusPill label={t(`priorities.${client.priority}`)} tone={client.priority === "urgent" ? "danger" : client.priority === "high" ? "warning" : "neutral"} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 dark:border-white/5">
        <div className="text-start">
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.budget')}</p>
          <p className="mt-1 truncate text-[11px] font-black uppercase text-zinc-900 dark:text-white">{client.budget}</p>
        </div>
        <div className="text-start">
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.next')}</p>
          <p className="mt-1 truncate text-[11px] font-black uppercase text-zinc-900 dark:text-white">{client.nextAction}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{client.lastContact}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("actions.markClosed")}
            disabled={isClosing}
            onClick={(event) => {
              event.stopPropagation();
              onMarkClosed(client);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("actions.markClosed")}
          </button>
          <button
            type="button"
            aria-label={`Delete ${client.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(client);
            }}
            className="text-zinc-300 transition-colors hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ClientsWorkspace({ initialView = "pipeline" }: { initialView?: "pipeline" | "calendar" | "list" }) {
  const t = useTranslations('Clients');
  const router = useRouter();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const [filter, setFilter] = useState<(typeof clientFilters)[number]>("all");
  const [stageFilter, setStageFilter] = useState<(typeof clientStageFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<(typeof clientViews)[number]>(initialView);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ stage: PipelineStage; index: number } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useUrlListState({
    filter,
    search,
    view,
    setFilter,
    setSearch,
    setView,
    defaultFilter: "all",
    defaultView: initialView,
    validFilters: clientFilters,
    validViews: clientViews,
  });

  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId, {
    type: filter === "all" ? undefined : filter,
    search,
  });
  const moveClientMutation = useMoveClientInPipelineMutation(clientsQuery.queryKey);
  const updateClientMutation = useUpdateClientOptimisticMutation(clientsQuery.queryKey);
  const deleteClientMutation = useDeleteClientOptimisticMutation(clientsQuery.queryKey);
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
  const stats = clientsQuery.stats;
  const calendarEventsQuery = useUpcomingCalendarEventsQuery(workspaceOrganizationId, {
    enabled: view === "calendar",
    limit: 50,
  });
  const calendarEvents = useMemo(() => calendarEventsQuery ?? [], [calendarEventsQuery]);
  const isLoading = isWorkspaceReady && clientsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || clientsQuery.queryStatus === "error";

  const searchedClients = useMemo(() => {
    return clients.filter((client) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || [client.name, client.contact, client.propertyInterest, client.budget].some((value) => value.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [clients, search]);

  const activeJourneyClients = useMemo(
    () => searchedClients.filter((client) => activePipelineStages.includes(client.pipelineStage as typeof activePipelineStages[number])),
    [searchedClients],
  );

  const tableClients = useMemo(() => {
    if (stageFilter === "active") {
      return searchedClients.filter((client) => activePipelineStages.includes(client.pipelineStage as typeof activePipelineStages[number]));
    }
    if (stageFilter === "closed") {
      return searchedClients.filter((client) => client.pipelineStage === "closed");
    }
    return searchedClients;
  }, [searchedClients, stageFilter]);

  const displayedClients = view === "pipeline" ? activeJourneyClients : view === "list" ? tableClients : searchedClients;

  const markClientClosed = (client: Client) => {
    if (!account.organization.id) return;
    updateClientMutation.mutate({
      organizationId: account.organization.id,
      client,
      values: {
        ...clientToFormValues(client),
        pipelineStage: "closed",
      },
    });
  };

  const columns: AppDataTableColumn<Client>[] = [
    {
      key: "name",
      header: t('form.nameLabel'),
      render: (client) => (
        <Link
          href={`/clients/${client.id}`}
          onClick={(event) => event.stopPropagation()}
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/15"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-xs font-black dark:bg-white/5">{client.name.charAt(0)}</div>
          <div className="min-w-0 text-start">
            <p className="truncate text-xs font-black uppercase text-zinc-900 dark:text-white">{client.name}</p>
            <p className="mt-1 truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{client.contact}</p>
          </div>
        </Link>
      ),
    },
    { key: "type", header: t('detail.labels.type'), render: (client) => <StatusPill label={t(`types.${client.type}`)} tone={typeTone(client.type)} /> },
    { key: "budget", header: t('detail.labels.budget') },
    { key: "pipelineStage", header: t('form.stageLabel'), render: (client) => t(`stages.${client.pipelineStage}`) },
    { key: "nextAction", header: t('form.actionLabel') },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (client) => (
        <div className="flex justify-end gap-1">
          {client.pipelineStage !== "closed" && (
            <button
              type="button"
              aria-label={t("actions.markClosed")}
              disabled={updateClientMutation.isPending}
              onClick={(event) => {
                event.stopPropagation();
                markClientClosed(client);
              }}
              className="p-2 text-zinc-300 hover:text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <Link
            href={`/clients/${client.id}/edit`}
            aria-label={`Edit ${client.name}`}
            onClick={(event) => event.stopPropagation()}
            className="p-2 text-zinc-300 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:text-white"
          >
            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button type="button" aria-label={`Delete ${client.name}`} onClick={(event) => { event.stopPropagation(); setDeleting(client); }} className="p-2 text-zinc-300 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppPageShell>
      <AppPageHeader eyebrow={t("eyebrow")} title={t("title") + "."} actions={<AppPrimaryButton onClick={() => setIsCreateOpen(true)}><UserPlus className="me-2 h-3.5 w-3.5" />{t("add")}</AppPrimaryButton>} />
      <AppStatsGrid stats={[
        { label: t("stats.total"), value: stats?.total ?? "...", icon: Users },
        { label: t("stats.active"), value: stats?.active ?? "...", dotClassName: "bg-emerald-500" },
        { label: t("stats.investors"), value: stats?.investors ?? "...", dotClassName: "bg-blue-500" },
        { label: t("stats.appointments"), value: view === "calendar" ? calendarEvents.length : "...", icon: Copy },
      ]} />
      <AppToolbar
        filters={[
          { value: "all", label: t("toolbar.filters.all") },
          { value: "Buyer", label: t("toolbar.filters.Buyer") },
          { value: "Tenant", label: t("toolbar.filters.Tenant") },
          { value: "Investor", label: t("toolbar.filters.Investor") },
          { value: "Broker", label: t("toolbar.filters.Broker") },
        ]}
        activeFilter={filter}
        onFilterChange={(next) => setFilter(next as "all" | ClientType)}
        sortLabel={t("toolbar.newest")}
        trailing={<SearchBox value={search} onChange={setSearch} placeholder={t("toolbar.search")} name="client-search" ariaLabel="Search clients" />}
      />

      <div className="flex flex-wrap gap-2">
        {(["pipeline", "list", "calendar"] as const).map((mode) => (
          <Button key={mode} variant={view === mode ? "default" : "outline"} size="sm" onClick={() => setView(mode)} className="text-[10px] font-black uppercase tracking-widest">
            {t(`views.${mode}`)}
          </Button>
        ))}
        {view === "list" && (
          <div className="ms-auto flex flex-wrap gap-1 rounded-full border border-zinc-100 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]">
            {clientStageFilters.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                className={cn(
                  "h-8 rounded-full px-3 text-[10px] font-black uppercase tracking-widest transition-colors",
                  stageFilter === stage
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
                )}
              >
                {t(`stageFilters.${stage}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant={view === "pipeline" ? "pipeline" : view === "calendar" ? "calendar" : "table"} />
      ) : isQueryBlocked ? (
        <HttpQueryState query={clientsQuery} variant={view === "pipeline" ? "pipeline" : view === "calendar" ? "calendar" : "table"} />
      ) : view === "pipeline" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {activePipelineStages.map((stage) => {
            const stageClients = sortPipelineClients(activeJourneyClients.filter((client) => client.pipelineStage === stage));
            const isDragOver = dragOverStage === stage;

            return (
              <section 
                key={stage} 
                className={cn(
                  "min-h-[420px] rounded-[28px] border p-3 transition-all duration-300",
                  isDragOver 
                    ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                    : "border-zinc-100 bg-zinc-50/40 dark:border-white/5 dark:bg-white/[0.01]"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverStage !== stage) setDragOverStage(stage);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStage(null);
                  const clientId = e.dataTransfer.getData("clientId") || draggedId;
                  if (clientId && account.organization.id) {
                    const movingClient = clients.find((client) => client.id === clientId);
                    if (movingClient) {
                      const targetIndex = dragOverIndex?.stage === stage ? dragOverIndex.index : stageClients.length;
                      moveClientMutation.mutate({
                        organizationId: account.organization.id,
                        client: movingClient,
                        stage,
                        stageClients,
                        targetIndex,
                      });
                    }
                  }
                  setDraggedId(null);
                  setDragOverIndex(null);
                }}
              >
                <div className="mb-4 flex items-center justify-between px-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t(`stages.${stage}`)}</h2>
                  <span className="text-[10px] font-black text-zinc-300">{String(stats?.stages[stage] ?? stageClients.length).padStart(2, "0")}</span>
                </div>
                <div className="space-y-3">
                  {stageClients.map((client, index) => {
                    const isDragOverItem = dragOverIndex?.stage === stage && dragOverIndex.index === index;
                    
                    return (
                      <div 
                        key={client.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedId(client.id);
                          e.dataTransfer.setData("clientId", client.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setDragOverStage(null);
                          setDragOverIndex(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedId !== client.id) {
                            setDragOverIndex({ stage, index });
                            setDragOverStage(stage);
                          }
                        }}
                        className={cn(
                          "transition-all duration-200",
                          draggedId === client.id ? "opacity-40" : "opacity-100",
                          isDragOverItem && "pt-12 relative before:absolute before:top-4 before:left-0 before:right-0 before:h-1 before:bg-primary/40 before:rounded-full"
                        )}
                      >
                        <ClientMiniCard client={client} onDelete={setDeleting} onMarkClosed={markClientClosed} isClosing={updateClientMutation.isPending} />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {isWorkspaceReady && !isLoading && view === "list" && (
        <AppDataTable
          columns={columns}
          data={tableClients}
          getRowKey={(client) => client.id}
          onRowClick={(client) => router.push(`/clients/${client.id}`)}
        />
      )}

      {isWorkspaceReady && !isLoading && view === "calendar" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {calendarEvents
            .filter((event) => !event.clientId || searchedClients.some((client) => client.id === event.clientId))
            .map((event) => (
            <AppSection key={event.id} title={`${event.date} · ${event.time}`} description={event.owner}>
              <div className="flex items-start justify-between gap-4">
                <div className="text-start">
                  <p className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{event.title}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">{event.clientName ?? event.location ?? "Workspace event"}</p>
                </div>
                <StatusPill label={event.status} tone="info" />
              </div>
            </AppSection>
          ))}
        </div>
      )}

      {isWorkspaceReady && !isQueryBlocked && displayedClients.length === 0 && <EmptyWorkspace icon={Users} title={t('empty.title')} description={t('empty.desc')} />}
      {isWorkspaceReady && !isQueryBlocked && searchedClients.length > 0 && (
        <InfiniteScrollSentinel
          status={clientsQuery.status}
          loadMore={clientsQuery.loadMore}
          pageSize={CLIENTS_PAGE_SIZE}
        />
      )}

      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('delete.title')}
        description={t('delete.desc', { name: deleting?.name ?? "..." })}
        isDeleting={deleteClientMutation.isPending}
        error={deleteClientMutation.error instanceof Error ? deleteClientMutation.error.message : null}
        onConfirm={() => {
          if (!deleting || !clients.some((client) => client.id === deleting.id)) {
            return;
          }
          if (!account.organization.id) return;
          const clientId = deleting.id;
          setDeleting(null);
          deleteClientMutation.mutate({ organizationId: account.organization.id, clientId });
        }}
      />

      <ClientSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </AppPageShell>
  );
}

export function ClientDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Clients');
  const propertyT = useTranslations('Properties');
  const locale = useLocale();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const client = useClientQuery(workspaceOrganizationId, id) as Client | null | undefined;
  const linkedUnitsQuery = useClientUnitLinksQuery(workspaceOrganizationId, id);
  const linkedUnits = useMemo(() => linkedUnitsQuery ?? [], [linkedUnitsQuery]);
  const units = useMemo(() => linkedUnits.flatMap((row) => (row.unit ? [row.unit] : [])), [linkedUnits]);
  const tasks = useClientTasksQuery(workspaceOrganizationId, id) ?? [];
  const events = useCalendarEventsQuery(workspaceOrganizationId, id) ?? [];
  const [taskTitle, setTaskTitle] = useState("");
  const [unitLinkStatus, setUnitLinkStatus] = useState<(typeof unitLinkStatuses)[number]>("shortlisted");
  const [unitLinkNotes, setUnitLinkNotes] = useState("");
  const [isUnitPickerOpen, setIsUnitPickerOpen] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const [unitStatusFilter, setUnitStatusFilter] = useState<"all" | PropertyStatus>("all");
  const allUnitsQuery = usePropertiesQuery(workspaceOrganizationId, { enabled: isUnitPickerOpen });
  const allUnits = allUnitsQuery ?? [];
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const profileOperation = useOperationState({ errorMessage: "Client update failed." });
  const deleteOperation = useOperationState({ errorMessage: "Client delete failed." });
  const closeOperation = useOperationState({ errorMessage: "Client close failed." });
  const taskOperation = useOperationState({ errorMessage: "Task action failed." });
  const linkOperation = useOperationState({ errorMessage: "Unit link failed." });
  const queryDebug = {
    resourceType: "client",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };
  const capabilitiesQuery = useReactQuery({
    queryKey: ["organization-capabilities", workspaceOrganizationId],
    queryFn: () => getOrganizationCapabilities(workspaceOrganizationId!),
    enabled: Boolean(workspaceOrganizationId),
  });
  const canManageVisibility = capabilitiesQuery.data?.canManageVisibility ?? false;

  if (workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} variant="detail" /></AppPageShell>;
  }

  if (client === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} variant="detail" /></AppPageShell>;
  }

  if (client === null) {
    return (
      <AppPageShell>
        <DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/clients" backLabel={t('detail.back')} />
      </AppPageShell>
    );
  }

  const currentStageIndex = Math.max(0, pipelineStages.indexOf(client.pipelineStage as typeof pipelineStages[number]));
  const linkedUnitIds = new Set(linkedUnits.map(({ link }) => link.propertyId));
  const availableUnits = allUnits.filter((unit) => !linkedUnitIds.has(unit.id));
  const unitSearchQuery = unitSearch.trim().toLowerCase();
  const filteredAvailableUnits = availableUnits.filter((unit) => {
    const matchesStatus = unitStatusFilter === "all" || unit.status === unitStatusFilter;
    const matchesSearch = unitSearchQuery
      ? [unit.title, unit.project, unit.price, unit.area, unit.status, unit.reference]
        .some((value) => String(value ?? "").toLowerCase().includes(unitSearchQuery))
      : true;
    return matchesStatus && matchesSearch;
  });
  const visibleAvailableUnits = filteredAvailableUnits.slice(0, 36);
  const isUnitCatalogLoading = allUnitsQuery === undefined;
  const linkUnit = (propertyId: string) => {
    void linkOperation.run(async () => {
      if (!workspaceOrganizationId) throw new Error("Select an organization first.");
      await linkClientUnitRequest(workspaceOrganizationId, client.id, propertyId, unitLinkStatus, unitLinkNotes);
      setUnitLinkNotes("");
      setUnitSearch("");
      setIsUnitPickerOpen(false);
    }, { successMessage: t("detail.units.linked") });
  };
  const markClosed = () => {
    void closeOperation.run(
      () => {
        if (!workspaceOrganizationId) throw new Error("Select an organization first.");
        return updateClientRequest(workspaceOrganizationId, client.id, {
          ...clientToFormValues(client),
          pipelineStage: "closed",
        });
      },
      { successMessage: t("actions.closed") },
    );
  };

  return (
    <AppPageShell contentClassName="space-y-8 pb-16">
      <section className="space-y-5 text-start">
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 dark:border-white/5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-black uppercase text-white dark:bg-zinc-100 dark:text-zinc-950">
              {client.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-widest text-zinc-400">{client.id.toUpperCase()}</p>
              <h1 className="mt-2 max-w-5xl text-3xl font-black leading-tight text-zinc-950 dark:text-zinc-50 md:text-[32px]">
                {client.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ClientMetaPill icon={Mail}>{client.contact}</ClientMetaPill>
                <ClientMetaPill icon={Phone}>{client.phone}</ClientMetaPill>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button variant="outline" onClick={() => setDeleting(true)} className="h-10 rounded-xl border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/20 dark:hover:bg-red-950/30">
              <Trash2 className="me-2 h-3.5 w-3.5" />
              {t('detail.delete')}
            </Button>
            <Link href={`/clients/${client.id}/edit`}>
              <AppPrimaryButton>
                <Edit className="me-2 h-3.5 w-3.5" />
                {t('detail.edit')}
              </AppPrimaryButton>
            </Link>
            {client.pipelineStage !== "closed" && (
              <Button
                type="button"
                disabled={closeOperation.isRunning}
                onClick={markClosed}
                variant="outline"
                className="h-10 rounded-xl px-4 text-xs font-bold"
              >
                <CheckCircle2 className="me-2 h-3.5 w-3.5" />
                {t("actions.markClosed")}
              </Button>
            )}
          </div>
        </div>

        <div className="inline-flex max-w-full rounded-[24px] border border-zinc-100 bg-white p-3 dark:border-white/5 dark:bg-[#0A0A0A] md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {pipelineStages.map((stage, i) => (
              <div
                key={stage}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 transition-colors",
                  i <= currentStageIndex ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950" : "bg-zinc-50 text-zinc-400 dark:bg-zinc-950/60"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black",
                    i <= currentStageIndex ? "bg-white/15 text-current dark:bg-zinc-950/10" : "border border-zinc-200 dark:border-zinc-800"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 truncate text-xs font-black">{t(`stages.${stage}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview" className="space-y-6">
        <AppTabsList tabs={[
          { value: "overview", label: t('views.pipeline'), icon: LayoutDashboard },
          { value: "profile", label: t('detail.recordTitle'), icon: User },
          { value: "units", label: t('detail.tabs.units'), icon: Building },
          { value: "docs", label: t('detail.tabs.documents'), icon: DocsIcon },
          { value: "activity", label: t('detail.tabs.activity'), icon: ActivityIcon },
        ]} />

        <TabsContent value="overview">
          <div className="space-y-5">
            <AppSection
              title={t('detail.recordTitle')}
              actions={(
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label={t(`stages.${client.pipelineStage}`)} tone={client.pipelineStage === "closed" ? "success" : "info"} />
                  <StatusPill label={t(`types.${client.type}`)} tone={typeTone(client.type)} />
                  <StatusPill label={t(`statuses.${client.status}`)} tone={client.status === "active" ? "success" : "neutral"} />
                  <StatusPill label={t(`priorities.${client.priority}`)} tone={client.priority === "urgent" ? "danger" : client.priority === "high" ? "warning" : "neutral"} />
                </div>
              )}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <CompactClientFact label={t('detail.labels.budget')} value={client.budget} />
                <CompactClientFact label={t('detail.nextTitle')} value={client.nextAction} />
                <ClientInfoRow icon={Search} label={t('detail.labels.interest')} value={client.propertyInterest} />
                <div className="grid gap-3 md:col-span-2 xl:col-span-3 xl:grid-cols-3">
                  <ClientInfoRow icon={Mail} label={t('detail.labels.email')} value={client.contact} />
                  <ClientInfoRow icon={Phone} label={t('detail.labels.phone')} value={client.phone} />
                  <ClientInfoRow icon={CalendarDays} label={t('card.next')} value={`${client.nextActionDate} ${t('detail.at')} ${client.appointmentTime}`} />
                </div>
              </div>
            </AppSection>

            <AppSection
              title={t('detail.tabs.units')}
              actions={<span className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">{linkedUnits.length} {t("detail.units.linkedCount")}</span>}
            >
              {linkedUnits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm font-bold text-zinc-400 dark:border-white/10">
                  {t("detail.units.linkUnitDesc")}
                </div>
              ) : (
                <div className="grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                  {linkedUnits.map(({ link, unit }) => unit ? (
                    <ClientLinkedUnitCard key={link.id} unit={unit} linkStatus={link.status} notes={link.notes} />
                  ) : null)}
                </div>
              )}
            </AppSection>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <AppSection title={t('detail.recordTitle')}>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                void profileOperation.run(
                  () => {
                    if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                    return updateClientRequest(workspaceOrganizationId, client.id, clientValuesFromFormData(formData));
                  },
                  { successMessage: "Client updated." },
                );
              }}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ClientDetailField label={t('form.nameLabel')} name="name" defaultValue={client.name} />
                <ClientDetailField label={t('detail.labels.email')} name="contact" type="email" defaultValue={client.contact} />
                <ClientDetailField label={t('detail.labels.phone')} name="phone" defaultValue={client.phone} />
                <ClientDetailField label={t('form.ageLabel')} name="age" type="number" defaultValue={String(client.age)} />
                <ClientDetailField label={t('form.budgetLabel')} name="budget" defaultValue={client.budget} />
                <ClientDetailField label={t('form.interestLabel')} name="propertyInterest" defaultValue={client.propertyInterest} />
                <ClientDetailField label={t('form.actionLabel')} name="nextAction" defaultValue={client.nextAction} className="lg:col-span-2" />
                <ClientDetailField label={t('form.issueLabel')} name="issue" defaultValue={client.issue ?? ""} />
                <ClientDetailField label="Nationality" name="nationality" defaultValue={client.nationality} />
                <ClientDetailField label="Generation" name="generation" defaultValue={client.generation} />
                <ClientDetailSelect label={t('form.typeLabel')} name="type" defaultValue={client.type} options={clientTypes.map((value) => ({ value, label: t(`types.${value}`) }))} />
                <ClientDetailSelect label={t('form.statusLabel')} name="status" defaultValue={client.status} options={clientStatuses.map((value) => ({ value, label: t(`statuses.${value}`) }))} />
                {canManageVisibility ? (
                  <ClientDetailSelect
                    label={t("form.visibilityLabel")}
                    name="visibility"
                    defaultValue={client.visibility ?? "private"}
                    options={[
                      { value: "private", label: t("form.visibilityPrivate") },
                      { value: "public", label: t("form.visibilityPublic") },
                    ]}
                  />
                ) : (
                  <input type="hidden" name="visibility" value={client.visibility ?? "private"} />
                )}
                <ClientDetailSelect label={t('form.priorityLabel')} name="priority" defaultValue={client.priority} options={clientPriorities.map((value) => ({ value, label: t(`priorities.${value}`) }))} />
                <ClientDetailSelect label={t('form.stageLabel')} name="pipelineStage" defaultValue={client.pipelineStage} options={pipelineStages.map((value) => ({ value, label: t(`stages.${value}`) }))} />
              </div>

              {profileOperation.error && <p className="text-xs font-bold text-red-500">{profileOperation.error}</p>}

              <div className="flex justify-end">
                <Button type="submit" disabled={profileOperation.isRunning} className="h-10 rounded-xl px-5 text-xs font-bold">
                  {profileOperation.isRunning ? "Saving..." : t('form.saveBtn')}
                </Button>
              </div>
            </form>
          </AppSection>
        </TabsContent>

        <TabsContent value="units">
          <div className="space-y-5">
            <AppSection
              title={t("detail.units.title")}
              description={t("detail.units.subtitle")}
              contentClassName="space-y-4"
              actions={(
                <>
                  <span className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">{linkedUnits.length} {t("detail.units.linkedCount")}</span>
                  <Button type="button" onClick={() => setIsUnitPickerOpen(true)} className="h-10 rounded-xl px-4 text-xs font-bold">
                    <Plus className="me-2 h-3.5 w-3.5" />{t("detail.units.linkUnit")}
                  </Button>
                </>
              )}
            >

              {linkOperation.error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-950/50 dark:bg-red-950/20">{linkOperation.error}</p>}

              <div className="grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                <button
                  type="button"
                  onClick={() => setIsUnitPickerOpen(true)}
                  className="flex min-h-[316px] items-center gap-4 rounded-[24px] border border-dashed border-zinc-200 bg-zinc-50 p-5 text-start transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-zinc-950 dark:text-zinc-50">{t("detail.units.linkUnit")}</span>
                    <span className="mt-1 block max-w-sm text-xs font-semibold leading-5 text-zinc-500 dark:text-zinc-400">{t("detail.units.linkUnitDesc")}</span>
                  </span>
                </button>

                {linkedUnits.map(({ link, unit }) => unit ? (
                  <div key={link.id} className="rounded-[24px] border border-zinc-100 bg-white p-3 dark:border-white/5 dark:bg-[#0B0B0B]">
                    <ClientLinkedUnitCard unit={unit} linkStatus={link.status} notes={link.notes} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/properties/${unit.id}`} className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 px-3 text-xs font-bold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-950">
                        <ArrowUpRight className="me-2 h-3.5 w-3.5" />{t("detail.units.openUnit")}
                      </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={linkOperation.isRunning}
                          onClick={() => void linkOperation.run(() => {
                            if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                            return unlinkClientUnitRequest(workspaceOrganizationId, client.id, link.propertyId);
                          }, { successMessage: t("detail.units.unlinked") })}
                          className="h-9 rounded-xl px-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="me-2 h-3.5 w-3.5" />{t("detail.units.unlink")}
                        </Button>
                    </div>
                  </div>
                ) : null)}
              </div>
            </AppSection>

            <Dialog open={isUnitPickerOpen} onOpenChange={(open) => {
              setIsUnitPickerOpen(open);
              if (!open) {
                setUnitSearch("");
                setUnitStatusFilter("all");
              }
            }}>
              <DialogContent className="max-h-[88vh] max-w-5xl overflow-hidden rounded-[24px] border-zinc-200 bg-white p-0 text-zinc-950 shadow-none dark:border-zinc-800 dark:bg-[#0B0B0B] dark:text-zinc-50">
                <DialogHeader className="border-b border-zinc-100 p-5 pe-14 text-start dark:border-zinc-800">
                  <DialogTitle className="text-xl font-black text-zinc-950 dark:text-zinc-50">{t("detail.units.modalTitle")}</DialogTitle>
                  <DialogDescription className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{t("detail.units.modalDesc")}</DialogDescription>
                </DialogHeader>

                <div className="sticky top-0 z-10 space-y-4 border-b border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-[#0B0B0B]">
                  <label className="relative block">
                    <span className="sr-only">{t("detail.units.search")}</span>
                    <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={unitSearch}
                      onChange={(event) => setUnitSearch(event.target.value)}
                      placeholder={t("detail.units.search")}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 ps-10 pe-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {(["all", "available", "reserved", "pending", "sold", "draft"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setUnitStatusFilter(status)}
                        className={cn(
                          "h-9 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest transition",
                          unitStatusFilter === status
                            ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                            : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-white/[0.04]",
                        )}
                      >
                        {status === "all" ? t("stageFilters.all") : propertyT(`toolbar.filters.${status}`)}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                    <label className="block text-start">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{t("detail.units.linkStatus")}</span>
                      <select
                        value={unitLinkStatus}
                        onChange={(event) => setUnitLinkStatus(event.target.value as (typeof unitLinkStatuses)[number])}
                        className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-zinc-950 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      >
                        {unitLinkStatuses.map((status) => <option key={status} value={status}>{t(`detail.units.statuses.${status}`)}</option>)}
                      </select>
                    </label>
                    <label className="block text-start">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{t("detail.units.notes")}</span>
                      <input
                        value={unitLinkNotes}
                        onChange={(event) => setUnitLinkNotes(event.target.value)}
                        placeholder={t("detail.units.notes")}
                        className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-zinc-950 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      />
                    </label>
                  </div>
                </div>

                <div className="max-h-[54vh] overflow-y-auto p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50">{t("detail.units.available")}</h3>
                    <span className="text-xs font-bold text-zinc-400">
                      {t("detail.units.showing", { shown: visibleAvailableUnits.length, total: filteredAvailableUnits.length })}
                    </span>
                  </div>

                  {isUnitCatalogLoading ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-950" />
                      ))}
                    </div>
                  ) : availableUnits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-zinc-800">{t("detail.units.noAvailable")}</div>
                  ) : filteredAvailableUnits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-zinc-800">{t("detail.units.noResults")}</div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                      {visibleAvailableUnits.map((unit) => (
                        <div key={unit.id} className="rounded-[24px] border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
                          <ClientLinkedUnitCard unit={unit} />
                            <Button type="button" disabled={linkOperation.isRunning} onClick={() => linkUnit(unit.id)} className="mt-3 h-9 w-full rounded-xl text-xs font-bold">
                              <Plus className="me-2 h-3.5 w-3.5" />{t("detail.units.link")}
                            </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        <TabsContent value="docs">
          <AppSection tone="muted" contentClassName="min-w-0">
            <ClientDocumentsManager
              organizationId={workspaceOrganizationId}
              clientId={client.id}
            />
          </AppSection>
        </TabsContent>

        <TabsContent value="activity">
          <AppSection
            title={t('detail.activity.title')}
            description={t('detail.activity.subtitle')}
            contentClassName="space-y-4"
            actions={(
              <>
                <span className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">{tasks.length} {t('detail.activity.tasks')}</span>
                <span className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">{events.length} {t('detail.activity.events')}</span>
              </>
            )}
          >

            <form
              className="grid gap-2 rounded-[20px] bg-zinc-50 p-3 dark:bg-white/[0.03] md:grid-cols-[140px_minmax(220px,1fr)_132px_132px_156px_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);
                void taskOperation.run(async () => {
                  if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                  await createClientTaskRequest(workspaceOrganizationId, taskPayloadFromFormData(formData, client.id));
                  setTaskTitle("");
                  form.reset();
                }, { successMessage: t('detail.activity.added') });
              }}
            >
              <input type="hidden" name="status" value="open" />
              {canManageVisibility ? (
                <select name="visibility" defaultValue="private" className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-[#0B0B0B] dark:text-zinc-100">
                  <option value="private">{t("form.visibilityPrivate")}</option>
                  <option value="public">{t("form.visibilityPublic")}</option>
                </select>
              ) : (
                <input type="hidden" name="visibility" value="private" />
              )}
              <input
                name="title"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder={t('detail.activity.taskTitle')}
                className="h-10 min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-[#0B0B0B] dark:text-zinc-50 dark:focus:border-zinc-600"
              />
              <select name="priority" defaultValue={client.priority} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-[#0B0B0B] dark:text-zinc-100">
                {clientPriorities.map((value) => <option key={value} value={value}>{t(`priorities.${value}`)}</option>)}
              </select>
              <input name="dueAt" type="date" className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-[#0B0B0B] dark:text-zinc-100" />
              <select name="propertyId" defaultValue="" className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-[#0B0B0B] dark:text-zinc-100">
                <option value="">{t('detail.activity.noUnit')}</option>
                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
              </select>
              <Button type="submit" disabled={!taskTitle.trim() || taskOperation.isRunning} className="h-10 rounded-xl px-5 text-xs font-black">
                {t('detail.activity.add')}
              </Button>
            </form>

            {taskOperation.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-950/50 dark:bg-red-950/20">{taskOperation.error}</p>}

            <div className="grid gap-3">
              {tasks.length === 0 && events.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">
                  {t('detail.activity.emptyTasks')}
                </div>
              ) : null}

              {tasks.map((task) => {
                const linkedUnit = units.find((unit) => unit.id === task.propertyId);
                const isDone = task.status === "done";
                return (
                  <article key={task.id} className="grid gap-4 rounded-[20px] border border-zinc-100 bg-white p-4 dark:border-white/5 dark:bg-[#0A0A0A] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill label={t(`detail.activity.taskStatuses.${task.status}`)} tone={isDone ? "success" : task.status === "canceled" ? "neutral" : "warning"} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{t(`priorities.${task.priority}`)}</span>
                        <span className="text-[10px] font-bold text-zinc-400">{task.dueAt ? new Date(task.dueAt).toLocaleDateString(locale) : t('detail.activity.noDate')}</span>
                      </div>
                      <p className={cn("mt-2 truncate text-sm font-black text-zinc-950 dark:text-zinc-50", isDone && "text-zinc-400 line-through dark:text-zinc-500")}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-zinc-400">
                        <span>{t('detail.activity.tasks')}</span>
                        {linkedUnit && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span>{linkedUnit.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {canManageVisibility && (
                        <select
                          value={task.visibility ?? "private"}
                          disabled={taskOperation.isRunning}
                          onChange={(event) => void taskOperation.run(() => {
                            if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                            return updateClientTaskRequest(workspaceOrganizationId, task.id, {
                              clientId: client.id,
                              title: task.title,
                              status: task.status,
                              visibility: event.target.value as ClientTaskPayload["visibility"],
                              priority: task.priority,
                              dueAt: task.dueAt,
                              propertyId: task.propertyId,
                              projectId: task.projectId,
                              calendarEventId: task.calendarEventId,
                              notes: task.notes,
                            });
                          }, { successMessage: t("detail.activity.saved") })}
                          className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                          <option value="private">{t("form.visibilityPrivate")}</option>
                          <option value="public">{t("form.visibilityPublic")}</option>
                        </select>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={taskOperation.isRunning}
                        onClick={() => void taskOperation.run(() => {
                          if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                          return updateClientTaskRequest(workspaceOrganizationId, task.id, {
                            clientId: client.id,
                            title: task.title,
                            status: isDone ? "open" : "done",
                            visibility: task.visibility ?? "private",
                            priority: task.priority,
                            dueAt: task.dueAt,
                            propertyId: task.propertyId,
                            projectId: task.projectId,
                            calendarEventId: task.calendarEventId,
                            notes: task.notes,
                          });
                        }, { successMessage: t('detail.activity.saved') })}
                        className="h-9 rounded-xl text-xs font-bold"
                      >
                        {isDone ? t('detail.activity.reopen') : t('detail.activity.complete')}
                      </Button>
                      <button
                        type="button"
                        disabled={taskOperation.isRunning}
                        onClick={() => void taskOperation.run(() => {
                          if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                          return deleteClientTaskRequest(workspaceOrganizationId, task.id);
                        }, { successMessage: t('detail.activity.deleted') })}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/30"
                        aria-label={t('detail.activity.deleteTask')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}

              {events.map((event) => (
                <article key={event.id} className="grid gap-4 rounded-[20px] border border-zinc-100 bg-white p-4 dark:border-white/5 dark:bg-[#0A0A0A] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={event.status} tone="info" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{t('detail.activity.calendarEvents')}</span>
                      <span className="text-[10px] font-bold text-zinc-400">{event.date} · {event.time}</span>
                    </div>
                    <p className="mt-2 truncate text-sm font-black text-zinc-950 dark:text-zinc-50">{event.title}</p>
                  </div>
                  <span className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 px-3 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {t('detail.activity.events')}
                  </span>
                </article>
              ))}
            </div>
          </AppSection>
        </TabsContent>
      </Tabs>

      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t('delete.title')}
        description={t('delete.desc', { name: client.name })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!workspaceOrganizationId) throw new Error("Select an organization first.");
          return deleteClientRequest(workspaceOrganizationId, client.id);
        }, {
          successMessage: "Client deleted.",
          onSuccess: () => {
            setDeleting(false);
            router.push("/clients");
          },
        })}
      />
    </AppPageShell>
  );
}

export function ClientFormScreen({ id }: { id?: string }) {
  const t = useTranslations('Clients');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const existing = useClientQuery(workspaceOrganizationId, id ?? "") as Client | null | undefined;
  const router = useRouter();
  const queryDebug = {
    resourceType: "client",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
  };

  if (id && workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} variant="detail" /></AppPageShell>;
  }

  if (id && existing === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} variant="detail" /></AppPageShell>;
  }

  if (id && existing === null) {
    return (
      <AppPageShell>
        <DetailNotFoundState 
          title={t('detail.notFound')} 
          description={t('detail.notFoundDesc')} 
          backHref="/clients" 
          backLabel={t('detail.back')} 
        />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell maxWidth="default">
      <AppPageHeader
        eyebrow={t('form.eyebrow')}
        title={existing ? t('form.editTitle') + "." : t('form.createTitle') + "."}
        subtitle={t('form.subtitle')}
      />

      <div className="rounded-[32px] border border-zinc-100 bg-white p-10 dark:border-white/5 dark:bg-[#0A0A0A]">
        <ClientForm
          existing={existing ?? undefined}
          onSuccess={(nextId) => router.push(`/clients/${nextId}`)}
          onCancel={() => router.back()}
        />
      </div>
    </AppPageShell>
  );
}

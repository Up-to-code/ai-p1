"use client";

import { useMemo, useState, useCallback, useEffect, type ReactNode } from "react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ChevronDown, Clock, Edit, Mail, Phone, Plus, Search, Trash2, User, UserPlus, Users, History as ActivityIcon, FileText as DocsIcon, LayoutDashboard, PhoneCall, Video, Tag, Link2, FileText, Briefcase, Calendar, Pencil, type LucideIcon } from "lucide-react";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppSection,
  AppTabsList,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { PipelineBoard, ViewSwitcherTabs, GroupedList } from "@/components/shared/view-system";
import type { ViewDefinition } from "@/components/shared/view-system/types";
import { clientToCardItem } from "./client-view-helpers";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import {
  CLIENTS_PAGE_SIZE,
  deleteClientRequest,
  clientsIndexQueryBaseKey,
  updateClientRequest,
  useClientQuery,
  useClientsIndexQuery,
  useDeleteClientOptimisticMutation,
  useMoveClientInPipelineMutation,
  useUpdateClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import {
  createClientTaskRequest,
  deleteClientTaskRequest,
  updateClientTaskRequest,
  useClientTasksQuery,
  type ClientTaskPayload,
} from "@/domains/clients/api/client-tasks";
import {
  useClientFollowUpsQuery,
  createFollowUpRequest,
  deleteFollowUpRequest,
  markFollowUpCompleteRequest,
} from "@/domains/clients/api/client-follow-ups";
import type { ClientFollowUpPayload } from "@/domains/clients/api/client-follow-ups";
import { useCalendarEventsQuery, useUpcomingCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import { useOpportunitiesQuery } from "@/domains/opportunities/api/opportunities";
import { useQuery as useConvexQuery } from "convex/react";
import { api as convexApi } from "@convex/_generated/api";
import type { Id as ConvexId } from "@convex/_generated/dataModel";
import { getOrganizationCapabilities } from "@/domains/organization/api/clerk-organization-api";
import { ClientDocumentsManager } from "@/domains/media/components/client-documents-manager";
import type { Client, ClientType } from "../store/clients.types";
import {
  activePipelineStages,
  activeJourneyClients as activeJourneyClientRows,
  calendarEventsForClients,
  clientFilters,
  clientPriorities,
  clientPipelineStageIndex,
  clientStageFilters,
  clientStatuses,
  clientTaskActivityRows,
  clientTaskUpdatePayload,
  clientToFormValues,
  clientTypes,
  clientValuesFromFormData,
  clientViews,
  clientsForStageFilter,
  displayedClientsForView,
  matchesClientSearch,
  pipelineStages,
  taskPayloadFromFormData,
  typeTone,
  type PipelineStage,
} from "../client-view-model";
import { useOperationState } from "@/lib/utils/operation-state";
import { DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, HttpQueryState, ProgressiveLoadingState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ClientForm } from "./client-form";
import { ClientSheet } from "./client-sheet";
import { NotionClientTable } from "./notion-client-table";
import { PipelineStagesSettings } from "./pipeline-stages-settings";
import { usePipelineStages } from "@/domains/clients/api/pipeline-stages";
import { sortPipelineClients } from "@/domains/clients/pipeline-order";

const clientTypeValuesForTranslation = new Set(["person", "organization", "Client", "Buyer", "Tenant", "Investor", "Broker"]);
const clientStatusValuesForTranslation = new Set(["new", "active", "nurture", "inactive", "archived"]);
const clientStageValuesForTranslation = new Set(["new", "qualified", "review", "negotiation", "closed"]);
const clientPriorityValuesForTranslation = new Set(["normal", "high", "urgent"]);

function fallbackLabel(value: string | null | undefined) {
  const source = String(value ?? "").trim();
  if (!source || source === "undefined") {
    return "—";
  }
  return source
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function translateClientLabel(
  t: ReturnType<typeof useTranslations<"Clients">>,
  namespace: "types" | "statuses" | "stages" | "priorities",
  value: string | null | undefined,
  validValues: ReadonlySet<string>,
) {
  if (value && validValues.has(value)) {
    return t(`${namespace}.${value}`);
  }
  return fallbackLabel(value);
}

function translateClientType(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "types", value, clientTypeValuesForTranslation);
}

function translateClientStatus(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "statuses", value, clientStatusValuesForTranslation);
}

function translateClientStage(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "stages", value, clientStageValuesForTranslation);
}

function translateClientPriority(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "priorities", value, clientPriorityValuesForTranslation);
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
      <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground outline-none transition focus:border-border focus:ring-2 focus:ring-ring"
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
      <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground outline-none transition focus:ring-2 focus:ring-ring"
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
    <span className="inline-flex h-8 min-w-0 max-w-full items-center gap-2 rounded-full bg-muted px-3 text-xs font-bold text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function ClientInfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: ReactNode; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-muted p-4">
      <span className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <p className="mt-3 truncate text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function CompactClientFact({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="group min-w-0 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-muted/40">
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">{value}</p>
    </div>
  );
}

function EditableTextBlock({
  value,
  placeholder = "Empty",
  className,
  multiline = false,
}: {
  value?: ReactNode;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-border hover:bg-muted/40 focus:border-ring focus:bg-muted/40 focus:outline-none",
        multiline ? "min-h-20 whitespace-pre-wrap" : "truncate",
        className,
      )}
      title="Inline editing ready"
    >
      <span className={cn(!value && "text-muted-foreground")}>{value || placeholder}</span>
      <Pencil className="ms-2 inline h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
    </div>
  );
}

function EditableTags({
  tags,
  fallback,
}: {
  tags?: string[];
  fallback: string;
}) {
  const visibleTags = tags?.length ? tags : [fallback];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleTags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="rounded-md border border-transparent bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
        >
          {tag}
        </button>
      ))}
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Add tag"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function NotionProperty({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="group grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-sm transition-colors hover:border-border hover:bg-muted/35">
      <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate text-xs font-medium">{label}</span>
      </div>
      <EditableTextBlock value={value} className="min-w-0 text-sm font-medium" />
    </div>
  );
}

function NotionActionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      {children}
    </Link>
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
      className="group rounded-[24px] border border-border bg-card p-5 transition-colors hover:border-border"
    >
      <div className="flex items-start justify-between gap-4">
        <Link href={`/clients/${client.id}`} className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-foreground text-sm font-black uppercase text-background">
            {client.name.charAt(0)}
          </div>
          <div className="min-w-0 text-start">
            <h3 className="truncate text-sm font-black uppercase tracking-tight text-foreground">{client.name}</h3>
            <p className="mt-1 truncate text-[9px] font-black uppercase tracking-widest text-muted-foreground">{client.contact}</p>
          </div>
        </Link>
        <Link
          href={`/clients/${client.id}/edit`}
          aria-label={`Edit ${client.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground/40 opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        >
          <Edit className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusPill label={translateClientType(t, client.type)} tone={typeTone(client.type)} />
        <StatusPill label={translateClientPriority(t, client.priority)} tone={client.priority === "urgent" ? "danger" : client.priority === "high" ? "warning" : "neutral"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {client.budget && client.budget !== "0" && (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            {client.budget}
          </div>
        )}
        {client.notes && (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            {client.notes}
          </div>
        )}
        {client.tags?.slice(0, 2).map(tag => (
          <div key={tag} className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2 py-1 text-[10px] font-bold text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            {tag}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{client.lastContact}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("actions.markClosed")}
            disabled={isClosing}
            onClick={(event) => {
              event.stopPropagation();
              onMarkClosed(client);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
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
            className="text-muted-foreground/40 transition-colors hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStagesSettingsOpen, setIsStagesSettingsOpen] = useState(false);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("clients-filters");
      if (saved) {
        const { filter: savedFilter, stageFilter: savedStage } = JSON.parse(saved);
        if (savedFilter && clientFilters.includes(savedFilter)) setFilter(savedFilter);
        if (savedStage && clientStageFilters.includes(savedStage)) setStageFilter(savedStage);
      }
    } catch {}
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("clients-filters", JSON.stringify({ filter, stageFilter }));
    } catch {}
  }, [filter, stageFilter]);

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
  const { stages: pipelineStagesData } = usePipelineStages(workspaceOrganizationId);

  const searchedClients = useMemo(() => clients.filter((client) => matchesClientSearch(client, search)), [clients, search]);

  const activeJourneyClients = useMemo(
    () => activeJourneyClientRows(searchedClients),
    [searchedClients],
  );

  const tableClients = useMemo(() => clientsForStageFilter(searchedClients, stageFilter), [searchedClients, stageFilter]);

  const displayedClients = displayedClientsForView(searchedClients, view, stageFilter);

  const updateClientField = (client: Client, field: string, value: any) => {
    if (!account.organization.id) return;
    updateClientMutation.mutate({
      organizationId: account.organization.id,
      client,
      values: {
        ...clientToFormValues(client),
        [field]: value,
      },
    });
  };

  const markClientClosed = (client: Client) => {
    if (!account.organization.id) return;
    updateClientMutation.mutate({
      organizationId: account.organization.id,
      client,
      values: {
        ...clientToFormValues(client),
        pipelineStage: "closed",
      },
    }, {
      onSuccess: () => {
        setSearch("");
        setStageFilter("all");
        setDraggedId(null);
        setDragOverStage(null);
        setDragOverIndex(null);
      },
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ── Page Header ── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-6 h-12 sticky top-0 z-10">
        {/* Left: View switcher + filters */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-foreground shrink-0 tracking-tight">{t("title")}</h1>

          <div className="inline-flex items-center gap-1">
            {([
              { key: "pipeline", label: t("views.pipeline"), icon: <LayoutDashboard className="h-3 w-3" /> },
              { key: "list", label: t("views.list"), icon: <FileText className="h-3 w-3" /> },
              { key: "calendar", label: t("views.calendar"), icon: <CalendarDays className="h-3 w-3" /> },
            ] as ViewDefinition[]).map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setView(v.key as typeof view)}
                className={cn(
                  "relative h-7 rounded-md px-3 text-[11px] font-semibold transition-all inline-flex items-center gap-1.5",
                  view === v.key ? "bg-foreground text-background shadow-sm" : "text-text-muted hover:text-foreground",
                )}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[11px] font-semibold transition-all",
                (filter !== "all" || stageFilter !== "all") ? "border-primary/50 bg-primary/5 text-foreground" : "text-text-muted hover:text-foreground"
              )}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {(filter !== "all" || stageFilter !== "all") && (
                <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {(filter !== "all" ? 1 : 0) + (stageFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute top-full left-0 z-20 mt-1 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</p>
                      {(["all", "person", "organization"] as const).map((f) => (
                        <label key={f} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted cursor-pointer">
                          <input
                            type="radio"
                            name="type-filter"
                            checked={filter === f}
                            onChange={() => setFilter(f as "all" | ClientType)}
                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className={cn("font-medium", filter === f ? "text-foreground" : "text-muted-foreground")}>
                            {t(`toolbar.filters.${f}`)}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="h-px bg-border" />
                    <div>
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stage</p>
                      {clientStageFilters.map((stage) => (
                        <label key={stage} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted cursor-pointer">
                          <input
                            type="radio"
                            name="stage-filter"
                            checked={stageFilter === stage}
                            onChange={() => setStageFilter(stage)}
                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className={cn("font-medium", stageFilter === stage ? "text-foreground" : "text-muted-foreground")}>
                            {t(`stageFilters.${stage}`)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {(filter !== "all" || stageFilter !== "all") && (
                    <>
                      <div className="my-2 h-px bg-border" />
                      <button
                        type="button"
                        onClick={() => { setFilter("all"); setStageFilter("all"); }}
                        className="w-full rounded px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        Clear all filters
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Search + New Client */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-2.5 transition-colors focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("toolbar.search")}
              aria-label="Search clients"
              className="h-full w-28 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-text-muted"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("add")}</span>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={cn(
        "flex-1 min-h-0 p-5 md:p-6 lg:p-8",
        view === "pipeline" ? "overflow-hidden" : "overflow-auto"
      )}>
        <div className={cn(
          "mx-auto w-full space-y-6 h-full",
          view === "pipeline" ? "" : "max-w-[1400px]"
        )}>
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant={view === "pipeline" ? "pipeline" : view === "calendar" ? "calendar" : "table"} />
      ) : isQueryBlocked ? (
        <HttpQueryState query={clientsQuery} variant={view === "pipeline" ? "pipeline" : view === "calendar" ? "calendar" : "table"} />
      ) : view === "pipeline" && (
        <PipelineBoard
          items={activeJourneyClients.map((client) => clientToCardItem({
            id: client.id,
            name: client.name,
            contact: client.contact,
            phone: client.phone,
            company: client.company,
            source: client.source,
            pipelineStage: client.pipelineStage,
            type: client.type,
          }))}
          stages={activePipelineStages.map((stage, index) => ({
            key: stage,
            name: translateClientStage(t, stage),
            color: ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"][index] ?? "#9CA3AF",
            order: index,
          }))}
          showBarColor
          showCount
          draggable
          onCardMove={(itemId, _fromStage, toStage, targetIndex) => {
            if (!account.organization.id) return;
            const movingClient = clients.find((c) => c.id === itemId);
            if (movingClient) {
              const stageClients = sortPipelineClients(activeJourneyClients.filter((c) => c.pipelineStage === toStage));
              moveClientMutation.mutate({
                organizationId: account.organization.id,
                client: movingClient,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                stage: toStage as any,
                stageClients,
                targetIndex,
              });
            }
          }}
          onCardClick={(item) => {
            const client = clients.find((c) => c.id === item.id);
            if (client) router.push(`/clients/${client.id}`);
          }}
          onAddStage={() => setIsStagesSettingsOpen(true)}
        />
      )}

      {isWorkspaceReady && !isLoading && view === "list" && (
        <GroupedList
          items={tableClients.map((client) => clientToCardItem({
            id: client.id,
            name: client.name,
            contact: client.contact,
            phone: client.phone,
            company: client.company,
            source: client.source,
            pipelineStage: client.pipelineStage,
            type: client.type,
          }))}
          stages={activePipelineStages.map((stage, index) => ({
            key: stage,
            name: translateClientStage(t, stage),
            color: ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"][index] ?? "#9CA3AF",
            order: index,
          }))}
          showSearch
          showCount
          defaultExpanded
          onRowClick={(item) => {
            const client = clients.find((c) => c.id === item.id);
            if (client) router.push(`/clients/${client.id}`);
          }}
        />
      )}

      {isWorkspaceReady && !isLoading && view === "calendar" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {calendarEventsForClients(calendarEvents, searchedClients).map((event) => (
            <AppSection key={event.id} title={`${event.date} · ${event.time}`} description={event.owner}>
              <div className="flex items-start justify-between gap-4">
                <div className="text-start">
                  <p className="text-sm font-black uppercase tracking-tight text-foreground">{event.title}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{event.clientName ?? event.location ?? "Workspace event"}</p>
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

      <ClientSheet
        open={isCreateOpen}
        indexQueryKey={clientsQuery.queryKey}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setSearch("");
        }}
        onSuccess={() => {
          setSearch("");
          setStageFilter("all");
        }}
      />

      {workspaceOrganizationId && (
        <PipelineStagesSettings
          open={isStagesSettingsOpen}
          onOpenChange={setIsStagesSettingsOpen}
          organizationId={workspaceOrganizationId}
          stages={pipelineStagesData}
        />
      )}
    </div>
  </div>
</div>
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
        title={existing ? t("form.editTitle") : t("form.createTitle")}
      />

      <div className="rounded-2xl border border-border bg-card p-6">
        <ClientForm
          existing={existing ?? undefined}
          onSuccess={(nextId) => router.push(`/clients/${nextId}`)}
          onCancel={() => router.back()}
        />
      </div>
    </AppPageShell>
  );
}

"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock, Edit, Mail, Phone, Plus, Search, Trash2, User, UserPlus, Users, History as ActivityIcon, FileText as DocsIcon, LayoutDashboard, PhoneCall, Video, Tag, Link2, FileText, Briefcase, Calendar, type LucideIcon } from "lucide-react";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
    <div className="min-w-0 rounded-2xl bg-muted p-4">
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
      <p className="mt-2 line-clamp-2 text-sm font-black leading-snug text-foreground">{value}</p>
    </div>
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

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div className="text-start">
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{t('card.budget')}</p>
          <p className="mt-1 truncate text-[11px] font-black uppercase text-foreground">{client.budget}</p>
        </div>
        <div className="text-start">
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{t('card.next')}</p>
          <p className="mt-1 truncate text-[11px] font-black uppercase text-foreground">{client.nextAction}</p>
        </div>
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

  const searchedClients = useMemo(() => clients.filter((client) => matchesClientSearch(client, search)), [clients, search]);

  const activeJourneyClients = useMemo(
    () => activeJourneyClientRows(searchedClients),
    [searchedClients],
  );

  const tableClients = useMemo(() => clientsForStageFilter(searchedClients, stageFilter), [searchedClients, stageFilter]);

  const displayedClients = displayedClientsForView(searchedClients, view, stageFilter);

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

  const columns: AppDataTableColumn<Client>[] = [
    {
      key: "name",
      header: t('form.nameLabel'),
      render: (client) => (
        <Link
          href={`/clients/${client.id}`}
          onClick={(event) => event.stopPropagation()}
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-black text-foreground">{client.name.charAt(0)}</div>
          <div className="min-w-0 text-start">
            <p className="truncate text-xs font-black uppercase text-foreground">{client.name}</p>
            <p className="mt-1 truncate text-[9px] font-black uppercase tracking-widest text-muted-foreground">{client.contact}</p>
          </div>
        </Link>
      ),
    },
    { key: "type", header: t('detail.labels.type'), render: (client) => <StatusPill label={translateClientType(t, client.type)} tone={typeTone(client.type)} /> },
    { key: "budget", header: t('detail.labels.budget') },
    { key: "pipelineStage", header: t('form.stageLabel'), render: (client) => translateClientStage(t, client.pipelineStage) },
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
              className="p-2 text-muted-foreground/40 hover:text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <Link
            href={`/clients/${client.id}/edit`}
            aria-label={`Edit ${client.name}`}
            onClick={(event) => event.stopPropagation()}
            className="p-2 text-muted-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button type="button" aria-label={`Delete ${client.name}`} onClick={(event) => { event.stopPropagation(); setDeleting(client); }} className="p-2 text-muted-foreground/40 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ── Page Header ── */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-8 h-14 sticky top-0 z-10">
        {/* Left: Title + divider + Type filter + View tabs */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold text-foreground shrink-0 tracking-tight">{t("title")}</h1>
          <div className="h-4 w-px bg-border shrink-0" />
          {/* Type filter */}
          <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 gap-0.5">
            {(["all", "person", "organization"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f as "all" | ClientType)}
                className={cn(
                  "h-6 rounded-lg px-2.5 text-[11px] font-semibold transition-all",
                  filter === f ? "bg-foreground text-background shadow-sm" : "text-text-muted hover:text-foreground",
                )}
              >
                {t(`toolbar.filters.${f}`)}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          {/* View tabs */}
          <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 gap-0.5">
            {(["pipeline", "list", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "h-6 rounded-lg px-2.5 text-[11px] font-semibold transition-all",
                  view === mode ? "bg-foreground text-background shadow-sm" : "text-text-muted hover:text-foreground",
                )}
              >
                {t(`views.${mode}`)}
              </button>
            ))}
          </div>
          {/* Stage sub-filter (list mode only) */}
          {view === "list" && (
            <>
              <div className="h-4 w-px bg-border shrink-0" />
              <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 gap-0.5">
                {clientStageFilters.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setStageFilter(stage)}
                    className={cn(
                      "h-6 rounded-lg px-2.5 text-[11px] font-semibold transition-all",
                      stageFilter === stage ? "bg-foreground text-background shadow-sm" : "text-text-muted hover:text-foreground",
                    )}
                  >
                    {t(`stageFilters.${stage}`)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Search + New Client */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center gap-2 rounded-xl border border-border bg-card px-3 transition-colors focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("toolbar.search")}
              aria-label="Search clients"
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-text-muted"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {t("add")}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-5 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1400px] space-y-6">
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
                    : "border-border bg-muted/40"
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
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{translateClientStage(t, stage)}</h2>
                  <span className="text-[10px] font-black text-muted-foreground/40">{String(stats?.stages?.[stage] ?? stageClients.length).padStart(2, "0")}</span>
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
        </div>
      </div>
    </div>
  );
}

export function ClientDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Clients');
  const locale = useLocale();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const client = useClientQuery(workspaceOrganizationId, id) as Client | null | undefined;
  const tasks = useClientTasksQuery(workspaceOrganizationId, id) ?? [];
  const events = useCalendarEventsQuery(workspaceOrganizationId, id) ?? [];
  const followUpsRaw = useClientFollowUpsQuery(workspaceOrganizationId, id);
  const followUps = useMemo(() => followUpsRaw ?? [], [followUpsRaw]);
  const linkedOpportunities = useOpportunitiesQuery(workspaceOrganizationId, { stage: "all" });
  const linkedProjects = useConvexQuery(
    convexApi.projects.read.listByClient,
    workspaceOrganizationId && id ? { organizationId: workspaceOrganizationId, clientId: id as ConvexId<"clients"> } : "skip",
  ) ?? [];
  const [taskTitle, setTaskTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [followUpFilter, setFollowUpFilter] = useState<"all" | "upcoming" | "past" | "completed">("all");
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpForm, setFollowUpForm] = useState<ClientFollowUpPayload>(() => ({
    clientId: id,
    type: "call",
    title: "",
    notes: "",
    followUpDate: Date.now(),
    status: "upcoming",
  }));
  const router = useRouter();
  const profileOperation = useOperationState({ errorMessage: "Client update failed." });
  const deleteOperation = useOperationState({ errorMessage: "Client delete failed." });
  const taskOperation = useOperationState({ errorMessage: "Task action failed." });
  const followUpOperation = useOperationState({ errorMessage: "Follow-up action failed." });
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
  const clientCloseMutation = useUpdateClientOptimisticMutation(
    clientsIndexQueryBaseKey(workspaceOrganizationId),
  );

  const filteredFollowUps = useMemo(() => {
    if (followUpFilter === "all") return followUps;
    return followUps.filter((fu: { status: string }) => fu.status === followUpFilter);
  }, [followUps, followUpFilter]);

  const clientOpportunities = useMemo(() => {
    return (linkedOpportunities ?? []).filter((opp) => opp.clientId === id);
  }, [linkedOpportunities, id]);

  const handleCreateFollowUp = useCallback(async () => {
    if (!workspaceOrganizationId || !followUpForm.title.trim()) return;
    await followUpOperation.run(async () => {
      await createFollowUpRequest(workspaceOrganizationId, {
        ...followUpForm,
        clientId: id,
        followUpDate: Date.now(),
      });
      setFollowUpForm({ clientId: id, type: "call", title: "", notes: "", followUpDate: Date.now(), status: "upcoming" });
      setShowFollowUpForm(false);
    }, { successMessage: "Follow-up created." });
  }, [workspaceOrganizationId, followUpForm, id, followUpOperation]);

  const handleDeleteFollowUp = useCallback(async (followUpId: string) => {
    if (!workspaceOrganizationId) return;
    await followUpOperation.run(
      () => deleteFollowUpRequest(workspaceOrganizationId, followUpId),
      { successMessage: "Follow-up deleted." },
    );
  }, [workspaceOrganizationId, followUpOperation]);

  const handleMarkFollowUpComplete = useCallback(async (followUpId: string) => {
    if (!workspaceOrganizationId) return;
    await followUpOperation.run(
      () => markFollowUpCompleteRequest(workspaceOrganizationId, followUpId),
      { successMessage: "Follow-up completed." },
    );
  }, [workspaceOrganizationId, followUpOperation]);

  if (workspaceStatus !== "ready") {
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} variant="detail" /></AppPageShell>;
  }

  if (client === undefined) {
    return (
      <AppPageShell>
        <ProgressiveLoadingState
          title={t("detail.loadingTitle")}
          description={t("detail.loadingDesc")}
          debug={queryDebug}
          variant="detail"
        />
      </AppPageShell>
    );
  }

  if (client === null) {
    return (
      <AppPageShell>
        <DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/clients" backLabel={t('detail.back')} />
      </AppPageShell>
    );
  }

  const currentStageIndex = clientPipelineStageIndex(client.pipelineStage);
  const markClosed = () => {
    if (!workspaceOrganizationId) return;
    clientCloseMutation.mutate({
      organizationId: workspaceOrganizationId,
      client,
      values: {
        ...clientToFormValues(client),
        pipelineStage: "closed",
      },
    });
  };

  return (
    <AppPageShell contentClassName="space-y-8 pb-16">
      <section className="space-y-5 text-start">
        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground text-lg font-black uppercase text-background">
              {client.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground">{client.id.toUpperCase()}</p>
              <h1 className="mt-2 max-w-5xl text-3xl font-black leading-tight text-foreground md:text-[32px]">
                {client.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {client.tags?.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
                <StatusPill label={translateClientType(t, client.type)} tone={typeTone(client.type)} />
                <StatusPill label={translateClientStatus(t, client.status)} tone={client.status === "active" ? "success" : "neutral"} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ClientMetaPill icon={Mail}>{client.contact}</ClientMetaPill>
                <ClientMetaPill icon={Phone}>{client.phone}</ClientMetaPill>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-border px-3 text-xs font-bold"
                onClick={() => window.location.href = `tel:${client.phone}`}
              >
                <PhoneCall className="me-1.5 h-3.5 w-3.5" />
                Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-border px-3 text-xs font-bold"
                onClick={() => window.location.href = `mailto:${client.contact}`}
              >
                <Mail className="me-1.5 h-3.5 w-3.5" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-border px-3 text-xs font-bold"
                onClick={() => router.push('/calendar')}
              >
                <Calendar className="me-1.5 h-3.5 w-3.5" />
                Schedule
              </Button>
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
                  disabled={clientCloseMutation.isPending}
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
        </div>

        <div className="inline-flex max-w-full rounded-[24px] border border-border bg-card p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {pipelineStages.map((stage, i) => (
              <div
                key={stage}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 transition-colors",
                  i <= currentStageIndex ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black",
                    i <= currentStageIndex ? "bg-foreground/15 text-current" : "border border-border"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 truncate text-xs font-black">{translateClientStage(t, stage)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Tabs defaultValue="followups" className="space-y-6">
        <AppTabsList tabs={[
          { value: "followups", label: "Follow-ups & Notes", icon: Clock },
          { value: "overview", label: t('views.pipeline'), icon: LayoutDashboard },
          { value: "profile", label: t('detail.recordTitle'), icon: User },
          { value: "docs", label: t('detail.tabs.documents'), icon: DocsIcon },
          { value: "activity", label: t('detail.tabs.activity'), icon: ActivityIcon },
          { value: "connections", label: "Connections", icon: Link2 },
        ]} />

        <TabsContent value="followups" className="space-y-6">
          <AppSection
            title="Follow-ups & Notes"
            description="Track all interactions and follow-ups with this client"
            actions={(
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">{followUps.length} total</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                  className="h-8 rounded-xl px-3 text-xs font-bold"
                >
                  <Plus className="me-1 h-3.5 w-3.5" />
                  Add New Follow-up
                </Button>
              </div>
            )}
          >
            {/* Filter bar */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 mb-4">
              {(["all", "upcoming", "past", "completed"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setFollowUpFilter(filter)}
                  className={cn(
                    "h-7 rounded-lg px-3 text-[11px] font-semibold transition-all capitalize",
                    followUpFilter === filter ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Add New Follow-up Form */}
            {showFollowUpForm && (
              <div className="rounded-[20px] border border-border bg-muted p-4 mb-4 space-y-3">
                <div className="grid gap-3 md:grid-cols-[140px_1fr_160px]">
                  <select
                    value={followUpForm.type}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value as ClientFollowUpPayload["type"] })}
                    className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="call">Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="email">Email</option>
                    <option value="task">Task</option>
                  </select>
                  <input
                    value={followUpForm.title}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                    placeholder="Follow-up title..."
                    className="h-10 min-w-0 rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground outline-none transition focus:border-ring"
                  />
                  <select
                    value={followUpForm.status}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, status: e.target.value as ClientFollowUpPayload["status"] })}
                    className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                <textarea
                  value={followUpForm.notes ?? ""}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground outline-none transition focus:border-ring resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowFollowUpForm(false)} className="h-8 rounded-xl text-xs font-bold">
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!followUpForm.title.trim() || followUpOperation.isRunning}
                    onClick={handleCreateFollowUp}
                    className="h-8 rounded-xl px-4 text-xs font-bold"
                  >
                    {followUpOperation.isRunning ? "Saving..." : "Save Follow-up"}
                  </Button>
                </div>
                {followUpOperation.error && <p className="text-xs font-bold text-red-500">{followUpOperation.error}</p>}
              </div>
            )}

            {/* Follow-ups History List */}
            <div className="grid gap-3">
              {filteredFollowUps.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm font-bold text-muted-foreground">
                  No follow-ups found. Click "Add New Follow-up" to create one.
                </div>
              ) : (
                filteredFollowUps.map((followUp: { id: string; type: string; status: string; followUpDate: number; title: string; notes?: string }, index: number) => {
                  const typeIcons: Record<string, LucideIcon> = {
                    call: PhoneCall,
                    meeting: Video,
                    email: Mail,
                    task: CheckCircle2,
                  };
                  const TypeIcon = typeIcons[followUp.type] || Clock;
                  const isRecent = index === 0;
                  const date = new Date(followUp.followUpDate);
                  const dateLabel = date.toLocaleDateString(locale, { month: "short", day: "numeric" });
                  const timeLabel = date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

                  return (
                    <article
                      key={followUp.id}
                      className={cn(
                        "grid gap-4 rounded-[20px] border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
                        isRecent ? "border-foreground/20 ring-1 ring-foreground/5" : "border-border",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            <TypeIcon className="h-2.5 w-2.5" />
                            {followUp.type}
                          </span>
                          <StatusPill
                            label={followUp.status}
                            tone={followUp.status === "completed" ? "success" : followUp.status === "upcoming" ? "info" : "neutral"}
                          />
                          <span className="text-[10px] font-bold text-muted-foreground">{dateLabel} {timeLabel}</span>
                        </div>
                        <p className="mt-2 text-sm font-black text-foreground">{followUp.title}</p>
                        {followUp.notes && (
                          <p className="mt-1 text-xs font-medium text-muted-foreground line-clamp-2">{followUp.notes}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-black">Y</div>
                          <span>You</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={followUpOperation.isRunning}
                          onClick={() => handleMarkFollowUpComplete(followUp.id)}
                          className="h-8 rounded-xl text-[10px] font-bold"
                        >
                          <CheckCircle2 className="me-1 h-3 w-3" />
                          {followUp.status === "completed" ? "Done" : "Complete"}
                        </Button>
                        <button
                          type="button"
                          disabled={followUpOperation.isRunning}
                          onClick={() => handleDeleteFollowUp(followUp.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          aria-label="Delete follow-up"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </AppSection>
        </TabsContent>

        <TabsContent value="overview">
          <div className="space-y-5">
            <AppSection
              title={t('detail.recordTitle')}
              actions={(
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label={translateClientStage(t, client.pipelineStage)} tone={client.pipelineStage === "closed" ? "success" : "info"} />
                  <StatusPill label={translateClientType(t, client.type)} tone={typeTone(client.type)} />
                  <StatusPill label={translateClientStatus(t, client.status)} tone={client.status === "active" ? "success" : "neutral"} />
                  <StatusPill label={translateClientPriority(t, client.priority)} tone={client.priority === "urgent" ? "danger" : client.priority === "high" ? "warning" : "neutral"} />
                </div>
              )}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <CompactClientFact label={t('detail.labels.budget')} value={client.budget} />
                <CompactClientFact label={t('detail.nextTitle')} value={client.nextAction} />
                <ClientInfoRow icon={Search} label={t('detail.labels.interest')} value={client.assetInterest} />
                <div className="grid gap-3 md:col-span-2 xl:col-span-3 xl:grid-cols-3">
                  <ClientInfoRow icon={Mail} label={t('detail.labels.email')} value={client.contact} />
                  <ClientInfoRow icon={Phone} label={t('detail.labels.phone')} value={client.phone} />
                  <ClientInfoRow icon={CalendarDays} label={t('card.next')} value={`${client.nextActionDate} ${t('detail.at')} ${client.appointmentTime}`} />
                </div>
              </div>
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
                <ClientDetailField label={t('form.interestLabel')} name="assetInterest" defaultValue={client.assetInterest} />
                <ClientDetailField label={t('form.actionLabel')} name="nextAction" defaultValue={client.nextAction} className="lg:col-span-2" />
                <ClientDetailField label={t('form.issueLabel')} name="issue" defaultValue={client.issue ?? ""} />
                <ClientDetailField label="Nationality" name="nationality" defaultValue={client.nationality} />
                <ClientDetailField label="Generation" name="generation" defaultValue={client.generation} />
                <ClientDetailSelect
                  label={t('form.typeLabel')}
                  name="type"
                  defaultValue={client.type}
                  options={clientTypes.map((value) => ({ value, label: translateClientType(t, value) }))}
                />
                <ClientDetailSelect
                  label={t('form.statusLabel')}
                  name="status"
                  defaultValue={client.status}
                  options={clientStatuses.map((value) => ({ value, label: translateClientStatus(t, value) }))}
                />
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
                <ClientDetailSelect
                  label={t('form.priorityLabel')}
                  name="priority"
                  defaultValue={client.priority}
                  options={clientPriorities.map((value) => ({ value, label: translateClientPriority(t, value) }))}
                />
                <ClientDetailSelect
                  label={t('form.stageLabel')}
                  name="pipelineStage"
                  defaultValue={client.pipelineStage}
                  options={pipelineStages.map((value) => ({ value, label: translateClientStage(t, value) }))}
                />
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
                <span className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">{tasks.length} {t('detail.activity.tasks')}</span>
                <span className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">{events.length} {t('detail.activity.events')}</span>
              </>
            )}
          >

            <form
              className="grid gap-2 rounded-[20px] bg-muted p-3 md:grid-cols-[140px_minmax(220px,1fr)_132px_132px_156px_auto]"
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
              <input type="hidden" name="status" value="todo" />
              {canManageVisibility ? (
                <select name="visibility" defaultValue="private" className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground outline-none">
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
                className="h-10 min-w-0 rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground outline-none transition focus:border-border focus:border-ring"
              />
              <select name="priority" defaultValue={client.priority} className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground outline-none">
                {clientPriorities.map((value) => <option key={value} value={value}>{translateClientPriority(t, value)}</option>)}
              </select>
              <input name="dueAt" type="date" className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground outline-none" />
              <input type="hidden" name="assetId" value="" />
              <Button type="submit" disabled={!taskTitle.trim() || taskOperation.isRunning} className="h-10 rounded-xl px-5 text-xs font-black">
                {t('detail.activity.add')}
              </Button>
            </form>

            {taskOperation.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-950/50 dark:bg-red-950/20">{taskOperation.error}</p>}

            <div className="grid gap-3">
              {tasks.length === 0 && events.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm font-bold text-muted-foreground">
                  {t('detail.activity.emptyTasks')}
                </div>
              ) : null}

              {clientTaskActivityRows(tasks, [] as Array<{ id: string; title: string }>, locale, t('detail.activity.noDate')).map(({ task, linkedAsset, isDone, statusTone, dueDateLabel }) => {
                return (
                  <article key={task.id} className="grid gap-4 rounded-[20px] border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill label={t(`detail.activity.taskStatuses.${task.status}`)} tone={statusTone} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{translateClientPriority(t, task.priority)}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{dueDateLabel}</span>
                      </div>
                      <p className={cn("mt-2 truncate text-sm font-black text-foreground", isDone && "text-muted-foreground line-through dark:text-muted-foreground")}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <span>{t('detail.activity.tasks')}</span>
                        {linkedAsset && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/40 dark:bg-muted" />
                            <span>{linkedAsset.title}</span>
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
                            return updateClientTaskRequest(
                              workspaceOrganizationId,
                              task.id,
                              clientTaskUpdatePayload(task, client.id, { visibility: event.target.value as ClientTaskPayload["visibility"] }),
                            );
                          }, { successMessage: t("detail.activity.saved") })}
                          className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground outline-none"
                        >
                          <option value="private">{t("form.visibilityPrivate")}</option>
                          <option value="workspace">{t("form.visibilityPublic")}</option>
                        </select>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={taskOperation.isRunning}
                        onClick={() => void taskOperation.run(() => {
                          if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                          return updateClientTaskRequest(
                            workspaceOrganizationId,
                            task.id,
                            clientTaskUpdatePayload(task, client.id, { status: isDone ? "todo" : "done" }),
                          );
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
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/30"
                        aria-label={t('detail.activity.deleteTask')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}

              {events.map((event) => (
                <article key={event.id} className="grid gap-4 rounded-[20px] border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={event.status} tone="info" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('detail.activity.calendarEvents')}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{event.date} · {event.time}</span>
                    </div>
                    <p className="mt-2 truncate text-sm font-black text-foreground">{event.title}</p>
                  </div>
                  <span className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground">
                    {t('detail.activity.events')}
                  </span>
                </article>
              ))}
            </div>
          </AppSection>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <AppSection
            title="Related Items"
            description="Linked opportunities, projects, calendar events, and documents"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {/* Linked Opportunities */}
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Opportunities</h3>
                  <span className="ml-auto text-[10px] font-bold text-muted-foreground">{clientOpportunities.length}</span>
                </div>
                {clientOpportunities.length === 0 ? (
                  <p className="text-xs font-medium text-muted-foreground">No linked opportunities</p>
                ) : (
                  <div className="space-y-2">
                    {clientOpportunities.map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between rounded-xl bg-muted p-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground">{opp.title}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">
                            {opp.value ? `$${opp.value.toLocaleString()}` : "No value"} · {opp.stage}
                          </p>
                        </div>
                        <StatusPill label={opp.status} tone={opp.status === "open" ? "info" : opp.status === "won" ? "success" : "neutral"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Projects */}
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Projects</h3>
                  <span className="ml-auto text-[10px] font-bold text-muted-foreground">{linkedProjects.length}</span>
                </div>
                {linkedProjects.length === 0 ? (
                  <p className="text-xs font-medium text-muted-foreground">No linked projects</p>
                ) : (
                  <div className="space-y-2">
                    {linkedProjects.map((project: { id: string; name: string; status: string }) => (
                      <div key={project.id} className="flex items-center justify-between rounded-xl bg-muted p-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground">{project.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{project.status}</p>
                        </div>
                        <StatusPill label={project.status} tone={project.status === "active" ? "success" : "neutral"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Calendar Events */}
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Calendar Events</h3>
                  <span className="ml-auto text-[10px] font-bold text-muted-foreground">{events.length}</span>
                </div>
                {events.length === 0 ? (
                  <p className="text-xs font-medium text-muted-foreground">No linked calendar events</p>
                ) : (
                  <div className="space-y-2">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between rounded-xl bg-muted p-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground">{event.title}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{event.date} · {event.time}</p>
                        </div>
                        <StatusPill label={event.status} tone="info" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Documents */}
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Documents</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground">Proposal_v2.pdf</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">2.4 MB</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground">Contract Draft</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">1.1 MB</span>
                  </div>
                </div>
              </div>
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

      <div className="rounded-[32px] border border-border bg-card p-10">
        <ClientForm
          existing={existing ?? undefined}
          onSuccess={(nextId) => router.push(`/clients/${nextId}`)}
          onCancel={() => router.back()}
        />
      </div>
    </AppPageShell>
  );
}

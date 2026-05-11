"use client";

import { useMemo, useState, type ComponentProps } from "react";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, Copy, Edit, Mail, Phone, Plus, Trash2, User, UserPlus, Users, History as ActivityIcon, FileText as DocsIcon, LayoutDashboard, Building } from "lucide-react";
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
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import {
  CLIENTS_PAGE_SIZE,
  deleteClientRequest,
  linkClientUnitRequest,
  updateClientRequest,
  useClientQuery,
  useClientsPagedQuery,
  useClientStatsQuery,
  useClientUnitLinksQuery,
} from "@/domains/clients/api/clients";
import {
  createClientTaskRequest,
  updateClientTaskRequest,
  useClientTasksQuery,
} from "@/domains/clients/api/client-tasks";
import { useCalendarEventsQuery, useCalendarStatsRangeQuery } from "@/domains/calendar/api/calendar";
import { usePropertiesQuery } from "@/domains/properties/api/properties";
import { ResourceMediaUploader } from "@/domains/media/components/resource-media-uploader";
import type { Client, ClientType } from "../store/clients.types";
import { useOperationState } from "@/lib/utils/operation-state";
import { DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, ProgressiveLoadingState, SearchBox, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ClientForm } from "./client-form";
import { ClientSheet } from "./client-sheet";
import type { PropertyStatus } from "@/domains/properties";

const pipelineStages = ["new", "qualified", "viewing", "negotiation", "closed"] as const;
const clientFilters = ["all", "Buyer", "Tenant", "Investor", "Broker"] as const;
const clientViews = ["pipeline", "list", "calendar"] as const;
type StatusPillTone = ComponentProps<typeof StatusPill>["tone"];

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
    pipelineStage: client.pipelineStage,
    priority: client.priority,
    nextAction: client.nextAction,
    issue: client.issue ?? "",
  };
}

function ClientMiniCard({ client, onDelete }: { client: Client; onDelete: (client: Client) => void }) {
  const t = useTranslations('Clients');
  return (
    <article
      draggable
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

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{client.lastContact}</span>
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
    </article>
  );
}

export function ClientsWorkspace({ initialView = "pipeline" }: { initialView?: "pipeline" | "calendar" | "list" }) {
  const t = useTranslations('Clients');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const [filter, setFilter] = useState<(typeof clientFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<(typeof clientViews)[number]>(initialView);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ stage: string; index: number } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const deleteOperation = useOperationState({ errorMessage: "Client delete failed." });
  const moveOperation = useOperationState({ errorMessage: "Client move failed." });

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

  const clientsQuery = useClientsPagedQuery(workspaceOrganizationId, {
    type: filter === "all" ? undefined : filter,
    search,
  });
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
  const stats = useClientStatsQuery(workspaceOrganizationId);
  const calendarStats = useCalendarStatsRangeQuery(workspaceOrganizationId, 0, 4102444800000);
  const calendarEventsQuery = useCalendarEventsQuery(workspaceOrganizationId);
  const calendarEvents = useMemo(() => calendarEventsQuery ?? [], [calendarEventsQuery]);
  const isLoading = isWorkspaceReady && clientsQuery.status === "LoadingFirstPage";

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || [client.name, client.contact, client.propertyInterest, client.budget].some((value) => value.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [clients, search]);

  const columns: AppDataTableColumn<Client>[] = [
    {
      key: "name",
      header: t('form.nameLabel'),
      render: (client) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-xs font-black dark:bg-white/5">{client.name.charAt(0)}</div>
          <div className="min-w-0 text-start">
            <p className="truncate text-xs font-black uppercase text-zinc-900 dark:text-white">{client.name}</p>
            <p className="mt-1 truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{client.contact}</p>
          </div>
        </div>
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
          <Link href={`/clients/${client.id}/edit`} aria-label={`Edit ${client.name}`} className="p-2 text-zinc-300 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:text-white">
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
        { label: t("stats.appointments"), value: calendarStats?.total ?? "...", icon: Copy },
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
      </div>

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} />
      ) : isLoading ? (
        <ProgressiveLoadingState />
      ) : view === "pipeline" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-5">
          {pipelineStages.map((stage) => {
            const stageClients = filteredClients.filter((client) => client.pipelineStage === stage);
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
                      void moveOperation.run(() =>
                        updateClientRequest(account.organization.id!, movingClient.id, {
                          ...clientToFormValues(movingClient),
                          pipelineStage: stage,
                        }),
                      );
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
                        <ClientMiniCard client={client} onDelete={setDeleting} />
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
        <AppDataTable columns={columns} data={filteredClients} getRowKey={(client) => client.id} />
      )}

      {isWorkspaceReady && !isLoading && view === "calendar" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {calendarEvents
            .filter((event) => !event.clientId || filteredClients.some((client) => client.id === event.clientId))
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

      {isWorkspaceReady && !isLoading && filteredClients.length === 0 && <EmptyWorkspace icon={Users} title={t('empty.title')} description={t('empty.desc')} />}
      {isWorkspaceReady && !isLoading && filteredClients.length > 0 && (
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
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!deleting || !clients.some((client) => client.id === deleting.id)) {
            throw new Error("This client is no longer available.");
          }
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deleteClientRequest(account.organization.id, deleting.id);
        }, {
          successMessage: "Client deleted.",
          onSuccess: () => setDeleting(null),
        })}
      />

      <ClientSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </AppPageShell>
  );
}

export function ClientDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Clients');
  const account = useAccountContext();
  const client = useClientQuery(account.organization.id ?? undefined, id) as Client | null | undefined;
  const linkedUnitsQuery = useClientUnitLinksQuery(account.organization.id ?? undefined, id);
  const linkedUnits = useMemo(() => linkedUnitsQuery ?? [], [linkedUnitsQuery]);
  const units = useMemo(() => linkedUnits.flatMap((row) => (row.unit ? [row.unit] : [])), [linkedUnits]);
  const allUnits = usePropertiesQuery(account.organization.id ?? undefined) ?? [];
  const tasks = useClientTasksQuery(account.organization.id ?? undefined, id) ?? [];
  const events = useCalendarEventsQuery(account.organization.id ?? undefined, id) ?? [];
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [unitToLink, setUnitToLink] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const deleteOperation = useOperationState({ errorMessage: "Client delete failed." });
  const taskOperation = useOperationState({ errorMessage: "Task action failed." });
  const linkOperation = useOperationState({ errorMessage: "Unit link failed." });

  if (client === undefined) {
    return <AppPageShell><EmptyWorkspace icon={Users} title="Loading client" description="Client data is syncing from Convex." /></AppPageShell>;
  }

  if (!client) {
    return (
      <AppPageShell>
        <DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/clients" backLabel={t('detail.back')} />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell>
      {/* ── Client Identity Header ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-zinc-900 text-xl font-black uppercase text-white dark:bg-white dark:text-zinc-900">
            {client.name.charAt(0)}
          </div>
          <div className="text-start">
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{client.name}.</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusPill label={t(`types.${client.type}`)} tone={typeTone(client.type)} />
              <StatusPill label={t(`statuses.${client.status}`)} tone={client.status === "active" ? "success" : "neutral"} />
              <StatusPill label={t(`priorities.${client.priority}`)} tone={client.priority === "urgent" ? "danger" : client.priority === "high" ? "warning" : "neutral"} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${client.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-100 bg-white px-5 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
            <Edit className="me-2 h-3.5 w-3.5" />
            {t('detail.edit')}
          </Link>
          <Button variant="ghost" onClick={() => setDeleting(true)} className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">
            <Trash2 className="me-2 h-3.5 w-3.5" />
            {t('detail.delete')}
          </Button>
        </div>
      </div>

      {/* ── Pipeline Progress ── */}
      <div className="rounded-[20px] border border-zinc-100 bg-white p-5 dark:border-white/5 dark:bg-[#0A0A0A]">
        <div className="flex items-center gap-2">
          {pipelineStages.map((stage, i) => {
            const stageIdx = pipelineStages.indexOf(client.pipelineStage as typeof pipelineStages[number]);
            return (
              <div key={stage} className="flex flex-1 items-center gap-2">
                <div className="flex flex-1 flex-col items-center gap-2">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-black transition-all",
                    i <= stageIdx ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 text-zinc-300 dark:border-white/10 dark:text-white/20"
                  )}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className={cn("text-[8px] font-black uppercase tracking-widest text-center", i <= stageIdx ? "text-zinc-900 dark:text-white" : "text-zinc-300 dark:text-white/20")}>
                    {t(`stages.${stage}`)}
                  </p>
                </div>
                {i < pipelineStages.length - 1 && (
                  <div className={cn("h-[2px] flex-1 rounded-full -mt-5", i < stageIdx ? "bg-zinc-900 dark:bg-white" : "bg-zinc-100 dark:bg-white/5")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <AppTabsList tabs={[
          { value: "overview", label: t('views.pipeline'), icon: LayoutDashboard },
          { value: "profile", label: t('detail.recordTitle'), icon: User },
          { value: "units", label: t('detail.tabs.units'), icon: Building },
          { value: "activity", label: t('detail.tabs.activity'), icon: ActivityIcon },
          { value: "docs", label: t('detail.tabs.documents'), icon: DocsIcon },
        ]} />

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Next Action + Contact */}
            <div className="space-y-6 lg:col-span-5">
              <AppSection tone="inverse" title={t('detail.nextTitle')}>
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white mb-6">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <h4 className="text-2xl font-black uppercase leading-tight tracking-tighter text-white">{client.nextAction}</h4>
                  </div>
                  <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                      <CalendarDays className="h-4 w-4 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('card.next')}</p>
                      <p className="text-sm font-black uppercase text-white">{client.nextActionDate} {t('detail.at')} {client.appointmentTime}</p>
                    </div>
                  </div>
                </div>
              </AppSection>
              <div className="rounded-[24px] border border-zinc-100 bg-white p-6 dark:border-white/5 dark:bg-[#0A0A0A]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-5">{t('detail.recordTitle')}</p>
                <div className="space-y-4">
                  {[
                    { label: t('detail.labels.email'), value: client.contact, icon: Mail },
                    { label: t('detail.labels.phone'), value: client.phone, icon: Phone },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 dark:bg-white/5"><Icon className="h-4 w-4" /></div>
                      <div className="min-w-0 text-start">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
                        <p className="mt-0.5 truncate text-sm font-black uppercase text-zinc-900 dark:text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center: Property Interest + Units Preview */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-[24px] border border-zinc-100 bg-white p-6 dark:border-white/5 dark:bg-[#0A0A0A]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-5">{t('detail.labels.interest')}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><Building className="h-5 w-5" /></div>
                  <div className="text-start">
                    <p className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">{client.propertyInterest}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">{t(`types.${client.type}`)}</p>
                  </div>
                </div>
                <div className="border-t border-zinc-100 pt-5 dark:border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-start">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('detail.labels.budget')}</p>
                      <p className="mt-1.5 text-lg font-black uppercase text-zinc-900 dark:text-white">{client.budget}</p>
                    </div>
                    <div className="text-start">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('detail.labels.priority')}</p>
                      <p className="mt-1.5 text-lg font-black uppercase text-zinc-900 dark:text-white">{t(`priorities.${client.priority}`)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-zinc-100 bg-white p-6 dark:border-white/5 dark:bg-[#0A0A0A]">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('detail.tabs.units')}</p>
                  <span className="text-[10px] font-black text-zinc-300">{String(units.slice(0, 3).length).padStart(2, "0")}</span>
                </div>
                <div className="space-y-3">
                  {units.slice(0, 3).map((u) => (
                    <Link key={u.id} href={`/properties/${u.id}`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/5">
                        {u.coverImageUrl ? <Image src={u.coverImageUrl} alt="" width={40} height={40} className="h-full w-full object-cover grayscale" /> : null}
                      </div>
                      <div className="min-w-0 flex-1 text-start">
                        <p className="truncate text-xs font-black uppercase text-zinc-900 dark:text-white">{u.title}</p>
                        <p className="truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{u.price} SAR</p>
                      </div>
                      <StatusPill label={u.status} tone={unitStatusTone(u.status)} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Timeline + Documents */}
            <div className="space-y-6 lg:col-span-3">
              <div className="rounded-[24px] border border-zinc-100 bg-white p-6 dark:border-white/5 dark:bg-[#0A0A0A]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-5">{t('detail.activity.subtitle')}</p>
                <div className="space-y-4">
                  {[
                    ...tasks.slice(0, 2).map((task) => ({ action: task.title, date: task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 10) : "Open", color: task.status === "done" ? "bg-zinc-300" : "bg-emerald-500" })),
                    ...events.slice(0, 2).map((event) => ({ action: event.title, date: `${event.date} ${event.time}`, color: "bg-blue-500" })),
                    { action: t('stages.new'), date: client.added, color: "bg-zinc-300" },
                  ].slice(0, 4).map((event, i, list) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("h-2.5 w-2.5 rounded-full", event.color)} />
                        {i < list.length - 1 && <div className="h-8 w-[2px] bg-zinc-100 dark:bg-white/5" />}
                      </div>
                      <div className="text-start -mt-0.5">
                        <p className="text-[11px] font-black uppercase text-zinc-900 dark:text-white">{event.action}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[24px] bg-zinc-900 p-8 text-center dark:bg-white">
                <DocsIcon className="h-6 w-6 text-white dark:text-zinc-900" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/50 dark:text-zinc-900/50">{t('detail.tabs.documents')}</p>
                <Button variant="outline" size="sm" className="mt-6 w-full border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 dark:border-zinc-200 dark:text-zinc-900">
                  <Plus className="me-2 h-3.5 w-3.5" />{t('add')}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <AppSection title={t('detail.recordTitle')}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { label: t('form.nameLabel'), value: client.name },
                { label: t('detail.labels.email'), value: client.contact },
                { label: t('detail.labels.phone'), value: client.phone },
                { label: t('form.ageLabel'), value: client.age },
                { label: t('detail.labels.budget'), value: client.budget },
                { label: t('detail.labels.interest'), value: client.propertyInterest },
                { label: t('detail.labels.type'), value: t(`types.${client.type}`) },
                { label: t('detail.labels.status'), value: t(`statuses.${client.status}`) },
                { label: t('detail.labels.id'), value: client.id.toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-zinc-100 p-5 text-start dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
                  <p className="mt-2 text-sm font-black uppercase text-zinc-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </AppSection>
        </TabsContent>

        <TabsContent value="units">
          <AppSection
            title={t('detail.tabs.units')}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <select value={unitToLink} onChange={(event) => setUnitToLink(event.target.value)} className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/5">
                  <option value="">Select unit</option>
                  {allUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
                </select>
                <Button
                  size="sm"
                  disabled={!unitToLink || linkOperation.isRunning}
                  onClick={() => void linkOperation.run(async () => {
                    if (!account.organization.id) throw new Error("Select an organization first.");
                    await linkClientUnitRequest(account.organization.id, client.id, unitToLink, "shortlisted");
                    setUnitToLink("");
                  }, { successMessage: "Unit linked." })}
                >
                  <Plus className="me-2 h-3.5 w-3.5" />Link
                </Button>
              </div>
            }
          >
            <AppDataTable 
              data={units.slice(0, 3)} 
              getRowKey={(u) => u.id}
              columns={[
                { 
                  key: "title", 
                  header: t('form.nameLabel'), 
                  render: (u) => (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 overflow-hidden rounded-lg bg-zinc-100 dark:bg-white/5">
                        {u.coverImageUrl ? <Image src={u.coverImageUrl} alt="" width={32} height={32} className="h-full w-full object-cover grayscale" /> : null}
                      </div>
                      <div className="text-start">
                        <p className="text-xs font-black uppercase text-zinc-900 dark:text-white">{u.title}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{u.project}</p>
                      </div>
                    </div>
                  )
                },
                { 
                  key: "status", 
                  header: t('detail.labels.status'), 
                  render: (u) => <StatusPill label={u.status} tone={unitStatusTone(u.status)} /> 
                },
                { key: "price", header: t('detail.labels.budget') },
                { 
                  key: "actions", 
                  header: "", 
                  align: "end", 
                  render: (u) => (
                    <Link href={`/properties/${u.id}`} className="text-zinc-300 hover:text-zinc-900 dark:hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) 
                }
              ]}
            />
          </AppSection>
        </TabsContent>

        <TabsContent value="activity">
          <AppSection title={t('detail.activity.subtitle')}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Open tasks</p>
                <div className="mt-4 space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => void taskOperation.run(() => {
                        if (!account.organization.id) throw new Error("Select an organization first.");
                        return updateClientTaskRequest(account.organization.id, task.id, {
                          clientId: client.id,
                          title: task.title,
                          status: task.status === "done" ? "open" : "done",
                          priority: task.priority,
                          dueAt: task.dueAt,
                          propertyId: task.propertyId,
                          projectId: task.projectId,
                          calendarEventId: task.calendarEventId,
                          notes: task.notes,
                        });
                      }, { successMessage: "Task updated." })}
                      className="flex w-full items-center justify-between rounded-xl bg-zinc-50 p-3 text-start text-xs font-black uppercase dark:bg-white/5"
                    >
                      <span>{task.title}</span>
                      <StatusPill label={task.status} tone={task.status === "done" ? "success" : "warning"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add task</p>
                <div className="mt-4 flex gap-2">
                  <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Task title" className="h-10 min-w-0 flex-1 rounded-xl border border-zinc-100 bg-white px-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-white/5" />
                  <Button disabled={!taskTitle.trim() || taskOperation.isRunning} onClick={() => void taskOperation.run(async () => {
                    if (!account.organization.id) throw new Error("Select an organization first.");
                    await createClientTaskRequest(account.organization.id, { clientId: client.id, title: taskTitle, status: "open", priority: client.priority });
                    setTaskTitle("");
                  }, { successMessage: "Task added." })}>Add</Button>
                </div>
              </div>
            </div>
          </AppSection>
        </TabsContent>

        <TabsContent value="docs">
          <AppSection title={t('detail.documents.subtitle')}>
            <ResourceMediaUploader
              organizationId={account.organization.id ?? undefined}
              resourceType="client"
              resourceId={client.id}
              pendingFiles={pendingFiles}
              onPendingFilesChange={setPendingFiles}
              immediate
              allowedKinds={["document", "image"]}
              labels={{ title: "Client documents", description: "Attach IDs, contracts, notes, and supporting files to this client." }}
            />
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
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deleteClientRequest(account.organization.id, client.id);
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
  const existing = useClientQuery(account.organization.id ?? undefined, id ?? "") as Client | null | undefined;
  const router = useRouter();

  if (id && existing === undefined) {
    return <AppPageShell><EmptyWorkspace icon={Users} title="Loading client" description="Client data is syncing from Convex." /></AppPageShell>;
  }

  if (id && !existing) {
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

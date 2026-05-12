"use client";

import { useMemo, useState, type ComponentProps } from "react";
import Image from "next/image";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, Copy, Edit, Mail, Phone, Plus, Search, Trash2, User, UserPlus, Users, History as ActivityIcon, FileText as DocsIcon, LayoutDashboard, Building } from "lucide-react";
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

const pipelineStages = ["new", "qualified", "viewing", "negotiation", "closed"] as const;
const clientFilters = ["all", "Buyer", "Tenant", "Investor", "Broker"] as const;
const clientViews = ["pipeline", "list", "calendar"] as const;
const clientTypes = ["Buyer", "Tenant", "Investor", "Broker"] as const;
const clientStatuses = ["active", "inactive"] as const;
const clientPriorities = ["normal", "high", "urgent"] as const;
const unitLinkStatuses = ["interested", "shortlisted", "viewing", "offer", "rejected"] as const;
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
    visibility: client.visibility ?? "private",
    pipelineStage: client.pipelineStage,
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
  const router = useRouter();
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

  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId, {
    type: filter === "all" ? undefined : filter,
    search,
  });
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
  const stats = clientsQuery.stats;
  const calendarEventsQuery = useUpcomingCalendarEventsQuery(workspaceOrganizationId, {
    enabled: view === "calendar",
    limit: 50,
  });
  const calendarEvents = useMemo(() => calendarEventsQuery ?? [], [calendarEventsQuery]);
  const isLoading = isWorkspaceReady && clientsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || clientsQuery.queryStatus === "error";

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
      </div>

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} />
      ) : isQueryBlocked ? (
        <HttpQueryState query={clientsQuery} />
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
        <AppDataTable
          columns={columns}
          data={filteredClients}
          getRowKey={(client) => client.id}
          onRowClick={(client) => router.push(`/clients/${client.id}`)}
        />
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

      {isWorkspaceReady && !isQueryBlocked && filteredClients.length === 0 && <EmptyWorkspace icon={Users} title={t('empty.title')} description={t('empty.desc')} />}
      {isWorkspaceReady && !isQueryBlocked && filteredClients.length > 0 && (
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
  const allUnitsQuery = usePropertiesQuery(workspaceOrganizationId, { enabled: isUnitPickerOpen });
  const allUnits = allUnitsQuery ?? [];
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const profileOperation = useOperationState({ errorMessage: "Client update failed." });
  const deleteOperation = useOperationState({ errorMessage: "Client delete failed." });
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
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} /></AppPageShell>;
  }

  if (client === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} /></AppPageShell>;
  }

  if (client === null) {
    return (
      <AppPageShell>
        <DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/clients" backLabel={t('detail.back')} />
      </AppPageShell>
    );
  }

  const currentStageIndex = Math.max(0, pipelineStages.indexOf(client.pipelineStage as typeof pipelineStages[number]));
  const activityPreview = [
    ...tasks.slice(0, 2).map((task) => ({
      action: task.title,
      date: task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 10) : "Open",
      color: task.status === "done" ? "bg-zinc-300" : "bg-emerald-500",
    })),
    ...events.slice(0, 2).map((event) => ({
      action: event.title,
      date: `${event.date} ${event.time}`,
      color: "bg-blue-500",
    })),
    { action: t('stages.new'), date: client.added, color: "bg-zinc-300" },
  ].slice(0, 4);
  const linkedUnitIds = new Set(linkedUnits.map(({ link }) => link.propertyId));
  const availableUnits = allUnits.filter((unit) => !linkedUnitIds.has(unit.id));
  const unitSearchQuery = unitSearch.trim().toLowerCase();
  const filteredAvailableUnits = unitSearchQuery
    ? availableUnits.filter((unit) => [unit.title, unit.project, unit.price, unit.area, unit.status]
      .some((value) => String(value ?? "").toLowerCase().includes(unitSearchQuery)))
    : availableUnits;
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

  return (
    <AppPageShell contentClassName="space-y-6 pb-16">
      <div className="rounded-[24px] border border-zinc-100 bg-white p-5 dark:border-white/5 dark:bg-[#0A0A0A] md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-lg font-black uppercase text-white dark:bg-white dark:text-zinc-900">
              {client.name.charAt(0)}
            </div>
            <div className="min-w-0 text-start">
              <p className="text-[11px] font-bold text-zinc-400">{client.id.toUpperCase()}</p>
              <h1 className="mt-1 truncate text-2xl font-black leading-tight text-zinc-900 dark:text-white md:text-3xl">{client.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill label={t(`types.${client.type}`)} tone={typeTone(client.type)} />
                <StatusPill label={t(`statuses.${client.status}`)} tone={client.status === "active" ? "success" : "neutral"} />
                <StatusPill label={t(`priorities.${client.priority}`)} tone={client.priority === "urgent" ? "danger" : client.priority === "high" ? "warning" : "neutral"} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link href={`/clients/${client.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-100 bg-white px-4 text-xs font-bold transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              <Edit className="me-2 h-3.5 w-3.5" />
              {t('detail.edit')}
            </Link>
            <Button variant="ghost" onClick={() => setDeleting(true)} className="h-10 rounded-xl px-4 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">
              <Trash2 className="me-2 h-3.5 w-3.5" />
              {t('detail.delete')}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-white/5 dark:bg-white/[0.02] sm:grid-cols-5">
          {pipelineStages.map((stage, i) => (
            <div
              key={stage}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                i <= currentStageIndex ? "bg-white text-zinc-900 dark:bg-white/10 dark:text-white" : "text-zinc-400"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                  i <= currentStageIndex ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 dark:border-white/10"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 truncate text-xs font-bold">{t(`stages.${stage}`)}</span>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <AppTabsList tabs={[
          { value: "overview", label: t('views.pipeline'), icon: LayoutDashboard },
          { value: "profile", label: t('detail.recordTitle'), icon: User },
          { value: "units", label: t('detail.tabs.units'), icon: Building },
          { value: "docs", label: t('detail.tabs.documents'), icon: DocsIcon },
          { value: "activity", label: t('detail.tabs.activity'), icon: ActivityIcon },
        ]} />

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <section className="rounded-[24px] border border-zinc-900 bg-zinc-950 p-6 text-start text-white dark:border-white/10 dark:bg-white/[0.06] lg:col-span-5">
              <div className="flex h-full min-h-[220px] flex-col justify-between gap-8">
                <div>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <p className="text-xs font-bold text-white/55">{t('detail.nextTitle')}</p>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                  <h2 className="text-2xl font-black leading-tight tracking-tight md:text-3xl">{client.nextAction}</h2>
                </div>
                <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <CalendarDays className="h-4 w-4 text-white/60" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white/45">{t('card.next')}</p>
                    <p className="truncate text-sm font-bold text-white">{client.nextActionDate} {t('detail.at')} {client.appointmentTime}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-zinc-100 bg-white p-6 text-start dark:border-white/5 dark:bg-[#0A0A0A] lg:col-span-4">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                  <Building className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-400">{t('detail.labels.interest')}</p>
                  <h2 className="mt-1 text-lg font-black leading-snug text-zinc-900 dark:text-white">{client.propertyInterest}</h2>
                </div>
              </div>
              <div className="grid gap-3 border-t border-zinc-100 pt-5 dark:border-white/5 sm:grid-cols-2">
                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
                  <p className="text-[11px] font-bold text-zinc-400">{t('detail.labels.budget')}</p>
                  <p className="mt-2 text-base font-black leading-snug text-zinc-900 dark:text-white">{client.budget}</p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
                  <p className="text-[11px] font-bold text-zinc-400">{t('detail.labels.priority')}</p>
                  <p className="mt-2 text-base font-black leading-snug text-zinc-900 dark:text-white">{t(`priorities.${client.priority}`)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-zinc-100 bg-white p-6 text-start dark:border-white/5 dark:bg-[#0A0A0A] lg:col-span-3">
              <p className="mb-5 text-xs font-bold text-zinc-400">{t('detail.recordTitle')}</p>
              <div className="space-y-4">
                {[
                  { label: t('detail.labels.email'), value: client.contact, icon: Mail },
                  { label: t('detail.labels.phone'), value: client.phone, icon: Phone },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 dark:bg-white/5">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-400">{label}</p>
                      <p className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-zinc-100 bg-white p-6 text-start dark:border-white/5 dark:bg-[#0A0A0A] lg:col-span-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs font-bold text-zinc-400">{t('detail.tabs.units')}</p>
                <span className="text-xs font-black text-zinc-300">{String(units.slice(0, 3).length).padStart(2, "0")}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {units.slice(0, 3).length > 0 ? units.slice(0, 3).map((u) => (
                  <Link key={u.id} href={`/properties/${u.id}`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/5">
                      {u.coverImageUrl ? <Image src={u.coverImageUrl} alt="" width={44} height={44} className="h-full w-full object-cover grayscale" /> : null}
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{u.title}</p>
                      <p className="mt-1 truncate text-[11px] font-bold text-zinc-400">{u.price} SAR</p>
                    </div>
                  </Link>
                )) : (
                  <div className="rounded-2xl border border-dashed border-zinc-200 p-4 text-sm font-bold text-zinc-400 dark:border-white/10 md:col-span-3">
                    {t('detail.tabs.units')}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-zinc-100 bg-white p-6 text-start dark:border-white/5 dark:bg-[#0A0A0A] lg:col-span-5">
              <p className="mb-5 text-xs font-bold text-zinc-400">{t('detail.activity.subtitle')}</p>
              <div className="space-y-4">
                {activityPreview.map((event, i, list) => (
                  <div key={`${event.action}-${i}`} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn("h-2.5 w-2.5 rounded-full", event.color)} />
                      {i < list.length - 1 && <div className="h-8 w-px bg-zinc-100 dark:bg-white/5" />}
                    </div>
                    <div className="-mt-1 min-w-0 text-start">
                      <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{event.action}</p>
                      <p className="mt-1 text-[11px] font-bold text-zinc-400">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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
            <section className="rounded-[24px] border border-zinc-100 bg-white p-5 text-start dark:border-white/5 dark:bg-[#0A0A0A] md:p-6">
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 dark:border-white/5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400">{t("detail.units.subtitle")}</p>
                  <h2 className="mt-1 text-xl font-black text-zinc-900 dark:text-white">{t("detail.units.title")}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:bg-white/[0.04]">{linkedUnits.length} {t("detail.units.linkedCount")}</span>
                  <Button type="button" onClick={() => setIsUnitPickerOpen(true)} className="h-10 rounded-xl px-4 text-xs font-bold">
                    <Plus className="me-2 h-3.5 w-3.5" />{t("detail.units.linkUnit")}
                  </Button>
                </div>
              </div>

              {linkOperation.error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-950/50 dark:bg-red-950/20">{linkOperation.error}</p>}

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setIsUnitPickerOpen(true)}
                  className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="mt-4 text-base font-black text-zinc-900 dark:text-white">{t("detail.units.linkUnit")}</span>
                  <span className="mt-2 max-w-xs text-sm font-semibold leading-6 text-zinc-400">{t("detail.units.linkUnitDesc")}</span>
                </button>

                {linkedUnits.map(({ link, unit }) => (
                  <article key={link.id} className="overflow-hidden rounded-[24px] border border-zinc-100 bg-white dark:border-white/5 dark:bg-[#0A0A0A]">
                    <div className="relative aspect-[16/9] bg-zinc-100 dark:bg-white/[0.03]">
                      {unit?.coverImageUrl ? (
                        <Image src={unit.coverImageUrl} alt="" fill sizes="360px" className="object-cover grayscale" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-300"><Building className="h-8 w-8" /></div>
                      )}
                      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                        <StatusPill label={link.status} tone="info" />
                        {unit && <StatusPill label={unit.status} tone={unitStatusTone(unit.status)} />}
                      </div>
                    </div>
                    <div className="space-y-4 p-4">
                      <div className="min-w-0 text-start">
                        {unit ? (
                          <Link href={`/properties/${unit.id}`} className="block truncate text-base font-black text-zinc-900 hover:underline dark:text-white">{unit.title}</Link>
                        ) : (
                          <p className="text-base font-black text-zinc-400">{t("detail.units.unitUnavailable")}</p>
                        )}
                        <p className="mt-1 truncate text-xs font-bold text-zinc-400">{unit ? unit.project : link.propertyId}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-zinc-50 p-3 text-start dark:bg-white/[0.03]">
                          <p className="text-[10px] font-bold text-zinc-400">{t("detail.units.price")}</p>
                          <p className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white">{unit?.price ?? "-"}</p>
                        </div>
                        <div className="rounded-2xl bg-zinc-50 p-3 text-start dark:bg-white/[0.03]">
                          <p className="text-[10px] font-bold text-zinc-400">{t("detail.units.area")}</p>
                          <p className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white">{unit?.area ?? "-"}</p>
                        </div>
                      </div>
                      {link.notes && <p className="rounded-2xl border border-zinc-100 p-3 text-start text-xs font-semibold text-zinc-500 dark:border-white/5 dark:text-zinc-400">{link.notes}</p>}
                      <div className="flex gap-2">
                        {unit && (
                          <Link href={`/properties/${unit.id}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-zinc-100 text-xs font-bold text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5">
                            <ArrowUpRight className="me-2 h-3.5 w-3.5" />{t("detail.units.openUnit")}
                          </Link>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          disabled={linkOperation.isRunning}
                          onClick={() => void linkOperation.run(() => {
                            if (!workspaceOrganizationId) throw new Error("Select an organization first.");
                            return unlinkClientUnitRequest(workspaceOrganizationId, client.id, link.propertyId);
                          }, { successMessage: t("detail.units.unlinked") })}
                          className="h-10 flex-1 rounded-xl text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="me-2 h-3.5 w-3.5" />{t("detail.units.unlink")}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <Dialog open={isUnitPickerOpen} onOpenChange={(open) => {
              setIsUnitPickerOpen(open);
              if (!open) setUnitSearch("");
            }}>
              <DialogContent className="max-h-[88vh] max-w-5xl overflow-hidden rounded-[28px] border-zinc-100 bg-white p-0 text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
                <DialogHeader className="border-b border-zinc-100 p-5 pe-14 text-start dark:border-white/5 md:p-6">
                  <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white">{t("detail.units.modalTitle")}</DialogTitle>
                  <DialogDescription className="text-sm font-semibold text-zinc-400">{t("detail.units.modalDesc")}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 border-b border-zinc-100 p-5 dark:border-white/5 md:grid-cols-[minmax(0,1fr)_180px_220px] md:p-6">
                  <label className="relative block">
                    <span className="sr-only">{t("detail.units.search")}</span>
                    <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={unitSearch}
                      onChange={(event) => setUnitSearch(event.target.value)}
                      placeholder={t("detail.units.search")}
                      className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 ps-10 pe-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:border-white/20"
                    />
                  </label>
                  <label className="block text-start">
                    <span className="text-[11px] font-bold text-zinc-400">{t("detail.units.linkStatus")}</span>
                    <select
                      value={unitLinkStatus}
                      onChange={(event) => setUnitLinkStatus(event.target.value as (typeof unitLinkStatuses)[number])}
                      className="mt-1 h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-sm font-bold text-zinc-900 outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    >
                      {unitLinkStatuses.map((status) => <option key={status} value={status}>{t(`detail.units.statuses.${status}`)}</option>)}
                    </select>
                  </label>
                  <label className="block text-start">
                    <span className="text-[11px] font-bold text-zinc-400">{t("detail.units.notes")}</span>
                    <input
                      value={unitLinkNotes}
                      onChange={(event) => setUnitLinkNotes(event.target.value)}
                      placeholder={t("detail.units.notes")}
                      className="mt-1 h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-sm font-bold text-zinc-900 outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    />
                  </label>
                </div>

                <div className="max-h-[52vh] overflow-y-auto p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">{t("detail.units.available")}</h3>
                    <span className="text-xs font-bold text-zinc-400">
                      {t("detail.units.showing", { shown: visibleAvailableUnits.length, total: filteredAvailableUnits.length })}
                    </span>
                  </div>

                  {isUnitCatalogLoading ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.04]" />
                      ))}
                    </div>
                  ) : availableUnits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">{t("detail.units.noAvailable")}</div>
                  ) : filteredAvailableUnits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">{t("detail.units.noResults")}</div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {visibleAvailableUnits.map((unit) => (
                        <article key={unit.id} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-2xl border border-zinc-100 bg-white p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <div className="relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/[0.03]">
                            {unit.coverImageUrl ? (
                              <Image src={unit.coverImageUrl} alt="" fill sizes="96px" className="object-cover grayscale" />
                            ) : (
                              <div className="flex h-full min-h-24 items-center justify-center text-zinc-300"><Building className="h-5 w-5" /></div>
                            )}
                          </div>
                          <div className="min-w-0 space-y-3 text-start">
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{unit.title}</p>
                                <StatusPill label={unit.status} tone={unitStatusTone(unit.status)} />
                              </div>
                              <p className="mt-1 truncate text-xs font-bold text-zinc-400">{unit.project}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                              <span>{unit.price}</span>
                              <span className="h-1 w-1 rounded-full bg-zinc-300" />
                              <span>{unit.area}</span>
                            </div>
                            <Button type="button" disabled={linkOperation.isRunning} onClick={() => linkUnit(unit.id)} className="h-9 w-full rounded-xl text-xs font-bold">
                              <Plus className="me-2 h-3.5 w-3.5" />{t("detail.units.link")}
                            </Button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <ClientDocumentsManager
            organizationId={workspaceOrganizationId}
            clientId={client.id}
          />
        </TabsContent>

        <TabsContent value="activity">
          <section className="space-y-5 text-start">
            <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-400">{t('detail.activity.subtitle')}</p>
                <h2 className="mt-1 text-xl font-black text-zinc-900 dark:text-white">{t('detail.activity.title')}</h2>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:bg-white/10 dark:text-zinc-300">{tasks.length} {t('detail.activity.tasks')}</span>
                {events.length > 0 && <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:bg-white/10 dark:text-zinc-300">{events.length} {t('detail.activity.events')}</span>}
              </div>
            </div>

            <form
              className="grid gap-2 rounded-2xl border border-zinc-100 bg-white p-2 dark:border-white/10 dark:bg-[#0A0A0A] md:grid-cols-[minmax(220px,1fr)_140px_140px_140px_140px_auto]"
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
                <select name="visibility" defaultValue="private" className="h-10 rounded-xl border border-transparent bg-zinc-50 px-3 text-xs font-bold text-zinc-700 outline-none dark:bg-white/[0.04] dark:text-white">
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
                className="h-10 min-w-0 rounded-xl border border-transparent bg-zinc-50 px-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-200 dark:bg-white/[0.04] dark:text-white dark:focus:border-white/10"
              />
              <select name="priority" defaultValue={client.priority} className="h-10 rounded-xl border border-transparent bg-zinc-50 px-3 text-xs font-bold text-zinc-700 outline-none dark:bg-white/[0.04] dark:text-white">
                {clientPriorities.map((value) => <option key={value} value={value}>{t(`priorities.${value}`)}</option>)}
              </select>
              <input name="dueAt" type="date" className="h-10 rounded-xl border border-transparent bg-zinc-50 px-3 text-xs font-bold text-zinc-700 outline-none dark:bg-white/[0.04] dark:text-white" />
              <select name="propertyId" defaultValue="" className="h-10 rounded-xl border border-transparent bg-zinc-50 px-3 text-xs font-bold text-zinc-700 outline-none dark:bg-white/[0.04] dark:text-white">
                <option value="">{t('detail.activity.noUnit')}</option>
                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
              </select>
              <Button type="submit" disabled={!taskTitle.trim() || taskOperation.isRunning} className="h-10 rounded-xl px-5 text-xs font-black uppercase tracking-widest">
                {t('detail.activity.add')}
              </Button>
            </form>

            {taskOperation.error && <p className="text-xs font-bold text-red-500">{taskOperation.error}</p>}

            {tasks.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white dark:border-white/10 dark:bg-[#0A0A0A]">
                <div className="divide-y divide-zinc-100 dark:divide-white/10">
                  {tasks.map((task) => {
                    const linkedUnit = units.find((unit) => unit.id === task.propertyId);
                    const isDone = task.status === "done";
                    return (
                      <article key={task.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill label={t(`detail.activity.taskStatuses.${task.status}`)} tone={isDone ? "success" : task.status === "canceled" ? "neutral" : "warning"} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t(`priorities.${task.priority}`)}</span>
                          </div>
                          <p className={cn("mt-2 truncate text-sm font-black text-zinc-900 dark:text-white", isDone && "text-zinc-400 line-through dark:text-zinc-500")}>
                            {task.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-zinc-400">
                            <span>{task.dueAt ? new Date(task.dueAt).toLocaleDateString(locale) : t('detail.activity.noDate')}</span>
                            {linkedUnit && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                                <span>{linkedUnit.title}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
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
                              className="h-9 rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm font-bold text-zinc-400 dark:border-white/10">
                {t('detail.activity.emptyTasks')}
              </div>
            )}

            {events.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('detail.activity.calendarEvents')}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {events.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0A0A0A]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{event.title}</p>
                        <p className="mt-1 text-[11px] font-bold text-zinc-400">{event.date} · {event.time}</p>
                      </div>
                      <StatusPill label={event.status} tone="info" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
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
    return <AppPageShell><WorkspaceQueryState status={workspaceStatus} /></AppPageShell>;
  }

  if (id && existing === undefined) {
    return <AppPageShell><ProgressiveLoadingState title={t("detail.loadingTitle")} description={t("detail.loadingDesc")} debug={queryDebug} /></AppPageShell>;
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

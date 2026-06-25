"use client";

import { useMemo, useState, useEffect } from "react";
import { CalendarDays, FileText, LayoutDashboard, Search, UserPlus, Users } from "lucide-react";
import {
  AppPageHeader,
  AppPageShell,
  AppSection,
  InfiniteScrollSentinel,
} from "@/components/shared";
import { PipelineBoard, GroupedList } from "@/components/shared/view-system";
import type { ViewDefinition } from "@/components/shared/view-system/types";
import { clientToCardItem } from "./client-view-helpers";
import { useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import {
  CLIENTS_PAGE_SIZE,
  useClientQuery,
  useClientsIndexQuery,
  useDeleteClientOptimisticMutation,
  useMoveClientInPipelineMutation,
} from "@/domains/clients/api/clients";
import type { Client, ClientType } from "../store/clients.types";
import {
  activePipelineStages,
  activeJourneyClients as activeJourneyClientRows,
  calendarEventsForClients,
  clientFilters,
  clientStageFilters,
  clientViews,
  clientsForStageFilter,
  displayedClientsForView,
  matchesClientSearch,
} from "../client-view-model";
import { DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, HttpQueryState, ProgressiveLoadingState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ClientForm } from "./client-form";
import { ClientSheet } from "./client-sheet";
import { PipelineStagesSettings } from "./pipeline-stages-settings";
import { usePipelineStages } from "@/domains/clients/api/pipeline-stages";
import { sortPipelineClients } from "@/domains/clients/pipeline-order";
import { useUpcomingCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import {
  translateClientStage,
} from "../lib/client-labels";

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
  const deleteClientMutation = useDeleteClientOptimisticMutation(clientsQuery.queryKey);
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
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

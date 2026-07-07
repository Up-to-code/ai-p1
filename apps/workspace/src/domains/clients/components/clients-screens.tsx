"use client";

import { useMemo, useState, useEffect } from "react";
import { CalendarDays, FileText, Search, UserPlus, Users } from "lucide-react";
import {
  AppPageShell,
  AppSection,
  InfiniteScrollSentinel,
} from "@/components/shared";
import { PageHeader } from "@/components/shared/page-header";
import { GroupedList } from "@/components/shared/view-system";
import { clientToCardItem } from "./client-view-helpers";
import { useRouter } from "@/i18n/routing";
import { useAuthSession } from "@/domains/auth";
import { logger } from "@/lib/logger";
import {
  CLIENTS_PAGE_SIZE,
  useClientQuery,
  useClientsIndexQuery,
  useDeleteClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import type { Client, ClientType } from "../store/clients.types";
import {
  activeJourneyClients as activeJourneyClientRows,
  calendarEventsForClients,
  clientFilters,
  clientStageFilters,
  clientViews,
  clientsForStageFilter,
  displayedClientsForView,
  matchesClientSearch,
} from "../client-view-model";
import { DeleteRecordDialog, EmptyWorkspace, HttpQueryState, ProgressiveLoadingState, DetailNotFoundState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ClientForm } from "./client-form";
import { getItem, setItem } from "@/domains/storage";
import { ClientSheet } from "./client-sheet";
import { useUpcomingCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import {
  translateClientStage,
} from "../lib/client-labels";

export function ClientsWorkspace({ initialView = "list" }: { initialView?: "calendar" | "list" }) {
  const t = useTranslations('Clients');
  const router = useRouter();
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? session.workspace.organizationId ?? undefined : undefined;
  const [filter, setFilter] = useState<(typeof clientFilters)[number]>("all");
  const [stageFilter, setStageFilter] = useState<(typeof clientStageFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<(typeof clientViews)[number]>(initialView);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load saved filters from IndexedDB on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    getItem("layouts", "clients-filters").then((entry) => {
      if (entry) {
        try {
          const saved = entry.value as { filter: string; stageFilter: string };
          if (saved.filter && clientFilters.includes(saved.filter as typeof clientFilters[number])) setFilter(saved.filter as typeof clientFilters[number]);
          if (saved.stageFilter && clientStageFilters.includes(saved.stageFilter as typeof clientStageFilters[number])) setStageFilter(saved.stageFilter as typeof clientStageFilters[number]);
        } catch (e) {
          logger.error("clients.filters_read_failed", { error: e });
        }
      }
    });
  }, []);

  // Save filters to IndexedDB when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    setItem("layouts", "clients-filters", { filter, stageFilter } as unknown as Record<string, unknown>);
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
    validViews: clientViews.filter(v => v !== "pipeline"),
  });

  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId, {
    type: filter === "all" ? undefined : filter,
    search,
  });
  const deleteClientMutation = useDeleteClientOptimisticMutation(clientsQuery.queryKey);
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
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

  return (
    <AppPageShell>
      <PageHeader
        title={t("title")}
        tabs={[
          { value: "list", label: t("views.list"), icon: FileText },
          { value: "calendar", label: t("views.calendar"), icon: CalendarDays },
        ]}
        activeTab={view}
        onTabChange={(value) => setView(value as typeof view)}
        actions={[
          {
            label: t("add"),
            icon: UserPlus,
            variant: "primary",
            onClick: () => setIsCreateOpen(true),
          },
        ]}
      />

      {/* Content */}
      <div className={cn(
        "flex-1 min-h-0",
        "overflow-auto"
      )}>
        <div className={cn(
          "mx-auto w-full space-y-6 h-full",
          "max-w-[1400px] p-5 md:p-6 lg:p-8"
        )}>
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant={view === "calendar" ? "calendar" : "table"} />
      ) : isQueryBlocked ? (
        <HttpQueryState query={clientsQuery} variant={view === "calendar" ? "calendar" : "table"} />
      ) : view === "list" && (
        <GroupedList
          items={tableClients.map((client) => clientToCardItem({
            id: client.id,
            name: client.name,
            contact: client.contact,
            phone: client.phone,
            company: client.company,
            source: client.source,
            pipelineStage: client.pipelineStage ?? "new",
            type: client.type,
          }))}
          stages={[
            {
              key: "all",
              name: t("filters.all"),
              color: "#9CA3AF",
              order: 0,
            }
          ]}
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
            <AppSection key={event.id} title={`${event.date} · ${event.time}`} description={event.clientName ?? event.location ?? "Workspace event"}>
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
          if (!session.organization.id) return;
          const clientId = deleting.id;
          setDeleting(null);
          deleteClientMutation.mutate({ organizationId: session.organization.id, clientId });
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
    </AppPageShell>
  );
}

export function ClientFormScreen({ id }: { id?: string }) {
  const t = useTranslations('Clients');
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? session.workspace.organizationId ?? undefined : undefined;
  const existing = useClientQuery(workspaceOrganizationId, id ?? "") as Client | null | undefined;
  const router = useRouter();
  const queryDebug = {
    resourceType: "client",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: session.workspace.isConvexAuthPending,
    isConvexAuthenticated: session.workspace.isConvexAuthenticated,
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
      <PageHeader
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

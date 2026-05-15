"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { ArrowRight, Building2, CalendarClock } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppPageHeader, AppPageShell, AppSection, AppDataTable } from "@/components/shared";
import { HttpQueryState, WorkspaceQueryState, StatusPill } from "@/components/shared/crud-ui";
import { DashboardChat } from "@/components/dashboard/dashboard-chat";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { parseWorkspaceMode, useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { usePropertiesIndexQuery } from "@/domains/properties/api/properties";
import type { PropertyUnit } from "@/domains/properties/store/properties.types";
import { useHttpQueryResult } from "@/components/shared/use-http-query";
import { useSearchParams } from "next/navigation";

const TODAY = new Date();

type DashboardOverview = {
  weekEvents: Array<{
    id: string;
    date: string;
    time: string;
    title: string;
    owner: string;
    clientName?: string;
    type: string;
    priority: "normal" | "high" | "urgent";
  }>;
};

export function DashboardScreen() {
  const t = useTranslations("Dashboard");
  const searchParams = useSearchParams();
  const queryMode = parseWorkspaceMode(searchParams.get("mode"));
  const setMode = useWorkspaceStore((state) => state.setMode);
  const mode = queryMode;
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const weekRange = useMemo(() => {
    const days = getWeekDays(TODAY);
    const start = new Date(days[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(days[days.length - 1]);
    end.setHours(23, 59, 59, 999);
    return { startAt: start.getTime(), endAt: end.getTime() };
  }, []);
  const overviewQuery = useHttpQueryResult<DashboardOverview>(
    ["dashboard", workspaceOrganizationId, weekRange.startAt, weekRange.endAt],
    workspaceOrganizationId ? `/api/v1/organizations/${workspaceOrganizationId}/read/dashboard/index` : undefined,
    workspaceOrganizationId ? { startAt: weekRange.startAt, endAt: weekRange.endAt } : undefined,
  );
  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId);
  const propertiesQuery = usePropertiesIndexQuery(workspaceOrganizationId);
  const overview = overviewQuery.data;
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
  const properties = useMemo(() => propertiesQuery.results as PropertyUnit[], [propertiesQuery.results]);
  const isLoading = isWorkspaceReady && overviewQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || overviewQuery.queryStatus === "error";

  useEffect(() => {
    setMode(queryMode);
  }, [queryMode, setMode]);

  const desk = useMemo(() => {
    const todayEvents = (overview?.weekEvents ?? [])
      .filter((event) => isSameDay(parseDate(event.date), TODAY))
      .slice(0, 10);
    const upcomingEvents = (overview?.weekEvents ?? [])
      .filter((event) => {
        const eventDate = parseDate(event.date);
        return eventDate ? eventDate.getTime() >= startOfToday().getTime() : false;
      })
      .slice(0, 10);

    return {
      todayEvents,
      upcomingEvents,
    };
  }, [overview]);
  const latestClients = useMemo(() => {
    return [...clients]
      .sort((left, right) => {
        const leftTime = left.createdAt ?? Date.parse(left.added) ?? 0;
        const rightTime = right.createdAt ?? Date.parse(right.added) ?? 0;

        return rightTime - leftTime;
      })
      .slice(0, 6);
  }, [clients]);
  const latestProperties = useMemo(() => {
    return [...properties]
      .sort((left, right) => {
        const leftTime = left.createdAt ?? left.updatedAt ?? Date.parse(left.updated ?? "") ?? 0;
        const rightTime = right.createdAt ?? right.updatedAt ?? Date.parse(right.updated ?? "") ?? 0;

        return rightTime - leftTime;
      })
      .slice(0, 12);
  }, [properties]);

  const aiPanel = useMemo(
    () => <DashboardChat organizationId={workspaceOrganizationId} />,
    [workspaceOrganizationId],
  );
  const workspacePanel = useMemo(
    () => (
      <AppPageShell contentClassName="space-y-6">
        <AppPageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        {workspaceStatus !== "ready" ? (
          <WorkspaceQueryState status={workspaceStatus} variant="dashboard" />
        ) : isQueryBlocked ? (
          <HttpQueryState query={overviewQuery} variant="dashboard" />
        ) : (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <NewPropertiesCard
                emptyLabel={t("normal.noProperties")}
                loading={isWorkspaceReady && propertiesQuery.queryStatus === "loading"}
                properties={latestProperties}
                title={t("normal.newProperties")}
                viewAllLabel={t("normal.viewAll")}
              />
              <LatestClientsTable
                clients={latestClients}
                emptyLabel={t("normal.noClients")}
                loading={isWorkspaceReady && clientsQuery.queryStatus === "loading"}
                title={t("normal.latestClients")}
              />
            </div>
            <UpcomingMeetingsCard
              events={desk.todayEvents.length > 0 ? desk.todayEvents : desk.upcomingEvents}
              emptyLabel={t("normal.noMeetings")}
              title={t("normal.upcomingMeeting")}
              viewAllLabel={t("normal.viewAll")}
            />
          </div>
        )}
      </AppPageShell>
    ),
    [clientsQuery.queryStatus, desk, isQueryBlocked, isWorkspaceReady, latestClients, latestProperties, overviewQuery, propertiesQuery.queryStatus, t, workspaceStatus],
  );

  return (
    <div className="relative h-full overflow-hidden">
      <ModePanel active={mode === "ai"}>
        {aiPanel}
      </ModePanel>
      <ModePanel active={mode === "ws"}>
        {workspacePanel}
      </ModePanel>
    </div>
  );
}

const dashboardActionLinkClassName =
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-[#0B5CFF] transition hover:bg-[#0B5CFF]/5 hover:text-[#084AD6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B5CFF]/10 dark:text-blue-300 dark:hover:bg-blue-400/10 dark:hover:text-blue-200";

function ModePanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full overflow-y-auto overflow-x-hidden transition-[opacity,transform,filter] duration-300 ease-out",
        active
          ? "pointer-events-auto visible translate-y-0 opacity-100 blur-0"
          : "pointer-events-none invisible translate-y-2 opacity-0 blur-sm"
      )}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

function UpcomingMeetingsCard({
  emptyLabel,
  events,
  title,
  viewAllLabel,
}: {
  emptyLabel: string;
  events: DashboardOverview["weekEvents"];
  title: string;
  viewAllLabel: string;
}) {
  return (
    <AppSection
      title={title}
      className="xl:sticky xl:top-6"
      actions={
        <Link href="/calendar" className={dashboardActionLinkClassName}>
          {viewAllLabel}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      }
    >
      {events.length > 0 ? (
        <div className={cn(scrollAreaClassName, "max-h-[364px] space-y-6")}>
          {events.map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/[0.02]">
                <CalendarClock className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex-1 border-b border-zinc-50 pb-4 dark:border-white/[0.02]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{event.title}</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{event.time}</span>
                </div>
                <p className="mt-1 text-[10px] font-medium uppercase text-zinc-500">{event.clientName ?? event.owner}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-center dark:border-white/10">
          <CalendarClock className="h-5 w-5 text-zinc-300" />
          <p className="mt-3 text-xs font-bold text-zinc-400">{emptyLabel}</p>
        </div>
      )}
    </AppSection>
  );
}

function NewPropertiesCard({
  emptyLabel,
  loading,
  properties,
  title,
  viewAllLabel,
}: {
  emptyLabel: string;
  loading: boolean;
  properties: PropertyUnit[];
  title: string;
  viewAllLabel: string;
}) {
  return (
    <AppSection 
      title={title}
      actions={
        <Link href="/properties" className={dashboardActionLinkClassName}>
          {viewAllLabel}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      }
    >
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[340px] animate-pulse rounded-[24px] bg-zinc-50 dark:bg-white/[0.02]" />
          ))
        ) : properties.length > 0 ? (
          properties.slice(0, 3).map((property) => (
            <DashboardPropertyTile key={property.id} property={property} />
          ))
        ) : (
          <div className="col-span-full flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-center dark:border-white/10">
            <p className="text-xs font-bold text-zinc-400">{emptyLabel}</p>
          </div>
        )}
      </div>
    </AppSection>
  );
}

function DashboardPropertyTile({ property }: { property: PropertyUnit }) {
  const t = useTranslations("Dashboard");
  const tp = useTranslations("Properties");

  return (
    <article className="group overflow-hidden rounded-[24px] border border-zinc-100 bg-white transition-colors hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]">
      <Link href={`/properties/${property.id}`} className="relative block h-40 w-full overflow-hidden bg-zinc-100 text-start focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:bg-white/5">
        {property.coverImageUrl || property.image ? (
          <Image src={property.coverImageUrl || property.image!} alt={property.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover opacity-80 grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Building2 className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="truncate text-sm font-black uppercase tracking-tight text-white">{property.title}</h3>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/60">{property.project || property.city}</p>
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <StatusPill label={tp(`toolbar.filters.${property.status}`)} tone={statusTone(property.status)} />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{property.reference}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t("normal.property.area")}</p>
            <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{property.area || "—"}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t("normal.property.layout")}</p>
            <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{t("normal.property.beds", { count: property.bedrooms })}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/5">
          <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">{formatCompactValue(property.price)}</p>
        </div>
      </div>
    </article>
  );
}

function statusTone(status: PropertyUnit["status"]) {
  if (status === "available") return "success";
  if (status === "pending") return "warning";
  if (status === "reserved") return "info";
  return "neutral";
}

function LatestClientsTable({
  clients,
  emptyLabel,
  loading,
  title,
}: {
  clients: Client[];
  emptyLabel: string;
  loading: boolean;
  title: string;
}) {
  const t = useTranslations("Dashboard");
  const common = useTranslations("Common");
  const tc = useTranslations("Clients");

  return (
    <AppSection
      title={title}
      actions={
        <Link href="/clients" className={dashboardActionLinkClassName}>
          {t("normal.viewAll")}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      }
      contentClassName={cn(scrollAreaClassName, "max-h-[360px]")}
    >
      <AppDataTable
        columns={[
          {
            key: "client",
            header: t("normal.clientsTable.client"),
            render: (client) => (
              <Link href={`/clients/${client.id}`} className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold uppercase text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                  {client.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-zinc-950 dark:text-white">{client.name}</span>
                  <span className="mt-0.5 block truncate text-[10px] font-medium text-zinc-500">{client.contact}</span>
                </span>
              </Link>
            ),
          },
          {
            key: "type",
            header: t("normal.clientsTable.source"),
            render: (client) => <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{tc(`types.${client.type}`)}</span>,
          },
          {
            key: "pipelineStage",
            header: t("normal.clientsTable.stage"),
            render: (client) => (
              <span className="rounded-full bg-zinc-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">
                {tc(`stages.${client.pipelineStage}`)}
              </span>
            ),
          },
          {
            key: "comingFrom",
            header: t("normal.clientsTable.comingFrom"),
            render: (client) => (
              <p className="max-w-[220px] truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {client.propertyInterest || client.nextAction}
              </p>
            ),
          },
        ]}
        data={loading ? [] : clients}
        getRowKey={(client) => client.id}
        emptyMessage={loading ? common("loading") : emptyLabel}
        className="border-0 shadow-none dark:bg-transparent"
      />
    </AppSection>
  );
}

function parseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function startOfToday() {
  const date = new Date(TODAY);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDays(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function isSameDay(left: Date | undefined, right: Date) {
  return Boolean(
    left &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate(),
  );
}

const scrollAreaClassName =
  "overflow-y-auto overflow-x-hidden pe-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent";

function formatCompactValue(value: React.ReactNode) {
  if (typeof value !== "number") {
    return value;
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

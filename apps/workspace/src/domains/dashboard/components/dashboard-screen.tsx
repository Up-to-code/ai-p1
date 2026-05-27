"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { ArrowRight, Building2, CalendarClock, Landmark, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { HttpQueryState, WorkspaceQueryState, StatusPill } from "@/components/shared/crud-ui";
import { DashboardChat } from "@/components/dashboard/dashboard-chat";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { parseWorkspaceMode, useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import type { Project } from "@/domains/projects/store/projects.types";
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
  const projectsQuery = useProjectsIndexQuery(workspaceOrganizationId);
  const overview = overviewQuery.data;
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
  const projects = useMemo(() => projectsQuery.results as Project[], [projectsQuery.results]);
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
  const latestProjects = useMemo(() => {
    return [...projects]
      .sort((left, right) => {
        const leftTime = left.createdAt ?? left.updatedAt ?? Date.parse(left.updated ?? "") ?? 0;
        const rightTime = right.createdAt ?? right.updatedAt ?? Date.parse(right.updated ?? "") ?? 0;

        return rightTime - leftTime;
      })
      .slice(0, 8);
  }, [projects]);

  const aiPanel = useMemo(
    () => <DashboardChat organizationId={workspaceOrganizationId} />,
    [workspaceOrganizationId],
  );
  const workspacePanel = useMemo(
    () => (
      <AppPageShell contentClassName="space-y-6">
        <AppPageHeader
          eyebrow={t("eyebrow")}
          subtitle={t("subtitle")}
          title={t("title")}
        />

        {workspaceStatus !== "ready" ? (
          <WorkspaceQueryState status={workspaceStatus} variant="dashboard" />
        ) : isQueryBlocked ? (
          <HttpQueryState query={overviewQuery} variant="dashboard" />
        ) : (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <NewProjectsCard
                emptyLabel={t("normal.noProjects")}
                loading={isWorkspaceReady && projectsQuery.queryStatus === "loading"}
                projects={latestProjects}
                title={t("normal.newProjects")}
                viewAllLabel={t("normal.viewAll")}
              />
              <LatestClientsList
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
    [clientsQuery.queryStatus, desk, isQueryBlocked, isWorkspaceReady, latestClients, latestProjects, overviewQuery, projectsQuery.queryStatus, t, workspaceStatus],
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
        <div className={cn(scrollAreaClassName, "max-h-[364px] divide-y divide-zinc-100 dark:divide-white/[0.04]")}>
          {events.map((event) => <ScheduleEventRow key={event.id} event={event} />)}
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

function ScheduleEventRow({ event }: { event: DashboardOverview["weekEvents"][number] }) {
  const calendar = useTranslations("Calendar");
  const eventTypeLabel = compactEventType(event, (type) => calendar(`types.${type}`));

  return (
    <div className="group grid grid-cols-[54px_minmax(0,1fr)_32px] items-center gap-3 py-3 transition-colors hover:bg-zinc-50/70 dark:hover:bg-white/[0.025]">
      <div className="text-center">
        <span className="block text-xs font-black tabular-nums text-zinc-950 dark:text-zinc-50">{event.time}</span>
        <span className={cn(
          "mx-auto mt-1 block h-1.5 w-1.5 rounded-full",
          event.priority === "urgent"
            ? "bg-red-500"
            : event.priority === "high"
              ? "bg-amber-500"
              : "bg-[#0B5CFF]"
        )} />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-xs font-black text-zinc-950 dark:text-zinc-50">
            {compactScheduleTitle(event.title)}
          </p>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            {eventTypeLabel}
          </span>
        </div>
        <p className="mt-1 truncate text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
          {event.clientName ?? event.owner}
        </p>
      </div>

      <div className="flex justify-end">
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-950 dark:text-zinc-500 dark:group-hover:bg-white/[0.06] dark:group-hover:text-zinc-100">
          <CalendarClock className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function NewProjectsCard({
  emptyLabel,
  loading,
  projects,
  title,
  viewAllLabel,
}: {
  emptyLabel: string;
  loading: boolean;
  projects: Project[];
  title: string;
  viewAllLabel: string;
}) {
  return (
    <AppSection 
      title={title}
      actions={
        <Link href="/projects" className={dashboardActionLinkClassName}>
          {viewAllLabel}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      }
    >
      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[232px] animate-pulse rounded-[22px] bg-zinc-50 dark:bg-white/[0.02]" />
          ))
        ) : projects.length > 0 ? (
          projects.slice(0, 3).map((project) => (
            <DashboardProjectTile key={project.id} project={project} />
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

function DashboardProjectTile({ project }: { project: Project }) {
  const t = useTranslations("Projects");
  const image = project.coverImageUrl || project.image;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-[22px] border border-zinc-100 bg-white transition-colors hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/10 dark:border-white/5 dark:bg-[#0A0A0A] dark:focus-visible:ring-white/10"
    >
      <div className="relative h-[232px] overflow-hidden bg-zinc-100 text-start dark:bg-white/5">
        {image ? (
          <Image
            src={image}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover opacity-85 grayscale transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Building2 className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/12 to-transparent transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:opacity-55" />
        <div className="pointer-events-none absolute -end-14 -top-14 h-36 w-36 rounded-full bg-[#0B5CFF]/25 opacity-35 blur-3xl transition-opacity duration-300 group-hover:opacity-90 group-focus-visible:opacity-90" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#8AB2FF]/80 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex min-w-0 items-end justify-between gap-4">
            <div className="min-w-0 opacity-0 translate-y-2 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <h3 className="line-clamp-2 text-base font-black leading-tight text-white">
                {project.name}
              </h3>
              <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-white/65">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{project.city || project.area || "—"}</span>
              </p>
            </div>
            <div className="shrink-0 text-end transition duration-300 md:translate-y-7 md:group-hover:translate-y-0 md:group-focus-visible:translate-y-0">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/50">
                {t("card.value")}
              </p>
              <p className="mt-1 max-w-32 truncate text-sm font-black text-white">
                {project.priceRange}
              </p>
            </div>
          </div>

          <div className="mt-4 flex translate-y-2 items-center justify-between border-t border-white/10 pt-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <div className="flex min-w-0 items-center gap-2 text-[10px] font-bold text-white/60">
              <Landmark className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{project.developer || project.type}</span>
            </div>
            <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-white/75">
              {project.units} {t("card.units")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function compactScheduleTitle(value: string) {
  return value
    .replace(/^\s*[a-z]+\s+\d+\s*-\s*/i, "")
    .replace(/\s+/g, " ")
    .trim() || value;
}

const knownCalendarTypes = new Set([
  "visit",
  "call",
  "meeting",
  "client-visit",
  "site-viewing",
  "appointment",
  "signing",
  "follow-up",
  "handover",
  "audit",
  "custom",
]);

function compactEventType(event: DashboardOverview["weekEvents"][number], translateType: (type: string) => string) {
  const rawType = event.type || event.title.match(/^\s*([a-z]+)/i)?.[1] || "";
  const normalized = rawType.replace(/_/g, "-").trim().toLowerCase();
  if (knownCalendarTypes.has(normalized)) return translateType(normalized);

  const fallback = normalized.replace(/-/g, " ").split(/\s+/).filter(Boolean)[0];
  return (fallback || translateType("custom")).slice(0, 12);
}

function LatestClientsList({
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
  const visibleClients = loading ? [] : clients;

  return (
    <AppSection
      title={title}
      actions={
        <Link href="/clients" className={dashboardActionLinkClassName}>
          {t("normal.viewAll")}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      }
    >
      {visibleClients.length > 0 ? (
        <div className={cn(scrollAreaClassName, "max-h-[360px] divide-y divide-zinc-100 dark:divide-white/[0.04]")}>
          {visibleClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 py-3 transition-colors hover:bg-zinc-50/70 dark:hover:bg-white/[0.025]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-black uppercase text-zinc-600 ring-1 ring-zinc-200 transition-colors group-hover:bg-white dark:bg-white/[0.08] dark:text-zinc-300 dark:ring-white/10 dark:group-hover:bg-white/[0.12]">
                {client.name.charAt(0)}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-xs font-black text-zinc-950 dark:text-zinc-50">{client.name}</span>
                <span className="mt-1 block truncate text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                  {client.propertyInterest || client.nextAction || client.contact}
                </span>
              </span>

              <span className="shrink-0">
                <StatusPill label={tc(`stages.${client.pipelineStage}`)} tone={client.pipelineStage === "closed" ? "success" : "info"} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-center dark:border-white/10">
          <p className="text-xs font-bold text-zinc-400">{loading ? common("loading") : emptyLabel}</p>
        </div>
      )}
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

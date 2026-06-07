"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { ArrowRight, Building2, CalendarClock, FileText, FolderOpen, Landmark, Layers3, MapPin, Package, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { HttpQueryState, WorkspaceQueryState, StatusPill } from "@/components/shared/crud-ui";
import { DashboardChat } from "@/components/dashboard/dashboard-chat";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { useAssetsIndexQuery } from "@/domains/assets/api/assets";
import type { WorkspaceAsset } from "@/domains/assets/store/assets.types";
import { formatSAR, statusTone } from "@/domains/assets/asset-view-model";
import {
  compactEventType,
  compactScheduleTitle,
  dashboardDesk,
  dashboardWeekRange,
  latestDashboardClients,
  latestDashboardProjects,
  type DashboardOverview,
} from "@/domains/dashboard/dashboard-view-model";
import { parseWorkspaceMode, useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import type { Project } from "@/domains/projects/store/projects.types";
import { statusTone as projectStatusTone } from "@/domains/projects/project-view-model";
import { useWorkspaceResourceResult } from "@/domains/resources/workspace-resource-request";
import { useSearchParams } from "next/navigation";

const TODAY = new Date();

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
    return dashboardWeekRange(TODAY);
  }, []);
  const overviewQuery = useWorkspaceResourceResult<DashboardOverview>(
    ["dashboard", workspaceOrganizationId, weekRange.startAt, weekRange.endAt],
    workspaceOrganizationId,
    "dashboard/index",
    workspaceOrganizationId ? { startAt: weekRange.startAt, endAt: weekRange.endAt } : undefined,
  );
  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId);
  const projectsQuery = useProjectsIndexQuery(workspaceOrganizationId);
  const assetsQuery = useAssetsIndexQuery(workspaceOrganizationId);
  const overview = overviewQuery.data;
  const clients = useMemo(() => clientsQuery.results as Client[], [clientsQuery.results]);
  const projects = useMemo(() => projectsQuery.results as Project[], [projectsQuery.results]);
  const assets = useMemo(() => assetsQuery.results as WorkspaceAsset[], [assetsQuery.results]);
  const isLoading = isWorkspaceReady && overviewQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || overviewQuery.queryStatus === "error";

  useEffect(() => {
    setMode(queryMode);
  }, [queryMode, setMode]);

  const desk = useMemo(() => {
    return dashboardDesk(overview?.weekEvents ?? [], TODAY);
  }, [overview]);
  const latestClients = useMemo(() => {
    return latestDashboardClients(clients);
  }, [clients]);
  const latestProjects = useMemo(() => {
    return latestDashboardProjects(projects);
  }, [projects]);
  const latestAssets = useMemo(() => {
    return [...assets]
      .sort((left, right) => {
        const leftTime = left.updatedAt ?? left.createdAt ?? Date.parse(left.updated ?? "") ?? 0;
        const rightTime = right.updatedAt ?? right.createdAt ?? Date.parse(right.updated ?? "") ?? 0;
        return rightTime - leftTime;
      })
      .slice(0, 6);
  }, [assets]);

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
              <WorkspaceOpsStrip
                assetStats={assetsQuery.stats}
                clientCount={clients.length}
                eventCount={desk.todayEvents.length}
                projectCount={projects.length}
              />
              <LatestAssetsBoard
                assets={latestAssets}
                emptyLabel={t("normal.noAssets")}
                loading={isWorkspaceReady && assetsQuery.queryStatus === "loading"}
                title={t("normal.newAssets")}
                viewAllLabel={t("normal.viewAll")}
              />
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
    [assetsQuery.queryStatus, assetsQuery.stats, clients.length, clientsQuery.queryStatus, desk, isQueryBlocked, isWorkspaceReady, latestAssets, latestClients, latestProjects, overviewQuery, projects.length, projectsQuery.queryStatus, t, workspaceStatus],
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

function WorkspaceOpsStrip({
  assetStats,
  clientCount,
  eventCount,
  projectCount,
}: {
  assetStats?: { total?: number; available?: number; pending?: number };
  clientCount: number;
  eventCount: number;
  projectCount: number;
}) {
  const t = useTranslations("Dashboard");
  const items = [
    { label: t("stats.projects"), value: projectCount, icon: Building2 },
    { label: t("stats.assets"), value: assetStats?.total ?? 0, icon: Package },
    { label: t("stats.clients"), value: clientCount, icon: UserRound },
    { label: t("stats.events"), value: eventCount, icon: CalendarClock },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0A0A0A]">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">{value}</p>
          </div>
          <Icon className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
        </div>
      ))}
    </section>
  );
}

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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-0">
              <div className="ms-5 h-4 w-[38%] animate-pulse rounded-t-xl bg-zinc-100 dark:bg-[#121212]" />
              <div className="h-[148px] animate-pulse rounded-[18px] rounded-tl-md border border-zinc-200/80 bg-white dark:border-white/10 dark:bg-[#0A0A0A]" />
            </div>
          ))
        ) : projects.length > 0 ? (
          projects.slice(0, 4).map((project) => (
            <DashboardProjectFolder key={project.id} project={project} />
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

function LatestAssetsBoard({
  assets,
  emptyLabel,
  loading,
  title,
  viewAllLabel,
}: {
  assets: WorkspaceAsset[];
  emptyLabel: string;
  loading: boolean;
  title: string;
  viewAllLabel: string;
}) {
  const visibleAssets = loading ? [] : assets;

  return (
    <AppSection
      title={title}
      actions={
        <Link href="/assets" className={dashboardActionLinkClassName}>
          {viewAllLabel}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      }
    >
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="min-h-[132px] animate-pulse rounded-md border border-zinc-200/80 bg-white dark:border-white/10 dark:bg-[#0A0A0A]" />
          ))}
        </div>
      ) : visibleAssets.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleAssets.map((asset) => <DashboardAssetFile key={asset.id} asset={asset} />)}
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-center dark:border-white/10">
          <p className="text-xs font-bold text-zinc-400">{emptyLabel}</p>
        </div>
      )}
    </AppSection>
  );
}

function DashboardFolderShell({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group block text-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#121212]/10 dark:focus-visible:ring-white/10"
    >
      <div className="relative pt-4">
        <div
          aria-hidden="true"
          className="absolute start-5 top-0 z-10 h-4 w-[42%] max-w-[108px] rounded-t-[14px] border border-b-0 border-zinc-200/80 bg-[#FAFAFA] transition-colors group-hover:border-zinc-300 dark:border-white/10 dark:bg-[#121212] dark:group-hover:border-white/20"
        />
        <div className="relative -mt-px overflow-hidden rounded-[18px] rounded-tl-md border border-zinc-200/80 bg-white transition duration-300 group-hover:border-zinc-300 dark:border-white/10 dark:bg-[#0A0A0A] dark:group-hover:border-white/20">
          {children}
        </div>
      </div>
    </Link>
  );
}

function DashboardProjectFolder({ project }: { project: Project }) {
  const t = useTranslations("Projects");
  const location = project.city || project.area || "—";

  return (
    <DashboardFolderShell href={`/projects/${project.id}`} label={project.name}>
      <div className="flex min-h-[148px] flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-[#121212] transition-colors group-hover:bg-zinc-950 group-hover:text-white dark:bg-white/[0.06] dark:text-white dark:group-hover:bg-white dark:group-hover:text-[#121212]">
            <FolderOpen className="h-4 w-4" />
          </span>
          <StatusPill label={t(`toolbar.filters.${project.status}`)} tone={projectStatusTone(project.status)} />
        </div>
        <div className="mt-3 min-w-0 flex-1">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">{project.reference}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-black leading-tight text-[#121212] dark:text-white">{project.name}</h3>
          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-[10px] font-bold text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{project.developer || project.type}</span>
          </span>
          <span className="shrink-0 truncate text-end font-black text-[#121212] dark:text-white">
            {project.priceRange || `${project.assetCount} ${t("card.assetCount")}`}
          </span>
        </div>
      </div>
    </DashboardFolderShell>
  );
}

function DashboardAssetFile({ asset }: { asset: WorkspaceAsset }) {
  const assetsT = useTranslations("Assets");

  return (
    <Link
      href={`/assets/${asset.id}`}
      aria-label={asset.title}
      className="group relative block min-h-[132px] overflow-hidden rounded-md border border-zinc-200/80 bg-white text-start transition-colors hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#121212]/10 dark:border-white/10 dark:bg-[#0A0A0A] dark:hover:border-white/20 dark:focus-visible:ring-white/10"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-0 top-0 border-s-[30px] border-s-transparent border-t-[30px] border-t-zinc-200 dark:border-t-zinc-700"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-0 top-0 border-s-[26px] border-s-transparent border-t-[26px] border-t-[#FAFAFA] dark:border-t-[#121212]"
      />

      <div className="relative flex h-full flex-col p-4 pe-8">
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-[#121212] dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
            <FileText className="h-4 w-4" />
          </span>
          <StatusPill label={assetsT(`toolbar.filters.${asset.status}`)} tone={statusTone(asset.status)} />
        </div>

        <div className="mt-3 min-w-0 flex-1">
          <p className="truncate font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-400">{asset.reference}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-black leading-tight text-[#121212] dark:text-white">{asset.title}</h3>
          <div className="mt-3 space-y-1.5">
            <span className="block h-px w-full bg-zinc-100 dark:bg-white/[0.06]" />
            <span className="block h-px w-[88%] bg-zinc-100 dark:bg-white/[0.06]" />
            <span className="block h-px w-[62%] bg-zinc-100 dark:bg-white/[0.04]" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Layers3 className="h-3 w-3 shrink-0" />
            <span className="truncate">{asset.area}</span>
          </span>
          <span className="shrink-0 font-black text-[#121212] dark:text-white">{formatSAR(asset.price)}</span>
        </div>
      </div>
    </Link>
  );
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
                  {client.assetInterest || client.nextAction || client.contact}
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

const scrollAreaClassName =
  "overflow-y-auto overflow-x-hidden pe-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent";

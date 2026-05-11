"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, CalendarClock, Edit, Home, MessageSquareText, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { ProgressiveLoadingState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { DashboardChat } from "@/components/dashboard/dashboard-chat";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { useHttpQuery } from "@/components/shared/use-http-query";

const TODAY = new Date();
const CHART_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"];

type DashboardProject = {
  id: string;
  name: string;
  reference: string;
  city: string;
  status: string;
  units: number;
  priceRange: string;
  coverImageUrl?: string;
};

type DashboardOverview = {
  counts: {
    dueToday: number;
    availableUnits: number;
    reviewUnits: number;
    readyProjects: number;
    blockedProjects: number;
    totalProjects: number;
  };
  projects: DashboardProject[];
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
  const mode = useWorkspaceStore((state) => state.mode);
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
  const overview = useHttpQuery<DashboardOverview>(
    ["dashboard", workspaceOrganizationId, weekRange.startAt, weekRange.endAt],
    workspaceOrganizationId ? `/api/v1/organizations/${workspaceOrganizationId}/read/dashboard` : undefined,
    workspaceOrganizationId ? { startAt: weekRange.startAt, endAt: weekRange.endAt } : undefined,
  );
  const isLoading = isWorkspaceReady && overview === undefined;

  const desk = useMemo(() => {
    const weekDays = getWeekDays(TODAY).map((date) => ({
      date,
      items: (overview?.weekEvents ?? []).filter((event) => isSameDay(parseDate(event.date), date)),
    }));
    const counts = overview?.counts ?? {
      dueToday: 0,
      availableUnits: 0,
      reviewUnits: 0,
      readyProjects: 0,
      blockedProjects: 0,
      totalProjects: 0,
    };
    const chartData = [
      { name: t("chart.clients"), value: Math.max(counts.dueToday, 1) },
      { name: t("chart.inventory"), value: Math.max(counts.availableUnits, 1) },
      { name: t("chart.review"), value: Math.max(counts.reviewUnits, 1) },
      { name: t("chart.blocked"), value: Math.max(counts.blockedProjects, 1) },
    ];

    return {
      weekDays,
      dueToday: counts.dueToday,
      availableUnits: counts.availableUnits,
      reviewUnits: counts.reviewUnits,
      readyProjects: counts.readyProjects,
      blockedProjects: counts.blockedProjects,
      totalProjects: counts.totalProjects,
      chartData,
    };
  }, [overview, t]);

  return (
    <AnimatePresence mode="wait">
      {mode === "ai" ? (
        <ModePanel key="ai-mode">
          <DashboardChat />
        </ModePanel>
      ) : (
        <ModePanel key="work-mode">
          <AppPageShell contentClassName="space-y-7">
            <AppPageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

            <div className="grid gap-3 md:grid-cols-3">
              <MiniSignal label={t("signals.followUps")} value={overview ? desk.dueToday : "..."} helper={t("overview.today")} tone="blue" />
              <MiniSignal label={t("signals.readyInventory")} value={overview ? desk.availableUnits : "..."} helper={t("overview.canShow")} tone="green" />
              <MiniSignal label={t("signals.blockedApprovals")} value={overview ? desk.blockedProjects : "..."} helper={t("overview.needsWork")} tone="amber" />
            </div>

            {workspaceStatus !== "ready" ? (
              <WorkspaceQueryState status={workspaceStatus} />
            ) : isLoading ? (
              <ProgressiveLoadingState />
            ) : (
              <>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <AppSection
                    title={t("calendar.title")}
                    description={t("calendar.description")}
                    actions={
                      <Link href="/calendar" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white">
                        {t("calendar.open")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    }
                  >
                    <div className="mb-5 grid gap-4 md:grid-cols-3">
                      {(overview?.projects ?? []).map((project) => (
                        <DashboardProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                    <div className="overflow-hidden rounded-[22px] border border-zinc-100 bg-white dark:border-white/5 dark:bg-[#0A0A0A]">
                      <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-white/5">
                        {desk.weekDays.map(({ date }) => {
                          const active = isSameDay(date, TODAY);
                          return (
                            <div key={date.toISOString()} className={cn("p-3 text-center", active && "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900")}>
                              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{date.toLocaleDateString("en", { weekday: "short" })}</p>
                              <p className="mt-1 text-lg font-black">{date.getDate()}</p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="grid min-h-[330px] grid-cols-7 divide-x divide-zinc-100 rtl:divide-x-reverse dark:divide-white/[0.04]">
                        {desk.weekDays.map(({ date, items }) => (
                          <div key={date.toISOString()} className="space-y-2 p-2">
                            {items.length === 0 ? (
                              <div className="h-20 rounded-2xl border border-dashed border-zinc-100 dark:border-white/[0.04]" />
                            ) : (
                              items.map((event) => (
                                <div key={event.id} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3 text-start dark:border-white/5 dark:bg-white/[0.035]">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-black text-zinc-900 dark:text-white">{event.time}</p>
                                    <span className={cn("h-2 w-2 rounded-full", priorityDotClassName[event.priority])} />
                                  </div>
                                  <p className="mt-2 truncate text-xs font-black text-zinc-900 dark:text-white">{event.clientName ?? event.owner}</p>
                                  <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">{event.title}</p>
                                  <div className="mt-3">
                                    <StatusPill label={event.type} tone="neutral" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </AppSection>

                  <div className="space-y-6">
                    <AppSection title={t("chart.title")} description={t("chart.description")}>
                      <div className="relative mx-auto h-[220px] max-w-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={desk.chartData} dataKey="value" innerRadius={64} outerRadius={94} strokeWidth={0} paddingAngle={3}>
                              {desk.chartData.map((entry, index) => (
                                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">{desk.readyProjects}/{desk.totalProjects}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("chart.center")}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {desk.chartData.map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </AppSection>

                    <AppSection title={t("actions.title")} description={t("actions.description")}>
                      <div className="space-y-2">
                        <RoleAction href="/clients" role={t("actions.sales")} label={t("actions.logFollowUp")} icon={MessageSquareText} primary />
                        <RoleAction href="/calendar" role={t("actions.coordinator")} label={t("actions.scheduleViewing")} icon={CalendarClock} />
                        <RoleAction href="/properties/create" role={t("actions.inventory")} label={t("actions.addUnit")} icon={Home} />
                        <RoleAction href="/projects/create" role={t("actions.admin")} label={t("actions.prepareProject")} icon={Plus} />
                      </div>
                    </AppSection>
                  </div>
                </div>
              </>
            )}
          </AppPageShell>
        </ModePanel>
      )}
    </AnimatePresence>
  );
}

function ModePanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function DashboardProjectCard({ project }: { project: DashboardProject }) {
  const t = useTranslations("Dashboard");

  return (
    <article className="group overflow-hidden rounded-[24px] border border-zinc-100 bg-white text-start transition hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]">
      <Link href={`/projects/${project.id}`} className="relative block h-36 overflow-hidden bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:bg-white/5">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover opacity-75 grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Home className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
          <h3 className="truncate text-sm font-black uppercase tracking-tight text-white">{project.name}</h3>
          <p className="mt-1 truncate text-[9px] font-black uppercase tracking-widest text-white/60">{project.city}</p>
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{project.reference}</span>
          <StatusPill label={project.status} tone={project.status === "approved" ? "success" : project.status === "pending" ? "warning" : "neutral"} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ProjectCardMetric label={t("projects.units")} value={String(project.units)} />
          <ProjectCardMetric label={t("projects.market")} value={project.priceRange} />
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/5">
          <button type="button" aria-label={t("projects.deleteProject", { name: project.name })} className="p-2 text-zinc-300 transition hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <Link href={`/projects/${project.id}/edit`} className="inline-flex items-center gap-1.5 p-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white">
            {t("projects.edit")}
            <Edit className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProjectCardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-white/[0.025]">
      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function MiniSignal({ label, value, helper, tone }: { label: string; value: number | string; helper: string; tone: "blue" | "green" | "amber" }) {
  return (
    <div className="rounded-[22px] border border-zinc-100 bg-white p-4 dark:border-white/5 dark:bg-[#0A0A0A]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">{label}</p>
          <p className="mt-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">{helper}</p>
        </div>
        <span className={cn("h-2.5 w-2.5 rounded-full", signalDotClassName[tone])} />
      </div>
      <p className="mt-3 text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function RoleAction({ href, role, label, icon: Icon, primary = false }: { href: string; role: string; label: string; icon: typeof Plus; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition",
        primary
          ? "bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-xs font-black">{label}</span>
        <span className={cn("mt-0.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest", primary ? "text-white/60 dark:text-zinc-500" : "text-zinc-400")}>
          <ShieldCheck className="h-3 w-3" />
          {role}
        </span>
      </span>
      <Icon className="h-4 w-4 shrink-0" />
    </Link>
  );
}

function parseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
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

const priorityDotClassName = {
  normal: "bg-zinc-300",
  high: "bg-amber-400",
  urgent: "bg-red-500",
};

const signalDotClassName = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
};

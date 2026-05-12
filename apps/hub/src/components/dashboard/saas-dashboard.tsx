"use client";

import {
  Clock3,
  FileCheck2,
  Home,
  Wifi,
  BarChart3,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { AppPageHeader, AppStatsGrid } from "@/components/shared";
import { cn } from "@/lib/utils";
import { DashboardChat } from "./dashboard-chat";
import { useAccountContext } from "@/domains/auth";
import { useWorkspaceStore } from "@/domains/dashboard";
import { useTranslations } from "next-intl";

export function SaasDashboard() {
  const { mode } = useWorkspaceStore();
  const t = useTranslations('Workspace');
  const account = useAccountContext();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const metrics = [
    { label: "Active Listings", value: "248", icon: Home, iconClassName: "text-blue-600" },
    { label: "Pending Approvals", value: "18", icon: FileCheck2, iconClassName: "text-amber-500" },
    { label: "Qualified Leads", value: "1,284", icon: UsersRound, iconClassName: "text-green-600" },
    { label: "Sync Health", value: "99.2%", icon: Wifi, iconClassName: "text-blue-600" },
  ];

  const workItems = [
    {
      title: "Approve Riyadh Heights tower units",
      meta: "24 units · developer submitted new pricing",
      status: "Review",
      due: "Today",
    },
    {
      title: "Resolve duplicate listing claims",
      meta: "Palm Residence · 3 broker submissions",
      status: "Blocked",
      due: "Today",
    },
    {
      title: "Publish verified Jeddah waterfront units",
      meta: "12 units · ready for marketplace sync",
      status: "Ready",
      due: "Tomorrow",
    },
  ];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      <div className="flex-1 overflow-hidden">
        {mode === "ws" ? (
          <div className="h-full overflow-y-auto bg-zinc-50/30 dark:bg-transparent">
            <div className="mx-auto max-w-[1400px] space-y-10 p-8">
                <AppPageHeader title={t('systemOverview')} subtitle={t('syncEfficiency')} />

                <AppStatsGrid stats={metrics} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Work Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{t('actionRequired')}</h2>
                    </div>
                    <div className="space-y-4">
                    {workItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-5 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                                <Clock3 className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div className="space-y-1">
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white">{item.title}</h4>
                            <p className="text-xs font-bold text-zinc-500">{item.meta}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.due}</span>
                            <span className={cn(
                                "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                                item.status === "Ready" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                            )}>
                                {item.status}
                            </span>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{t('quickTools')}</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { label: "Sync Inventory", icon: Wifi },
                            { label: "Verify Claims", icon: FileCheck2 },
                            { label: "Team Performance", icon: TrendingUp },
                            { label: "Project Reports", icon: BarChart3 },
                        ].map((tool, i) => (
                            <button key={i} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4 text-left transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <tool.icon className="h-4 w-4 text-zinc-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                </div>
            </div>
          </div>
        ) : (
          <DashboardChat organizationId={organizationId} />
        )}
      </div>
    </div>
  );
}

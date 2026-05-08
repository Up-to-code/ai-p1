"use client";

import { Activity, Building2, FolderOpen, Home, Plus, Users, Search, ArrowRight } from "lucide-react";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { useClientsStore } from "@/domains/clients";
import { useProjectsStore } from "@/domains/projects";
import { usePropertiesStore } from "@/domains/properties";
import { StatusPill } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function DashboardScreen() {
  const t = useTranslations('Dashboard');
  const clients = useClientsStore((state) => state.clients);
  const projects = useProjectsStore((state) => state.projects);
  const units = usePropertiesStore((state) => state.units);

  return (
    <AppPageShell>
      <AppPageHeader 
        eyebrow={t('eyebrow')} 
        title={t('title')} 
      />

      <div className="grid gap-8">
        {/* Stats Summary - Very Simple */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: t('stats.clients'), value: clients.length, icon: Users },
            { label: t('stats.projects'), value: projects.length, icon: FolderOpen },
            { label: t('stats.units'), value: units.length, icon: Home },
            { label: t('simple.syncStatus'), value: "99.2%", icon: Activity },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-white/5 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <stat.icon className="h-4 w-4 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main List Section: Projects or Units */}
          <div className="lg:col-span-2 space-y-6">
            <AppSection 
              title={t('simple.recentProjects')} 
              actions={
                <Link href="/projects" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                  {t('simple.viewAllProjects')}
                </Link>
              }
            >
              <div className="divide-y divide-zinc-50 dark:divide-white/5">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="group flex items-center justify-between py-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5">
                        <Building2 className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{project.name}</p>
                        <p className="text-[11px] font-medium text-zinc-400">{project.developer || 'Internal Project'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-end">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('simple.syncStatus')}</p>
                        <p className="mt-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 capitalize">{project.status}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </AppSection>

            <AppSection 
              title={t('simple.inventoryUnits')}
              actions={
                <Link href="/properties" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                  {t('simple.fullInventory')}
                </Link>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {units.slice(0, 4).map((unit) => (
                  <div key={unit.id} className="rounded-2xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200 dark:border-white/5 dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{unit.title}</p>
                        <p className="mt-1 text-[11px] text-zinc-400">{unit.type} • {unit.area} m²</p>
                      </div>
                      <StatusPill label={unit.status} tone={unit.status === "available" ? "success" : "warning"} />
                    </div>
                  </div>
                ))}
              </div>
            </AppSection>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="rounded-[24px] border border-zinc-100 bg-white p-6 dark:border-white/5 dark:bg-zinc-900">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('simple.quickActions')}</h3>
              <div className="mt-6 space-y-2">
                <Link href="/projects/create" className="flex w-full items-center justify-between rounded-xl bg-zinc-900 p-4 text-white transition-all hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-widest">{t('simple.newProject')}</span>
                  <Plus className="h-4 w-4" />
                </Link>
                <Link href="/properties/create" className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 transition-all hover:bg-zinc-50 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest">{t('simple.addUnit')}</span>
                  <Plus className="h-4 w-4" />
                </Link>
                <Link href="/clients" className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 transition-all hover:bg-zinc-50 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest">{t('simple.registerClient')}</span>
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[24px] bg-zinc-50 p-6 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-zinc-400" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('simple.globalSearch')}</h3>
              </div>
              <p className="mt-3 text-xs font-medium text-zinc-500">{t('simple.searchDesc')}</p>
              <div className="mt-4 relative">
                <input 
                  type="text" 
                  placeholder={t('simple.searchPlaceholder')}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppPageShell>
  );
}






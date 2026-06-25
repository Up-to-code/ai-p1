"use client";

import { AppPageHeader, AppPageShell, AppSection, AppStatsGrid } from "@/components/shared";
import { AppPrimaryButton } from "@/components/shared";
import { Lock, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  WORK_OS_MODULE_ICONS,
  WORK_OS_MODULE_STAT_KEYS,
  type WorkOsModuleKind,
} from "../config/work-os-modules.config";

export function WorkOsModuleScreen({ kind }: { kind: WorkOsModuleKind }) {
  const t = useTranslations("WorkOs.modules");
  const icons = WORK_OS_MODULE_ICONS[kind];
  const statKeys = WORK_OS_MODULE_STAT_KEYS[kind];
  const stats = statKeys.map((key, index) => ({
    label: t(`${kind}.stats.${key}`),
    value: "0",
    icon: icons[index],
  }));

  return (
    <AppPageShell maxWidth="full" contentClassName="space-y-6">
      <AppPageHeader
        eyebrow={t(`${kind}.eyebrow`)}
        title={t(`${kind}.title`)}
        subtitle={t(`${kind}.subtitle`)}
        actions={(
          <AppPrimaryButton disabled className="opacity-50">
            <Plus className="me-2 h-3.5 w-3.5" />
            {t(`${kind}.primaryLabel`)}
          </AppPrimaryButton>
        )}
      />
      <div className="relative">
        <div className="space-y-8 opacity-40 blur-[8px] pointer-events-none select-none grayscale-[0.2] transition-all">
          <AppStatsGrid stats={stats} />
          <AppSection
            title={t("workspaceView.title")}
            description={t("workspaceView.description")}
          >
            <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border text-center dark:border-white/10">
              <p className="text-xs font-bold text-muted-foreground">{t("workspaceView.empty")}</p>
            </div>
          </AppSection>
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 min-h-[400px]">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-[20px] border border-border/80 bg-white/90 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-foreground/90 dark:shadow-black/40">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
              <Lock className="h-3.5 w-3.5" />
              {t("comingSoon.badge")}
            </span>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              {t(`${kind}.title`)}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground dark:text-muted-foreground">
              {t("comingSoon.description", { module: t(`${kind}.title`) })}
            </p>
          </div>
        </div>
      </div>
    </AppPageShell>
  );
}

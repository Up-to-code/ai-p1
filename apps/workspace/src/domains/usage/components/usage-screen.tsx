"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useBillingUsage } from "@/domains/billing/api/billing";
import { useAuthSession } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { USAGE_TABS, type UsageTab } from "../config/usage-tabs.config";
import type { UsageLocale } from "../lib/usage-formatters";
import { PaymentsLedger } from "./payments-ledger";
import { UsageLoadingSkeleton } from "./usage-loading-skeleton";
import { UsageOverviewPanel } from "./usage-overview-panel";
import { UsageStatePanel } from "./usage-state-panel";

export function UsageScreen() {
  const t = useTranslations("Usage");
  const locale = useLocale() as UsageLocale;
  const session = useAuthSession();
  const [activeTab, setActiveTab] = useState<UsageTab>("usage");
  const organizationId = session.workspace.status === "ready" ? session.organization.id : undefined;
  const usage = useBillingUsage(organizationId);

  if (session.workspace.status !== "ready") {
    return (
      <div className="min-h-screen bg-muted/50/50 dark:bg-[#070707]">
        <WorkspaceQueryState status={session.workspace.status} variant="dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50/50" style={{backgroundColor: "var(--q-bg-secondary)"}}>
      <div className="border-b" style={{borderColor: "var(--q-border)", backgroundColor: "var(--q-card)"}}>
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="space-y-2">
            <h1 className="truncate text-2xl font-black uppercase tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-px">
            {USAGE_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                    activeTab === tab.id
                      ? "border-foreground bg-muted/50/80 text-foreground dark:border-white dark:bg-white/[0.03]"
                      : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/[0.02] dark:hover:text-muted-foreground/40",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {usage.status === "loading" && (
          <UsageLoadingSkeleton activeTab={activeTab} label={t("loading")} />
        )}
        {usage.status === "error" && (
          <UsageStatePanel message={t("error")} muted={usage.error.message} />
        )}
        {usage.status === "ready" && activeTab === "usage" && (
          <UsageOverviewPanel locale={locale} usage={usage.data} />
        )}
        {usage.status === "ready" && activeTab === "payments" && (
          <PaymentsLedger locale={locale} payments={usage.data.payments} />
        )}
      </div>
    </div>
  );
}

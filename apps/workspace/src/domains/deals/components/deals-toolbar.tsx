"use client";

import { Search, Plus, KanbanSquare, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppPrimaryButton } from "@/components/shared";
import { HeaderSelect } from "@/components/ui/header-select";
import { cn } from "@/lib/utils";
import type { DealStage } from "../store/deals.types";
import { dealStages } from "../lib/deal-view-model";

interface DealsToolbarProps {
  stage: DealStage | "all";
  search: string;
  view: "pipeline" | "list";
  dealStageLabels: Record<DealStage, string>;
  onStageChange: (stage: DealStage | "all") => void;
  onSearchChange: (search: string) => void;
  onViewChange: (view: "pipeline" | "list") => void;
  onNewDeal: () => void;
}

export function DealsToolbar({
  stage,
  search,
  view,
  dealStageLabels,
  onStageChange,
  onSearchChange,
  onViewChange,
  onNewDeal,
}: DealsToolbarProps) {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");

  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-lg font-bold text-foreground truncate">{t("title")}</h1>
        <div className="h-5 w-px bg-border shrink-0" />
        <HeaderSelect
          value={stage}
          onChange={(value) => onStageChange(value as DealStage | "all")}
          options={[
            { value: "all", label: t("filters.all") },
            ...dealStages.map((item) => ({ value: item, label: dealStageLabels[item] })),
          ]}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 transition-colors focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={common("search")}
            className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center rounded-lg bg-muted p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => onViewChange("pipeline")}
            className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-all", view === "pipeline" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            aria-label="Pipeline view"
          >
            <KanbanSquare className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-all", view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
        <AppPrimaryButton onClick={onNewDeal} className="h-8 px-3 text-xs">
          <Plus className="me-1.5 h-3.5 w-3.5" />
          {t("actions.new")}
        </AppPrimaryButton>
      </div>
    </div>
  );
}

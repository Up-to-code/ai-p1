"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/crud-ui";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { DEAL_STAGES } from "../config/deals.config";
import { formatValue, priorityTone } from "../lib/deal-view-model";
import type { Deal, DealPriority, DealStage } from "../store/deals.types";

export function DealBoard({
  deals,
  labels,
  priorityLabels,
  onEdit,
  onDelete,
  onMoveStage,
  movingId,
}: {
  deals: Deal[];
  labels: Record<DealStage, string>;
  priorityLabels: Record<DealPriority, string>;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onMoveStage: (deal: Deal, stage: DealStage) => void;
  movingId: string | null;
}) {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {DEAL_STAGES.map((stage) => {
        const rows = deals.filter((deal) => deal.stage === stage);
        const isDragOver = dragOverStage === stage;

        return (
          <section
            key={stage}
            className={cn(
              "flex min-h-[420px] w-[min(100%,280px)] shrink-0 flex-col rounded-[28px] border p-3 transition-all duration-300",
              isDragOver
                ? "border-[var(--q-accent)] bg-[var(--q-accent-muted)] ring-4 ring-[var(--q-accent-border)]"
                : "border-border bg-muted/50/40 dark:border-white/5 dark:bg-white/[0.01]",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (dragOverStage !== stage) setDragOverStage(stage);
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOverStage(null);
              const dealId = event.dataTransfer.getData("dealId") || draggedId;
              if (!dealId) return;
              const moving = deals.find((deal) => deal.id === dealId);
              if (moving && moving.stage !== stage) onMoveStage(moving, stage);
              setDraggedId(null);
            }}
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{labels[stage]}</h3>
              <span className="text-[10px] font-black tabular-nums text-muted-foreground/40">{String(rows.length).padStart(2, "0")}</span>
            </div>
            <div className="flex-1 space-y-3">
              {rows.map((deal) => (
                <article
                  key={deal.id}
                  draggable={movingId !== deal.id}
                  onDragStart={(event) => {
                    setDraggedId(deal.id);
                    event.dataTransfer.setData("dealId", deal.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverStage(null);
                  }}
                  className={cn(
                    "rounded-2xl border border-border bg-white p-3 transition-all dark:border-white/10 dark:bg-[#0A0A0A]",
                    draggedId === deal.id && "scale-[0.98] opacity-60",
                    movingId === deal.id && "pointer-events-none opacity-50",
                    movingId !== deal.id && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-foreground">{deal.title}</h4>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">{formatValue(deal)}</p>
                    </div>
                    <StatusPill label={priorityLabels[deal.priority]} tone={priorityTone(deal.priority)} />
                  </div>
                  {deal.nextStep ? (
                    <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">{deal.nextStep}</p>
                  ) : null}
                  {deal.dealThinking ? (
                    <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground/70">{deal.dealThinking}</p>
                  ) : null}
                  <div className="mt-4 flex justify-end gap-2">
                    <Link
                      href={`/deals/${deal.id}`}
                      draggable={false}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[10px] font-bold text-foreground hover:bg-muted/50 dark:border-white/10 dark:text-muted-foreground/30"
                    >
                      {t("actions.open")}
                    </Link>
                    <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => onEdit(deal)}>
                      {common("edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-lg px-2 text-red-600"
                      onClick={() => onDelete(deal)}
                      aria-label={t("actions.deleteDeal")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

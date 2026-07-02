"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/crud-ui";
import { PipelineStageIndicator } from "@qentrah/our-platform-components";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useScreenDetection } from "@qentrah/ui/qentrah-table";
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
  highlightId,
}: {
  deals: Deal[];
  labels: Record<DealStage, string>;
  priorityLabels: Record<DealPriority, string>;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onMoveStage: (deal: Deal, stage: DealStage) => void;
  movingId: string | null;
  /**
   * When set, the matching card is scrolled into view (with a brief
   * ring highlight) — used after e.g. a stage change from outside the
   * board. Driven by `useScreenDetection` from the kanban container.
   */
  highlightId?: string | null;
}) {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const screen = useScreenDetection({
    rootRef: boardRef,
    selector: "[data-screen-id]",
    rootMargin: "-16px",
  });

  // When `highlightId` changes, scroll the matching card into view
  // and pulse a brief ring so the user notices the move.
  useEffect(() => {
    if (!highlightId) return
    const el = boardRef.current?.querySelector<HTMLElement>(
      `[data-screen-id="${highlightId}"]`,
    )
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    el.dataset.flashUntil = String(Date.now() + 1400)
    const t = window.setTimeout(() => {
      delete el.dataset.flashUntil
    }, 1500)
    return () => window.clearTimeout(t)
  }, [highlightId])

  return (
    <div
      ref={boardRef}
      data-screen-root
      className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2"
    >
      {DEAL_STAGES.map((stage) => {
        const rows = deals.filter((deal) => deal.stage === stage);
        const isDragOver = dragOverStage === stage;

        return (
          <section
            key={stage}
            className={cn(
              "flex min-h-[420px] w-[min(100%,280px)] shrink-0 flex-col rounded-xl border p-3 transition-all duration-300",
              isDragOver
                ? "border-foreground/40 bg-secondary"
                : "border-border bg-card",
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
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{labels[stage]}</h3>
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground/40">{String(rows.length).padStart(2, "0")}</span>
            </div>
            <div className="mb-3 px-2">
              <PipelineStageIndicator
                stages={DEAL_STAGES.map((s) => ({ key: s, name: labels[s] }))}
                currentStageKey={stage}
                variant="strip"
              />
            </div>
            <div className="flex-1 space-y-3">
              {rows.map((deal) => {
                const visible = screen.isVisible(deal.id)
                return (
                  <article
                    key={deal.id}
                    data-screen-id={deal.id}
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
                      "rounded-[10px] border border-border bg-card p-3 transition-all duration-200",
                      "data-[flash-until]:ring-2 data-[flash-until]:ring-foreground/40",
                      draggedId === deal.id && "scale-[0.98] opacity-60",
                      movingId === deal.id && "pointer-events-none opacity-50",
                      movingId !== deal.id && "cursor-grab active:cursor-grabbing",
                      !visible && "ring-1 ring-foreground/10",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-foreground">{deal.title}</h4>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">{formatValue(deal)}</p>
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
                        className="inline-flex h-8 items-center rounded-md border border-border px-3 text-[10px] font-bold text-foreground hover:bg-secondary"
                      >
                        {t("actions.open")}
                      </Link>
                      <Button type="button" variant="outline" className="h-8 rounded-md px-3 text-[10px] font-bold" onClick={() => onEdit(deal)}>
                        {common("edit")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-md px-2 text-red-600"
                        onClick={() => onDelete(deal)}
                        aria-label={t("actions.deleteDeal")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@qentrah/platform-core";
import { CardDefault } from "./card-default";
import { ColumnHeader } from "./column-header";
import { InlineNewCard, type InlineNewCardData } from "./inline-new-card";
import { useSortableBoard } from "./use-sortable-board";
import type { CardItem, StageDefinition, CardAction, CardSlotConfig } from "./types";

export interface PipelineBoardProps {
  items: CardItem[];
  stages: StageDefinition[];
  columnWidth?: number;
  showBarColor?: boolean;
  showCount?: boolean;
  actions?: CardAction[];
  cardSlots?: CardSlotConfig[];
  cardClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  renderColumnHeader?: (stage: StageDefinition, count: number) => ReactNode;
  renderCard?: (item: CardItem, stage: StageDefinition) => ReactNode;
  renderColumnFooter?: (stage: StageDefinition) => ReactNode;
  draggable?: boolean;
  allowInlineCreate?: boolean;
  inlineCreatePrimaryPlaceholder?: string;
  inlineCreateSecondaryPlaceholder?: string;
  inlineCreatePrimaryLabel?: string;
  onCardMove?: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onInlineCreate?: (stageKey: string, data: InlineNewCardData) => void;
  onStageRename?: (stageKey: string, newName: string) => void;
  onStageDelete?: (stageKey: string) => void;
  onCardClick?: (item: CardItem) => void;
  onCardDelete?: (item: CardItem) => void;
  onAddStage?: () => void;
  renderEmpty?: (stage: StageDefinition) => ReactNode;
}

export function PipelineBoard({
  items,
  stages,
  columnWidth = 280,
  showBarColor = true,
  showCount = true,
  actions,
  cardSlots,
  cardClassName,
  renderColumnHeader,
  renderCard,
  renderColumnFooter,
  draggable = true,
  allowInlineCreate = false,
  inlineCreatePrimaryPlaceholder = "Title",
  inlineCreateSecondaryPlaceholder,
  inlineCreatePrimaryLabel = "Save",
  onCardMove,
  onInlineCreate,
  onStageRename,
  onStageDelete,
  onCardClick,
  onCardDelete,
  onAddStage,
  renderEmpty,
}: PipelineBoardProps) {
  const [inlineNewStage, setInlineNewStage] = useState<string | null>(null);

  const { getColumnRef } = useSortableBoard({ stages, draggable, onCardMove });

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-4">
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <div className="inline-flex gap-4 h-full pb-2 min-w-full">
          {stages.map((stage) => {
            const stageItems = items.filter((i) => i.stageKey === stage.key);
            const showNewBadge =
              stage.isNew === true &&
              stage.createdAt !== undefined &&
              (Date.now() - stage.createdAt < 30_000 || stageItems.length === 0);

            return (
              <div
                key={stage.key}
                className={cn(
                  "shrink-0 flex flex-col rounded-xl bg-muted/20 border border-border/30 overflow-hidden h-full",
                  showNewBadge && "ring-2 ring-emerald-500/40 shadow-md shadow-emerald-500/10"
                )}
                style={{ width: columnWidth }}
              >
                {renderColumnHeader ? (
                  renderColumnHeader(stage, stageItems.length)
                ) : (
                  <ColumnHeader
                    stage={stage}
                    count={stageItems.length}
                    showBarColor={showBarColor}
                    showCount={showCount}
                    showNewBadge={showNewBadge}
                    allowInlineCreate={allowInlineCreate}
                    onStageRename={(key, name) => onStageRename?.(key, name)}
                    onAddStage={onAddStage}
                    onStageDelete={onStageDelete}
                    onAddClick={() => setInlineNewStage(stage.key)}
                  />
                )}

                <div
                  ref={getColumnRef(stage.key)}
                  data-stage-key={stage.key}
                  className="flex-1 flex flex-col gap-2.5 px-2 pb-2 overflow-y-auto min-h-0"
                >
                  {stageItems.length === 0 && renderEmpty ? (
                    renderEmpty(stage)
                  ) : (
                    stageItems.map((item) => (
                      <div key={item.id} data-card-id={item.id} className="shrink-0">
                        {renderCard ? (
                          renderCard(item, stage)
                        ) : (
                          <CardDefault
                            item={item}
                            stage={stage}
                            actions={actions}
                            cardSlots={cardSlots}
                            cardClassName={cardClassName}
                            onClick={onCardClick}
                            onDelete={onCardDelete}
                          />
                        )}
                      </div>
                    ))
                  )}

                  {allowInlineCreate && inlineNewStage === stage.key && (
                    <div className="shrink-0">
                      <InlineNewCard
                        stageColor={stage.color}
                        primaryPlaceholder={inlineCreatePrimaryPlaceholder}
                        secondaryPlaceholder={inlineCreateSecondaryPlaceholder}
                        primaryLabel={inlineCreatePrimaryLabel}
                        onSave={(data) => { onInlineCreate?.(stage.key, data); setInlineNewStage(null); }}
                        onCancel={() => setInlineNewStage(null)}
                      />
                    </div>
                  )}

                  {renderColumnFooter && <div className="shrink-0">{renderColumnFooter(stage)}</div>}
                </div>
              </div>
            );
          })}

          {onAddStage && (
            <div className="shrink-0 flex flex-col" style={{ width: columnWidth }}>
              <div className="flex items-center px-1 pt-3">
                <button
                  onClick={onAddStage}
                  className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="flex items-center justify-center w-[18px] h-[18px] rounded-[5px] bg-muted group-hover:bg-muted-foreground/20 transition-colors">
                    <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                  Add group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

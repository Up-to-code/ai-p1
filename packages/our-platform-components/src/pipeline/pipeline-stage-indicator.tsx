"use client";

import { ChevronRight, Check } from "lucide-react";
import { cn } from "@qentrah/platform-core";

export type PipelineStageIndicatorVariant = "dots" | "strip" | "breadcrumb";

export interface PipelineStageIndicatorProps {
  stages: Array<{ key: string; name: string; color?: string }>;
  currentStageKey: string;
  variant?: PipelineStageIndicatorVariant;
  className?: string;
  onStageClick?: (stageKey: string) => void;
  ariaLabel?: string;
}

interface StageStatus {
  past: boolean;
  current: boolean;
  future: boolean;
}

function stageStatus(stage: { key: string }, currentStageKey: string, index: number, currentIndex: number): StageStatus {
  if (index < currentIndex) return { past: true, current: false, future: false };
  if (index === currentIndex) return { past: false, current: true, future: false };
  return { past: false, current: false, future: true };
}

export function PipelineStageIndicator({
  stages,
  currentStageKey,
  variant = "dots",
  className,
  onStageClick,
  ariaLabel,
}: PipelineStageIndicatorProps) {
  const currentIndex = Math.max(0, stages.findIndex((s) => s.key === currentStageKey));

  if (variant === "dots") {
    return (
      <div className={cn("inline-flex items-center gap-1", className)} role="list" aria-label={ariaLabel ?? "Pipeline progress"}>
        {stages.map((stage, index) => {
          const status = stageStatus(stage, currentStageKey, index, currentIndex);
          const color = stage.color ?? "#6b7280";
          const dotClass = cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            status.past && "opacity-100",
            status.current && "h-2 w-2 ring-1 ring-offset-1",
            status.future && "opacity-30",
          );
          const dotStyle: React.CSSProperties = status.future
            ? { backgroundColor: color }
            : { backgroundColor: color, ...(status.current ? { "--tw-ring-color": color } as React.CSSProperties : {}) };
          return (
            <button
              key={stage.key}
              type="button"
              role="listitem"
              aria-label={`${stage.name}${status.current ? " (current)" : status.past ? " (completed)" : ""}`}
              aria-current={status.current ? "step" : undefined}
              className={dotClass}
              style={dotStyle}
              onClick={onStageClick ? () => onStageClick(stage.key) : undefined}
              disabled={!onStageClick}
            />
          );
        })}
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className={cn("w-full", className)} role="list" aria-label="Pipeline progress">
        <div className="flex w-full">
          {stages.map((stage, index) => {
            const status = stageStatus(stage, currentStageKey, index, currentIndex);
            const color = stage.color ?? "#6b7280";
            return (
              <button
                key={stage.key}
                type="button"
                role="listitem"
                aria-current={status.current ? "step" : undefined}
                className={cn(
                  "flex-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border-t-2",
                  index === 0 && "rounded-l",
                  index === stages.length - 1 && "rounded-r",
                  status.future && "opacity-40",
                )}
                style={{
                  borderTopColor: status.future ? "#e5e7eb" : color,
                  color: status.future ? "#9ca3af" : color,
                }}
                onClick={onStageClick ? () => onStageClick(stage.key) : undefined}
                disabled={!onStageClick}
              >
                {stage.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // breadcrumb
  return (
    <div className={cn("inline-flex items-center gap-1 text-[11px]", className)} role="list" aria-label="Pipeline progress">
      {stages.map((stage, index) => {
        const status = stageStatus(stage, currentStageKey, index, currentIndex);
        const color = stage.color ?? "#6b7280";
        return (
          <span key={stage.key} className="inline-flex items-center gap-1" role="listitem">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium transition-colors",
                status.current && "font-bold",
                status.future && "opacity-40",
              )}
              style={{ color: status.future ? "#9ca3af" : color }}
              onClick={onStageClick ? () => onStageClick(stage.key) : undefined}
              disabled={!onStageClick}
              aria-current={status.current ? "step" : undefined}
            >
              {status.past ? <Check className="h-3 w-3" /> : null}
              {stage.name}
            </button>
            {index < stages.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            )}
          </span>
        );
      })}
    </div>
  );
}

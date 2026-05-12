"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@anan/platform-core/classnames";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<keyof typeof THEMES, string>;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.theme || item.color);

  if (colorConfig.length === 0) {
    return null;
  }

  const styles = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const declarations = colorConfig
        .map(([key, item]) => {
          const color = item.theme?.[theme as keyof typeof item.theme] ?? item.color;
          return color ? `  --color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");

      return `${prefix} [data-chart="${id}"] {\n${declarations}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

/**
 * WHY:   Admin charts need one shared styling container so pages stop hand-tuning Recharts panel behavior individually.
 * WHAT:  Provides shadcn-style chart config context plus CSS variables for each registered series.
 * HOW:   Injects scoped CSS vars per chart instance and wraps the chart in a stable responsive shell.
 */
export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId().replace(/:/g, "");
  const chartId = `chart-${id ?? uniqueId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex min-h-[220px] min-w-0 w-full max-w-full items-stretch justify-center text-xs [&_.recharts-cartesian-grid_line]:stroke-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] [&_.recharts-cartesian-axis-line]:stroke-transparent [&_.recharts-cartesian-axis-tick_line]:stroke-transparent [&_.recharts-cartesian-axis-tick_text]:fill-[var(--workspace-muted)] [&_.recharts-legend-item-text]:fill-[var(--workspace-bubble-other-foreground)]",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = RechartsPrimitive.Tooltip;
export const ChartLegend = RechartsPrimitive.Legend;

type ChartTooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: unknown;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  hideLabel?: boolean;
  indicator?: "dot" | "line";
};

/**
 * WHY:   Every admin chart tooltip should speak the same visual language as the rest of the rebuilt control plane.
 * WHAT:  Renders a shared tooltip body from the chart config plus Recharts payload data.
 * HOW:   Resolves labels and colors from the surrounding `ChartContainer` config and falls back safely when absent.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  indicator = "dot",
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="grid min-w-[12rem] gap-2 rounded-[20px] border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] px-3 py-2.5 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.3)] backdrop-blur-sm">
      {!hideLabel && label ? (
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
          {String(label)}
        </div>
      ) : null}
      <div className="grid gap-2">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "");
          const itemConfig = config[key];
          const color = item.color ?? itemConfig?.color ?? `var(--color-${key})`;

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--workspace-bubble-other-foreground)]">
                {indicator === "line" ? (
                  <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                )}
                <span>{itemConfig?.label ?? item.name ?? key}</span>
              </div>
              <span className="text-[12px] font-black tabular-nums text-[var(--workspace-bubble-other-foreground)]">
                {typeof item.value === "number" ? item.value.toLocaleString("ar-SA") : String(item.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ChartLegendPayloadItem = {
  color?: string;
  dataKey?: string | number;
  value?: string | number;
};

type ChartLegendContentProps = {
  payload?: ChartLegendPayloadItem[];
  className?: string;
};

/**
 * WHY:   Overview and analytics charts need a compact legend component that stays consistent without page-specific markup.
 * WHAT:  Renders a row-wrapping legend using the chart config metadata.
 * HOW:   Reads payload items from Recharts, then resolves labels and colors from `ChartContainer`.
 */
export function ChartLegendContent({ payload, className }: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3 pt-2", className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value ?? "");
        const itemConfig = config[key];
        const color = item.color ?? itemConfig?.color ?? `var(--color-${key})`;

        return (
          <div key={key} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--workspace-muted)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span>{itemConfig?.label ?? item.value ?? key}</span>
          </div>
        );
      })}
    </div>
  );
}

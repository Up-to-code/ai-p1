"use client";

import React from "react";
import {
  FunnelChart,
  FunnelSeries,
  FunnelArc,
  TooltipArea,
  FunnelAxis,
  FunnelAxisLine,
} from "reaviz";
import { cn } from "@/lib/utils";

export interface FunnelDataPoint {
  key: string;
  data: number;
}

const funnelChartColors = ["#5B14C5", "#6E28D9", "#8B5CF6", "#A78BFA", "#C4B5FD"];

interface IncidentFunnelWidgetProps {
  className?: string;
  conversionLabel?: string;
  data: FunnelDataPoint[];
  description?: string;
  loading?: boolean;
  metrics?: Array<{
    label: string;
    value: string | number;
  }>;
  title?: string;
}

function IncidentFunnelWidget({
  className,
  conversionLabel,
  data,
  description,
  loading = false,
  metrics = [],
  title = "Incident Report",
}: IncidentFunnelWidgetProps): React.ReactElement {
  const chartData = data.map((item) => ({
    ...item,
    data: typeof item.data === "number" && !Number.isNaN(item.data) ? item.data : 0,
  }));
  const hasData = chartData.some((item) => item.data > 0);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[24px] border border-zinc-100 bg-white p-4 text-start transition-colors duration-300 dark:border-white/5 dark:bg-[#0A0A0A]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-900 opacity-50 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {conversionLabel && (
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
            {conversionLabel}
          </span>
        )}
      </div>

      <div className="mt-4 flex h-[176px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-3 dark:border-white/[0.04] dark:bg-white/[0.025]">
        {loading ? (
          <div className="h-28 w-full max-w-[220px] animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-white/10" />
        ) : hasData ? (
          <div className="mx-auto flex w-full max-w-[260px] items-center justify-center">
          <FunnelChart
            id="incident-funnel-chart"
            height={156}
            width={248}
            data={chartData}
            series={
              <FunnelSeries
                arc={
                  <FunnelArc
                    colorScheme={funnelChartColors}
                    gradient={null}
                    tooltip={<TooltipArea />}
                    glow={{
                      blur: 15,
                      color: "rgba(91, 20, 197, 0.5)",
                    }}
                  />
                }
                axis={
                  <FunnelAxis
                    label={null}
                    line={
                      <FunnelAxisLine
                        strokeColor="#4A5568"
                      />
                    }
                  />
                }
              />
            }
          />
          </div>
        ) : (
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No data</p>
        )}
      </div>

      {metrics.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <FunnelMetric key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      )}
    </section>
  );
}

function FunnelMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-white/[0.025]">
      <p className="text-sm font-black tracking-tighter text-zinc-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
    </div>
  );
}

export default IncidentFunnelWidget;

"use client";

import { Cell, Pie, PieChart } from "recharts";
import { cn } from "@anan/platform-core/classnames";
import { formatChartNumber, type ChartBreakdownDatum } from "./chartTypes";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart";
import ResponsiveChartFrame from "./ResponsiveChartFrame";

type DonutBreakdownChartProps = {
  data: ChartBreakdownDatum[];
  className?: string;
  height?: number;
};

/**
 * WHY:   Distribution views such as model share and burn share need a compact chart that is not another line plot.
 * WHAT:  Renders a donut chart with an inline legend.
 * HOW:   Uses Recharts pie primitives with Arabic numeric formatting and a shared tooltip style.
 */
export default function DonutBreakdownChart({
  data,
  className,
  height = 280,
}: DonutBreakdownChartProps) {
  const config = data.reduce<Record<string, { label: string; color: string }>>((accumulator, item) => {
    accumulator[item.label] = { label: item.label, color: item.color };
    return accumulator;
  }, {});

  return (
    <div className={cn("grid min-w-0 max-w-full items-start gap-4 lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,1fr)]", className)}>
      <div dir="ltr">
        <ResponsiveChartFrame height={height}>
          {({ width, height: chartHeight }) => (
            <ChartContainer config={config} className="h-full">
              <PieChart width={width} height={chartHeight}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {data.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
          )}
        </ResponsiveChartFrame>
      </div>
      <div className="grid max-h-[320px] min-w-0 content-start gap-3 overflow-y-auto overscroll-contain pr-1">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/5 px-4 py-3 transition-colors hover:bg-muted/10">
            <div className="flex items-center gap-3 text-[13px] font-bold text-foreground">
              <span className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
            <span className="text-sm font-black tabular-nums tracking-tight text-foreground">{formatChartNumber(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

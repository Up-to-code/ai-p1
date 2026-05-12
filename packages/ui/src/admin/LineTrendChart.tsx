"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@anan/platform-core/classnames";
import { type ChartDatum, type ChartSeries, buildChartConfig } from "./chartTypes";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./chart";
import ResponsiveChartFrame from "./ResponsiveChartFrame";

type LineTrendChartProps = {
  data: ChartDatum[];
  series: ChartSeries[];
  className?: string;
  height?: number;
};

/**
 * WHY:   Admin analytics need one reusable line-chart primitive instead of many page-specific chart implementations.
 * WHAT:  Renders a multi-series line chart with a shared visual treatment and tooltip styling.
 * HOW:   Accepts normalized day-based rows and maps each series config to a Recharts `Line`.
 */
export default function LineTrendChart({
  data,
  series,
  className,
  height = 260,
}: LineTrendChartProps) {
  const config = buildChartConfig(series);

  return (
    <div className={cn("min-w-0 max-w-full w-full", className)} dir="ltr">
      <ResponsiveChartFrame height={height}>
        {({ width, height: chartHeight }) => (
          <ChartContainer config={config} className="h-full">
            <LineChart width={width} height={chartHeight} data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} width={40} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              {series.map((item) => (
                <Line
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  name={item.label}
                  stroke={`var(--color-${item.dataKey})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </ResponsiveChartFrame>
    </div>
  );
}

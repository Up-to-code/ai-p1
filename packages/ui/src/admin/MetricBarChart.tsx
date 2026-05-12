"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@anan/platform-core/classnames";
import { type ChartDatum, type ChartSeries, buildChartConfig } from "./chartTypes";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./chart";
import ResponsiveChartFrame from "./ResponsiveChartFrame";

type MetricBarChartProps = {
  data: ChartDatum[];
  series: ChartSeries[];
  className?: string;
  height?: number;
  horizontal?: boolean;
};

/**
 * WHY:   Queue, funnel, and category comparisons repeat across the rebuilt admin surface.
 * WHAT:  Renders a reusable bar chart in either horizontal or vertical orientation.
 * HOW:   Maps normalized `label` rows and one or more metric series into a shared Recharts bar chart.
 */
export default function MetricBarChart({
  data,
  series,
  className,
  height = 280,
  horizontal = false,
}: MetricBarChartProps) {
  const config = buildChartConfig(series);

  return (
    <div className={cn("min-w-0 max-w-full w-full", className)} dir="ltr">
      <ResponsiveChartFrame height={height}>
        {({ width, height: chartHeight }) => (
          <ChartContainer config={config} className="h-full">
            <BarChart
              width={width}
              height={chartHeight}
              data={data}
              layout={horizontal ? "vertical" : "horizontal"}
              margin={horizontal ? { top: 0, right: 12, left: 30, bottom: 0 } : { top: 8, right: 12, left: 0, bottom: 8 }}
              barGap={8}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              {horizontal ? (
                <>
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} />
                  <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} width={112} />
                </>
              ) : (
                <>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} width={40} />
                </>
              )}
              <ChartTooltip content={<ChartTooltipContent />} />
              {!horizontal || series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
              {series.map((item) => (
                <Bar
                  key={item.dataKey}
                  dataKey={item.dataKey}
                  name={item.label}
                  fill={`var(--color-${item.dataKey})`}
                  radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                  maxBarSize={horizontal ? 24 : 36}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </ResponsiveChartFrame>
    </div>
  );
}

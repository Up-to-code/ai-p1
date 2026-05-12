"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@anan/platform-core/classnames";
import { type ChartDatum, type ChartSeries, formatChartNumber } from "./chartTypes";
import ResponsiveChartFrame from "./ResponsiveChartFrame";

type AreaTrendChartProps = {
  data: ChartDatum[];
  series: ChartSeries[];
  className?: string;
  height?: number;
};

/**
 * WHY:   Some admin trends read better as filled volume rather than only line strokes.
 * WHAT:  Renders a reusable multi-series area chart with the same admin tooltip and axis treatment.
 * HOW:   Keeps the plotting direction left-to-right while formatting values in Arabic numerals.
 */
export default function AreaTrendChart({
  data,
  series,
  className,
  height = 280,
}: AreaTrendChartProps) {
  return (
    <div className={cn("w-full", className)} dir="ltr">
      <ResponsiveChartFrame height={height}>
        {({ width, height: chartHeight }) => (
          <AreaChart width={width} height={chartHeight} data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: "bold" }} width={40} />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => [formatChartNumber(value as number | string), String(name ?? "")]}
            />
            {series.map((item) => (
              <Area
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label}
                stroke={item.color}
                fill={item.color}
                fillOpacity={0.16}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveChartFrame>
    </div>
  );
}

import type { ChartConfig } from "./chart";

export type ChartDatum = Record<string, number | string>;

export type ChartSeries = {
  dataKey: string;
  label: string;
  color: string;
};

export type ChartBreakdownDatum = {
  label: string;
  value: number;
  color: string;
};

export function buildChartConfig(series: ChartSeries[]): ChartConfig {
  return series.reduce<ChartConfig>((accumulator, item) => {
    accumulator[item.dataKey] = {
      label: item.label,
      color: item.color,
    };
    return accumulator;
  }, {});
}

export function formatChartNumber(value: number | string) {
  const numericValue = Number(value ?? 0);
  return new Intl.NumberFormat("ar-SA").format(numericValue);
}

"use client";

import type { Project, ProjectStatus } from "../store/projects.types";
import type { ProjectFormValues } from "../validation/project.schema";

export const projectFilters = ["all", "approved", "pending", "draft", "rejected"] as const;
export const projectViews = ["grid", "list"] as const;
export const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
export const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

export function toggleProjectAssetType(
  assetTypes: string[] | undefined,
  value: string,
) {
  const current = assetTypes ?? [];
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export function matchesProjectSearch(project: Pick<Project, "name" | "reference">, search: string) {
  const query = search.trim().toLowerCase();
  return !query || [project.name, project.reference].some((value) => value?.toLowerCase().includes(query));
}

export function projectFormDefaults(project?: Project | null): ProjectFormValues {
  return {
    name: project?.name ?? "",
    status: project?.status ?? "planned",
    health: project?.health ?? "onTrack",
    visibility: project?.visibility ?? "team",
    useAiSetup: false,
    description: project?.description ?? "",
  };
}

export function parseIsoDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function projectDateDisplayLabel(value: string | undefined, placeholder: string) {
  const selectedDate = parseIsoDate(value);
  return selectedDate
    ? selectedDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : placeholder;
}

export function nextProjectCalendarMonth(current: Date, offset: number) {
  return new Date(current.getFullYear(), current.getMonth() + offset, 1);
}

export function projectWeekdayLabels(formatter = weekdayFormatter) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2026, 0, 4 + index);
    return { key: date.toISOString(), label: formatter.format(date) };
  });
}


export function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calendarDaysForMonth(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstDay = start.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let index = 0; index < firstDay; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function statusTone(status: ProjectStatus) {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  if (status === "archived") return "danger";
  return "neutral";
}

export function projectDocumentAssets<TAsset extends { kind: string }>(media: TAsset[]) {
  return media.filter((asset) => asset.kind === "document");
}

export function projectLocationLabel(project: { reference?: string }) {
  return project.reference ?? "";
}

export function projectInventoryMetrics<TAsset extends { status?: string }>(assets: TAsset[], plannedAssets = 0) {
  const countByStatus = (status: string) =>
    assets.filter((asset) => String(asset.status).toLowerCase() === status).length;

  return {
    plannedAssets,
    liveAssetCount: assets.length,
    inventoryCoverage: plannedAssets > 0 ? Math.min(100, Math.round((assets.length / plannedAssets) * 100)) : 0,
    availableAssets: countByStatus("available"),
    reservedAssets: countByStatus("reserved"),
    soldAssets: countByStatus("sold"),
    pendingAssets: countByStatus("pending"),
  };
}

export function projectMovementWidth(value: number, total: number) {
  const boundedTotal = Math.max(total, 1);
  return `${Math.max(value > 0 ? 8 : 0, Math.round((value / boundedTotal) * 100))}%`;
}

export function compactProjectDetailRows<TLabel, TValue>(
  rows: Array<[TLabel, TValue | null | undefined | ""]>,
) {
  return rows.filter((row): row is [TLabel, TValue] => Boolean(row[1]));
}

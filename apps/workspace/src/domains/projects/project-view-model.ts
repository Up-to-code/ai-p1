"use client";

import type { Project, ProjectStatus } from "./store/projects.types";
import { projectCategories, projectOfferingTypes } from "./validation/project.schema";
import type { ProjectFormValues } from "./validation/project.schema";

export const projectFilters = ["all", "approved", "pending", "draft", "rejected"] as const;
export const projectViews = ["grid", "list"] as const;
export const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
export const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function projectPriceId() {
  return `price-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function toProjectPriceRows(project?: Project | null): ProjectFormValues["projectPrices"] {
  if (project?.projectPrices?.length) {
    return project.projectPrices.map((item) => ({ id: item.id, label: item.label, price: item.price }));
  }
  return [{ id: projectPriceId(), label: "", price: "" }];
}

export function toggleProjectUnitType(
  unitTypes: ProjectFormValues["unitTypes"] | undefined,
  value: ProjectFormValues["unitTypes"][number],
) {
  const current = unitTypes ?? [];
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export function updateProjectPriceRow(
  rows: ProjectFormValues["projectPrices"] | undefined,
  rowId: string,
  key: "label" | "price",
  value: string,
) {
  return (rows ?? []).map((item) => item.id === rowId ? { ...item, [key]: value } : item);
}

export function addProjectPriceRow(
  rows: ProjectFormValues["projectPrices"] | undefined,
  createId = projectPriceId,
) {
  return [...(rows ?? []), { id: createId(), label: "", price: "" }];
}

export function removeProjectPriceRow(
  rows: ProjectFormValues["projectPrices"] | undefined,
  rowId: string,
  createId = projectPriceId,
) {
  const next = (rows ?? []).filter((item) => item.id !== rowId);
  return next.length ? next : [{ id: createId(), label: "", price: "" }];
}

export function matchesProjectSearch(project: Pick<Project, "name" | "reference" | "city" | "developer">, search: string) {
  const query = search.trim().toLowerCase();
  return !query || [project.name, project.reference, project.city, project.developer].some((value) => value.toLowerCase().includes(query));
}

function projectFormType(project?: Project | null): ProjectFormValues["type"] {
  return projectCategories.includes(project?.type as ProjectFormValues["type"])
    ? project?.type as ProjectFormValues["type"]
    : "Residential";
}

function projectFormUnitTypes(project?: Project | null): ProjectFormValues["unitTypes"] {
  return (project?.unitTypes ?? []).filter((type): type is ProjectFormValues["unitTypes"][number] =>
    projectOfferingTypes.includes(type as ProjectFormValues["unitTypes"][number]),
  );
}

export function projectFormDefaults(project?: Project | null): ProjectFormValues {
  return {
    name: project?.name ?? "",
    developer: project?.developer ?? "",
    city: project?.city ?? "",
    area: project?.area ?? "",
    type: projectFormType(project),
    unitTypes: projectFormUnitTypes(project),
    status: project?.status ?? "draft" as ProjectStatus,
    visibility: project?.visibility ?? "private",
    units: String(project?.units ?? 0),
    averagePrice: project?.averagePrice ?? project?.priceRange ?? "",
    projectPrices: toProjectPriceRows(project),
    priceRange: project?.priceRange ?? "",
    regaAuthorizationNo: project?.regaAuthorizationNo ?? "",
    regaExpiresAt: project?.regaExpiresAt ?? "",
    planNumber: project?.planNumber ?? "",
    plotNumber: project?.plotNumber ?? "",
    postalIdentity: project?.postalIdentity ?? "",
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
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "danger";
  return "neutral";
}

export function projectDocumentAssets<TAsset extends { kind: string }>(media: TAsset[]) {
  return media.filter((asset) => asset.kind === "document");
}

export function projectLocationLabel(project: Pick<Project, "city" | "area">) {
  return [project.city, project.area].filter(Boolean).join(" · ");
}

export function projectInventoryMetrics<TUnit extends { status?: string }>(units: TUnit[], plannedUnits = 0) {
  const countByStatus = (status: string) =>
    units.filter((unit) => String(unit.status).toLowerCase() === status).length;

  return {
    plannedUnits,
    liveUnitCount: units.length,
    inventoryCoverage: plannedUnits > 0 ? Math.min(100, Math.round((units.length / plannedUnits) * 100)) : 0,
    availableUnits: countByStatus("available"),
    reservedUnits: countByStatus("reserved"),
    soldUnits: countByStatus("sold"),
    pendingUnits: countByStatus("pending"),
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

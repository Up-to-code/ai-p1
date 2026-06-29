import type { Client } from "../store/clients.types";
import type {
  ClientTableFilterStage,
  ClientTableFilterStatus,
  ClientTableFilterType,
  ClientTableSortDir,
  ClientTableSortField,
} from "../config/client-table.config";

export function clientTableInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function clientStatusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
    case "new":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400";
    case "nurture":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
    case "inactive":
      return "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50";
    case "archived":
      return "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/40";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function clientStageBadgeClass(stage: string): string {
  switch (stage) {
    case "blank":
      return "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50";
    case "new_lead":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
    case "attempted":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";
    case "contacted":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400";
    case "qualified":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
    case "unqualified":
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function clientTypeBadgeClass(type: string): string {
  switch (type) {
    case "organization":
      return "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400";
    case "person":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function filterClientTableRows(
  clients: Client[],
  search: string,
  filters: {
    type: ClientTableFilterType;
    status: ClientTableFilterStatus;
    pipelineStage: ClientTableFilterStage;
  },
): Client[] {
  const query = search.toLowerCase();
  return clients.filter((client) => {
    const matchesSearch =
      !query ||
      client.name.toLowerCase().includes(query) ||
      client.contact.toLowerCase().includes(query) ||
      (client.company && client.company.toLowerCase().includes(query));
    const matchesType = !filters.type || client.type === filters.type;
    const matchesStatus = !filters.status || client.status === filters.status;
    const matchesStage =
      !filters.pipelineStage || client.pipelineStage === filters.pipelineStage;
    return matchesSearch && matchesType && matchesStatus && matchesStage;
  });
}

export function sortClientTableRows(
  clients: Client[],
  sortField: ClientTableSortField,
  sortDir: ClientTableSortDir,
): Client[] {
  const sorted = [...clients];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "type":
        cmp = a.type.localeCompare(b.type);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "pipelineStage":
        cmp = (a.pipelineStage ?? "").localeCompare(b.pipelineStage ?? "");
        break;
      case "lastContact":
        cmp = (a.lastContact ?? "").localeCompare(b.lastContact ?? "");
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export function paginateClientTableRows<T>(
  rows: T[],
  page: number,
  pageSize: number,
): { page: number; totalPages: number; rows: T[] } {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    rows: rows.slice(start, start + pageSize),
  };
}

export function clientTablePageNumbers(
  totalPages: number,
  currentPage: number,
): Array<number | "..."> {
  const pages: Array<number | "..."> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (currentPage > 3) pages.push("...");
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

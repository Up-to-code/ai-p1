"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import {
  useUpdateClientOptimisticMutation,
  useDeleteClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  CheckCircle2,
  Building2,
  ChevronLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { BulkActionModal } from "./bulk-action-modal";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type SortField = "name" | "type" | "status" | "pipelineStage" | "lastContact";
type SortDir = "asc" | "desc";

type FilterType = "" | "person" | "organization";
type FilterStatus = "" | "new" | "active" | "nurture" | "inactive" | "archived";
type FilterStage = "" | "blank" | "new_lead" | "attempted" | "contacted" | "qualified" | "unqualified";

interface ClientTableViewProps {
  clients: Client[];
  isLoading?: boolean;
  onDelete?: (client: Client) => void;
  onMarkClosed?: (client: Client) => void;
  onBulkUpdate?: (clientIds: string[], field: string, value: string) => void;
  isClosing?: boolean;
  onCreateClient?: () => void;
  view?: "pipeline" | "table";
  onViewChange?: (view: "pipeline" | "table") => void;
  filter?: "all" | "person" | "organization";
  onFilterChange?: (filter: "all" | "person" | "organization") => void;
  stageFilter?: "all" | "active" | "unqualified";
  onStageFilterChange?: (stageFilter: "all" | "active" | "unqualified") => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  clientCount?: number;
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 15;

const stageOptions = [
  { value: "blank", label: "Blank" },
  { value: "new_lead", label: "New Lead" },
  { value: "attempted", label: "Attempted" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "unqualified", label: "Unqualified" },
] as const;

const typeOptions = [
  { value: "person", label: "Person" },
  { value: "organization", label: "Organization" },
] as const;

const statusOptions = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "nurture", label: "Nurture" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
] as const;

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function statusBadgeClass(status: string): string {
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

function stageBadgeClass(stage: string): string {
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

function typeBadgeClass(type: string): string {
  switch (type) {
    case "organization":
      return "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400";
    case "person":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/* ── Skeleton Rows ─────────────────────────────────────────────────────────── */

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skel-${i}`} className="border-t border-border">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </td>
          <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
          <td className="px-4 py-3"><Skeleton className="h-5 w-5 rounded" /></td>
        </tr>
      ))}
    </>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export function ClientTableView({
  clients,
  isLoading = false,
  onDelete,
  onMarkClosed,
  onBulkUpdate,
  isClosing,
  onCreateClient,
  view = "table",
  onViewChange,
  filter = "all",
  onFilterChange,
  stageFilter = "all",
  onStageFilterChange,
  search = "",
  onSearchChange,
  clientCount = 0,
}: ClientTableViewProps) {
  const t = useTranslations("Clients");
  const account = useAccountContext();

  /* ── State ─────────────────────────────────────────────────────────────── */
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    type: FilterType;
    status: FilterStatus;
    pipelineStage: FilterStage;
  }>({ type: "", status: "", pipelineStage: "" });

  const updateClientMutation = useUpdateClientOptimisticMutation(["clients-index"]);
  const deleteClientMutation = useDeleteClientOptimisticMutation(["clients-index"]);

  /* ── Filtering & Sorting ───────────────────────────────────────────────── */
  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q));
      const matchesType = !filters.type || c.type === filters.type;
      const matchesStatus = !filters.status || c.status === filters.status;
      const matchesStage =
        !filters.pipelineStage || c.pipelineStage === filters.pipelineStage;
      return matchesSearch && matchesType && matchesStatus && matchesStage;
    });
  }, [clients, search, filters]);

  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients];
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
          cmp = a.pipelineStage.localeCompare(b.pipelineStage);
          break;
        case "lastContact":
          cmp = (a.lastContact ?? "").localeCompare(b.lastContact ?? "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredClients, sortField, sortDir]);

  /* ── Pagination ────────────────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(sortedClients.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedClients = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedClients.slice(start, start + PAGE_SIZE);
  }, [sortedClients, safePage]);

  /* ── Selection ─────────────────────────────────────────────────────────── */
  const allVisibleSelected =
    paginatedClients.length > 0 &&
    paginatedClients.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedClients.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedClients.forEach((c) => next.add(c.id));
        return next;
      });
    }
  }, [allVisibleSelected, paginatedClients]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  /* ── Badges ────────────────────────────────────────────────────────────── */
  const activeBadges = useMemo(() => {
    const badges: { label: string; key: string; clear: () => void }[] = [];
    if (search) {
      badges.push({
        label: `Search: "${search}"`,
        key: "search",
        clear: () => { onSearchChange?.(""); setPage(1); },
      });
    }
    if (filters.type) {
      badges.push({
        label: `Type: ${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}`,
        key: "type",
        clear: () => { setFilters((f) => ({ ...f, type: "" })); setPage(1); },
      });
    }
    if (filters.status) {
      badges.push({
        label: `Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`,
        key: "status",
        clear: () => { setFilters((f) => ({ ...f, status: "" })); setPage(1); },
      });
    }
    if (filters.pipelineStage) {
      badges.push({
        label: `Stage: ${filters.pipelineStage.charAt(0).toUpperCase() + filters.pipelineStage.slice(1)}`,
        key: "stage",
        clear: () => { setFilters((f) => ({ ...f, pipelineStage: "" })); setPage(1); },
      });
    }
    return badges;
  }, [search, filters, onSearchChange]);

  /* ── Handlers ──────────────────────────────────────────────────────────── */
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField],
  );

  const handleInlineUpdate = useCallback(
    (client: Client, field: string, value: string) => {
      if (!account.organization.id) return;
      updateClientMutation.mutate({
        organizationId: account.organization.id,
        client,
        values: {
          name: client.name,
          type: client.type,
          contact: client.contact,
          phone: client.phone,
          age: "",
          nationality: "",
          generation: "",
          budget: client.budget,
          assetInterest: client.assetInterest,
          status: client.status,
          visibility: client.visibility ?? "private",
          pipelineStage: client.pipelineStage,
          pipelineOrder: client.pipelineOrder,
          priority: client.priority,
          nextAction: "",
          issue: "",
          notes: client.notes ?? "",
          tags: client.tags ?? [],
          [field]: value,
        },
      });
    },
    [account.organization.id, updateClientMutation],
  );

  const handleBulkApply = useCallback(
    (action: string, value: string) => {
      if (!onBulkUpdate || selectedIds.size === 0) return;
      onBulkUpdate(Array.from(selectedIds), action, value);
      clearSelection();
    },
    [onBulkUpdate, selectedIds, clearSelection],
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-foreground" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-foreground" />
    );
  };

  /* ── Page numbers ──────────────────────────────────────────────────────── */
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="w-full">
      {/* ── Bulk Action Bar ──────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-[11px] font-bold text-primary">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Layers className="h-3.5 w-3.5" />
            Actions
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="w-10 px-4 py-2.5">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                </th>
                <th className="w-[28%] px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center hover:text-foreground transition-colors"
                  >
                    Name
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="w-[12%] px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("type")}
                    className="inline-flex items-center hover:text-foreground transition-colors"
                  >
                    Type
                    <SortIcon field="type" />
                  </button>
                </th>
                <th className="w-[14%] px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("status")}
                    className="inline-flex items-center hover:text-foreground transition-colors"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="w-[16%] px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("pipelineStage")}
                    className="inline-flex items-center hover:text-foreground transition-colors"
                  >
                    Stage
                    <SortIcon field="pipelineStage" />
                  </button>
                </th>
                <th className="w-[14%] px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("lastContact")}
                    className="inline-flex items-center hover:text-foreground transition-colors"
                  >
                    Last Contact
                    <SortIcon field="lastContact" />
                  </button>
                </th>
                <th className="w-[10%] px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={5} />
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    {t("empty.title")}
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const isSelected = selectedIds.has(client.id);
                  return (
                    <tr
                      key={client.id}
                      onMouseEnter={() => setHoveredRow(client.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={cn(
                        "border-t border-border transition-colors",
                        isSelected ? "bg-primary/5" : "hover:bg-muted/30",
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(client.id)}
                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                        </div>
                      </td>

                      {/* Name + Avatar */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center">
                          {/* Avatar chip on hover */}
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-150",
                              hoveredRow === client.id || isSelected
                                ? "bg-foreground text-background scale-110"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {client.type === "organization" ? (
                              <Building2 className="h-3.5 w-3.5" />
                            ) : (
                              getInitials(client.name)
                            )}
                          </div>
                          <Link
                            href={`/clients/${client.id}`}
                            className="ml-3 min-w-0 truncate font-medium text-foreground hover:underline"
                          >
                            {client.name}
                          </Link>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-2.5">
                        <Popover>
                          <PopoverTrigger
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all hover:opacity-80 cursor-pointer outline-none",
                              typeBadgeClass(client.type),
                            )}
                          >
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              client.type === "person" ? "bg-sky-500" : "bg-violet-500",
                            )} />
                            {client.type === "person" ? "Person" : "Organization"}
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-48 p-1.5">
                            <p className="px-2 pb-1.5 pt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Type</p>
                            {typeOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleInlineUpdate(client, "type", option.value)}
                                className={cn(
                                  "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors",
                                  client.type === option.value
                                    ? "bg-foreground text-background"
                                    : "text-foreground hover:bg-muted",
                                )}
                              >
                                <span className={cn(
                                  "h-2 w-2 rounded-full",
                                  option.value === "person" ? "bg-sky-500" : "bg-violet-500",
                                )} />
                                {option.label}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5">
                        <Popover>
                          <PopoverTrigger
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all hover:opacity-80 cursor-pointer outline-none",
                              statusBadgeClass(client.status),
                            )}
                          >
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              client.status === "active" && "bg-emerald-500",
                              client.status === "new" && "bg-sky-500",
                              client.status === "nurture" && "bg-amber-500",
                              client.status === "inactive" && "bg-gray-400",
                              client.status === "archived" && "bg-gray-300",
                            )} />
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-48 p-1.5">
                            <p className="px-2 pb-1.5 pt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleInlineUpdate(client, "status", option.value)}
                                className={cn(
                                  "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors",
                                  client.status === option.value
                                    ? "bg-foreground text-background"
                                    : "text-foreground hover:bg-muted",
                                )}
                              >
                                <span className={cn(
                                  "h-2 w-2 rounded-full",
                                  option.value === "active" && "bg-emerald-500",
                                  option.value === "new" && "bg-sky-500",
                                  option.value === "nurture" && "bg-amber-500",
                                  option.value === "inactive" && "bg-gray-400",
                                  option.value === "archived" && "bg-gray-300",
                                )} />
                                {option.label}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </td>

                      {/* Stage */}
                      <td className="px-4 py-2.5">
                        <Popover>
                          <PopoverTrigger
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all hover:opacity-80 cursor-pointer outline-none",
                              stageBadgeClass(client.pipelineStage),
                            )}
                          >
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              client.pipelineStage === "blank" && "bg-gray-400",
                              client.pipelineStage === "new_lead" && "bg-amber-500",
                              client.pipelineStage === "attempted" && "bg-[#F0997B]",
                              client.pipelineStage === "contacted" && "bg-[#378ADD]",
                              client.pipelineStage === "qualified" && "bg-[#639922]",
                              client.pipelineStage === "unqualified" && "bg-[#E24B4A]",
                            )} />
                            {client.pipelineStage.charAt(0).toUpperCase() + client.pipelineStage.slice(1)}
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-48 p-1.5">
                            <p className="px-2 pb-1.5 pt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Stage</p>
                            {stageOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleInlineUpdate(client, "pipelineStage", option.value)}
                                className={cn(
                                  "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors",
                                  client.pipelineStage === option.value
                                    ? "bg-foreground text-background"
                                    : "text-foreground hover:bg-muted",
                                )}
                              >
                                <span className={cn(
                                  "h-2 w-2 rounded-full",
                                  option.value === "blank" && "bg-gray-400",
                                  option.value === "new_lead" && "bg-amber-500",
                                  option.value === "attempted" && "bg-[#F0997B]",
                                  option.value === "contacted" && "bg-[#378ADD]",
                                  option.value === "qualified" && "bg-[#639922]",
                                  option.value === "unqualified" && "bg-[#E24B4A]",
                                )} />
                                {option.label}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </td>

                      {/* Last Contact */}
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {client.lastContact || "\u2014"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5">
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1 transition-opacity",
                            hoveredRow === client.id ? "opacity-100" : "opacity-0",
                          )}
                        >
                          {client.pipelineStage !== "unqualified" && (
                            <button
                              type="button"
                              onClick={() => onMarkClosed?.(client)}
                              disabled={isClosing}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 disabled:opacity-50"
                              title={t("actions.markClosed")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <Link
                            href={`/clients/${client.id}/edit`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleting(client)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}\u2013
            {Math.min(safePage * PAGE_SIZE, sortedClients.length)} of{" "}
            {sortedClients.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="px-1 text-xs text-muted-foreground"
                >
                  \u2026
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p as number)}
                  className={cn(
                    "inline-flex h-7 min-w-[28px] items-center justify-center rounded-md px-2 text-[11px] font-medium transition-colors",
                    safePage === p
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Bulk Action Modal ────────────────────────────────────────────── */}
      <BulkActionModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        selectedCount={selectedIds.size}
        onApply={handleBulkApply}
      />

      {/* ── Delete Dialog ────────────────────────────────────────────────── */}
      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("delete.title")}
        description={t("delete.desc", { name: deleting?.name ?? "..." })}
        isDeleting={deleteClientMutation.isPending}
        error={
          deleteClientMutation.error instanceof Error
            ? deleteClientMutation.error.message
            : null
        }
        onConfirm={() => {
          if (!deleting || !account.organization.id) return;
          const clientId = deleting.id;
          setDeleting(null);
          deleteClientMutation.mutate({
            organizationId: account.organization.id,
            clientId,
          });
        }}
      />
    </div>
  );
}
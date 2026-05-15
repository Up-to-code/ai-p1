"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, ChevronDown, Filter, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

type Align = "start" | "center" | "end";

export interface AppStatItem {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  dotClassName?: string;
  iconClassName?: string;
}

export interface AppToolbarFilter {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface AppDataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: Align;
}

interface AppPageShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: "default" | "wide" | "full";
}

interface AppPageHeaderProps {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  context?: React.ReactNode;
  className?: string;
}

interface AppStatsGridProps {
  stats: AppStatItem[];
  className?: string;
}

interface AppToolbarProps {
  filters?: AppToolbarFilter[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: React.ReactNode;
  view?: "grid" | "list";
  onViewChange?: (value: "grid" | "list") => void;
  sortLabel?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

interface AppSectionProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: "default" | "muted" | "inverse" | "danger";
}

interface AppDataTableProps<T> {
  columns: AppDataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string;
  emptyMessage?: React.ReactNode;
  className?: string;
  rowClassName?: string | ((row: T) => string);
  onRowClick?: (row: T) => void;
}

interface AppThumbnailCellProps {
  src?: string;
  alt: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
}

interface AppTabsListProps {
  tabs: AppToolbarFilter[];
  className?: string;
}

const maxWidthClassName: Record<NonNullable<AppPageShellProps["maxWidth"]>, string> = {
  default: "max-w-[1400px]",
  wide: "max-w-[1700px]",
  full: "max-w-none",
};

const alignClassName: Record<Align, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const toneClassName: Record<NonNullable<AppSectionProps["tone"]>, string> = {
  default: "border-zinc-100 bg-white dark:border-white/5 dark:bg-[#0A0A0A]",
  muted: "border-zinc-100 bg-zinc-50/50 dark:border-white/5 dark:bg-white/[0.01]",
  inverse: "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900",
  danger: "border-red-100 bg-red-50/30 dark:border-red-900/30 dark:bg-red-950/10",
};

export function AppPageShell({
  children,
  className,
  contentClassName,
  maxWidth = "wide",
}: AppPageShellProps) {
  return (
    <div className={cn("min-h-screen bg-white p-6 dark:bg-[#0A0A0A] md:p-8 lg:p-12", className)}>
      <div className={cn("mx-auto space-y-10 pb-20", maxWidthClassName[maxWidth], contentClassName)}>
        {children}
      </div>
    </div>
  );
}

export function AppPageHeader({
  title,
  eyebrow,
  subtitle,
  actions,
  context,
  className,
}: AppPageHeaderProps) {
  return (
    <header className={cn("relative overflow-hidden flex flex-col gap-8 border-b border-zinc-100 pb-10 text-start dark:border-white/5 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-top-4 duration-1000", className)}>
      <div className="relative z-10 min-w-0 space-y-3">
        {eyebrow && (
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <div className="h-px w-6 bg-zinc-200 dark:bg-white/10" />
            <span className="truncate" dir="auto">{eyebrow}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-950 dark:text-white md:text-3xl line-clamp-2" dir="auto">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-sm font-medium leading-relaxed tracking-tight text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      {(context || actions) && (
        <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-4">
          {context}
          {actions}
        </div>
      )}
      {/* Institutional canvas flair */}
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-zinc-50/50 blur-3xl dark:bg-white/[0.02]" />
    </header>
  );
}

export function AppStatsGrid({ stats, className }: AppStatsGridProps) {
  return (
    <div className={cn("grid grid-cols-2 overflow-hidden rounded-[24px] border border-zinc-100 bg-zinc-100 gap-px dark:border-white/5 dark:bg-white/5 lg:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex h-28 flex-col justify-between bg-white p-5 transition-colors hover:bg-zinc-50/50 dark:bg-[#0A0A0A] dark:hover:bg-white/[0.01]">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-[9px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</span>
              {Icon ? (
                <Icon className={cn("h-3.5 w-3.5 shrink-0 text-zinc-300", stat.iconClassName)} />
              ) : (
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", stat.dotClassName ?? "bg-zinc-400")} />
              )}
            </div>
            <p className="truncate text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function AppToolbar({
  filters,
  activeFilter,
  onFilterChange,
  filterLabel,
  view,
  onViewChange,
  sortLabel,
  trailing,
  className,
}: AppToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-zinc-100 pb-4 dark:border-white/5 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-4">
        {filters && activeFilter && onFilterChange && (
          <AppFilterDropdown
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            label={filterLabel}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-zinc-400">
        {view && onViewChange && (
          <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-0.5 dark:border-white/5 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={cn("rounded-lg p-2 transition-colors", view === "grid" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={cn("rounded-lg p-2 transition-colors", view === "list" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white")}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {sortLabel && (
          <div className="flex items-center gap-3">
            <Filter className="h-3 w-3" />
            <button type="button" className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-[9px] font-black uppercase text-zinc-900 dark:border-white/10 dark:text-white">
              {sortLabel}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>
        )}
        {trailing}
      </div>
    </div>
  );
}

function AppFilterDropdown({
  filters,
  activeFilter,
  onFilterChange,
  label,
}: {
  filters: AppToolbarFilter[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  label?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeOption = useMemo(
    () => filters.find((filter) => filter.value === activeFilter) ?? filters[0],
    [activeFilter, filters],
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-20 min-w-[190px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 text-start text-[10px] font-black uppercase tracking-[0.16em] text-zinc-900 shadow-none transition hover:border-[#0B5CFF]/35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B5CFF]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
      >
        <span className="min-w-0">
          {label ? <span className="block truncate text-[8px] text-zinc-400">{label}</span> : null}
          <span className="block truncate">{activeOption?.label}</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={typeof label === "string" ? label : "Filter"}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="absolute start-0 top-12 w-full min-w-[220px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-950/5 dark:border-white/10 dark:bg-[#101010]"
        >
          {filters.map((filter) => {
            const isActive = filter.value === activeFilter;
            const Icon = filter.icon;
            return (
              <button
                key={filter.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onFilterChange(filter.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-start text-[10px] font-black uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5CFF]/20",
                  isActive
                    ? "bg-[#0B5CFF] text-white"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
                )}
              >
                {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
                <span className="min-w-0 flex-1 truncate">{filter.label}</span>
                {isActive ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AppSection({
  children,
  className,
  contentClassName,
  title,
  description,
  actions,
  tone = "default",
}: AppSectionProps) {
  return (
    <section className={cn("rounded-[24px] border p-6 text-start", toneClassName[tone], className)}>
      {(title || description || actions) && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {title && <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-900 opacity-50 dark:text-white">{title}</h2>}
            {description && <p className="text-xs font-medium uppercase tracking-tight text-zinc-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

export function AppDataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No data available.",
  className,
  rowClassName,
  onRowClick,
}: AppDataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-[20px] border border-zinc-100 bg-white dark:border-white/5 dark:bg-[#0A0A0A]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-start">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-white/5 dark:bg-white/[0.01]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400",
                    alignClassName[column.align ?? "start"],
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-white/[0.02]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "group transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.01]",
                    onRowClick && "cursor-pointer",
                    typeof rowClassName === "function" ? rowClassName(row) : rowClassName
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 text-xs font-black uppercase text-zinc-600 dark:text-zinc-300",
                        alignClassName[column.align ?? "start"],
                        column.className
                      )}
                    >
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AppThumbnailCell({ src, alt, title, meta }: AppThumbnailCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-zinc-100 grayscale transition-colors group-hover:grayscale-0 dark:border-white/5">
        {src ? (
          <Image src={src} alt={alt} fill sizes="32px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-zinc-100 dark:bg-white/10" />
        )}
      </div>
      <div className="min-w-0 text-start">
        <p className="max-w-[220px] truncate text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white">{title}</p>
        {meta && <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">{meta}</div>}
      </div>
    </div>
  );
}

export function AppTabsList({ tabs, className }: AppTabsListProps) {
  return (
    <div className="border-b border-zinc-100 dark:border-white/5">
      <TabsList className={cn("scrollbar-none h-10 w-full justify-start gap-10 overflow-x-auto rounded-none bg-transparent p-0", className)}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative h-10 flex-none rounded-none border-0 bg-transparent px-0 text-[10px] font-black uppercase tracking-[0.35em] shadow-none transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-zinc-900 after:opacity-0 hover:text-zinc-600 data-active:bg-transparent data-active:text-zinc-900 data-active:after:opacity-100 dark:after:bg-white dark:data-active:bg-transparent dark:data-active:text-white dark:hover:text-zinc-300"
            >
              {Icon && <Icon className="me-2 h-3.5 w-3.5" />}
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}

export function AppPrimaryButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("h-10 rounded-xl border-0 bg-zinc-900 px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-none transition-colors hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

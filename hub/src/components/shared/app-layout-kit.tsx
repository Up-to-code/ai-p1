"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Filter, LayoutGrid, List } from "lucide-react";
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
  src: string;
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
    <header className={cn("flex flex-col gap-6 border-b border-zinc-100 pb-5 text-start dark:border-white/5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400">
            <div className="h-0.5 w-6 bg-zinc-200 dark:bg-white/10" />
            <span className="truncate">{eyebrow}</span>
          </div>
        )}
        <h1 className="truncate text-3xl font-black uppercase leading-none tracking-tighter text-zinc-900 dark:text-white md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-sm font-medium leading-6 text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      {(context || actions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {context}
          {actions}
        </div>
      )}
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
  view,
  onViewChange,
  sortLabel,
  trailing,
  className,
}: AppToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-zinc-100 pb-4 dark:border-white/5 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-4">
        {filters && (
          <div className="scrollbar-none flex min-w-0 items-center gap-6 overflow-x-auto">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onFilterChange?.(filter.value)}
                  className={cn(
                    "relative shrink-0 pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  {filter.label}
                  {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-white" />}
                </button>
              );
            })}
          </div>
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
        <Image src={src} alt={alt} fill sizes="32px" className="object-cover" />
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

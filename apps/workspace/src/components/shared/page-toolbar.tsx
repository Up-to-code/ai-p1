"use client";

import { useState, useCallback, type ReactNode, type LabelHTMLAttributes } from "react";
import { Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tab definition ────────────────────────────────────────────────────────────
export interface PageTab<T extends string = string> {
  label: string;
  value: T;
  /** Optional lucide icon element */
  icon?: ReactNode;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
export interface PageToolbarProps<T extends string = string> {
  /** Underline-style view tabs rendered on the left */
  tabs?: PageTab<T>[];
  activeTab?: T;
  onTabChange?: (value: T) => void;
  onTabsReorder?: (tabs: PageTab<T>[]) => void;
  onAddTab?: () => void;
  /** Optional count badge shown after the last tab */
  count?: number;
  /**
   * Extra content injected into the left slot AFTER the tabs.
   * Use this for calendar nav buttons, status filter chips, etc.
   */
  leftExtra?: ReactNode;
  /**
   * Completely override the left slot (no tabs rendered).
   * Use when a page has nothing tab-like on the left.
   */
  leftOverride?: ReactNode;
  /** Right slot — search field, filter menus, primary CTA, etc. */
  right?: ReactNode;
  className?: string;
}

/**
 * PageToolbar
 *
 * A single, consistent sticky top-bar used by every domain screen.
 * ClickUp-style: tabs with a 2 px underline indicator on the left,
 * actions on the right. Zero gap between bar and content below.
 */
export function PageToolbar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  onTabsReorder,
  onAddTab,
  count,
  leftExtra,
  leftOverride,
  right,
  className,
}: PageToolbarProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDrop = useCallback((index: number) => {
    if (draggedIndex === null || draggedIndex === index || !tabs) return;
    const reordered = [...tabs];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    onTabsReorder?.(reordered as PageTab<T>[]);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, tabs, onTabsReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b border-border bg-background sticky top-0 z-10",
        className,
      )}
    >
      {/* ── Left slot ── */}
      <div className="flex items-center gap-0 px-4 min-w-0">
        {leftOverride ?? (
          <>
            {/* Tab pills */}
            {tabs?.map((tab, index) => (
              <button
                key={tab.value}
                type="button"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                onClick={() => onTabChange?.(tab.value)}
                className={cn(
                  "relative group flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-semibold transition-colors whitespace-nowrap",
                  draggedIndex === index && "opacity-40",
                  dragOverIndex === index && "border-l-2 border-primary",
                  activeTab === tab.value
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-t-full"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab shrink-0" />
                {tab.icon && (
                  <span className="shrink-0 opacity-70">{tab.icon}</span>
                )}
                {tab.label}
              </button>
            ))}

            {/* Count badge */}
            {count !== undefined && (
              <span className="ml-2 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {count}
              </span>
            )}

            {/* Add view button */}
            {onAddTab && (
              <button
                onClick={onAddTab}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Extra left content (nav buttons, filters, etc.) */}
            {leftExtra && (
              <div className="ml-3 flex items-center gap-2">{leftExtra}</div>
            )}
          </>
        )}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right slot ── */}
      {right && (
        <div className="flex shrink-0 items-center gap-2 px-4 py-1.5">
          {right}
        </div>
      )}
    </div>
  );
}

// ─── Convenience sub-components for the right slot ─────────────────────────────

/** Compact search input for the right slot */
export function ToolbarSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 transition-colors",
        "focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20",
        className,
      )}
    >
      {/* inline search icon via CSS so we don't import lucide here */}
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3 shrink-0 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-28 bg-transparent text-[11px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

/** Primary CTA button for the right slot */
export function ToolbarButton({
  onClick,
  children,
  className,
}: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3",
        "text-[11px] font-semibold text-primary-foreground shadow-sm",
        "transition-all hover:bg-primary/90 active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Ghost/outline button for the right slot (filter, etc.) */
export function ToolbarGhostButton({
  onClick,
  children,
  active,
  className,
}: {
  onClick?: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5",
        "text-[11px] font-medium transition-all",
        active
          ? "border-primary/30 bg-primary/5 text-primary"
          : "border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Icon-only toggle group for the right slot (pipeline / list / board) */
export function ToolbarViewToggle<T extends string>({
  views,
  active,
  onChange,
}: {
  views: { value: T; icon: ReactNode; label?: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center rounded-lg bg-muted p-0.5 gap-0.5">
      {views.map((v) => (
        <button
          key={v.value}
          type="button"
          onClick={() => onChange(v.value)}
          aria-label={v.label}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md transition-all",
            active === v.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v.icon}
        </button>
      ))}
    </div>
  );
}

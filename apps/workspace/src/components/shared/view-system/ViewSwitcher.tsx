"use client";

import React, { useState } from 'react';
import { ViewMeta, DEFAULT_VIEW_CATALOG, getViewMeta } from './view-catalog';
import { ViewIcon } from './view-icon';
import { cn } from '@qentrah/platform-core/classnames';

export type ViewMode = 'dashboard' | 'widgets' | 'table' | 'board' | 'calendar' | 'timeline' | 'list';

export interface ViewSwitcherProps {
  /** Available view modes for this domain */
  availableViews: ViewMode[];
  /** Currently active view mode */
  activeView: ViewMode;
  /** Callback when view mode changes */
  onViewChange: (view: ViewMode) => void;
  /** Optional custom view catalog (defaults to DEFAULT_VIEW_CATALOG) */
  viewCatalog?: readonly ViewMeta[];
  /** Optional custom view labels */
  customLabels?: Partial<Record<ViewMode, string>>;
  /** Optional custom view descriptions */
  customDescriptions?: Partial<Record<ViewMode, string>>;
  /** Show as compact pill buttons (default: false) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ViewSwitcher - Unified view switching component for all domains.
 * 
 * Provides consistent UI for switching between different view modes:
 * - Dashboard: Overview with metrics and insights
 * - Widgets: Grid of customizable widgets
 * - Table: AG Grid table with advanced features
 * - Board: Kanban-style board view
 * - Calendar: Calendar view
 * - Timeline: Gantt/timeline view
 * - List: Simple list view
 * 
 * Uses the view catalog for consistent icons and colors across the app.
 */
export function ViewSwitcher({
  availableViews,
  activeView,
  onViewChange,
  viewCatalog = DEFAULT_VIEW_CATALOG,
  customLabels = {},
  customDescriptions = {},
  compact = false,
  className,
}: ViewSwitcherProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Map view modes to catalog types
  const viewTypeMap: Record<ViewMode, string> = {
    dashboard: 'dashboard',
    widgets: 'dashboard',
    table: 'table',
    board: 'board',
    calendar: 'calendar',
    timeline: 'timeline',
    list: 'list',
  };

  // Get available view metadata
  const availableViewMeta = availableViews
    .map((view) => ({
      mode: view,
      meta: getViewMeta(viewTypeMap[view], viewCatalog),
    }))
    .filter((v) => v.meta !== undefined);

  const activeMeta = availableViewMeta.find((v) => v.mode === activeView);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {availableViewMeta.map(({ mode, meta }) => (
          <button
            key={mode}
            onClick={() => onViewChange(mode)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              "hover:bg-muted/80",
              activeView === mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground"
            )}
            title={customDescriptions[mode] || meta?.description}
          >
            {meta && <ViewIcon type={meta.type} catalog={viewCatalog} size={16} />}
            <span>{customLabels[mode] || meta?.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Active view display */}
      {activeMeta && activeMeta.meta && (
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            "hover:bg-muted/80 border border-border/50",
            "bg-card"
          )}
        >
          <ViewIcon type={activeMeta.meta.type} catalog={viewCatalog} size={18} />
          <span>{customLabels[activeView] || activeMeta.meta.label}</span>
          <svg
            className={cn(
              "w-4 h-4 transition-transform",
              isDropdownOpen ? "rotate-180" : ""
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
            {availableViewMeta.map(({ mode, meta }) => (
              <button
                key={mode}
                onClick={() => {
                  onViewChange(mode);
                  setIsDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-muted/80",
                  activeView === mode
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                )}
              >
                {meta && <ViewIcon type={meta.type} catalog={viewCatalog} size={16} />}
                <div className="flex flex-col items-start">
                  <span>{customLabels[mode] || meta?.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {customDescriptions[mode] || meta?.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * ViewSwitcherTabs - Tab-style view switcher for domain headers.
 * Shows all available views as tabs at the top of the page.
 */
export interface ViewSwitcherTabsProps extends Omit<ViewSwitcherProps, 'compact'> {
  /** Show icons in tabs (default: true) */
  showIcons?: boolean;
}

export function ViewSwitcherTabs({
  availableViews,
  activeView,
  onViewChange,
  viewCatalog,
  customLabels,
  showIcons = true,
  className,
}: ViewSwitcherTabsProps) {
  const viewTypeMap: Record<ViewMode, string> = {
    dashboard: 'dashboard',
    widgets: 'dashboard',
    table: 'table',
    board: 'board',
    calendar: 'calendar',
    timeline: 'timeline',
    list: 'list',
  };

  const availableViewMeta = availableViews
    .map((view) => ({
      mode: view,
      meta: getViewMeta(viewTypeMap[view], viewCatalog),
    }))
    .filter((v) => v.meta !== undefined);

  return (
    <div className={cn("flex items-center gap-1 border-b border-border", className)}>
      {availableViewMeta.map(({ mode, meta }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2",
            "hover:bg-muted/50",
            activeView === mode
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {showIcons && meta && <ViewIcon type={meta.type} catalog={viewCatalog} size={16} />}
          <span>{customLabels?.[mode] || meta?.label}</span>
        </button>
      ))}
    </div>
  );
}

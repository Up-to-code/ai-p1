"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Table, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";

export type WorkspaceTableType = 'projects' | 'clients' | 'deals' | 'tasks' | 'calendar' | 'docs' | 'team' | 'timeTracking';

export interface WorkspaceTableSwitcherProps {
  /** Currently selected table type */
  activeTable: WorkspaceTableType;
  /** Callback when table type changes */
  onTableChange: (table: WorkspaceTableType) => void;
  /** Show compact version (default: false) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

const TABLE_LABELS: Record<WorkspaceTableType, string> = {
  projects: "Projects",
  clients: "Clients",
  deals: "Deals",
  tasks: "Tasks",
  calendar: "Calendar",
  docs: "Documents",
  team: "Team",
  timeTracking: "Time Tracking",
};

const TABLE_DESCRIPTIONS: Record<WorkspaceTableType, string> = {
  projects: "View and manage all projects",
  clients: "View and manage all clients",
  deals: "View and manage all deals",
  tasks: "View and manage all tasks",
  calendar: "View calendar and schedule",
  docs: "View and manage all documents",
  team: "View and manage team members",
  timeTracking: "Track time for projects and tasks",
};

/**
 * WorkspaceTableSwitcher - Global table switcher for workspace-wide navigation.
 * 
 * Allows users to switch between different domain tables across the entire workspace,
 * filtering by the selected workspace or query context.
 */
export function WorkspaceTableSwitcher({
  activeTable,
  onTableChange,
  compact = false,
  className,
}: WorkspaceTableSwitcherProps) {
  const t = useTranslations("Workspace");
  const [isOpen, setIsOpen] = useState(false);

  const tables: WorkspaceTableType[] = ['projects', 'clients', 'deals', 'tasks', 'calendar', 'docs', 'team', 'timeTracking'];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => onTableChange(table)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              "hover:bg-muted/80",
              activeTable === table
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground"
            )}
            title={TABLE_DESCRIPTIONS[table]}
          >
            <Table className="w-4 h-4" />
            <span>{TABLE_LABELS[table]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
          "hover:bg-muted/80 border border-border/50",
          "bg-card"
        )}
      >
        <Table className="w-4 h-4" />
        <span>{TABLE_LABELS[activeTable]}</span>
        <Filter className="w-4 h-4 text-muted-foreground" />
        <svg
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen ? "rotate-180" : ""
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

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => {
                  onTableChange(table);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-muted/80",
                  activeTable === table
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                )}
              >
                <Table className="w-4 h-4" />
                <div className="flex flex-col items-start">
                  <span>{TABLE_LABELS[table]}</span>
                  <span className="text-xs text-muted-foreground">
                    {TABLE_DESCRIPTIONS[table]}
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
 * WorkspaceTableSwitcherTabs - Tab-style table switcher for workspace header.
 */
export interface WorkspaceTableSwitcherTabsProps extends Omit<WorkspaceTableSwitcherProps, 'compact'> {
  /** Show icons in tabs (default: true) */
  showIcons?: boolean;
}

export function WorkspaceTableSwitcherTabs({
  activeTable,
  onTableChange,
  showIcons = true,
  className,
}: WorkspaceTableSwitcherTabsProps) {
  const tables: WorkspaceTableType[] = ['projects', 'clients', 'deals', 'tasks', 'calendar', 'docs', 'team', 'timeTracking'];

  return (
    <div className={cn("flex items-center gap-1 border-b border-border", className)}>
      {tables.map((table) => (
        <button
          key={table}
          onClick={() => onTableChange(table)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2",
            "hover:bg-muted/50",
            activeTable === table
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {showIcons && <Table className="w-4 h-4" />}
          <span>{TABLE_LABELS[table]}</span>
        </button>
      ))}
    </div>
  );
}

"use client";

import { useState, useCallback, useId } from "react";
import {
  Plus,
  MoreHorizontal,
  FileText,
  Info,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { isRtlLocale } from "@/lib/i18n/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectDocumentEditor } from "./project-document-editor";
import type { Project } from "../store/projects.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabType = "overview" | "document";

interface OverviewTab {
  id: string;
  type: "overview";
  label: string;
}

interface DocumentTab {
  id: string;
  type: "document";
  label: string;
  title: string;
  content: string;
}

type PanelTab = OverviewTab | DocumentTab;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function defaultTabs(): PanelTab[] {
  return [{ id: "overview", type: "overview", label: "Overview" }];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProjectStatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function OverviewPanel({ project }: { project: Project }) {
  const healthLabel: Record<string, string> = {
    onTrack: "On Track",
    atRisk: "At Risk",
    blocked: "Blocked",
  };
  const healthColor: Record<string, string> = {
    onTrack: "text-emerald-600 dark:text-emerald-400",
    atRisk: "text-amber-600 dark:text-amber-400",
    blocked: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Description */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1">
          Description
        </p>
        <p className="text-[13px] leading-relaxed text-foreground">
          {project.description || (
            <span className="italic text-muted-foreground">No description</span>
          )}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <ProjectStatCard label="Status" value={project.status} />
        <ProjectStatCard
          label="Health"
          value={
            <span className={healthColor[project.health] ?? ""}>
              {healthLabel[project.health] ?? project.health}
            </span>
          }
        />
        {project.budget != null && (
          <ProjectStatCard
            label="Planned budget"
            value={`$${project.budget.toLocaleString()}`}
          />
        )}
        {project.startDate && (
          <ProjectStatCard
            label="Start"
            value={new Date(project.startDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        )}
        {project.endDate && (
          <ProjectStatCard
            label="Deadline"
            value={new Date(project.endDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        )}
        {project.visibility && (
          <ProjectStatCard label="Visibility" value={project.visibility} />
        )}
      </div>
    </div>
  );
}

// Inline rename input shown inside the tab
function TabRenameInput({
  value,
  onCommit,
  onCancel,
}: {
  value: string;
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft.trim() || value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit(draft.trim() || value);
        if (e.key === "Escape") onCancel();
        e.stopPropagation();
      }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      className="w-24 min-w-0 rounded border border-border bg-background px-1 py-0 text-[11px] font-bold text-foreground outline-none focus:border-foreground/30"
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ProjectOverviewSidebarProps {
  project: Project;
  defaultOpen?: boolean;
}

export function ProjectOverviewSidebar({
  project,
  defaultOpen = true,
}: ProjectOverviewSidebarProps) {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [tabs, setTabs] = useState<PanelTab[]>(defaultTabs);
  const [activeTabId, setActiveTabId] = useState<string>("overview");
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Tab management
  // ------------------------------------------------------------------

  const addDocumentTab = useCallback(() => {
    const id = uid();
    const newTab: DocumentTab = {
      id,
      type: "document",
      label: "New Doc",
      title: "",
      content: "",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  }, []);

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== tabId);
        // Always keep at least the overview tab
        if (next.length === 0) return prev;
        return next;
      });
      setActiveTabId((current) => {
        if (current !== tabId) return current;
        const remaining = tabs.filter((t) => t.id !== tabId);
        return remaining[remaining.length - 1]?.id ?? "overview";
      });
    },
    [tabs],
  );

  const renameTab = useCallback((tabId: string, newLabel: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, label: newLabel } : t)),
    );
    setRenamingTabId(null);
  }, []);

  const duplicateTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const source = prev.find((t) => t.id === tabId);
      if (!source || source.type !== "document") return prev;
      const id = uid();
      const copy: DocumentTab = {
        ...source,
        id,
        label: `${source.label} (copy)`,
      };
      const idx = prev.findIndex((t) => t.id === tabId);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const updateDocumentTab = useCallback(
    (tabId: string, patch: Partial<Pick<DocumentTab, "title" | "content">>) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId && t.type === "document" ? { ...t, ...patch } : t,
        ),
      );
    },
    [],
  );

  // ------------------------------------------------------------------
  // Active tab content
  // ------------------------------------------------------------------

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // ------------------------------------------------------------------
  // Collapsed state — show a thin toggle strip
  // ------------------------------------------------------------------

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;
  const ChevronOpenIcon = isRtl ? ChevronRight : ChevronLeft;

  if (!isOpen) {
    return (
      <div className="relative flex h-full shrink-0 flex-col items-center border-s border-border bg-secondary pt-4">
        <button
          type="button"
          title="Open project panel"
          onClick={() => setIsOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronIcon className="h-3.5 w-3.5" />
        </button>
        {/* Rotated project name label */}
        <div className="mt-6 flex items-center justify-center">
          <span
            className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {project.name}
          </span>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Expanded panel
  // ------------------------------------------------------------------

  return (
    <div
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col border-s border-border bg-secondary",
        isRtl && "font-cairo",
      )}
    >
      {/* ---- Header: project name + collapse button ---- */}
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <span className="min-w-0 truncate text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
          {project.name}
        </span>
        <button
          type="button"
          title="Close panel"
          onClick={() => setIsOpen(false)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronOpenIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ---- Tab bar ---- */}
      <div className="flex shrink-0 items-center gap-0 overflow-x-auto border-b border-border scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isRenaming = renamingTabId === tab.id;
          const Icon = tab.type === "overview" ? Info : FileText;

          return (
            <div
              key={tab.id}
              className={cn(
                "group/tab relative flex shrink-0 items-center",
                isActive
                  ? "border-b-2 border-foreground"
                  : "border-b-2 border-transparent",
              )}
            >
              {/* Tab trigger */}
              <button
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "flex h-9 items-center gap-1.5 pl-2.5 pr-1 text-[11px] font-bold transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3 shrink-0 opacity-60" />
                {isRenaming ? (
                  <TabRenameInput
                    value={tab.label}
                    onCommit={(v) => renameTab(tab.id, v)}
                    onCancel={() => setRenamingTabId(null)}
                  />
                ) : (
                  <span className="max-w-[80px] truncate">{tab.label}</span>
                )}
              </button>

              {/* Per-tab ⋯ menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                    isActive
                      ? "opacity-60 hover:opacity-100"
                      : "opacity-0 group-hover/tab:opacity-60 group-hover/tab:hover:opacity-100",
                  )}
                  title="Tab options"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start" className="min-w-[160px]">
                  <DropdownMenuItem
                    onClick={() => setRenamingTabId(tab.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Rename
                  </DropdownMenuItem>
                  {tab.type === "document" && (
                    <DropdownMenuItem onClick={() => duplicateTab(tab.id)}>
                      <FileText className="h-3.5 w-3.5" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  {tab.type === "document" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => closeTab(tab.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Close × button (document tabs only, hover) */}
              {tab.type === "document" && (
                <button
                  type="button"
                  title="Close tab"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={cn(
                    "mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                    "opacity-0 group-hover/tab:opacity-60 group-hover/tab:hover:opacity-100",
                    isActive && "opacity-40 hover:opacity-100",
                  )}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* + Add tab */}
        <button
          type="button"
          title="Add document"
          onClick={addDocumentTab}
          className="flex h-9 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ---- Tab content ---- */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab?.type === "overview" && (
          <OverviewPanel project={project} />
        )}

        {activeTab?.type === "document" && (
          <div className="flex h-full flex-col p-4">
            <ProjectDocumentEditor
              title={activeTab.title}
              onTitleChange={(title) =>
                updateDocumentTab(activeTab.id, { title })
              }
              value={activeTab.content}
              onChange={(content) =>
                updateDocumentTab(activeTab.id, { content })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

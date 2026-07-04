"use client";

/**
 * InboxCommandPalette
 *
 * The global search / command surface for the inbox.
 * Triggered by clicking the search bar at the top of the inbox page.
 *
 * Features:
 * - Category filter pills: All · Tasks · Docs · Agents · Members · …
 * - Results grouped by category with icons + relative timestamps
 * - Hover row actions: Send to conversation · Copy link · Open
 * - Keyboard navigation: ↑↓ to move, Enter to open, Esc to close
 * - Loading skeleton while data fetches
 * - "No results" state with helpful empty copy
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  User,
  CheckSquare,
  FileText,
  Loader2,
  ExternalLink,
  Link2,
  Send,
  Bot,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { listOrganizationMembers } from "@/domains/organization/api";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useDocsQuery } from "@/domains/docs/api/docs";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResultCategory = "tasks" | "docs" | "members" | "agents";

interface PaletteResult {
  id: string;
  category: ResultCategory;
  title: string;
  subtitle?: string;
  timestamp?: number;
  /** raw data for action callbacks */
  data: unknown;
}

interface InboxCommandPaletteProps {
  organizationId?: string;
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  /** Called when user clicks "Send to conversation" on a result */
  onSendToConversation?: (result: PaletteResult) => void;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: {
  id: ResultCategory | "all";
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "all", label: "All", icon: Search },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "docs", label: "Docs", icon: FileText },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "members", label: "Members", icon: User },
];

const CATEGORY_ICONS: Record<ResultCategory, React.ElementType> = {
  tasks: CheckSquare,
  docs: FileText,
  agents: Bot,
  members: User,
};

const CATEGORY_ACCENT: Record<ResultCategory, string> = {
  tasks: "text-blue-500",
  docs: "text-violet-500",
  agents: "text-emerald-500",
  members: "text-amber-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Result row ───────────────────────────────────────────────────────────────

function ResultRow({
  result,
  isSelected,
  onOpen,
  onSend,
  onCopyLink,
}: {
  result: PaletteResult;
  isSelected: boolean;
  onOpen: (r: PaletteResult) => void;
  onSend: (r: PaletteResult) => void;
  onCopyLink: (r: PaletteResult) => void;
}) {
  const Icon = CATEGORY_ICONS[result.category];
  const accent = CATEGORY_ACCENT[result.category];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer select-none",
        isSelected || hovered ? "bg-accent" : "hover:bg-accent/50",
      )}
      onClick={() => onOpen(result)}
    >
      {/* Category icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted",
          accent,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground leading-snug">
          {result.title}
        </p>
        {result.subtitle && (
          <p className="truncate text-[11px] text-muted-foreground leading-snug mt-0.5">
            {result.subtitle}
          </p>
        )}
      </div>

      {/* Timestamp (hidden when row actions are visible) */}
      {result.timestamp && !hovered && !isSelected && (
        <span className="shrink-0 text-[11px] text-muted-foreground/60 tabular-nums">
          {relativeTime(result.timestamp)}
        </span>
      )}

      {/* Hover row actions */}
      <AnimatePresence>
        {(hovered || isSelected) && (
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.12 }}
            className="flex shrink-0 items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionButton
              icon={Send}
              label="Send to conversation"
              onClick={() => onSend(result)}
            />
            <ActionButton
              icon={Link2}
              label="Copy link"
              onClick={() => onCopyLink(result)}
            />
            <ActionButton
              icon={ExternalLink}
              label="Open"
              onClick={() => onOpen(result)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-3 pb-1 pt-2 first:pt-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground/50">({count})</span>
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InboxCommandPalette({
  organizationId,
  projectId,
  isOpen,
  onClose,
  onSendToConversation,
}: InboxCommandPaletteProps) {
  const session = useAuthSession();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ResultCategory | "all">("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ────────────────────────────────────────────────────────
  const tasksResult = useTasksQuery(organizationId, { search: query, projectId });
  const docsResult = useDocsQuery(organizationId, { search: query, projectId });
  const [members, setMembers] = useState<
    Array<{ id: string; name: string; email?: string; createdAt?: number }>
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    setLoadingMembers(true);
    listOrganizationMembers(organizationId)
      .then((data) =>
        setMembers(
          data.map((m) => ({
            id: m.userId,
            name: m.user?.name || m.user?.email || m.userId,
            email: m.user?.email,
          })),
        ),
      )
      .finally(() => setLoadingMembers(false));
  }, [organizationId]);

  const isLoading = loadingMembers;

  // ── Build result list ────────────────────────────────────────────────────
  const allResults = useMemo<PaletteResult[]>(() => {
    const items: PaletteResult[] = [];
    const q = query.toLowerCase().trim();

    const matches = (text: string) => !q || text.toLowerCase().includes(q);

    // Tasks
    const tasks = Array.isArray(tasksResult?.data)
      ? (tasksResult.data as any[])
      : Array.isArray(tasksResult)
        ? (tasksResult as any[])
        : [];
    tasks.forEach((t) => {
      if (!matches(t.title ?? "")) return;
      items.push({
        id: t._id ?? t.id,
        category: "tasks",
        title: t.title,
        subtitle: t.status ? `Status: ${t.status}` : undefined,
        timestamp: t._creationTime ?? t.createdAt,
        data: t,
      });
    });

    // Docs
    const docs = Array.isArray(docsResult?.data)
      ? (docsResult.data as any[])
      : Array.isArray(docsResult)
        ? (docsResult as any[])
        : [];
    docs.forEach((d) => {
      if (!matches(d.title ?? "")) return;
      items.push({
        id: d._id ?? d.id,
        category: "docs",
        title: d.title,
        subtitle: d.content ? (d.content as string).slice(0, 60) : undefined,
        timestamp: d._creationTime ?? d.createdAt,
        data: d,
      });
    });

    // Members
    members.forEach((m) => {
      if (!matches(m.name) && !matches(m.email ?? "")) return;
      items.push({
        id: m.id,
        category: "members",
        title: m.name,
        subtitle: m.email,
        data: m,
      });
    });

    return items;
  }, [tasksResult, docsResult, members, query]);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? allResults
        : allResults.filter((r) => r.category === activeCategory),
    [allResults, activeCategory],
  );

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<ResultCategory, PaletteResult[]>();
    filtered.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    });
    return map;
  }, [filtered]);

  // ── Reset selection when results change ──────────────────────────────────
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // ── Auto-focus input on open ─────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setActiveCategory("all");
    }
  }, [isOpen]);

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const r = filtered[selectedIndex];
        if (r) handleOpen(r);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, filtered, selectedIndex]);

  // ── Click-outside ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleOpen = (r: PaletteResult) => {
    console.log("Open result:", r);
    onClose();
  };

  const handleSend = (r: PaletteResult) => {
    onSendToConversation?.(r);
    onClose();
  };

  const handleCopyLink = (r: PaletteResult) => {
    const url = `${window.location.origin}/en/inbox?ref=${r.category}/${r.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    onClose();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/20"
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, docs, members…"
                className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2 overflow-x-auto scrollbar-none">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                    activeCategory === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Results body */}
            <div className="max-h-[360px] overflow-y-auto overscroll-contain p-2">
              {isLoading && !query ? (
                // Skeleton while loading
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground">No results</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {query ? `Nothing found for "${query}"` : "Start typing to search"}
                  </p>
                </div>
              ) : (
                // Grouped results
                Array.from(grouped.entries()).map(([category, rows]) => {
                  const Icon = CATEGORY_ICONS[category];
                  const categoryLabel =
                    CATEGORIES.find((c) => c.id === category)?.label ?? category;
                  let globalOffset = 0;
                  Array.from(grouped.entries()).forEach(([cat, rs]) => {
                    if (cat === category) return;
                    // accumulate offset for correct keyboard navigation index
                    const order = ["tasks", "docs", "agents", "members"] as const;
                    if (order.indexOf(cat) < order.indexOf(category as any))
                      globalOffset += rs.length;
                  });

                  return (
                    <div key={category}>
                      {activeCategory === "all" && (
                        <SectionHeader label={categoryLabel} count={rows.length} />
                      )}
                      {rows.map((result, rowIdx) => {
                        const flatIdx = filtered.indexOf(result);
                        return (
                          <ResultRow
                            key={result.id}
                            result={result}
                            isSelected={flatIdx === selectedIndex}
                            onOpen={handleOpen}
                            onSend={handleSend}
                            onCopyLink={handleCopyLink}
                          />
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
              <span className="text-[11px] text-muted-foreground/60">
                {filtered.length > 0
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                  : ""}
              </span>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>Esc close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

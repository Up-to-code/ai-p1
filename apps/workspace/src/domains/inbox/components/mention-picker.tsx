"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  User,
  CheckSquare,
  FileText,
  Paperclip,
  Loader2,
  Building2,
  DollarSign,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function AiLogoSmall({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/ai/logo.png"
      alt=""
      width={16}
      height={16}
      className={cn("object-contain", className)}
    />
  );
}
import {
  listOrganizationMembers,
  getOrganizationCapabilities,
} from "@/domains/organization/api";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useDocsQuery } from "@/domains/docs/api/docs";
import { useAuthSession } from "@/domains/auth";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useOpportunitiesQuery } from "@/domains/opportunities/api/opportunities";
import type { MessageMention } from "../types/inbox.types";

interface MentionPickerProps {
  organizationId: string;
  projectId?: string;
  onSelect: (mention: MessageMention) => void;
  onClose: () => void;
}

type MentionType = MessageMention["type"] | "ai";

interface MentionItem {
  id: string;
  name: string;
  type: MentionType;
  subtitle?: string;
  icon: React.ElementType;
}

const AI_MENTION_NAME = "qentrah";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  ai: { label: "AI", icon: AiLogoSmall },
  user: { label: "People", icon: User },
  task: { label: "Tasks", icon: CheckSquare },
  document: { label: "Docs", icon: FileText },
  file: { label: "Files", icon: Paperclip },
  project: { label: "Projects", icon: FolderOpen },
  client: { label: "Clients", icon: Building2 },
  deal: { label: "Deals", icon: DollarSign },
};

const CATEGORY_ORDER = [
  "ai",
  "user",
  "task",
  "document",
  "file",
  "project",
  "client",
  "deal",
];

export function MentionPicker({
  organizationId,
  projectId,
  onSelect,
  onClose,
}: MentionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const session = useAuthSession();
  const [capabilities, setCapabilities] = useState<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (organizationId) {
      getOrganizationCapabilities(organizationId).then(setCapabilities);
    }
  }, [organizationId]);

  const [users, setUsers] = useState<
    Array<{ id: string; name: string; email?: string }>
  >([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (organizationId) {
      setIsLoadingUsers(true);
      listOrganizationMembers(organizationId)
        .then((membersData) => {
          setUsers(
            membersData.map((m) => ({
              id: m.userId,
              name: m.user?.name || m.user?.email || m.userId,
              email: m.user?.email,
            })),
          );
        })
        .finally(() => setIsLoadingUsers(false));
    }
  }, [organizationId]);

  const tasksResult = useTasksQuery(organizationId, {
    status: "all",
    projectId: projectId || null,
  });
  const tasks = Array.isArray(tasksResult) ? tasksResult : [];

  const docsResult = useDocsQuery(organizationId, {
    projectId: projectId || null,
  });
  const documents = Array.isArray(docsResult) ? docsResult : [];

  const projectsResult = useProjectsIndexQuery(organizationId);
  const projects = projectsResult?.results ?? [];

  const clientsResult = useClientsIndexQuery(organizationId);
  const clients = clientsResult?.results ?? [];

  const dealsResult = useOpportunitiesQuery(organizationId);
  const deals = Array.isArray(dealsResult) ? dealsResult : [];

  // Combine ALL items across all categories into one global list
  const allItems = useMemo(() => {
    const items: MentionItem[] = [];

    // AI Assistant (always available)
    items.push({
      id: "ai-draw",
      name: AI_MENTION_NAME,
      type: "ai",
      subtitle: "Ask the AI assistant",
      icon: AiLogoSmall,
    });

    users.forEach((user) =>
      items.push({
        id: user.id,
        name: user.name,
        type: "user" as const,
        subtitle: user.email,
        icon: User,
      }),
    );

    tasks.forEach((task) =>
      items.push({
        id: task.id,
        name: task.title,
        type: "task" as const,
        subtitle: task.status,
        icon: CheckSquare,
      }),
    );

    documents.forEach((doc) =>
      items.push({
        id: doc.id,
        name: doc.title,
        type: "document" as const,
        subtitle: doc.folderId || "Root",
        icon: FileText,
      }),
    );

    projects.forEach((project) =>
      items.push({
        id: project.id,
        name: project.name,
        type: "project" as const,
        subtitle: project.status || "Active",
        icon: FolderOpen,
      }),
    );

    clients.forEach((client) =>
      items.push({
        id: client.id,
        name: client.name,
        type: "client" as const,
        subtitle: client.pipelineStage || "New",
        icon: Building2,
      }),
    );

    deals.forEach((deal) =>
      items.push({
        id: deal.id,
        name: deal.title,
        type: "deal" as const,
        subtitle: deal.stage || "New",
        icon: DollarSign,
      }),
    );

    return items;
  }, [users, tasks, documents, projects, clients, deals]);

  // Global search across ALL categories
  const filteredItems = useMemo(() => {
    const categoryItems =
      activeCategory === "all"
        ? allItems
        : allItems.filter((item) => String(item.type) === activeCategory);
    if (!searchQuery.trim()) return categoryItems;
    const query = searchQuery.toLowerCase().replace(/^@+/, "");
    return categoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query),
    );
  }, [activeCategory, allItems, searchQuery]);

  // Group filtered results by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, MentionItem[]> = {};
    CATEGORY_ORDER.forEach((cat) => {
      groups[cat] = [];
    });
    filteredItems.forEach((item) => {
      const key = String(item.type);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredItems.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, selectedIndex, onClose]);

  const handleSelect = (item: MentionItem) => {
    onSelect({
      id: item.id,
      name: item.name,
      type: item.type as MessageMention["type"],
    } as MessageMention);
    onClose();
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-0 right-0 z-50 mx-auto max-w-xl rounded-lg border border-border bg-popover shadow-2xl"
      style={{ bottom: "100px" }}
    >
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3">
        {[
          { key: "all", label: "All" },
          ...CATEGORY_ORDER.map((key) => ({
            key,
            label: CATEGORY_CONFIG[key]?.label ?? key,
          })),
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveCategory(tab.key);
              setSelectedIndex(0);
            }}
            className={cn(
              "shrink-0 border-b-2 px-2 py-1.5 text-[11px] font-medium transition-colors",
              activeCategory === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search people, tasks, docs, projects, clients..."
            className="pl-9 h-10 text-sm border-transparent bg-muted/50 focus:bg-background"
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto">
        {isLoadingUsers ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <Search className="mb-2 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No results found" : "No items available"}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {CATEGORY_ORDER.map((catKey) => {
              const items = groupedItems[catKey];
              if (!items?.length) return null;

              const config = CATEGORY_CONFIG[catKey];
              if (!config) return null;
              const Icon = config.icon;

              return (
                <div key={catKey}>
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {config.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {items.length}
                    </span>
                  </div>
                  {items.map((item) => {
                    const globalIndex = filteredItems.indexOf(item);
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          "mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50 text-foreground",
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium">
                            {item.name}
                          </div>
                          {item.subtitle && (
                            <div className="truncate text-[11px] text-muted-foreground">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground bg-muted/30 flex items-center justify-between">
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
        <span>Esc Close</span>
      </div>
    </motion.div>
  );
}

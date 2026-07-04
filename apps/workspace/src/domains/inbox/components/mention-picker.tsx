"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, CheckSquare, FileText, Paperclip, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { listOrganizationMembers, getOrganizationCapabilities } from "@/domains/organization/api";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useDocsQuery } from "@/domains/docs/api/docs";
import { useAuthSession } from "@/domains/auth";
import type { MessageMention } from "../types/inbox.types";

interface MentionPickerProps {
  organizationId: string;
  projectId?: string;
  onSelect: (mention: MessageMention) => void;
  onClose: () => void;
}

type MentionCategory = "users" | "tasks" | "documents" | "files";

interface MentionItem {
  id: string;
  name: string;
  type: MessageMention["type"];
  category: MentionCategory;
  subtitle?: string;
}

export function MentionPicker({
  organizationId,
  projectId,
  onSelect,
  onClose,
}: MentionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MentionCategory | "all">("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const session = useAuthSession();
  const [capabilities, setCapabilities] = useState<any>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Fetch capabilities for permission checks
  useEffect(() => {
    if (organizationId) {
      getOrganizationCapabilities(organizationId).then(setCapabilities);
    }
  }, [organizationId]);

  // Permission checks
  const canMentionUsers = capabilities?.canViewMembers ?? true;
  const canMentionTasks = capabilities?.canViewTasks ?? true;
  const canMentionDocs = capabilities?.canViewDocs ?? true;
  const canMentionFiles = capabilities?.canViewMedia ?? true;

  // Fetch users
  const [users, setUsers] = useState<Array<{ id: string; name: string; email?: string }>>([]);
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
            }))
          );
        })
        .finally(() => setIsLoadingUsers(false));
    }
  }, [organizationId]);

  // Fetch tasks
  const tasksResult = useTasksQuery(organizationId, {
    status: "all",
    projectId: projectId || null,
  });
  const tasks = Array.isArray(tasksResult) ? tasksResult : [];

  // Fetch documents
  const docsResult = useDocsQuery(organizationId, {
    projectId: projectId || null,
  });
  const documents = Array.isArray(docsResult) ? docsResult : [];

  // Combine all items with permission checks
  const allItems = useMemo(() => {
    const items: MentionItem[] = [];

    // Add users (with permission check)
    if (canMentionUsers && (selectedCategory === "all" || selectedCategory === "users")) {
      users.forEach((user) => {
        items.push({
          id: user.id,
          name: user.name,
          type: "user",
          category: "users",
          subtitle: user.email,
        });
      });
    }

    // Add tasks (with permission check)
    if (canMentionTasks && (selectedCategory === "all" || selectedCategory === "tasks")) {
      tasks.forEach((task) => {
        items.push({
          id: task.id,
          name: task.title,
          type: "task",
          category: "tasks",
          subtitle: task.status,
        });
      });
    }

    // Add documents (with permission check)
    if (canMentionDocs && (selectedCategory === "all" || selectedCategory === "documents")) {
      documents.forEach((doc) => {
        items.push({
          id: doc.id,
          name: doc.title,
          type: "document",
          category: "documents",
          subtitle: doc.folderId || "Root",
        });
      });
    }

    return items;
  }, [users, tasks, documents, selectedCategory, canMentionUsers, canMentionTasks, canMentionDocs]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<MentionCategory, MentionItem[]> = {
      users: [],
      tasks: [],
      documents: [],
      files: [],
    };

    filteredItems.forEach((item) => {
      groups[item.category].push(item);
    });

    return groups;
  }, [filteredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
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
      type: item.type,
    });
    onClose();
  };

  const getCategoryIcon = (category: MentionCategory) => {
    switch (category) {
      case "users":
        return User;
      case "tasks":
        return CheckSquare;
      case "documents":
        return FileText;
      case "files":
        return Paperclip;
    }
  };

  const getCategoryLabel = (category: MentionCategory) => {
    switch (category) {
      case "users":
        return "Users";
      case "tasks":
        return "Tasks";
      case "documents":
        return "Documents";
      case "files":
        return "Files";
    }
  };

  const isLoading = isLoadingUsers;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-0 right-0 mx-auto max-w-2xl rounded-xl border border-border bg-popover shadow-2xl z-50"
      style={{ bottom: "100px" }}
    >
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, tasks, documents..."
            className="pl-9 h-10 text-sm"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 border-b border-border p-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap",
            selectedCategory === "all"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          All
        </button>
        {canMentionUsers && (
          <button
            type="button"
            onClick={() => setSelectedCategory("users")}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              selectedCategory === "users"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            Users
          </button>
        )}
        {canMentionTasks && (
          <button
            type="button"
            onClick={() => setSelectedCategory("tasks")}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              selectedCategory === "tasks"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            Tasks
          </button>
        )}
        {canMentionDocs && (
          <button
            type="button"
            onClick={() => setSelectedCategory("documents")}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              selectedCategory === "documents"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            Documents
          </button>
        )}
        {canMentionFiles && (
          <button
            type="button"
            onClick={() => setSelectedCategory("files")}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap",
              selectedCategory === "files"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            Files
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No items found</p>
          </div>
        ) : (
          <div className="p-3">
            {(["users", "tasks", "documents", "files"] as MentionCategory[]).map((category) => {
              const items = groupedItems[category];
              if (items.length === 0) return null;

              const Icon = getCategoryIcon(category);
              const hasPermission = 
                (category === "users" && canMentionUsers) ||
                (category === "tasks" && canMentionTasks) ||
                (category === "documents" && canMentionDocs) ||
                (category === "files" && canMentionFiles);

              if (!hasPermission) return null;

              return (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {getCategoryLabel(category)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((item, idx) => {
                      const globalIndex = filteredItems.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                            isSelected
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">
                              {item.name}
                            </div>
                            {item.subtitle && (
                              <div className="truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2 w-2 rounded-full bg-accent-foreground"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Permission-based access
          </span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

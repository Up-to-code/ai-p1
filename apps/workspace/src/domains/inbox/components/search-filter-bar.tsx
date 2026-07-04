"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, CheckSquare, FileText, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { listOrganizationMembers } from "@/domains/organization/api";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useDocsQuery } from "@/domains/docs/api/docs";
import { useResourceMediaQuery } from "@/domains/media/api/media";
import type { OrganizationMember } from "@/domains/organization/api/types";

type FilterType = "all" | "users" | "tasks" | "docs" | "files";

interface SearchResult {
  id: string;
  type: FilterType;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  data: any;
}

interface SearchFilterBarProps {
  organizationId?: string;
  projectId?: string;
  onSelectResult?: (result: SearchResult) => void;
}

export function SearchFilterBar({ organizationId, projectId, onSelectResult }: SearchFilterBarProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const session = useAuthSession();
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch data based on active filter
  const tasksResult = useTasksQuery(organizationId, { search: query, projectId });
  const docsResult = useDocsQuery(organizationId, { search: query, projectId });
  const media = useResourceMediaQuery(organizationId, "project", projectId);
  const [users, setUsers] = useState<OrganizationMember[]>([]);

  const tasks = tasksResult?.data;
  const docs = docsResult?.data;

  useEffect(() => {
    if (organizationId) {
      listOrganizationMembers(organizationId).then(setUsers);
    }
  }, [organizationId]);

  // Filter results based on query and active filter
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];

    // Add users
    if (activeFilter === "all" || activeFilter === "users") {
      const filteredUsers = users.filter((u) => 
        u.user?.name?.toLowerCase().includes(query.toLowerCase()) ||
        u.user?.email?.toLowerCase().includes(query.toLowerCase())
      );
      filteredUsers.forEach((u) => {
        searchResults.push({
          id: u.userId,
          type: "users",
          title: u.user?.name || u.user?.email || u.userId,
          subtitle: u.user?.email,
          icon: <User className="h-4 w-4" />,
          data: u,
        });
      });
    }

    // Add tasks
    if ((activeFilter === "all" || activeFilter === "tasks") && tasks && Array.isArray(tasks)) {
      tasks.forEach((task: any) => {
        searchResults.push({
          id: task._id || task.id,
          type: "tasks",
          title: task.title,
          subtitle: task.status,
          icon: <CheckSquare className="h-4 w-4" />,
          data: task,
        });
      });
    }

    // Add docs
    if ((activeFilter === "all" || activeFilter === "docs") && docs && Array.isArray(docs)) {
      docs.forEach((doc: any) => {
        searchResults.push({
          id: doc._id || doc.id,
          type: "docs",
          title: doc.title,
          subtitle: doc.content?.slice(0, 50),
          icon: <FileText className="h-4 w-4" />,
          data: doc,
        });
      });
    }

    // Add files
    if ((activeFilter === "all" || activeFilter === "files") && media && Array.isArray(media)) {
      media.forEach((m: any) => {
        searchResults.push({
          id: m._id || m.id,
          type: "files",
          title: m.name,
          subtitle: `${(m.size / 1024).toFixed(1)} KB`,
          icon: <Image className="h-4 w-4" />,
          data: m,
        });
      });
    }

    setResults(searchResults);
  }, [query, activeFilter, tasks, docs, media, users]);

  const filters: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: "all", label: "All", icon: <Search className="h-4 w-4" /> },
    { type: "users", label: "Users", icon: <User className="h-4 w-4" /> },
    { type: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
    { type: "docs", label: "Docs", icon: <FileText className="h-4 w-4" /> },
    { type: "files", label: "Files", icon: <Image className="h-4 w-4" /> },
  ];

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult?.(result);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search everything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-8 h-8 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground text-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {/* Filter Tabs */}
            <div className="flex border-b border-border">
              {filters.map((filter) => (
                <button
                  key={filter.type}
                  type="button"
                  onClick={() => setActiveFilter(filter.type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
                    activeFilter === filter.type
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-auto p-2">
              {results.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

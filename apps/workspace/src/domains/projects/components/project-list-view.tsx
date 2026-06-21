"use client";

import { useState, useMemo } from "react";
import { useAccountContext } from "@/domains/auth";
import { useProjectsIndexQuery, useProjectTaskCounts } from "../api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { Plus, FolderKanban, ListTodo, Tag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CreateProjectForm } from "./create-project-form";
import { cn } from "@/lib/utils";
import { GlobalProjectsDashboard } from "./global-projects-dashboard";

const statusTone: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  archived: "bg-zinc-500/10 text-zinc-400",
  planned: "bg-muted text-muted-foreground",
};

const healthTone: Record<string, string> = {
  onTrack: "text-emerald-500",
  atRisk: "text-amber-500",
  blocked: "text-red-500",
};

const healthLabel: Record<string, string> = {
  onTrack: "On Track",
  atRisk: "At Risk",
  blocked: "Blocked",
};

export function ProjectListView() {
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;

  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const query = useProjectsIndexQuery(workspaceOrganizationId ?? undefined, { search });
  const projects = query.results ?? [];
  const taskCounts = useProjectTaskCounts(workspaceOrganizationId ?? undefined);
  const counts: Record<string, number> = taskCounts ?? {};

  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId ?? undefined);
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of (clientsQuery?.results ?? []) as Client[]) {
      map.set(c.id, c.name);
    }
    return map;
  }, [clientsQuery?.results]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center px-2 pb-2">
        <div className="text-start flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">All Projects</h1>
          <p className="text-sm font-medium text-text-secondary mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-md border-border bg-background text-[13px] font-medium shadow-sm"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="h-9 rounded-md px-4 font-bold text-[13px] shadow-sm">
            <Plus className="me-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Dashboard */}
      <div className="flex-1 overflow-auto -mx-2 px-2 pb-8 min-h-[600px]">
        <GlobalProjectsDashboard />
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none" showCloseButton={false}>
          <DialogTitle className="sr-only">New Project</DialogTitle>
          <DialogDescription className="sr-only">Create a new project</DialogDescription>
          <CreateProjectForm onSuccess={() => setIsCreateModalOpen(false)} onCancel={() => setIsCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

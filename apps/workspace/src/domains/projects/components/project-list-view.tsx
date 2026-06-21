"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import { useProjectsIndexQuery, useProjectTaskCounts, updateProjectRequest, deleteProjectRequest } from "../api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import type { Project, ProjectStatus, ProjectHealth } from "../store/projects.types";
import { projectSchema, type ProjectFormValues } from "../validation/project.schema";
import { useQueryClient } from "@tanstack/react-query";
import { EditableText } from "@/components/ui/editable-text";
import { EditableTags } from "@/components/ui/editable-tags";
import { EditableSelect } from "@/components/ui/editable-select";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderKanban,
  ArrowUpDown,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CreateProjectForm } from "./create-project-form";

const projectStatuses: readonly ProjectStatus[] = ["planned", "active", "paused", "completed", "archived"];
const projectHealths: readonly ProjectHealth[] = ["onTrack", "atRisk", "blocked"];

const statusLabel: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

const healthLabel: Record<string, string> = {
  onTrack: "On Track",
  atRisk: "At Risk",
  blocked: "Blocked",
};

const statusColorMap: Record<string, "gray" | "green" | "yellow" | "blue" | "red" | "brown" | "orange" | "purple" | "pink"> = {
  planned: "gray",
  active: "green",
  paused: "yellow",
  completed: "blue",
  archived: "gray",
};

const healthColorMap: Record<string, "gray" | "green" | "yellow" | "blue" | "red" | "brown" | "orange" | "purple" | "pink"> = {
  onTrack: "green",
  atRisk: "yellow",
  blocked: "red",
};

const statusDot: Record<string, string> = {
  planned: "bg-muted-foreground",
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  completed: "bg-sky-500",
  archived: "bg-zinc-400",
};

const healthDot: Record<string, string> = {
  onTrack: "bg-emerald-500",
  atRisk: "bg-amber-500",
  blocked: "bg-red-500",
};

export function ProjectListView() {
  const t = useTranslations("Projects");
  const router = useRouter();
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const query = useProjectsIndexQuery(orgId, { search, status: statusFilter === "all" ? undefined : statusFilter });
  const projects = query.results ?? [];
  const hasMore = query.status === "CanLoadMore";
  const isLoading = query.queryStatus === "loading";
  const taskCounts = useProjectTaskCounts(orgId);
  const counts: Record<string, number> = taskCounts ?? {};

  const clientsQuery = useClientsIndexQuery(orgId);
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of (clientsQuery?.results ?? []) as Client[]) {
      map.set(c.id, c.name);
    }
    return map;
  }, [clientsQuery?.results]);

  const updateProject = useCallback(
    async (project: Project, field: string, value: any) => {
      if (!orgId) return;
      const formValues: ProjectFormValues = {
        name: project.name,
        clientId: project.clientId ?? "",
        opportunityId: project.opportunityId ?? "",
        status: project.status,
        health: project.health,
        visibility: project.visibility ?? "team",
        startDate: project.startDate ?? "",
        endDate: project.endDate ?? "",
        budget: project.budget != null ? String(project.budget) : "",
        description: project.description ?? "",
        tags: project.tags ?? [],
        templateId: project.templateId ?? "",
        useAiSetup: false,
        [field]: value,
      };
      try {
        await updateProjectRequest(orgId, project.id, formValues);
        queryClient.invalidateQueries({ queryKey: ["projects-index", orgId] });
      } catch (err) {
        console.error("Failed to update project:", err);
      }
    },
    [orgId, queryClient],
  );

  const deleteProject = useCallback(
    async (project: Project) => {
      if (!orgId) return;
      try {
        await deleteProjectRequest(orgId, project.id);
        queryClient.invalidateQueries({ queryKey: ["projects-index", orgId] });
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    },
    [orgId, queryClient],
  );

  function getInitials(name: string) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Status filter pills */}
        <div className="flex items-center gap-0.5 rounded-xl border border-border bg-card p-0.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "h-7 rounded-lg px-3 text-[11px] font-semibold transition-all",
              statusFilter === "all"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {projectStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "h-7 rounded-lg px-3 text-[11px] font-semibold transition-all capitalize",
                statusFilter === s
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-56 rounded-xl border-border bg-card pl-8 text-xs font-medium"
          />
        </div>

        {/* New Project */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-8 rounded-xl bg-primary px-3 text-xs font-semibold text-white"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Project
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-muted/30 dark:bg-white/[0.01]">
              <tr className="border-b border-border dark:border-white/5">
                <th className="w-12 px-3 py-2.5"></th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    Name
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  </span>
                </th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Status</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Health</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Client</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Progress</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Tasks</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Tags</th>
                <th className="w-20 px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onMouseEnter={() => setHoveredRow(project.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "border-b border-border/50 last:border-0 transition-colors cursor-pointer",
                    hoveredRow === project.id && "bg-muted/20 dark:bg-white/[0.02]",
                  )}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  {/* Avatar */}
                  <td className="px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-[11px] font-black text-foreground">
                      {getInitials(project.name)}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-3 py-2.5">
                    <div className="min-w-0">
                      <EditableText
                        value={project.name}
                        onChange={(name) => updateProject(project, "name", name)}
                        className="text-sm font-bold text-foreground"
                        disabled={hoveredRow !== project.id}
                      />
                      {project.startDate && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {project.startDate}{project.endDate ? ` → ${project.endDate}` : ""}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <EditableSelect
                      value={project.status}
                      options={projectStatuses.map((s) => ({ label: statusLabel[s], value: s }))}
                      onChange={(status) => updateProject(project, "status", status)}
                      colorMapType="project-status"
                      defaultColors={statusColorMap}
                      disabled={hoveredRow !== project.id}
                    />
                  </td>

                  {/* Health */}
                  <td className="px-3 py-2.5">
                    <EditableSelect
                      value={project.health}
                      options={projectHealths.map((h) => ({ label: healthLabel[h], value: h }))}
                      onChange={(health) => updateProject(project, "health", health)}
                      colorMapType="project-health"
                      defaultColors={healthColorMap}
                      disabled={hoveredRow !== project.id}
                    />
                  </td>

                  {/* Client */}
                  <td className="px-3 py-2.5">
                    {project.clientId ? (
                      <span
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/clients/${project.clientId}`);
                        }}
                      >
                        {clientMap.get(project.clientId) || "Unknown"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </td>

                  {/* Progress */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {project.progress ?? 0}%
                      </span>
                    </div>
                  </td>

                  {/* Tasks */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {counts[project.id] ?? 0}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="px-3 py-2.5">
                    <EditableTags
                      tags={project.tags ?? []}
                      onChange={(tags) => updateProject(project, "tags", tags)}
                      disabled={hoveredRow !== project.id}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div
                      className={cn(
                        "flex items-center gap-0.5 transition-opacity",
                        hoveredRow === project.id ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${project.id}/edit`);
                        }}
                        className="p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors rounded-md hover:bg-muted"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(project);
                        }}
                        className="p-1.5 text-muted-foreground/40 hover:text-red-500 transition-colors rounded-md hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="border-t border-border dark:border-white/5">
            <button
              type="button"
              onClick={() => query.loadMore(50)}
              className="w-full py-3 text-xs font-bold text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              Load more projects...
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <FolderKanban className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">
              {search ? "No projects match your search." : "No projects yet."}
            </p>
            {!search && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="outline"
                size="sm"
                className="mt-4 h-8 rounded-xl text-xs font-semibold"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create your first project
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none" showCloseButton={false}>
          <DialogTitle className="sr-only">New Project</DialogTitle>
          <DialogDescription className="sr-only">Create a new project</DialogDescription>
          <CreateProjectForm onSuccess={() => setIsCreateModalOpen(false)} onCancel={() => setIsCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleting?.name ?? "..."}"? This action cannot be undone.`}
        isDeleting={false}
        onConfirm={() => {
          if (!deleting) return;
          deleteProject(deleting);
          setDeleting(null);
        }}
      />
    </div>
  );
}

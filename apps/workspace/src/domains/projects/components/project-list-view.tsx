"use client";

import { useState } from "react";
import { useAccountContext } from "@/domains/auth";
import { useProjectsIndexQuery } from "../api/projects";
import { Plus, Search, Filter, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CreateProjectForm } from "./create-project-form";

export function ProjectListView() {
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const query = useProjectsIndexQuery(workspaceOrganizationId ?? undefined, { search });
  const projects = query.results ?? [];
  const stats = query.stats ?? { total: 0, approved: 0, pending: 0, draft: 0, rejected: 0 };
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center border-b border-border pb-8 dark:border-white/5">
        <div className="text-start flex-1">
          <h1 className="text-3xl font-black tracking-tight text-text-primary">All Projects</h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">Manage all your active and upcoming deliveries.</p>
        </div>
        
        <div className="flex items-center">
          <Button onClick={() => setIsCreateModalOpen(true)} className="h-11 rounded-xl px-6 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 font-bold">
            <Plus className="me-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Grid */}
      {query.queryStatus === "loading" ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-surface/50 p-16 text-center dark:border-white/10 dark:bg-white/5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted dark:bg-white/10">
            <FolderKanban className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-6 text-xl font-black text-text-primary">No projects found</h3>
          <p className="mt-2 max-w-sm text-sm font-medium text-text-secondary">Get started by creating your first project container to organize tasks, files, and team communication.</p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="mt-8 h-12 rounded-xl px-8 shadow-lg shadow-primary/20 font-bold">
            <Plus className="me-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/overview`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="text-start">
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                    project.status === "active" ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                    project.status === "paused" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" :
                    "bg-muted text-foreground dark:bg-white/10 dark:text-muted-foreground"
                  }`}>
                    {project.status || "Planned"}
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-black tracking-tight text-text-primary group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-text-secondary">{project.description}</p>
                )}
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-border pt-5 dark:border-white/5">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Team & Client
                </div>
                <div className="text-xs font-bold text-text-secondary">
                  {new Date(project._creationTime).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

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

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, FolderGit2, Globe, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CreateProjectForm } from "@/domains/projects/components/create-project-form";
import { useProjectSwitcher } from "@/domains/projects/hooks/use-project-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const {
    projects,
    activeProject,
    activeProjectId,
    isGlobalMode,
    isLoading,
    switchProject,
    switchToGlobal,
  } = useProjectSwitcher();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div
          role="combobox"
          aria-expanded={open}
          className="flex h-9 items-center justify-between gap-2 rounded-lg border border-[var(--color-divider)] bg-background px-3 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 w-[220px]"
        >
          <div className="flex items-center gap-2 truncate">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-5 rounded shrink-0" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </>
            ) : isGlobalMode || !activeProject ? (
              <>
                <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span className="truncate">Global Workspace</span>
              </>
            ) : (
              <>
                <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FolderGit2 className="h-3.5 w-3.5" />
                </div>
                <span className="truncate">{activeProject.name}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-2 shadow-xl rounded-xl" align="start">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => {
              switchToGlobal();
              setOpen(false);
            }}
            className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-[var(--color-divider)] transition-colors"
          >
            <Globe className="me-2 h-4 w-4 text-zinc-500" />
            Global Workspace
            {isGlobalMode && <Check className="ms-auto h-4 w-4" />}
          </button>

          <div className="h-px bg-[var(--color-divider)] my-1" />

          <div className="px-2 pt-1 pb-1 text-xs font-medium text-text-muted">Active Projects</div>
          {isLoading ? (
            <div className="space-y-1 px-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="h-4 w-4 rounded shrink-0" />
                  <Skeleton className="h-4 rounded-full" style={{ width: `${60 + i * 12}%` }} />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="px-2 py-2 text-sm text-text-muted">No project found.</div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  switchProject(project.id);
                  setOpen(false);
                }}
                className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-[var(--color-divider)] transition-colors"
              >
                <FolderGit2 className="me-2 h-4 w-4 text-indigo-500" />
                <span className="truncate">{project.name}</span>
                {activeProject?.id === project.id && <Check className="ms-auto h-4 w-4" />}
              </button>
            ))
          )}

          <div className="h-px bg-[var(--color-divider)] my-1" />

          <button
            onClick={() => {
              setOpen(false);
            }}
            className="flex w-full items-center px-2 py-1.5 text-xs text-text-muted rounded-lg hover:bg-[var(--color-divider)] transition-colors"
          >
            View all projects
          </button>
          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              setOpen(false);
            }}
            className="flex w-full items-center px-2 py-1.5 text-xs text-primary rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
          >
            <Plus className="me-2 h-3.5 w-3.5" />
            Create new project
          </button>
        </div>
      </PopoverContent>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none" showCloseButton={false}>
          <DialogTitle className="sr-only">New Project</DialogTitle>
          <DialogDescription className="sr-only">Create a new project</DialogDescription>
          <CreateProjectForm onSuccess={() => setIsCreateModalOpen(false)} onCancel={() => setIsCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </Popover>
  );
}

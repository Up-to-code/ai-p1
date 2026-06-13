"use client";

import * as React from "react";
import { Check, ChevronsUpDown, FolderGit2, Globe, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CreateProjectForm } from "@/domains/projects/components/create-project-form";

import { useRouter } from "@/i18n/routing";
import { useParams, usePathname } from "next/navigation";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const account = useAccountContext();
  const activeOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  const projectsQuery = useProjectOptionsQueryResult(activeOrganizationId);
  const projects = projectsQuery.data ?? [];

  const { activeProjectId, setActiveProjectId } = useWorkspaceStore();

  const activeProject = React.useMemo(() => {
    return projects.find((p) => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  // Sync state if URL specifies a project but store doesn't (deep link)
  React.useEffect(() => {
    const pathParts = pathname.split("/");
    const projectsIndex = pathParts.indexOf("projects");
    if (projectsIndex !== -1 && pathParts.length > projectsIndex + 1) {
      const idInUrl = pathParts[projectsIndex + 1];
      if (idInUrl !== "create" && idInUrl !== "index" && idInUrl !== activeProjectId) {
        setActiveProjectId(idInUrl);
      }
    } else if (activeProjectId && !pathname.includes("/projects")) {
      // Keep it in store, no need to clear it, this allows "Global Zone vs Project Zone" paradigm.
    }
  }, [pathname, activeProjectId, setActiveProjectId]);

  const isGlobalMode = !activeProjectId;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className="flex h-9 items-center justify-between gap-2 rounded-lg border border-[var(--color-divider)] bg-background px-3 text-sm font-semibold shadow-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 w-[220px]"
        >
          <div className="flex items-center gap-2 truncate">
            {isGlobalMode || !activeProject ? (
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
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-2 shadow-xl rounded-xl" align="start">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => {
              setActiveProjectId(null);
              if (pathname.includes("/projects/")) {
                router.push("/dashboard");
              }
              setOpen(false);
            }}
            className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <Globe className="mr-2 h-4 w-4 text-zinc-500" />
            Global Workspace
            {isGlobalMode && <Check className="ml-auto h-4 w-4" />}
          </button>

          <div className="h-px bg-zinc-200 dark:bg-white/10 my-1" />

          <div className="px-2 py-1 text-xs font-medium text-zinc-500">Active Projects</div>
          {projects.length === 0 && (
            <div className="px-2 py-2 text-sm text-zinc-500">No project found.</div>
          )}
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                setActiveProjectId(project.id);
                if (pathname.includes("/projects/")) {
                  // If we are deep inside a project route, try to switch to the new project
                  const pathParts = pathname.split("/");
                  const projectsIndex = pathParts.indexOf("projects");
                  const currentTab = pathParts[projectsIndex + 2] || "overview";
                  router.push(`/projects/${project.id}/${currentTab}`);
                }
                setOpen(false);
              }}
              className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <FolderGit2 className="mr-2 h-4 w-4 text-indigo-500" />
              <span className="truncate">{project.name}</span>
              {activeProjectId === project.id && <Check className="ml-auto h-4 w-4" />}
            </button>
          ))}

          <div className="h-px bg-zinc-200 dark:bg-white/10 my-1" />
          
          <button
            onClick={() => {
              router.push("/projects");
              setOpen(false);
            }}
            className="flex w-full items-center px-2 py-1.5 text-xs text-zinc-500 rounded-md hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            View all projects
          </button>
          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              setOpen(false);
            }}
            className="flex w-full items-center px-2 py-1.5 text-xs text-indigo-500 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
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

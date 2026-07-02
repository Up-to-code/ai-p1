"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, FolderGit2, Plus, Trash2, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateProjectForm } from "@/domains/projects/components/create-project-form";
import { useProjectSwitcher } from "@/domains/projects/hooks/use-project-switcher";
import { deleteProjectRequest } from "@/domains/projects/api/projects";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";

export function ProjectSwitcher() {
  const t = useTranslations("ProjectSwitcher");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; project: { id: string; name: string } } | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<{ project: { id: string; name: string } } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const session = useAuthSession();
  const { spaceSlug, projectId: activeProjectId, setProject } = useNavigation();
  const activeOrganizationId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId ?? undefined
      : undefined;

  const {
    projects,
    activeProject,
    isGlobalMode,
    isLoading,
    refetchProjects,
  } = useProjectSwitcher();

  const filteredProjects = React.useMemo(() => {
    if (!spaceSlug) return [];
    return projects;
  }, [projects, spaceSlug]);

  const handleContextMenu = React.useCallback((e: React.MouseEvent, project: { id: string; name: string }) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, project });
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (!deleteModal || !activeOrganizationId || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProjectRequest(activeOrganizationId, deleteModal.project.id);
      setDeleteModal(null);
      setContextMenu(null);
      refetchProjects();
      router.push("/ws");
    } catch {
    } finally {
      setIsDeleting(false);
    }
  }, [deleteModal, activeOrganizationId, isDeleting, router, refetchProjects]);

  React.useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);

  if (!spaceSlug) return null;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <div
            role="combobox"
            aria-expanded={open}
            className="flex h-9 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold transition-colors hover:bg-muted w-[220px]"
          >
            <div className="flex items-center gap-2 truncate">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-5 rounded shrink-0" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </>
              ) : !activeProject ? (
                <>
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-foreground dark:bg-white/10 dark:text-muted-foreground">
                    <FolderGit2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate text-text-muted">{t("noProjectSelected")}</span>
                </>
              ) : (
                <>
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-muted-foreground">
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
            <div className="px-2 pt-1 pb-1 text-xs font-medium text-text-muted">{t("activeProjects")}</div>
            {isLoading ? (
              <div className="space-y-1 px-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                    <Skeleton className="h-4 rounded-full" style={{ width: `${60 + i * 12}%` }} />
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="px-2 py-2 text-sm text-text-muted">{t("noProjectFound")}</div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setProject(project.id);
                    setOpen(false);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, project)}
                  className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  <FolderGit2 className="me-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{project.name}</span>
                  {activeProject?.id === project.id && <Check className="ms-auto h-4 w-4" />}
                </button>
              ))
            )}

            <div className="h-px bg-border my-1" />

            <button
              onClick={() => {
                setOpen(false);
              }}
              className="flex w-full items-center px-2 py-1.5 text-xs text-text-muted rounded-lg hover:bg-muted transition-colors"
            >
              {t("viewAllProjects")}
            </button>
            <button
              onClick={() => {
                setIsCreateModalOpen(true);
                setOpen(false);
              }}
              className="flex w-full items-center px-2 py-1.5 text-xs text-primary rounded-lg hover:bg-muted transition-colors"
            >
              <Plus className="me-2 h-3.5 w-3.5" />
              {t("createNewProject")}
            </button>
          </div>
        </PopoverContent>

        <CreateProjectForm
          isOpen={isCreateModalOpen}
          onSuccess={() => setIsCreateModalOpen(false)}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Popover>

      {contextMenu && createPortal(
        <div
          className="fixed z-[100] min-w-[160px] rounded-lg bg-popover p-1 shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              setDeleteModal({ project: contextMenu.project });
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete project
          </button>
        </div>,
        document.body
      )}

      <Dialog open={!!deleteModal} onOpenChange={(isOpen) => { if (!isOpen) setDeleteModal(null); }}>
        <DialogContent className="max-w-md">
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium text-foreground">{deleteModal?.project.name}</span>? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModal(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

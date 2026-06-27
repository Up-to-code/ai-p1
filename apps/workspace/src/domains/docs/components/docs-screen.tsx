"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  FolderOpen,
  Folder,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import {
  EmptyWorkspace,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { DocListView } from "./doc-list-view";
import { DocGridView } from "./doc-grid-view";
import { DocEditor } from "./doc-editor";
import { DocCreateForm } from "./doc-create-form";
import {
  createDocRequest,
  updateDocRequest,
  moveDocRequest,
  createDocFolderRequest,
  useDocsQuery,
  useDocQuery,
  useDocFoldersQuery,
} from "../api/docs";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import type { DocRecord, DocFolder } from "../docs.types";
import { cn } from "@/lib/utils";
import { type DocViewMode, emptyDoc } from "../docs.constants";
import { DocSkeleton } from "./doc-skeleton";
import { useOptimisticDocActions, docOptimisticUpdate, docOptimisticRemove } from "../hooks/use-optimistic-actions";

import { buildBreadcrumbPath, getSubfolders } from "../lib/folder-utils";
export function DocsScreen({
  projectId: projectIdProp,
}: { hideShell?: boolean; projectId?: string | null } = {}) {
  const t = useTranslations("Docs");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (account.workspace.organizationId ?? undefined)
      : undefined;

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<DocViewMode>("list");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const selectedId = searchParams.get("docId");

  const projectId = projectIdProp ?? undefined;

  const projectOptions = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectList = useMemo(
    () => projectOptions.data ?? [],
    [projectOptions.data],
  );

  const setSelectedId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("docId", id);
      else params.delete("docId");
      const next = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(next as never, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const docsResult = useDocsQuery(organizationId, {
    projectId,
    folderId: selectedFolderId,
    search,
  });

  const foldersResult = useDocFoldersQuery(organizationId, projectId);
  const allFolders = foldersResult.data ?? [];
  const emptyDocs = [] as DocRecord[];
  const rawDocs = docsResult.data ?? emptyDocs;

  const optimistic = useOptimisticDocActions();
  const docs = useMemo(() => optimistic.applyToList(rawDocs), [rawDocs, optimistic.version]);

  useEffect(() => {
    optimistic.reconcile(rawDocs);
  }, [rawDocs, optimistic.reconcile]);

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      if (doc.deletedAt) return false;
      return true;
    });
  }, [docs]);

  const currentSubfolders = useMemo(
    () => getSubfolders(allFolders, selectedFolderId),
    [allFolders, selectedFolderId],
  );

  const breadcrumbPath = useMemo(
    () => buildBreadcrumbPath(allFolders, selectedFolderId),
    [allFolders, selectedFolderId],
  );

  const selectedDoc = useMemo(
    () => filteredDocs.find((d) => d.id === selectedId) ?? null,
    [filteredDocs, selectedId],
  );

  const updateDocMutation = useMutation({
    mutationFn: async (variables: {
      organizationId: string;
      doc: DocRecord;
      title: string;
      content: string;
    }) => {
      return updateDocRequest(variables.organizationId, variables.doc.id, {
        title: variables.title,
        content: variables.content,
        folderId: variables.doc.folderId ?? "",
        projectId: variables.doc.projectId ?? "",
        visibility: variables.doc.visibility,
        tags: (variables.doc.tags ?? []).join(", "),
      });
    },
  });

  async function createNewDoc() {
    if (!organizationId) return;
    setShowCreateForm(true);
  }

  function handleCreateDoc(title: string, templateId?: string) {
    setShowCreateForm(false);
    createDocRequest(organizationId!, {
      ...emptyDoc,
      title,
      folderId: selectedFolderId ?? "",
      projectId: projectId ?? "",
    }).then((result) => {
      setSelectedId(result.doc.id);
    });
  }

  async function handleCreateFolder() {
    if (!organizationId || !newFolderName.trim()) return;
    await createDocFolderRequest(organizationId, {
      name: newFolderName.trim(),
      parentId: selectedFolderId ?? "",
      projectId: projectId ?? "",
    });
    setNewFolderName("");
    setShowNewFolder(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-8 h-14 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="h-4 w-4 text-text-muted shrink-0" />
          <h1 className="text-sm font-semibold text-foreground shrink-0 tracking-tight">
            {t("title")}
          </h1>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-lg px-2.5",
                viewMode === "list"
                  ? "bg-foreground text-background hover:bg-foreground hover:text-background"
                  : "text-text-muted hover:text-foreground",
              )}
            >
              <List className="h-3 w-3 inline-block mr-1" />
              {t("viewMode.list")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-lg px-2.5",
                viewMode === "grid"
                  ? "bg-foreground text-background hover:bg-foreground hover:text-background"
                  : "text-text-muted hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-3 w-3 inline-block mr-1" />
              {t("viewMode.grid")}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={common("search")}
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-text-muted"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNewFolder(true)}
            className="h-8 rounded-xl px-3 text-xs"
          >
            <Folder className="h-3.5 w-3.5" />
            {t("folders.newFolder")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={createNewDoc}
            className="h-8 rounded-xl px-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("actions.newDoc")}
          </Button>
        </div>
      </div>

      {/* ── Breadcrumb bar ── */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-background/60 px-8 h-9">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setSelectedFolderId(null)}
          className={cn(
            "h-auto rounded-md px-1.5 py-0.5 text-xs font-medium",
            selectedFolderId === null
              ? "text-foreground"
              : "text-text-muted hover:text-foreground",
          )}
        >
          <Home className="h-3 w-3" />
          <span>{t("title")}</span>
        </Button>
        {breadcrumbPath.map((folder) => (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-text-muted/50" />
            <Button
              type="button"
              variant="link"
              size="xs"
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                "h-auto rounded-md px-1.5 py-0.5 text-xs font-medium no-underline",
                folder.id === selectedFolderId
                  ? "text-foreground"
                  : "text-text-muted hover:text-foreground",
              )}
            >
              {folder.name}
            </Button>
          </div>
        ))}
      </div>

      {/* ── Body: unified folder + doc list ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-300",
            selectedDoc && "blur-[1.5px]",
          )}
        >
          <div className="flex-1 overflow-auto p-6">
            {workspaceStatus !== "ready" ? (
              <WorkspaceQueryState status={workspaceStatus} variant="table" />
            ) : docsResult.error ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {docsResult.error}
                </p>
              </div>
            ) : docsResult.data === undefined ? (
              <DocSkeleton viewMode={viewMode} />
            ) : currentSubfolders.length === 0 && filteredDocs.length === 0 && !showNewFolder ? (
              <EmptyWorkspace
                icon={FileText}
                title={t("empty.title")}
                description={t("empty.description")}
              />
            ) : viewMode === "list" ? (
              <DocListView
                docs={filteredDocs}
                folders={currentSubfolders}
                selectedId={selectedId ?? undefined}
                onDocClick={(id) => setSelectedId(id === selectedId ? null : id)}
                onFolderClick={(id) => setSelectedFolderId(id)}
                organizationId={organizationId}
                showNewFolder={showNewFolder}
                newFolderName={newFolderName}
                onNewFolderNameChange={setNewFolderName}
                onCreateFolder={handleCreateFolder}
                onCancelNewFolder={() => {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }}
              />
            ) : (
              <DocGridView
                docs={filteredDocs}
                folders={currentSubfolders}
                selectedId={selectedId ?? undefined}
                onDocClick={(id) => setSelectedId(id === selectedId ? null : id)}
                onFolderClick={(id) => setSelectedFolderId(id)}
                showNewFolder={showNewFolder}
                newFolderName={newFolderName}
                onNewFolderNameChange={setNewFolderName}
                onCreateFolder={handleCreateFolder}
                onCancelNewFolder={() => {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }}
              />
            )}
          </div>
        </div>

        {/* Doc editor modal */}
        {selectedDoc && organizationId && (
          <div
            className={cn(
              "fixed inset-0 z-40 flex items-center justify-center modal-overlay-animate-in",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              aria-label="Close doc"
              className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[2px] dark:bg-black/45 hover:bg-black/20 dark:hover:bg-black/45"
              onClick={() => setSelectedId(null)}
            />
            <div
              className={cn(
                "relative z-10 overflow-hidden border border-border bg-background flex flex-col modal-content-animate-in",
                isModalFullscreen
                  ? "w-screen h-screen rounded-none border-0"
                  : "w-[90vw] h-[90vh] rounded-2xl",
              )}
            >
              <DocEditor
                key={selectedDoc.id}
                doc={selectedDoc}
                organizationId={organizationId}
                onClose={() => setSelectedId(null)}
                onSaved={() => {}}
                onDeleted={() => {
                  setSelectedId(null);
                }}
                isFullscreen={isModalFullscreen}
                onToggleFullscreen={() => setIsModalFullscreen((v) => !v)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Create doc form modal */}
      {showCreateForm && (
        <DocCreateForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateDoc}
          folderId={selectedFolderId}
        />
      )}
    </div>
  );
}

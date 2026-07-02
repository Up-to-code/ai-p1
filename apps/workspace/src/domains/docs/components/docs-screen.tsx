"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Search,
  Folder,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAuthSession } from "@/domains/auth";
import {
  EmptyWorkspace,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { PageHeader } from "@/components/shared/page-header";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { DocEditor } from "./doc-editor";
import { DocCreateForm } from "./doc-create-form";
import { DocCreateDropdown } from "./doc-create-dropdown";
import { AppDataTable, type AppDataTableColumn } from "@/components/shared";
import {
  createDocRequest,
  updateDocRequest,
  useDocsQuery,
  useDocFoldersQuery,
} from "../api/docs";
import type { DocRecord, DocFolder } from "../docs.types";
import { cn } from "@/lib/utils";
import { emptyDoc } from "../docs.constants";
import { DocSkeleton } from "./doc-skeleton";
import { useOptimisticDocActions } from "../hooks/use-optimistic-actions";
import { buildBreadcrumbPath, getSubfolders } from "../lib/folder-utils";

export function DocsScreen({
  projectId: projectIdProp,
}: { hideShell?: boolean; projectId?: string | null } = {}) {
  const t = useTranslations("Docs");
  const common = useTranslations("Common");
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const [search, setSearch] = useState("");
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

  const docColumns: AppDataTableColumn<DocRecord>[] = [
    {
      key: "title",
      header: t("table.name"),
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {row.title || "Untitled"}
          </span>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: t("table.updated"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

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
    const { createDocFolderRequest } = await import("../api/docs");
    await createDocFolderRequest(organizationId, {
      name: newFolderName.trim(),
      parentId: selectedFolderId ?? "",
      projectId: projectId ?? "",
    });
    setNewFolderName("");
    setShowNewFolder(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <PageHeader
        title={t("title")}
        actions={[
          {
            label: t("actions.newDoc"),
            icon: Plus,
            variant: "primary",
            onClick: createNewDoc,
          },
        ]}
      />

      {/* Breadcrumb bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-6 py-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSelectedFolderId(null)}
          className={cn(
            "h-8 rounded-lg px-3 text-xs font-medium",
            selectedFolderId === null
              ? "bg-card text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Home className="h-3.5 w-3.5 mr-2" />
          {t("title")}
        </Button>
        {breadcrumbPath.map((folder) => (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-medium",
                folder.id === selectedFolderId
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {folder.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNewFolder(true)}
            className="h-8 rounded-lg px-3 text-xs font-medium"
          >
            <Folder className="h-3.5 w-3.5 mr-2" />
            {t("folders.newFolder")}
          </Button>
          <DocCreateDropdown
            onCreateBlank={() => createNewDoc()}
            onCreateFromTemplate={(templateId) => {
              createNewDoc();
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={common("search")}
              className="h-full w-48 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Body */}
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
          <DocSkeleton viewMode={"grid"} />
        ) : currentSubfolders.length === 0 && filteredDocs.length === 0 && !showNewFolder ? (
          <EmptyWorkspace
            icon={FileText}
            title={t("empty.title")}
            description={t("empty.description")}
          />
        ) : (
          <div className="space-y-4">
            {/* Folders */}
            {currentSubfolders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentSubfolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Folder className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate w-full text-center">
                      {folder.name}
                    </span>
                  </button>
                ))}
                {showNewFolder && (
                  <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-5">
                    <input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name"
                      className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateFolder();
                        if (e.key === "Escape") {
                          setShowNewFolder(false);
                          setNewFolderName("");
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateFolder}
                        className="flex-1 h-9 text-sm"
                      >
                        Create
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewFolder(false);
                          setNewFolderName("");
                        }}
                        className="flex-1 h-9 text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Docs */}
            {filteredDocs.length > 0 && (
              <AppDataTable
                columns={docColumns}
                data={filteredDocs}
                getRowKey={(row, index) => row.id}
                onRowClick={(row) => setSelectedId(row.id)}
              />
            )}
          </div>
        )}
      </div>

      {/* Doc editor modal */}
      {selectedDoc && organizationId && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center modal-overlay-animate-in",
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
              "relative z-10 overflow-hidden border border-border bg-background flex flex-col modal-content-animate-in resize overflow-auto",
              isModalFullscreen
                ? "w-screen h-screen rounded-none border-0 resize-none"
                : "w-[800px] h-[600px] min-w-[400px] min-h-[300px] rounded-2xl",
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

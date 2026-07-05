"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { Plus, FileText, Search, Folder, Info, X } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useDocsQuery, useDocFoldersQuery, createDocRequest, createDocFolderRequest, useDocQuery } from "../api/docs";
import type { DocRecord, DocFolder } from "../docs.types";
import { cn } from "@/lib/utils";
import { emptyDoc } from "../docs.constants";
import { DocCreateForm } from "./doc-create-form";
import { buildBreadcrumbPath, getSubfolders } from "../lib/folder-utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/routing";
import { DocEditor } from "./doc-editor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DocsTableSkeleton } from "./docs-table-skeleton";

export function DocsPageRedesigned({
  projectId: projectIdProp,
}: { projectId?: string | null } = {}) {
  const t = useTranslations("Docs");
  const common = useTranslations("Common");
  const session = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showFolderGuidance, setShowFolderGuidance] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const projectId = projectIdProp ?? undefined;

  const { data: selectedDoc, isLoading: isLoadingDoc } = useDocQuery(organizationId, selectedDocId || undefined);

  // Sync modal with URL
  useEffect(() => {
    const match = pathname.match(/^\/docs\/([^/]+)$/);
    if (match && match[1]) {
      setSelectedDocId(match[1]);
    } else {
      setSelectedDocId(null);
    }
  }, [pathname]);

  const docsResult = useDocsQuery(organizationId, {
    projectId,
    folderId: selectedFolderId,
    search,
  });

  const foldersResult = useDocFoldersQuery(organizationId, projectId);
  const allFolders = foldersResult.data ?? [];
  const emptyDocs = [] as DocRecord[];
  const rawDocs = docsResult.data ?? emptyDocs;
  const docs = rawDocs.filter((doc) => !doc.deletedAt);
  const isLoading = docsResult.isLoading || foldersResult.isLoading;

  const currentSubfolders = getSubfolders(allFolders, selectedFolderId);
  const breadcrumbPath = buildBreadcrumbPath(allFolders, selectedFolderId);

  // Combine folders and docs into single table
  const tableData = [
    ...currentSubfolders.map((folder) => ({
      id: folder.id,
      type: 'folder' as const,
      name: folder.name,
      updatedAt: folder.updatedAt || folder.createdAt,
      itemCount: allFolders.filter((f) => f.parentId === folder.id).length,
    })),
    ...docs.map((doc) => ({
      id: doc.id,
      type: 'doc' as const,
      name: doc.title || "Untitled",
      updatedAt: doc.updatedAt,
      itemCount: null,
    })),
  ];

  const columns: QentrahColumnDef<any>[] = [
    {
      headerName: "Name",
      field: "name",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (p: any) => {
        const isFolder = p.data?.type === 'folder';
        return (
          <div className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:bg-muted/50 rounded px-1 py-1">
            {isFolder ? (
              <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm font-medium text-foreground truncate">
              {p.data?.name}
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Type",
      field: "type",
      width: 100,
      valueGetter: (p: any) => p.data?.type === 'folder' ? 'Folder' : 'Document',
    },
    {
      headerName: "Items",
      field: "itemCount",
      width: 80,
      valueGetter: (p: any) => p.data?.itemCount ?? "—",
    },
    {
      headerName: "Updated",
      field: "updatedAt",
      width: 140,
      valueGetter: (p: any) => {
        const value = p.data?.updatedAt;
        if (!value) return "—";
        return new Date(value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
  ];



  const handleRowClick = (event: any) => {
    const row = event.data;
    if (row?.type === 'folder') {
      setSelectedFolderId(row.id);
    } else if (row?.id) {
      router.push(`/docs/${row.id}`);
    }
  };

  const handleCloseModal = () => {
    router.push("/docs");
  };

  async function handleCreateFolder() {
    if (!organizationId || !newFolderName.trim()) return;
    await createDocFolderRequest(organizationId, {
      name: newFolderName.trim(),
      parentId: selectedFolderId ?? "",
      projectId: projectId ?? "",
    });
    setNewFolderName("");
    setShowNewFolder(false);
    setShowFolderGuidance(true);
  }

  function handleCreateDoc(title: string, templateId?: string) {
    setShowCreateForm(false);
    createDocRequest(organizationId!, {
      ...emptyDoc,
      title,
      folderId: selectedFolderId ?? "",
      projectId: projectId ?? "",
    }).then((result) => {
      router.push(`/docs/${result.doc.id}`);
    });
  }

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-9 rounded-lg px-4 text-sm font-medium"
            >
              <Folder className="w-4 h-4 mr-2" />
              {t("folders.newFolder")}
            </Button>
            <Button
              type="button"
              disabled
              className="h-9 rounded-lg px-4 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("actions.newDoc")}
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        </div>
      </div>
    );
  }



  if (tableData.length === 0 && !showNewFolder && !showFolderGuidance) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewFolder(true)}
              className="h-9 rounded-lg px-4 text-sm font-medium"
            >
              <Folder className="w-4 h-4 mr-2" />
              {t("folders.newFolder")}
            </Button>
            <Button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="h-9 rounded-lg px-4 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("actions.newDoc")}
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace icon={FileText} title={t("empty.title")} description={t("empty.description")} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
        <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowNewFolder(true)}
            className="h-9 rounded-lg px-4 text-sm font-medium"
          >
            <Folder className="w-4 h-4 mr-2" />
            {t("folders.newFolder")}
          </Button>
          <Button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="h-9 rounded-lg px-4 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("actions.newDoc")}
          </Button>
        </div>
      </div>

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
        <div className="ml-auto flex items-center gap-2">
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

      {/* Table */}
      <div className="flex-1 overflow-auto bg-muted/20">
        {showNewFolder ? (
          <div className="m-6 flex gap-2 items-center p-4 border border-dashed border-border bg-muted/30 rounded-lg">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="h-9 flex-1 rounded-lg border border-border bg-background px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/20"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCreateFolder}
              className="h-9 text-sm"
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
              className="h-9 text-sm"
            >
              Cancel
            </Button>
          </div>
        ) : null}

        {showFolderGuidance && (
          <div className="m-6 p-6 border border-border bg-card rounded-lg">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Folder created successfully
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Folders help you organize your documents. You can now create your first document in this folder to get started.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setShowFolderGuidance(false);
                      setShowCreateForm(true);
                    }}
                    className="h-8 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create first document
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFolderGuidance(false)}
                    className="h-8 text-sm"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <DocsTableSkeleton />
        ) : (
          <QentrahTable
            rows={tableData}
            columns={columns}
            onRowClicked={handleRowClick}
            getRowId={(row) => row.id}
            className="h-full"
            suppressRowClickSelection={false}
            rowSelection="single"
          />
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

      {/* Document editor modal */}
      <Dialog open={!!selectedDocId} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-[90vh] p-0" showCloseButton={false}>
          {selectedDoc && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
                <h1 className="text-lg font-semibold text-foreground truncate flex-1">
                  {selectedDoc.title || "Untitled"}
                </h1>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCloseModal}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <DocEditor
                  doc={selectedDoc}
                  organizationId={organizationId!}
                  onClose={handleCloseModal}
                  onSaved={() => {}}
                  onDeleted={handleCloseModal}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

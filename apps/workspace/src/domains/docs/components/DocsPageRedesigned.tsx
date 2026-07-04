"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Plus, FileText, Search, Folder } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useDocsQuery, useDocFoldersQuery, createDocRequest, createDocFolderRequest } from "../api/docs";
import type { DocRecord, DocFolder } from "../docs.types";
import { cn } from "@/lib/utils";
import { emptyDoc } from "../docs.constants";
import { DocEditor } from "./doc-editor";
import { DocCreateForm } from "./doc-create-form";
import { buildBreadcrumbPath, getSubfolders } from "../lib/folder-utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";

export function DocsPageRedesigned({
  projectId: projectIdProp,
}: { projectId?: string | null } = {}) {
  const t = useTranslations("Docs");
  const common = useTranslations("Common");
  const session = useAuthSession();
  const [activeView, setActiveView] = useState<ViewMode>('table');
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

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
  const docs = rawDocs.filter((doc) => !doc.deletedAt);

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
          <div className="flex items-center gap-2.5 min-w-0">
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
      valueFormatter: (p: any) => p.value === 'folder' ? 'Folder' : 'Document',
    },
    {
      headerName: "Items",
      field: "itemCount",
      width: 80,
      valueFormatter: (p: any) => p.value ?? "—",
    },
    {
      headerName: "Updated",
      field: "updatedAt",
      width: 140,
      valueFormatter: (p: any) => {
        if (!p.value) return "—";
        return new Date(p.value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
  ];

  const actions: HeaderAction[] = [
    {
      label: t("actions.newDoc"),
      icon: <Plus className="w-4 h-4" />,
      onClick: () => setShowCreateForm(true),
      variant: "primary",
    },
  ];

  const availableViews: ViewMode[] = ['table', 'board', 'calendar', 'timeline', 'dashboard', 'widgets'];

  const handleRowClick = (row: any) => {
    if (row.type === 'folder') {
      setSelectedFolderId(row.id);
    } else {
      const doc = docs.find((d) => d.id === row.id);
      if (doc) setSelectedDoc(doc);
    }
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
  }

  function handleCreateDoc(title: string, templateId?: string) {
    setShowCreateForm(false);
    createDocRequest(organizationId!, {
      ...emptyDoc,
      title,
      folderId: selectedFolderId ?? "",
      projectId: projectId ?? "",
    }).then((result) => {
      const newDoc = docs.find((d) => d.id === result.doc.id);
      if (newDoc) setSelectedDoc(newDoc);
    });
  }

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Documents"
          currentSection="All Documents"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        </div>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Documents"
          currentSection="All Documents"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace icon={FileText} title={t("empty.title")} description={t("empty.description")} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DomainHeader
        domain="Documents"
        currentSection={`${tableData.length} item${tableData.length !== 1 ? "s" : ""}`}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
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

      {/* View content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'table' && (
          <div className="h-full p-6">
            {showNewFolder ? (
              <div className="mb-4 flex gap-2 items-center p-4 border border-dashed border-border bg-muted/30 rounded-lg">
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
            <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
              <QentrahTable
                rows={tableData}
                columns={columns}
                density="compact"
                height="100%"
                rowSelection="single"
                getRowId={(row) => row.id}
                onRowClicked={(p) => handleRowClick(p.data)}
              />
            </div>
          </div>
        )}

        {activeView === 'board' && (
          <div className="h-full p-6">
            <ViewLoading style="board" message="Board view coming soon" />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="h-full p-6">
            <ViewLoading style="calendar" message="Calendar view coming soon" />
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="h-full p-6">
            <ViewLoading style="table" message="Timeline view coming soon" />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Dashboard view coming soon" />
          </div>
        )}

        {activeView === 'widgets' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Widgets view coming soon" />
          </div>
        )}
      </div>

      {/* Doc editor drawer */}
      {selectedDoc && organizationId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] dark:bg-black/45"
            onClick={() => setSelectedDoc(null)}
          />
          <div className="relative z-10 w-[800px] h-[600px] min-w-[400px] min-h-[300px] rounded-2xl border border-border bg-background overflow-hidden flex flex-col">
            <DocEditor
              key={selectedDoc.id}
              doc={selectedDoc}
              organizationId={organizationId}
              onClose={() => setSelectedDoc(null)}
              onSaved={() => {}}
              onDeleted={() => {
                setSelectedDoc(null);
              }}
              isFullscreen={false}
              onToggleFullscreen={() => {}}
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

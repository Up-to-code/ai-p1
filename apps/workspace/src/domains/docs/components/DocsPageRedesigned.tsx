"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, FileText, Info } from "lucide-react";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useDocsQuery, useDocFoldersQuery, createDocRequest, createDocFolderRequest, useDocQuery } from "../api/docs";
import type { DocRecord } from "../docs.types";
import { DOC_TEMPLATE_CONTENT, DOC_TEMPLATE_TYPES, emptyDoc } from "../docs.constants";
import { DocCreateForm } from "./doc-create-form";
import { buildBreadcrumbPath, getSubfolders } from "../lib/folder-utils";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "@/i18n/routing";
import { DocEditor } from "./doc-editor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DocsTableSkeleton } from "./docs-table-skeleton";
import { DocsListTable, type DocsListItem } from "./docs-list-table";
import { Input } from "@/components/ui/input";
import { DocTemplateCover } from "./doc-template-cover";
import { DocsResourceLayout } from "./docs-resource-layout";

export function DocsPageRedesigned({
  projectId: projectIdProp,
}: { projectId?: string | null } = {}) {
  const t = useTranslations("Docs");
  const common = useTranslations("Common");
  const session = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showFolderGuidance, setShowFolderGuidance] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [initialTemplateId, setInitialTemplateId] = useState("blank");

  const filter = searchParams.get("filter");
  const isTemplatesView = searchParams.get("template") === "true";

  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const projectId = projectIdProp ?? undefined;

  const { data: selectedDoc } = useDocQuery(organizationId, selectedDocId || undefined);

  // Sync modal with URL
  useEffect(() => {
    const match = pathname.match(/^\/docs\/([^/]+)$/);
    if (match && match[1]) {
      setSelectedDocId(match[1]);
    } else {
      setSelectedDocId(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (searchParams.get("new") !== "true") return;
    setInitialTemplateId("blank");
    setShowCreateForm(true);
  }, [searchParams]);

  const docsResult = useDocsQuery(organizationId, {
    projectId,
    folderId: selectedFolderId,
    search,
  });

  const foldersResult = useDocFoldersQuery(organizationId, projectId);
  const allFolders = foldersResult.data ?? [];
  const emptyDocs = [] as DocRecord[];
  const rawDocs = docsResult.data ?? emptyDocs;
  const activeDocs = rawDocs.filter((doc) => !doc.deletedAt);
  const docs = filter === "shared"
    ? activeDocs.filter((doc) => doc.createdByUserId !== session.user.id && doc.visibility !== "private")
    : filter === "recent"
      ? [...activeDocs].sort((left, right) => right.updatedAt - left.updatedAt)
      : activeDocs;
  const isLoading = docsResult.isLoading || foldersResult.isLoading;

  const currentSubfolders = getSubfolders(allFolders, selectedFolderId);
  const breadcrumbPath = buildBreadcrumbPath(allFolders, selectedFolderId);

  // Combine folders and docs into single table
  const tableData: DocsListItem[] = [
    ...(filter || isTemplatesView ? [] : currentSubfolders.map((folder) => ({
      id: folder.id,
      type: 'folder' as const,
      name: folder.name,
      updatedAt: folder.updatedAt || folder.createdAt,
      itemCount: allFolders.filter((f) => f.parentId === folder.id).length,
    }))),
    ...docs.map((doc) => ({
      id: doc.id,
      type: 'doc' as const,
      name: doc.title || "Untitled",
      updatedAt: doc.updatedAt,
      itemCount: null,
    })),
  ];

  const handleItemOpen = (item: DocsListItem) => {
    if (item.type === "folder") {
      setSelectedFolderId(item.id);
    } else {
      router.push(`/docs/${item.id}`);
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

  function openCreateDoc(templateId = "blank") {
    setInitialTemplateId(templateId);
    setShowCreateForm(true);
  }

  function handleCreateDoc(title: string, templateId?: string) {
    setShowCreateForm(false);
    createDocRequest(organizationId!, {
      ...emptyDoc,
      title,
      content: templateId ? (DOC_TEMPLATE_CONTENT[templateId] ?? "") : "",
      folderId: selectedFolderId ?? "",
      projectId: projectId ?? "",
    }).then((result) => {
      router.push(`/docs/${result.doc.id}`);
    });
  }

  if (workspaceStatus !== "ready") {
    return (
      <DocsResourceLayout
        onNewFolder={() => {}}
        onNewDoc={() => {}}
        breadcrumbPath={[]}
        selectedFolderId={selectedFolderId}
        onSelectFolder={() => {}}
        search={search}
        onSearchChange={() => {}}
      >
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        </div>
      </DocsResourceLayout>
    );
  }



  if (!isLoading && !isTemplatesView && tableData.length === 0 && !showNewFolder && !showFolderGuidance) {
    return (
      <DocsResourceLayout
        onNewFolder={() => setShowNewFolder(true)}
        onNewDoc={() => openCreateDoc()}
        breadcrumbPath={breadcrumbPath}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        search={search}
        onSearchChange={setSearch}
      >
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace
            icon={FileText}
            title={filter === "shared" ? "No shared documents" : filter === "recent" ? "No recent documents" : t("empty.title")}
            description={filter === "shared" ? "Documents shared by teammates will appear here." : filter === "recent" ? "Documents you recently worked in will appear here." : t("empty.description")}
          />
        </div>
      </DocsResourceLayout>
    );
  }

  return (
    <DocsResourceLayout
      onNewFolder={() => setShowNewFolder(true)}
      onNewDoc={() => openCreateDoc()}
      breadcrumbPath={breadcrumbPath}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      search={search}
      onSearchChange={setSearch}
    >
      {/* Content */}
      <div className="flex-1 overflow-auto bg-[var(--q-bg)]">
        {showNewFolder ? (
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="h-9 flex-1 text-sm font-medium"
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
          <div className="border-b border-border px-6 py-5">
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

        {isTemplatesView ? (
          <div className="grid gap-3 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {DOC_TEMPLATE_TYPES.map((template) => (
              <Button
                key={template.id}
                type="button"
                variant="outline"
                onClick={() => openCreateDoc(template.id)}
                className="h-auto min-w-0 flex-col items-stretch justify-start gap-0 overflow-hidden rounded-xl p-0 text-left"
              >
                <DocTemplateCover templateId={template.id} className="aspect-[3/2] w-full border-b border-border/60" />
                <span className="block p-3">
                  <span className="block text-sm font-medium text-foreground">{template.label}</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">Start a new document with this structure.</span>
                </span>
              </Button>
            ))}
          </div>
        ) : isLoading ? (
          <DocsTableSkeleton />
        ) : (
          <DocsListTable items={tableData} onOpen={handleItemOpen} />
        )}
      </div>

      {/* Create doc form modal */}
      {showCreateForm && (
        <DocCreateForm
          key={initialTemplateId}
          onClose={() => {
            setShowCreateForm(false);
            if (searchParams.get("new") === "true") router.push("/docs");
          }}
          onSubmit={handleCreateDoc}
          folderId={selectedFolderId}
          initialTemplateId={initialTemplateId}
        />
      )}

      {/* Document editor modal */}
      <Dialog open={!!selectedDocId} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-[90vh] p-0" showCloseButton={false}>
          {selectedDoc && (
            <div className="flex flex-col h-full">
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
    </DocsResourceLayout>
  );
}

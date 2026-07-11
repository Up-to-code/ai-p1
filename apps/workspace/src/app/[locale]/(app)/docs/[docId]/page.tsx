"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileText } from "lucide-react";
import { EmptyWorkspace } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useDocQuery } from "@/domains/docs/api/docs";
import { DocEditor } from "@/domains/docs/components/doc-editor";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { WorkspaceQueryState } from "@/components/shared/crud-ui";
import { DocEditorSkeleton } from "@/domains/docs/components/doc-editor-skeleton";

export default function DocEditorPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const t = useTranslations("Docs");
  const session = useAuthSession();
  const router = useRouter();
  const { docId } = use(params);

  // Redirect if docId is undefined or invalid
  if (!docId || docId === "undefined") {
    router.push("/docs");
    return null;
  }

  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const { data: doc, isLoading } = useDocQuery(organizationId, docId);

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/docs")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <DocEditorSkeleton />;
  }

  if (!doc) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/docs")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace
            icon={FileText}
            title="Document not found"
            description="The document you're looking for doesn't exist or you don't have access to it."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <DocEditor
          doc={doc}
          organizationId={organizationId!}
          onClose={() => router.push("/docs")}
          onSaved={() => {}}
          onDeleted={() => router.push("/docs")}
        />
      </div>
    </div>
  );
}

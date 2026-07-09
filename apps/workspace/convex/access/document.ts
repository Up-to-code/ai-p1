import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { canPerformOrganizationAction } from "../permissions";
import { resolveProjectAccess, type ProjectAccess } from "./project";

type DocumentAccessCtx = Pick<QueryCtx, "auth" | "db" | "runQuery">;
type Document = Doc<"docs">;
type Folder = Doc<"docFolders">;
type Project = Doc<"projects">;

export type DocumentAccessErrorCode =
  | "DOCUMENT_ACCESS_DENIED"
  | "DOCUMENT_UPDATE_DENIED"
  | "DOCUMENT_SCOPE_DENIED"
  | "DOCUMENT_SCOPE_CONFLICT";

export interface DocumentAccess {
  readonly actor: ProjectAccess["actor"];
  readonly organizationId: string;
  canReadDocument(document: Document): Promise<boolean>;
  canUpdateDocument(document: Document): Promise<boolean>;
  canReadFolder(folder: Folder): Promise<boolean>;
  canUpdateFolder(folder: Folder): Promise<boolean>;
  canReadInProject(projectId?: string): Promise<boolean>;
  canCreateInProject(projectId?: string): Promise<boolean>;
  filterReadableDocuments(documents: readonly Document[]): Promise<Document[]>;
  filterReadableFolders(folders: readonly Folder[]): Promise<Folder[]>;
  assertCanReadDocument(document: Document): Promise<void>;
  assertCanUpdateDocument(document: Document): Promise<void>;
  assertCanUpdateFolder(folder: Folder): Promise<void>;
  assertCanCreateInProject(projectId?: string): Promise<void>;
  assertMatchingScope(
    source: { projectId?: string },
    target: { projectId?: string },
  ): void;
}

function activeInOrganization(
  record: { organizationId: string; deletedAt?: number },
  organizationId: string,
) {
  return record.organizationId === organizationId && !record.deletedAt;
}

function accessError(
  code: DocumentAccessErrorCode,
  message: string,
  organizationId: string,
  resourceId?: string,
) {
  return new ConvexError({ code, message, organizationId, resourceId });
}

export async function resolveDocumentAccess(
  ctx: DocumentAccessCtx,
  organizationId: string,
): Promise<DocumentAccess> {
  const projectAccess = await resolveProjectAccess(ctx, organizationId);
  const projectCache = new Map<string, Promise<Project | null>>();

  const getProject = (projectId?: string): Promise<Project | null> => {
    if (!projectId) return Promise.resolve(null);
    const cached = projectCache.get(projectId);
    if (cached) return cached;

    const project = ctx.db
      .get(projectId as Id<"projects">)
      .then((candidate) =>
        candidate &&
        candidate.organizationId === organizationId &&
        !candidate.deletedAt &&
        candidate.recordState !== "deleted"
          ? candidate
          : null,
      );
    projectCache.set(projectId, project);
    return project;
  };

  const canPerformUnscopedAction = (
    action: "create" | "read" | "update" | "delete",
  ) =>
    canPerformOrganizationAction(
      ctx,
      organizationId,
      projectAccess.actor.userId,
      "document",
      action,
    );

  const canReadDocument = async (document: Document) => {
    if (!activeInOrganization(document, organizationId)) return false;

    const documentVisible =
      document.createdByUserId === projectAccess.actor.userId ||
      projectAccess.organizationRole === "owner" ||
      projectAccess.organizationRole === "admin" ||
      (document.visibility !== "private" &&
        (await canPerformUnscopedAction("read")));
    if (!documentVisible) return false;

    if (!document.projectId) return true;
    const project = await getProject(document.projectId);
    return Boolean(project && projectAccess.canRead(project));
  };

  const canUpdateDocument = async (document: Document) => {
    if (!activeInOrganization(document, organizationId)) return false;
    if (!document.projectId) return canPerformUnscopedAction("update");
    const project = await getProject(document.projectId);
    return Boolean(project && projectAccess.canUpdate(project));
  };

  const canReadFolder = async (folder: Folder) => {
    if (!activeInOrganization(folder, organizationId)) return false;
    if (!folder.projectId) return canPerformUnscopedAction("read");
    const project = await getProject(folder.projectId);
    return Boolean(project && projectAccess.canRead(project));
  };

  const canUpdateFolder = async (folder: Folder) => {
    if (!activeInOrganization(folder, organizationId)) return false;
    if (!folder.projectId) return canPerformUnscopedAction("update");
    const project = await getProject(folder.projectId);
    return Boolean(project && projectAccess.canUpdate(project));
  };

  const canCreateInProject = async (projectId?: string) => {
    if (!projectId) return canPerformUnscopedAction("create");
    const project = await getProject(projectId);
    return Boolean(project && projectAccess.canUpdate(project));
  };

  const canReadInProject = async (projectId?: string) => {
    if (!projectId) return canPerformUnscopedAction("read");
    const project = await getProject(projectId);
    return Boolean(project && projectAccess.canRead(project));
  };

  const assertMatchingScope: DocumentAccess["assertMatchingScope"] = (
    source,
    target,
  ) => {
    if ((source.projectId ?? undefined) !== (target.projectId ?? undefined)) {
      throw accessError(
        "DOCUMENT_SCOPE_CONFLICT",
        "Documents and folders must belong to the same project scope.",
        organizationId,
      );
    }
  };

  return {
    actor: projectAccess.actor,
    organizationId,
    canReadDocument,
    canUpdateDocument,
    canReadFolder,
    canUpdateFolder,
    canReadInProject,
    canCreateInProject,
    filterReadableDocuments: async (documents) => {
      const readable = await Promise.all(
        documents.map(async (document) =>
          (await canReadDocument(document)) ? document : null,
        ),
      );
      return readable.filter(
        (document): document is Document => document !== null,
      );
    },
    filterReadableFolders: async (folders) => {
      const readable = await Promise.all(
        folders.map(async (folder) =>
          (await canReadFolder(folder)) ? folder : null,
        ),
      );
      return readable.filter((folder): folder is Folder => folder !== null);
    },
    assertCanReadDocument: async (document) => {
      if (!(await canReadDocument(document))) {
        throw accessError(
          "DOCUMENT_ACCESS_DENIED",
          "You do not have permission to read this document.",
          organizationId,
          document._id,
        );
      }
    },
    assertCanUpdateDocument: async (document) => {
      if (!(await canUpdateDocument(document))) {
        throw accessError(
          "DOCUMENT_UPDATE_DENIED",
          "You do not have permission to update this document.",
          organizationId,
          document._id,
        );
      }
    },
    assertCanUpdateFolder: async (folder) => {
      if (!(await canUpdateFolder(folder))) {
        throw accessError(
          "DOCUMENT_UPDATE_DENIED",
          "You do not have permission to update this folder.",
          organizationId,
          folder._id,
        );
      }
    },
    assertCanCreateInProject: async (projectId) => {
      if (!(await canCreateInProject(projectId))) {
        throw accessError(
          "DOCUMENT_SCOPE_DENIED",
          "You do not have permission to create documents in this scope.",
          organizationId,
          projectId,
        );
      }
    },
    assertMatchingScope,
  };
}

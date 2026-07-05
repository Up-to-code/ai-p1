export type DocVisibility = "private" | "team" | "workspace";

export type CustomField = {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  value: string | number | boolean | null;
  options?: string[]; // For select type
};

export type DocRecord = {
  id: string;
  title: string;
  content?: string;
  folderId?: string;
  projectId?: string;
  visibility: DocVisibility;
  tags?: string[];
  customFields?: CustomField[];
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type DocFolder = {
  id: string;
  organizationId: string;
  name: string;
  parentId?: string;
  projectId?: string;
  icon?: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type DocFormValues = {
  title: string;
  content: string;
  folderId: string;
  projectId: string;
  visibility: DocVisibility;
  tags: string;
  customFields?: CustomField[];
};

export type DocFolderFormValues = {
  name: string;
  parentId: string;
  projectId: string;
};

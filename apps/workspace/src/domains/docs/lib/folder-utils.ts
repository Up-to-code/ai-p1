import type { DocFolder } from "../docs.types";

export function buildBreadcrumbPath(
  folders: DocFolder[],
  selectedFolderId: string | null,
): DocFolder[] {
  if (!selectedFolderId) return [];
  const map = new Map<string, DocFolder>();
  for (const folder of folders) map.set(folder.id, folder);
  const path: DocFolder[] = [];
  let current = map.get(selectedFolderId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return path;
}

export function getSubfolders(folders: DocFolder[], parentId: string | null): DocFolder[] {
  return folders.filter((folder) => {
    if (folder.deletedAt) return false;
    if (parentId === null) return !folder.parentId;
    return folder.parentId === parentId;
  });
}

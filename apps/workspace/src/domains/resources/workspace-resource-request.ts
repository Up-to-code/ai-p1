// Re-export from focused modules for backward compatibility.
// Prefer importing directly from the specific module in new code.

export { organizationApiPath, organizationResourcePath, organizationReadPath } from "./routing";
export { workspaceFetch, workspaceMutation } from "./fetch";
export { useWorkspacePagedResource, useWorkspaceIndexedResource, useWorkspaceResource, useWorkspaceResourceResult } from "./hooks";
export type { WorkspaceResourceFilters, IndexedInfinitePage } from "./types";

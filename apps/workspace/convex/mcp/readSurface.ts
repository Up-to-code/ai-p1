import { presentWorkspaceRecord } from "../shared/present";
import { isPublicWorkspaceRecord } from "../workspace/businessData";
import { cappedSearchResult, matchesSearch, pagedResult } from "./toolInputs";

type PageResult<TRecord> = {
  page: TRecord[];
  isDone: boolean;
  continueCursor: string;
};

type WorkspaceRecord = {
  _id: string;
  visibility?: "private" | "team" | "workspace" | "organization" | "space_members";
  deletedAt?: number;
  [key: string]: unknown;
};

export function mcpPublicWorkspaceRecords<TRecord extends WorkspaceRecord>(
  records: TRecord[],
  search?: string,
  searchValues?: (record: TRecord) => Array<string | undefined>,
) {
  return records
    .filter((record) => !record.deletedAt)
    .filter((record) => isPublicWorkspaceRecord(record as { visibility?: "private" | "team" | "workspace" | "organization" | "space_members" }))
    .filter((record) => !search || matchesSearch(search, searchValues?.(record) ?? []));
}

export function mcpPublicWorkspacePage<TRecord extends WorkspaceRecord>(page: PageResult<TRecord>) {
  return pagedResult(
    {
      ...page,
      page: mcpPublicWorkspaceRecords(page.page),
    },
    presentWorkspaceRecord,
  );
}

export function mcpPublicWorkspaceSearchResult<TRecord extends WorkspaceRecord>(
  records: TRecord[],
  params: {
    search: string;
    limit: number;
    searchValues: (record: TRecord) => Array<string | undefined>;
    sort?: (a: TRecord, b: TRecord) => number;
  },
) {
  const filtered = mcpPublicWorkspaceRecords(records, params.search, params.searchValues);
  const ordered = params.sort ? filtered.sort(params.sort) : filtered;
  return cappedSearchResult(ordered.slice(0, params.limit), presentWorkspaceRecord);
}

export function mcpPublicMediaPage<TAsset extends { shareVisibility?: string; sortOrder: number; createdAt: number }>(
  page: PageResult<TAsset>,
) {
  return pagedResult(
    {
      ...page,
      page: page.page
        .filter((asset) => (asset.shareVisibility ?? "private") === "public")
        .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt),
    },
    (asset) => asset,
  );
}

export function mcpCalendarEventPage<TEvent extends { _id: string; deletedAt?: number; startAt: number }>(
  page: PageResult<TEvent>,
) {
  return pagedResult(
    {
      ...page,
      page: page.page.filter((event) => !event.deletedAt).sort((a, b) => a.startAt - b.startAt),
    },
    presentWorkspaceRecord,
  );
}

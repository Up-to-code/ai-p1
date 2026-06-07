import { activeRows } from "./readStats";

type WorkspaceReadRow = {
  deletedAt?: number;
};

type WorkspaceUpdatedRow = WorkspaceReadRow & {
  updatedAt: number;
};

type WorkspaceChronologicalRow = WorkspaceReadRow & {
  startAt: number;
};

type WorkspaceDueRow = WorkspaceReadRow & {
  dueAt?: number;
  dueDate?: string;
};

export function activeWorkspaceRows<TRow extends WorkspaceReadRow>(rows: TRow[]) {
  return activeRows(rows);
}

export function activeUpdatedWorkspaceRows<TRow extends WorkspaceUpdatedRow>(rows: TRow[]) {
  return activeWorkspaceRows(rows).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function activeChronologicalWorkspaceRows<TRow extends WorkspaceChronologicalRow>(rows: TRow[]) {
  return activeWorkspaceRows(rows).sort((a, b) => a.startAt - b.startAt);
}

export function activeDueWorkspaceRows<TRow extends WorkspaceDueRow>(rows: TRow[]) {
  return activeWorkspaceRows(rows).sort(
    (a, b) => dueSortValue(a) - dueSortValue(b),
  );
}

function dueSortValue(row: WorkspaceDueRow) {
  if (row.dueAt) return row.dueAt;
  if (row.dueDate) return Date.parse(row.dueDate);
  return Number.MAX_SAFE_INTEGER;
}

export function boundedWorkspaceReadLimit(limit: number | undefined, fallback: number, max: number) {
  return Math.max(1, Math.min(limit ?? fallback, max));
}

export function workspaceSearchRows<TRow extends WorkspaceReadRow, TStatus extends string>(
  rows: TRow[],
  params: {
    search: string;
    status?: TStatus;
    getStatus: (row: TRow) => string;
    searchValues: (row: TRow) => Array<string | undefined>;
    limit?: number;
  },
) {
  const search = params.search.trim().toLowerCase();
  return activeWorkspaceRows(rows)
    .filter((row) => !params.status || params.getStatus(row) === params.status)
    .filter((row) => params.searchValues(row).some((value) => value?.toLowerCase().includes(search)))
    .slice(0, params.limit ?? 100);
}

export async function presentActiveWorkspacePage<TRow extends WorkspaceReadRow, TPresented>(
  rows: TRow[],
  present: (row: TRow) => Promise<TPresented>,
) {
  return Promise.all(activeWorkspaceRows(rows).map(present));
}

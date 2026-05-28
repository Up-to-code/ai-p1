const MAX_ADMIN_PAGE_SIZE = 100;

export type AdminPage<TRecord> = {
  page: TRecord[];
  isDone: boolean;
  continueCursor: string;
};

export function boundedAdminPaginationOpts<TPagination extends { numItems: number }>(paginationOpts: TPagination) {
  return {
    ...paginationOpts,
    numItems: Math.max(1, Math.min(paginationOpts.numItems, MAX_ADMIN_PAGE_SIZE)),
  };
}

export function adminPageWarnings(search?: string) {
  return search?.trim()
    ? ["Search is bounded to indexed paginated results. Use specific ids, status, or organization filters for large data sets."]
    : [];
}

export function adminMatchesSearch(search: string | undefined, values: Array<string | undefined | null>) {
  const normalized = search?.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => (value ?? "").toLowerCase().includes(normalized));
}

export function adminListPage<TRecord>(
  page: AdminPage<TRecord>,
  params: {
    mapRecord: (record: TRecord) => unknown;
    search?: string;
    searchValues: (record: TRecord) => Array<string | undefined | null>;
  },
) {
  const filtered = page.page.filter((record) => adminMatchesSearch(params.search, params.searchValues(record)));
  return {
    rows: filtered.map(params.mapRecord),
    isDone: page.isDone,
    continueCursor: page.continueCursor,
    warnings: adminPageWarnings(params.search),
  };
}

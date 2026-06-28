import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * Consistent soft-delete helpers.
 * All business tables use a single `deletedAt?: number` field.
 * No `isDeleted` boolean — timestamps are the source of truth.
 */

export function isActive<T extends { deletedAt?: unknown }>(
  doc: T,
): doc is T & { deletedAt: undefined } {
  return doc.deletedAt === undefined;
}

export function filterActive<T extends { deletedAt?: unknown }>(
  docs: T[],
): (T & { deletedAt: undefined })[] {
  return docs.filter(isActive);
}

export function activeRows<TRow extends { deletedAt?: unknown }>(
  rows: TRow[],
): (TRow & { deletedAt: undefined })[] {
  return filterActive(rows);
}

export function sortByUpdated<T extends { updatedAt: number; deletedAt?: unknown }>(
  rows: (T & { deletedAt: undefined })[],
) {
  return [...rows].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function sortByCreated<T extends { createdAt: number; deletedAt?: unknown }>(
  rows: (T & { deletedAt: undefined })[],
) {
  return [...rows].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Paginate active rows with cursor-based pagination.
 */
export function paginateActive<T extends { deletedAt?: unknown; _creationTime: number }>(
  rows: T[],
  cursor?: string,
  limit = 50,
): { page: T[]; nextCursor: string | null; isDone: boolean } {
  const active = activeRows(rows);
  const startIndex = cursor
    ? active.findIndex((r) => r._creationTime.toString() === cursor)
    : 0;

  if (startIndex === -1) {
    return { page: [], nextCursor: null, isDone: true };
  }

  const page = active.slice(startIndex, startIndex + limit);
  const nextCursor = page.length === limit
    ? page[page.length - 1]._creationTime.toString()
    : null;

  return {
    page: page as (T & { deletedAt: undefined })[],
    nextCursor,
    isDone: nextCursor === null,
  };
}

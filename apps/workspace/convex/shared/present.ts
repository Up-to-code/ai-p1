import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * WHY:   Domains need a consistent way to transform database records for API responses.
 * WHAT:  Generic presentation interface that domains can extend with their specific logic.
 * HOW:  Base transformation adds `id` field and strips deleted fields; domains add domain-specific fields.
 */

export function presentWorkspaceRecord<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

export function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function isoTime(timestamp: number) {
  return new Date(timestamp).toISOString().slice(11, 16);
}

export function stripDeletedFields<T extends { deletedAt?: unknown; isDeleted?: unknown }>(doc: T) {
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, ...safe } = doc;
  return safe;
}

export function presentWithVisibility<T extends { _id: string; visibility?: "private" | "team" | "workspace" }>(
  doc: T,
  defaults?: { visibility?: "private" | "team" | "workspace" },
) {
  return { ...doc, id: doc._id, visibility: doc.visibility ?? (defaults?.visibility ?? "private") };
}

/**
 * Generic presentation function that combines common transformations.
 * Domains can use this as a base and add their specific fields.
 */
export function presentBaseRecord<T extends { _id: string; deletedAt?: unknown; isDeleted?: unknown }>(
  doc: T,
) {
  const clean = stripDeletedFields(doc);
  return presentWorkspaceRecord(clean);
}

/**
 * Type for domain-specific presentation functions.
 * Each domain can implement this interface to add their specific transformations.
 */
export type DomainPresenter<TDoc, TPresented> = (doc: TDoc, ctx?: QueryCtx) => Promise<TPresented> | TPresented;

/**
 * Helper to create a list item presenter from a full presenter.
 * List item presenters should omit expensive fields (e.g., nested relations).
 */
export function createListItemPresenter<TDoc, TPresented>(
  fullPresenter: DomainPresenter<TDoc, TPresented>,
): DomainPresenter<TDoc, TPresented> {
  return fullPresenter;
}

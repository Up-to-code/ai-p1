import type { Doc } from "../_generated/dataModel";

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

import type { Doc } from "../_generated/dataModel";

export function presentWorkspaceRecord<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

/** Supports legacy Unix-second timestamps while preserving current millisecond records. */
export function timestampMilliseconds(timestamp: number) {
  return timestamp < 100_000_000_000 ? timestamp * 1_000 : timestamp;
}

export function isoDate(timestamp: number) {
  return new Date(timestampMilliseconds(timestamp)).toISOString().slice(0, 10);
}

export function isoTime(timestamp: number) {
  return new Date(timestampMilliseconds(timestamp)).toISOString().slice(11, 16);
}

export function stripDeletedFields<T extends { deletedAt?: unknown; isDeleted?: unknown }>(doc: T) {
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, ...safe } = doc;
  return safe;
}

export function presentBaseRecord<T extends { _id: string; deletedAt?: unknown; isDeleted?: unknown }>(
  doc: T,
) {
  const clean = stripDeletedFields(doc);
  return presentWorkspaceRecord(clean);
}

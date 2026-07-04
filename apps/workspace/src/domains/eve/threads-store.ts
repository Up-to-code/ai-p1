import { openDB, type IDBPDatabase } from "idb";
import type { SessionState, HandleMessageStreamEvent } from "eve/client";

const DB_NAME = "qentrah:threads";
const DB_VERSION = 2;
const STORE_NAME = "threads";

interface ThreadDB {
  [STORE_NAME]: {
    key: string;
    value: unknown;
  };
}

export interface ThreadStorageEntry {
  id: string;
  title: string;
  sessionState: SessionState | null;
  events: HandleMessageStreamEvent[];
  createdAt: number;
  updatedAt: number;
}

export interface ThreadMeta {
  id: string;
  title: string;
  updatedAt: number;
}

let dbPromise: Promise<IDBPDatabase<ThreadDB>> | null = null;

function getDb(): Promise<IDBPDatabase<ThreadDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ThreadDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

export function threadKey(orgId: string, id: string): string {
  return `thread:${orgId}:${id}`;
}

export function indexKey(orgId: string): string {
  return `thread:${orgId}:index`;
}

export function threadBelongsToOrg(key: string, orgId: string): boolean {
  return key.startsWith(`thread:${orgId}:`);
}

export async function listThreads(orgId: string): Promise<ThreadMeta[]> {
  if (!isBrowser()) return [];
  try {
    const db = await getDb();
    const index = await db.get(STORE_NAME, indexKey(orgId));
    return (index as ThreadMeta[]) ?? [];
  } catch (err) {
    console.error("[threads-store] listThreads failed:", err);
    return [];
  }
}

export async function getThread(orgId: string, id: string): Promise<ThreadStorageEntry | null> {
  if (!isBrowser()) return null;
  try {
    const db = await getDb();
    const entry = await db.get(STORE_NAME, threadKey(orgId, id));
    return (entry as ThreadStorageEntry) ?? null;
  } catch (err) {
    console.error("[threads-store] getThread failed:", err);
    return null;
  }
}

export async function saveThread(
  orgId: string,
  id: string,
  data: Omit<ThreadStorageEntry, "id" | "createdAt" | "updatedAt"> & { createdAt?: number },
): Promise<void> {
  if (!isBrowser()) return;
  try {
    const db = await getDb();
    const key = threadKey(orgId, id);
    const existing = await db.get(STORE_NAME, key);
    const entry: ThreadStorageEntry = {
      id,
      title: data.title,
      sessionState: data.sessionState,
      events: data.events,
      createdAt: data.createdAt ?? (existing as ThreadStorageEntry)?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    await db.put(STORE_NAME, entry, key);

    const ik = indexKey(orgId);
    const index = ((await db.get(STORE_NAME, ik)) as ThreadMeta[]) ?? [];
    const meta: ThreadMeta = { id, title: entry.title, updatedAt: entry.updatedAt };
    const existingIdx = index.findIndex((m) => m.id === id);
    if (existingIdx >= 0) {
      index[existingIdx] = meta;
    } else {
      index.push(meta);
    }
    index.sort((a, b) => b.updatedAt - a.updatedAt);
    await db.put(STORE_NAME, index, ik);
  } catch (err) {
    console.error("[threads-store] saveThread failed:", err);
  }
}

export async function deleteThread(orgId: string, id: string): Promise<void> {
  if (!isBrowser()) return;
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, threadKey(orgId, id));

    const ik = indexKey(orgId);
    const index = ((await db.get(STORE_NAME, ik)) as ThreadMeta[]) ?? [];
    const filtered = index.filter((m) => m.id !== id);
    await db.put(STORE_NAME, filtered, ik);
  } catch (err) {
    console.error("[threads-store] deleteThread failed:", err);
  }
}

export async function renameThread(orgId: string, id: string, title: string): Promise<void> {
  if (!isBrowser()) return;
  try {
    const db = await getDb();
    const key = threadKey(orgId, id);
    const existing = await db.get(STORE_NAME, key);
    if (!existing) return;
    const entry = existing as ThreadStorageEntry;
    entry.title = title;
    entry.updatedAt = Date.now();
    await db.put(STORE_NAME, entry, key);

    const ik = indexKey(orgId);
    const index = ((await db.get(STORE_NAME, ik)) as ThreadMeta[]) ?? [];
    const existingIdx = index.findIndex((m) => m.id === id);
    if (existingIdx >= 0) {
      index[existingIdx] = { id, title, updatedAt: entry.updatedAt };
    }
    await db.put(STORE_NAME, index, ik);
  } catch (err) {
    console.error("[threads-store] renameThread failed:", err);
  }
}

export async function generateThreadId(): Promise<string> {
  return crypto.randomUUID();
}

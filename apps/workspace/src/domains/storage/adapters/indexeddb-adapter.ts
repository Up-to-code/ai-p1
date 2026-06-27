import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type StoredValue = Record<string, unknown> | string | number | boolean | null;

export interface StorageEntry {
  value: StoredValue;
  version: number;
  updatedAt: number;
}

export interface StorageSchema extends DBSchema {
  drafts: {
    key: string;
    value: StorageEntry;
  };
  layouts: {
    key: string;
    value: StorageEntry;
  };
  cache: {
    key: string;
    value: StorageEntry;
  };
  metadata: {
    key: string;
    value: { version: number };
  };
}

const DB_NAME = "qentrah:workspace";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StorageSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<StorageSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<StorageSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts");
        }
        if (!db.objectStoreNames.contains("layouts")) {
          db.createObjectStore("layouts");
        }
        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache");
        }
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata");
        }
      },
    });
  }
  return dbPromise;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

export async function getItem(
  store: "drafts" | "layouts" | "cache",
  key: string,
): Promise<StorageEntry | undefined> {
  if (!isBrowser()) return undefined;
  const db = await getDb();
  return db.get(store, key);
}

export async function setItem(
  store: "drafts" | "layouts" | "cache",
  key: string,
  value: StoredValue,
  version = 1,
): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDb();
  await db.put(store, { value, version, updatedAt: Date.now() }, key);
}

export async function removeItem(
  store: "drafts" | "layouts" | "cache",
  key: string,
): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDb();
  await db.delete(store, key);
}

export async function clearStore(
  store: "drafts" | "layouts" | "cache",
): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDb();
  await db.clear(store);
}

export async function getAllKeys(
  store: "drafts" | "layouts" | "cache",
): Promise<string[]> {
  if (!isBrowser()) return [];
  const db = await getDb();
  return (await db.getAllKeys(store)) as string[];
}

export async function getVersion(
  scope: string,
): Promise<number> {
  if (!isBrowser()) return 0;
  const db = await getDb();
  const entry = await db.get("metadata", scope);
  return entry?.version ?? 0;
}

export async function setVersion(
  scope: string,
  version: number,
): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDb();
  await db.put("metadata", { version }, scope);
}

export async function getNextVersion(
  scope: string,
): Promise<number> {
  const current = await getVersion(scope);
  const next = current + 1;
  await setVersion(scope, next);
  return next;
}

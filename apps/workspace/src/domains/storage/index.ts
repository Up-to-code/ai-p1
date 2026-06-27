export {
  getItem,
  setItem,
  removeItem,
  clearStore,
  getAllKeys,
  getVersion,
  setVersion,
  getNextVersion,
} from "./adapters/indexeddb-adapter";

export type { StoredValue, StorageEntry } from "./adapters/indexeddb-adapter";

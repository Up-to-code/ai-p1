export type UnsafeApiRecord = Record<string, unknown>;

export function createUnsafeApiProxy(source: unknown): UnsafeApiRecord {
  return new Proxy({} as UnsafeApiRecord, {
    get(_target, property) {
      if (typeof property !== "string") {
        return undefined;
      }
      return (source as UnsafeApiRecord | undefined)?.[property];
    },
  });
}

export function createUnsafeApiRecord(source: unknown): UnsafeApiRecord {
  return source as UnsafeApiRecord;
}

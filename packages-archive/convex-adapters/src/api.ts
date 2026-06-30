export {
  createUnsafeApiProxy,
  createUnsafeApiRecord,
  type UnsafeApiRecord,
} from "@qentrah/platform-core/convex-api";

import type { UnsafeApiRecord } from "@qentrah/platform-core/convex-api";

export function getApiRefs<TRefs extends Record<string, unknown>>(
  apiUnsafe: UnsafeApiRecord,
  path: string,
): TRefs {
  return apiUnsafe[path] as TRefs;
}

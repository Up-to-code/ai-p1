import assert from "node:assert/strict";
import test from "node:test";

import type * as ExpoRuntime from "../runtime/expoRuntime";

type RuntimeUrlGetter = typeof ExpoRuntime.getAuthUrl | typeof ExpoRuntime.getWorkspaceApiUrl;

test("expo runtime exposes Workspace API URL getters for dynamic native clients", () => {
  const getterNames: Array<keyof Pick<typeof ExpoRuntime, "getAuthUrl" | "getWorkspaceApiUrl">> = [
    "getAuthUrl",
    "getWorkspaceApiUrl",
  ];

  assert.deepEqual(getterNames, ["getAuthUrl", "getWorkspaceApiUrl"]);
});

const _runtimeUrlGetterTypeCheck: RuntimeUrlGetter | null = null;
void _runtimeUrlGetterTypeCheck;

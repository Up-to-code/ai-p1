"use client";

import { useEffect } from "react";
import { useAccessCheckpointsStore } from "@/stores/access-checkpoints-store";
import { COMMON_PERMISSION_GROUPS, mergeCheckpointScopes } from "@/validation/access-checkpoints";

const COMMON_SCOPES: ReadonlySet<string> = new Set(COMMON_PERMISSION_GROUPS.flatMap((group) => group.scopes.map((scope) => scope.value)));

export function useAccessCheckpoints(initialScopes: string[] = []) {
  const selectedScopes = useAccessCheckpointsStore((state) => state.selectedScopes);
  const manualScopes = useAccessCheckpointsStore((state) => state.manualScopes);
  const toggleScope = useAccessCheckpointsStore((state) => state.toggleScope);
  const setManualScopes = useAccessCheckpointsStore((state) => state.setManualScopes);
  const reset = useAccessCheckpointsStore((state) => state.reset);

  useEffect(() => {
    const selected = initialScopes.filter((scope) => COMMON_SCOPES.has(scope));
    const manual = initialScopes.filter((scope) => !COMMON_SCOPES.has(scope)).join("\n");
    reset(selected, manual);
  }, [initialScopes.join("|"), reset]);

  return {
    groups: COMMON_PERMISSION_GROUPS,
    selectedScopes,
    manualScopes,
    toggleScope,
    setManualScopes,
    resolvedScopes: mergeCheckpointScopes(selectedScopes, manualScopes),
  };
}

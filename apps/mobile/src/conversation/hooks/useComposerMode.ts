import { useMemo } from "react";

import {
  composerModeScrollButtonExtraOffset,
  resolveComposerMode,
} from "@/conversation/lib/composerDockLayout";

export function useComposerMode(isEditing: boolean) {
  return useMemo(() => {
    const mode = resolveComposerMode(isEditing);

    return {
      mode,
      isEditing: mode === "edit",
      scrollButtonExtraOffset: composerModeScrollButtonExtraOffset(mode),
    };
  }, [isEditing]);
}

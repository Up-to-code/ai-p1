import { useMemo } from "react";
import { Platform } from "react-native";

type ComposerSheetMotionConfig = {
  openFocusDelayMs: number;
  closeDockFocusDelayMs: number;
  enterDurationMs: number;
  exitDurationMs: number;
};

export function useComposerSheetMotion(isCompactDevice: boolean): ComposerSheetMotionConfig {
  return useMemo(() => {
    if (Platform.OS === "ios") {
      return {
        openFocusDelayMs: isCompactDevice ? 250 : 220,
        closeDockFocusDelayMs: isCompactDevice ? 280 : 240,
        enterDurationMs: isCompactDevice ? 220 : 180,
        exitDurationMs: isCompactDevice ? 170 : 140,
      };
    }

    return {
      openFocusDelayMs: isCompactDevice ? 140 : 120,
      closeDockFocusDelayMs: isCompactDevice ? 170 : 140,
      enterDurationMs: isCompactDevice ? 200 : 180,
      exitDurationMs: isCompactDevice ? 150 : 130,
    };
  }, [isCompactDevice]);
}

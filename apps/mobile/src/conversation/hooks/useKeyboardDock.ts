import { Platform } from "react-native";

import {
  calculateKeyboardDock,
  type KeyboardDockLayout,
} from "@/conversation/lib/keyboardDockLayout";

export function useKeyboardDock({
  bottomInset,
  dockHeight,
  keyboardHeight,
  keyboardGap = 4,
}: {
  bottomInset: number;
  dockHeight: number;
  keyboardHeight: number;
  keyboardGap?: number;
}): KeyboardDockLayout {
  return calculateKeyboardDock({
    bottomInset,
    dockHeight,
    keyboardHeight,
    keyboardGap,
    isIos: Platform.OS === "ios",
  });
}

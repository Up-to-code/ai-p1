import { Platform } from "react-native";

type KeyboardDockResult = {
  dockBottomOffset: number;
  listBottomPadding: number;
  keyboardVisible: boolean;
};

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
}): KeyboardDockResult {
  const keyboardVisible = keyboardHeight > 0;
  const restingGap = 0;
  const composerBuffer = Math.max(Math.min(bottomInset, 12), 8);

  return {
    dockBottomOffset:
      Platform.OS === "ios" && keyboardVisible
        ? keyboardHeight + keyboardGap + 4
        : 0,
    listBottomPadding:
      Math.min(dockHeight, 200) +
      composerBuffer +
      (Platform.OS === "ios" && keyboardVisible
        ? keyboardHeight + keyboardGap + 4
        : restingGap),
    keyboardVisible,
  };
}

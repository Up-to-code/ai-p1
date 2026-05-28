export type KeyboardDockLayout = {
  dockBottomOffset: number;
  listBottomPadding: number;
  scrollButtonBottomOffset: number;
  keyboardVisible: boolean;
};

export function calculateKeyboardDock({
  bottomInset,
  dockHeight,
  keyboardHeight,
  keyboardGap = 4,
  isIos,
}: {
  bottomInset: number;
  dockHeight: number;
  keyboardHeight: number;
  keyboardGap?: number;
  isIos: boolean;
}): KeyboardDockLayout {
  const keyboardVisible = keyboardHeight > 0;
  const restingGap = 0;
  const composerBuffer = Math.max(Math.min(bottomInset, 12), 8);
  const measuredDockHeight = Math.max(dockHeight, 0);
  const keyboardOffset =
    isIos && keyboardVisible
      ? keyboardHeight + keyboardGap + 4
      : 0;
  const dockBottomOffset = keyboardOffset;

  return {
    dockBottomOffset,
    listBottomPadding:
      measuredDockHeight +
      composerBuffer +
      (keyboardVisible ? keyboardOffset : restingGap),
    scrollButtonBottomOffset:
      dockBottomOffset + measuredDockHeight + composerBuffer + 8,
    keyboardVisible,
  };
}

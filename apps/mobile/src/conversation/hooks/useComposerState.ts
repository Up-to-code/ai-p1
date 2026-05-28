import { useEffect, useState } from "react";
import type { NativeSyntheticEvent, TextInputContentSizeChangeEventData } from "react-native";

import {
  clampComposerInputHeight,
  composerMeasuredLineCount,
  COMPOSER_INPUT_LINE_HEIGHT,
  COMPOSER_INPUT_MAX_HEIGHT,
  COMPOSER_INPUT_MIN_HEIGHT,
  isComposerInputExpanded,
  nextComposerMeasuredHeight,
  resolveComposerMeasuredHeight,
  shouldShowComposerExpansion,
  shouldScrollComposerInput,
} from "@/conversation/lib/composerDockLayout";

const INPUT_MIN_HEIGHT = COMPOSER_INPUT_MIN_HEIGHT;
const INPUT_LINE_HEIGHT = COMPOSER_INPUT_LINE_HEIGHT;
const INPUT_MAX_HEIGHT = COMPOSER_INPUT_MAX_HEIGHT;

export function useComposerState(draftText: string) {
  const [measuredContentHeight, setMeasuredContentHeight] = useState(INPUT_MIN_HEIGHT);

  useEffect(() => {
    if (!draftText.trim()) {
      setMeasuredContentHeight(INPUT_MIN_HEIGHT);
    }
  }, [draftText]);

  const resolvedContentHeight = resolveComposerMeasuredHeight(draftText, measuredContentHeight);
  const inputHeight = clampComposerInputHeight(resolvedContentHeight);
  const measuredLineCount = composerMeasuredLineCount(inputHeight);
  const inputExpanded = isComposerInputExpanded(inputHeight, draftText);
  const showExpandComposer = shouldShowComposerExpansion(inputHeight);
  const inputScrollable = shouldScrollComposerInput(resolvedContentHeight);

  const handleContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    setMeasuredContentHeight((currentHeight) =>
      nextComposerMeasuredHeight(currentHeight, event.nativeEvent.contentSize.height),
    );
  };

  const resetComposerState = () => { setMeasuredContentHeight(INPUT_MIN_HEIGHT); };

  return {
    inputHeight,
    inputExpanded,
    inputScrollable,
    measuredLineCount,
    showExpandComposer,
    handleContentSizeChange,
    resetComposerState,
  };
}
export const composerStateConstants = { INPUT_MIN_HEIGHT, INPUT_MAX_HEIGHT };

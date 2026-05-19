import { useEffect, useState } from "react";
import type { NativeSyntheticEvent, TextInputContentSizeChangeEventData } from "react-native";

const INPUT_MIN_HEIGHT = 24;
const INPUT_LINE_HEIGHT = 22;
const INPUT_MAX_VISIBLE_LINES = 3;
const INPUT_MAX_HEIGHT = INPUT_LINE_HEIGHT * INPUT_MAX_VISIBLE_LINES;
const EXPAND_THRESHOLD_HEIGHT = INPUT_MAX_HEIGHT;
const EXPAND_THRESHOLD_LINES = 3;
const HEIGHT_UPDATE_DEADZONE = 2;

function clampHeight(height: number) { return Math.min(Math.max(height, INPUT_MIN_HEIGHT), INPUT_MAX_HEIGHT); }
function getMeasuredLineCount(height: number) { return Math.max(1, Math.round(height / INPUT_LINE_HEIGHT)); }

export function useComposerState(draftText: string) {
  const [measuredContentHeight, setMeasuredContentHeight] = useState(INPUT_MIN_HEIGHT);

  useEffect(() => {
    if (!draftText.trim()) {
      setMeasuredContentHeight(INPUT_MIN_HEIGHT);
    }
  }, [draftText]);

  const inputHeight = clampHeight(measuredContentHeight);
  const measuredLineCount = getMeasuredLineCount(inputHeight);
  const inputExpanded = measuredLineCount > 1 || draftText.includes("\n");
  const showExpandComposer = measuredLineCount >= EXPAND_THRESHOLD_LINES || inputHeight >= EXPAND_THRESHOLD_HEIGHT;

  const handleContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    const contentHeight = Math.round(event.nativeEvent.contentSize.height);
    const nextHeight = clampHeight(contentHeight);
    setMeasuredContentHeight((currentHeight) => (
      Math.abs(currentHeight - nextHeight) >= HEIGHT_UPDATE_DEADZONE ? nextHeight : currentHeight
    ));
  };

  const resetComposerState = () => { setMeasuredContentHeight(INPUT_MIN_HEIGHT); };

  return {
    inputHeight,
    inputExpanded,
    measuredLineCount,
    showExpandComposer,
    handleContentSizeChange,
    resetComposerState,
  };
}
export const composerStateConstants = { INPUT_MIN_HEIGHT, INPUT_MAX_HEIGHT };

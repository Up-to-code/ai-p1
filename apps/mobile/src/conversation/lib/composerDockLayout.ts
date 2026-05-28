export const COMPOSER_INPUT_MIN_HEIGHT = 24;
export const COMPOSER_INPUT_LINE_HEIGHT = 22;
export const COMPOSER_INPUT_MAX_VISIBLE_LINES = 2.5;
export const COMPOSER_INPUT_MAX_HEIGHT = Math.round(
  COMPOSER_INPUT_LINE_HEIGHT * COMPOSER_INPUT_MAX_VISIBLE_LINES,
);
export const COMPOSER_EDIT_FLOAT_GAP = 8;
export const COMPOSER_EXPAND_THRESHOLD_LINES = 3;
export const COMPOSER_HEIGHT_UPDATE_DEADZONE = 2;

export function clampComposerInputHeight(height: number) {
  return Math.min(Math.max(height, COMPOSER_INPUT_MIN_HEIGHT), COMPOSER_INPUT_MAX_HEIGHT);
}

export function shouldScrollComposerInput(contentHeight: number) {
  return contentHeight > COMPOSER_INPUT_MAX_HEIGHT;
}

export function getExplicitComposerLineHeight(value: string) {
  const explicitLines = value.split("\n").length;
  return explicitLines * COMPOSER_INPUT_LINE_HEIGHT;
}

export function resolveComposerMeasuredHeight(value: string, measuredContentHeight: number) {
  return Math.max(measuredContentHeight, getExplicitComposerLineHeight(value));
}

export function composerMeasuredLineCount(height: number) {
  return Math.max(1, Math.round(height / COMPOSER_INPUT_LINE_HEIGHT));
}

export function isComposerInputExpanded(height: number, value: string) {
  return composerMeasuredLineCount(height) > 1 || value.includes("\n");
}

export function shouldShowComposerExpansion(height: number) {
  return composerMeasuredLineCount(height) >= COMPOSER_EXPAND_THRESHOLD_LINES
    || height >= COMPOSER_INPUT_MAX_HEIGHT;
}

export function nextComposerMeasuredHeight(currentHeight: number, contentHeight: number) {
  const nextHeight = clampComposerInputHeight(Math.round(contentHeight));
  return Math.abs(currentHeight - nextHeight) >= COMPOSER_HEIGHT_UPDATE_DEADZONE
    ? nextHeight
    : currentHeight;
}

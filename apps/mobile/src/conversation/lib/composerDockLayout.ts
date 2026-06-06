export const COMPOSER_INPUT_MIN_HEIGHT = 24;
export const COMPOSER_INPUT_LINE_HEIGHT = 22;
export const COMPOSER_INPUT_MAX_VISIBLE_LINES = 3;
export const COMPOSER_INPUT_MAX_HEIGHT = Math.round(
  COMPOSER_INPUT_LINE_HEIGHT * COMPOSER_INPUT_MAX_VISIBLE_LINES,
);
export const COMPOSER_EDIT_FLOAT_GAP = 8;
export const COMPOSER_EDITING_STRIP_HEIGHT = 42;
export const COMPOSER_EDIT_SCROLL_BUTTON_GAP = 10;
const COMPOSER_EXPAND_THRESHOLD_LINES = 3;
const COMPOSER_HEIGHT_UPDATE_DEADZONE = 2;

export type ComposerMode = "compose" | "edit";

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

export function resolveComposerMode(isEditing: boolean): ComposerMode {
  return isEditing ? "edit" : "compose";
}

export function composerModeScrollButtonExtraOffset(mode: ComposerMode) {
  return mode === "edit"
    ? COMPOSER_EDITING_STRIP_HEIGHT + COMPOSER_EDIT_FLOAT_GAP + COMPOSER_EDIT_SCROLL_BUTTON_GAP
    : 0;
}

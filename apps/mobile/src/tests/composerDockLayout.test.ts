import test from "node:test";
import assert from "node:assert/strict";

import {
  clampComposerInputHeight,
  COMPOSER_INPUT_LINE_HEIGHT,
  COMPOSER_INPUT_MAX_HEIGHT,
  COMPOSER_INPUT_MAX_VISIBLE_LINES,
  COMPOSER_INPUT_MIN_HEIGHT,
  composerModeScrollButtonExtraOffset,
  composerMeasuredLineCount,
  getExplicitComposerLineHeight,
  isComposerInputExpanded,
  nextComposerMeasuredHeight,
  resolveComposerMode,
  resolveComposerMeasuredHeight,
  shouldScrollComposerInput,
  shouldShowComposerExpansion,
} from "@/conversation/lib/composerDockLayout";

test("composer input clamps to a three line visible height", () => {
  assert.equal(COMPOSER_INPUT_MAX_VISIBLE_LINES, 3);
  assert.equal(COMPOSER_INPUT_MAX_HEIGHT, Math.round(COMPOSER_INPUT_LINE_HEIGHT * 3));
  assert.equal(clampComposerInputHeight(1), COMPOSER_INPUT_MIN_HEIGHT);
  assert.equal(clampComposerInputHeight(10_000), COMPOSER_INPUT_MAX_HEIGHT);
});

test("composer mode raises floating controls while editing", () => {
  assert.equal(resolveComposerMode(false), "compose");
  assert.equal(resolveComposerMode(true), "edit");
  assert.equal(composerModeScrollButtonExtraOffset("compose"), 0);
  assert.ok(composerModeScrollButtonExtraOffset("edit") > 0);
});

test("composer input only scrolls after content exceeds visible height", () => {
  assert.equal(shouldScrollComposerInput(COMPOSER_INPUT_MAX_HEIGHT), false);
  assert.equal(shouldScrollComposerInput(COMPOSER_INPUT_MAX_HEIGHT + 1), true);
});

test("composer input respects explicit newline height before native measurement catches up", () => {
  assert.equal(getExplicitComposerLineHeight("one"), COMPOSER_INPUT_LINE_HEIGHT);
  assert.equal(getExplicitComposerLineHeight("one\ntwo"), COMPOSER_INPUT_LINE_HEIGHT * 2);
  assert.equal(clampComposerInputHeight(COMPOSER_INPUT_LINE_HEIGHT * 2), COMPOSER_INPUT_LINE_HEIGHT * 2);
  assert.equal(
    resolveComposerMeasuredHeight("one\ntwo\nthree", COMPOSER_INPUT_MIN_HEIGHT),
    COMPOSER_INPUT_LINE_HEIGHT * 3,
  );
  assert.equal(clampComposerInputHeight(COMPOSER_INPUT_LINE_HEIGHT * 3), COMPOSER_INPUT_MAX_HEIGHT);
});

test("composer input expansion state is derived by the layout module", () => {
  assert.equal(composerMeasuredLineCount(COMPOSER_INPUT_LINE_HEIGHT), 1);
  assert.equal(composerMeasuredLineCount(COMPOSER_INPUT_LINE_HEIGHT * 2), 2);
  assert.equal(isComposerInputExpanded(COMPOSER_INPUT_LINE_HEIGHT, "hello"), false);
  assert.equal(isComposerInputExpanded(COMPOSER_INPUT_LINE_HEIGHT, "hello\nagain"), true);
  assert.equal(shouldShowComposerExpansion(COMPOSER_INPUT_LINE_HEIGHT * 2), false);
  assert.equal(shouldShowComposerExpansion(COMPOSER_INPUT_LINE_HEIGHT * 3), true);
});

test("composer measured height updates only outside the deadzone", () => {
  assert.equal(nextComposerMeasuredHeight(24, 25), 24);
  assert.equal(nextComposerMeasuredHeight(24, 27), 27);
  assert.equal(nextComposerMeasuredHeight(24, 1), COMPOSER_INPUT_MIN_HEIGHT);
  assert.equal(nextComposerMeasuredHeight(24, 10_000), COMPOSER_INPUT_MAX_HEIGHT);
});

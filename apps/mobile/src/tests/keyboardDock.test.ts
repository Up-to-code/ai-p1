import test from "node:test";
import assert from "node:assert/strict";

import { calculateKeyboardDock } from "@/conversation/lib/keyboardDockLayout";

test("keyboard dock separates feed padding from scroll button placement", () => {
  const dock = calculateKeyboardDock({
    bottomInset: 12,
    dockHeight: 120,
    keyboardHeight: 300,
    isIos: true,
  });

  assert.equal(dock.keyboardVisible, true);
  assert.equal(dock.dockBottomOffset, 308);
  assert.equal(dock.listBottomPadding, 440);
  assert.equal(dock.scrollButtonBottomOffset, 448);
});

test("keyboard dock keeps resting offsets compact", () => {
  const dock = calculateKeyboardDock({
    bottomInset: 0,
    dockHeight: 120,
    keyboardHeight: 0,
    isIos: true,
  });

  assert.equal(dock.keyboardVisible, false);
  assert.equal(dock.dockBottomOffset, 0);
  assert.equal(dock.listBottomPadding, 128);
  assert.equal(dock.scrollButtonBottomOffset, 136);
});

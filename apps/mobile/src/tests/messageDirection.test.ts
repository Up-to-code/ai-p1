import test from "node:test";
import assert from "node:assert/strict";

import {
  detectAssistantMessageDirection,
  detectTextBlockDirection,
  getDirectionalTextAnchor,
  resolveAssistantBrandMarkerVisibility,
  resolveMessagePhysicalSide,
  resolveMessageRowSlots,
  resolveUserBubbleDirection,
} from "../conversation/lib/messageDirection";

test("assistant message direction follows message language", () => {
  assert.equal(detectAssistantMessageDirection("Hello, I can help with clients and tasks."), "ltr");
  assert.equal(detectAssistantMessageDirection("مرحباً، أستطيع مساعدتك في العملاء والمهام."), "rtl");
});

test("user bubble direction follows app locale, not typed text", () => {
  assert.equal(resolveUserBubbleDirection("ar", { uiLocale: "en" }), "rtl");
  assert.equal(resolveUserBubbleDirection("en", { uiLocale: "ar" }), "ltr");
  assert.equal(resolveUserBubbleDirection("system", { uiLocale: "ar" }), "rtl");
});

test("message rows use physical sides independent of locale direction", () => {
  assert.equal(resolveMessagePhysicalSide("user"), "right");
  assert.equal(resolveMessagePhysicalSide("assistant"), "left");
  assert.deepEqual(resolveMessageRowSlots("user"), ["spacer", "message"]);
  assert.deepEqual(resolveMessageRowSlots("assistant"), ["message", "spacer"]);
});

test("mixed assistant markdown can resolve direction per block", () => {
  const blocks = [
    "Here is the client summary:",
    "- العملاء — عرض أو إضافة أو تحديث بيانات عميل",
    "- Tasks: Organize action items.",
  ];

  assert.deepEqual(blocks.map(detectTextBlockDirection), ["ltr", "rtl", "ltr"]);
});

test("directional anchors stabilize punctuation and emoji in text runs", () => {
  assert.equal(getDirectionalTextAnchor("rtl"), "\u200F");
  assert.equal(getDirectionalTextAnchor("ltr"), "\u200E");
});

test("completed and pending assistant messages do not render history brand markers", () => {
  assert.equal(resolveAssistantBrandMarkerVisibility({ role: "assistant", streamState: "complete" }), false);
  assert.equal(resolveAssistantBrandMarkerVisibility({ role: "assistant", streamState: "streaming", isPending: true }), false);
});

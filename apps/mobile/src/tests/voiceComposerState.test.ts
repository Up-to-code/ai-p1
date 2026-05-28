import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeVoiceAudioLevel,
  VOICE_PERMISSION_DENIED_MESSAGE,
  VOICE_RECOGNITION_UNAVAILABLE_MESSAGE,
  VOICE_RUNTIME_UNAVAILABLE_MESSAGE,
  voiceStateFromResult,
  voiceTranscriptFromResult,
} from "@/voice/lib/voiceComposerState";

test("voice composer state normalizes audio into a stable zero-to-one range", () => {
  assert.equal(normalizeVoiceAudioLevel(-20), 0);
  assert.equal(normalizeVoiceAudioLevel(-2), 0);
  assert.equal(normalizeVoiceAudioLevel(4), 0.5);
  assert.equal(normalizeVoiceAudioLevel(10), 1);
  assert.equal(normalizeVoiceAudioLevel(20), 1);
});

test("voice composer state projects transcript and recognition phase", () => {
  assert.equal(voiceTranscriptFromResult({ results: [{ transcript: "Find villas" }], isFinal: false }), "Find villas");
  assert.equal(voiceTranscriptFromResult({ results: [], isFinal: false }), "");
  assert.equal(voiceStateFromResult({ isFinal: false }), "transcribing");
  assert.equal(voiceStateFromResult({ isFinal: true }), "idle");
});

test("voice composer state owns fixed unavailable messages", () => {
  assert.match(VOICE_RUNTIME_UNAVAILABLE_MESSAGE, /development build/);
  assert.equal(VOICE_PERMISSION_DENIED_MESSAGE, "Microphone permission denied.");
  assert.equal(VOICE_RECOGNITION_UNAVAILABLE_MESSAGE, "Speech recognition unavailable on this device.");
});

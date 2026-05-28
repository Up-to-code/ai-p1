import type { VoiceMode } from "@/types/domain";

export const VOICE_RUNTIME_UNAVAILABLE_MESSAGE = "Voice input needs a development build. Expo Go will use text only.";
export const VOICE_PERMISSION_DENIED_MESSAGE = "Microphone permission denied.";
export const VOICE_RECOGNITION_UNAVAILABLE_MESSAGE = "Speech recognition unavailable on this device.";

type VoiceResultEvent = {
  results?: Array<{ transcript?: string }>;
  isFinal?: boolean;
};

export function normalizeVoiceAudioLevel(value: number) {
  const clamped = Math.min(Math.max(value, -2), 10);
  return (clamped + 2) / 12;
}

export function voiceTranscriptFromResult(event: VoiceResultEvent) {
  return event.results?.[0]?.transcript ?? "";
}

export function voiceStateFromResult(event: VoiceResultEvent): VoiceMode {
  return event.isFinal ? "idle" : "transcribing";
}

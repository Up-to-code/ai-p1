import type { StateCreator } from "zustand";

import type { VoiceMode } from "@/types/domain";

export type VoiceSlice = {
  permission: "unknown" | "granted" | "denied";
  voiceState: VoiceMode;
  transcript: string;
  audioLevel: number;
  error: string | null;
  setPermission: (value: VoiceSlice["permission"]) => void;
  setVoiceState: (value: VoiceMode) => void;
  setTranscript: (value: string) => void;
  setAudioLevel: (value: number) => void;
  setVoiceError: (value: string | null) => void;
  resetVoice: () => void;
};

export const createVoiceSlice: StateCreator<VoiceSlice, [], [], VoiceSlice> = (set) => ({
  permission: "unknown",
  voiceState: "idle",
  transcript: "",
  audioLevel: 0,
  error: null,
  setPermission: (value) => set({ permission: value }),
  setVoiceState: (value) => set({ voiceState: value }),
  setTranscript: (value) => set({ transcript: value }),
  setAudioLevel: (value) => set({ audioLevel: value }),
  setVoiceError: (value) => set({ error: value }),
  resetVoice: () => set({ voiceState: "idle", transcript: "", audioLevel: 0, error: null }),
});

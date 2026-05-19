import { track } from "@/persistence/analytics/track";
import { useAppStore } from "@/store";
import {
  isSpeechRecognitionRuntimeAvailable,
  requestSpeechPermissions,
  speechRecognitionAvailable,
  startSpeechRecognition,
  stopSpeechRecognition,
  useSpeechRecognitionEvent,
  type SpeechRecognitionError,
  type SpeechRecognitionResult,
  type SpeechRecognitionVolumeChange,
} from "@/voice/adapters/expoSpeechAdapter";

function normalizeAudioLevel(value: number) {
  const clamped = Math.min(Math.max(value, -2), 10);
  return (clamped + 2) / 12;
}

export function useVoiceComposer() {
  const sessionId = useAppStore((state) => state.sessionId);
  const setDraftText = useAppStore((state) => state.setDraftText);
  const setPermission = useAppStore((state) => state.setPermission);
  const setVoiceState = useAppStore((state) => state.setVoiceState);
  const setTranscript = useAppStore((state) => state.setTranscript);
  const setAudioLevel = useAppStore((state) => state.setAudioLevel);
  const setVoiceError = useAppStore((state) => state.setVoiceError);
  const voiceState = useAppStore((state) => state.voiceState);
  const audioLevel = useAppStore((state) => state.audioLevel);
  const error = useAppStore((state) => state.error);

  useSpeechRecognitionEvent("start", () => {
    setVoiceState("listening");
    setVoiceError(null);
    setAudioLevel(0);
    track("voice_input_started", { sessionId });
  });

  useSpeechRecognitionEvent("result", (event: SpeechRecognitionResult) => {
    const transcript = event.results?.[0]?.transcript ?? "";
    setTranscript(transcript);
    setDraftText(transcript);
    setVoiceState(event.isFinal ? "idle" : "transcribing");

    if (event.isFinal) {
      track("voice_input_completed", { sessionId, transcript });
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setVoiceState("idle");
    setAudioLevel(0);
  });

  useSpeechRecognitionEvent("error", (event: SpeechRecognitionError) => {
    setVoiceState("failed");
    setAudioLevel(0);
    setVoiceError(event.message);
  });

  useSpeechRecognitionEvent("volumechange", (event: SpeechRecognitionVolumeChange) => {
    setAudioLevel(normalizeAudioLevel(event.value));
  });

  const start = async () => {
    setVoiceState("requesting_permission");
    setAudioLevel(0);
    setTranscript("");

    if (!isSpeechRecognitionRuntimeAvailable()) {
      setPermission("denied");
      setVoiceState("failed");
      setVoiceError("Voice input needs a development build. Expo Go will use text only.");
      return;
    }

    const permission = await requestSpeechPermissions();

    if (!permission.granted) {
      setPermission("denied");
      setVoiceState("failed");
      setVoiceError("Microphone permission denied.");
      return;
    }

    setPermission("granted");

    if (!speechRecognitionAvailable()) {
      setVoiceState("failed");
      setVoiceError("Speech recognition unavailable on this device.");
      return;
    }

    startSpeechRecognition();
  };

  const stop = () => {
    stopSpeechRecognition();
  };

  return {
    voiceState,
    audioLevel,
    error,
    start,
    stop,
  };
}

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
import {
  normalizeVoiceAudioLevel,
  VOICE_PERMISSION_DENIED_MESSAGE,
  VOICE_RECOGNITION_UNAVAILABLE_MESSAGE,
  VOICE_RUNTIME_UNAVAILABLE_MESSAGE,
  voiceStateFromResult,
  voiceTranscriptFromResult,
} from "@/voice/lib/voiceComposerState";

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
    const transcript = voiceTranscriptFromResult(event);
    setTranscript(transcript);
    setDraftText(transcript);
    setVoiceState(voiceStateFromResult(event));

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
    setAudioLevel(normalizeVoiceAudioLevel(event.value));
  });

  const start = async () => {
    setVoiceState("requesting_permission");
    setAudioLevel(0);
    setTranscript("");

    if (!isSpeechRecognitionRuntimeAvailable()) {
      setPermission("denied");
      setVoiceState("failed");
      setVoiceError(VOICE_RUNTIME_UNAVAILABLE_MESSAGE);
      return;
    }

    const permission = await requestSpeechPermissions();

    if (!permission.granted) {
      setPermission("denied");
      setVoiceState("failed");
      setVoiceError(VOICE_PERMISSION_DENIED_MESSAGE);
      return;
    }

    setPermission("granted");

    if (!speechRecognitionAvailable()) {
      setVoiceState("failed");
      setVoiceError(VOICE_RECOGNITION_UNAVAILABLE_MESSAGE);
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

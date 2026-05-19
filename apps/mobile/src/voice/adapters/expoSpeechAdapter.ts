import { isExpoGo } from "@/runtime/expoRuntime";

type SpeechRecognitionEventName = "start" | "result" | "end" | "error" | "volumechange";

type SpeechRecognitionResult = {
  results?: { transcript?: string }[];
  isFinal?: boolean;
};

type SpeechRecognitionError = {
  message: string;
};

type SpeechRecognitionPermission = {
  granted: boolean;
};

type SpeechRecognitionVolumeChange = {
  value: number;
};

type ExpoSpeechRecognitionPackage = typeof import("expo-speech-recognition");

const speechRecognitionPackage = loadSpeechRecognitionPackage();
const speechRecognitionModule = speechRecognitionPackage?.ExpoSpeechRecognitionModule ?? null;

type SpeechRecognitionEventMap = {
  start: void;
  result: SpeechRecognitionResult;
  end: void;
  error: SpeechRecognitionError;
  volumechange: SpeechRecognitionVolumeChange;
};

export function useSpeechRecognitionEvent<EventName extends SpeechRecognitionEventName>(
  eventName: EventName,
  listener: (event: SpeechRecognitionEventMap[EventName]) => void,
) {
  if (!speechRecognitionPackage?.useSpeechRecognitionEvent) {
    return;
  }

  speechRecognitionPackage.useSpeechRecognitionEvent(eventName, listener as never);
}

function loadSpeechRecognitionPackage(): ExpoSpeechRecognitionPackage | null {
  if (isExpoGo) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-speech-recognition") as ExpoSpeechRecognitionPackage;
  } catch {
    return null;
  }
}

export async function requestSpeechPermissions(): Promise<SpeechRecognitionPermission> {
  if (!speechRecognitionModule) {
    return { granted: false };
  }

  return speechRecognitionModule.requestPermissionsAsync();
}

export function startSpeechRecognition() {
  speechRecognitionModule?.start({
    lang: "en-US",
    interimResults: true,
    maxAlternatives: 1,
    continuous: false,
    addsPunctuation: true,
    requiresOnDeviceRecognition: false,
    volumeChangeEventOptions: {
      enabled: true,
      intervalMillis: 80,
    },
  });
}

export function stopSpeechRecognition() {
  speechRecognitionModule?.stop();
}

export function abortSpeechRecognition() {
  speechRecognitionModule?.abort();
}

export function speechRecognitionAvailable() {
  return speechRecognitionModule?.isRecognitionAvailable() ?? false;
}

export function isSpeechRecognitionRuntimeAvailable() {
  return Boolean(speechRecognitionModule);
}

export type { SpeechRecognitionError, SpeechRecognitionResult, SpeechRecognitionVolumeChange };

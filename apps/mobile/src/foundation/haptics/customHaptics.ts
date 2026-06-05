import { Platform } from "react-native";
import * as ExpoHaptics from "expo-haptics";
import { playAHAP } from "react-native-hapticlabs";
import RNFS from "react-native-fs";

const TYPEWRITER_WAVE_PATH = `${RNFS.MainBundlePath}/QentrahTypewriterWave.ahap`;
const TYPEWRITER_MIN_INTERVAL_MS = 360;
const TYPEWRITER_FALLBACK_STEPS_MS = [0, 95, 185, 310];

let lastTypewriterWaveAt = 0;

export const playSoftSelectionHaptic = () => {
  void ExpoHaptics.selectionAsync().catch(() => undefined);
};

export const playTypewriterSpeedInHaptic = () => {
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light).catch(() => undefined);
};

export const playTypewriterTickHaptic = () => {
  void ExpoHaptics.selectionAsync().catch(() => undefined);
};

export const playTypewriterLazyOutHaptic = () => {
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Soft).catch(() => undefined);
};

export const playTypewriterWaveHaptic = () => {
  if (Platform.OS !== "ios") {
    void ExpoHaptics.selectionAsync().catch(() => undefined);
    return;
  }

  const now = Date.now();
  if (now - lastTypewriterWaveAt < TYPEWRITER_MIN_INTERVAL_MS) return;
  lastTypewriterWaveAt = now;

  TYPEWRITER_FALLBACK_STEPS_MS.forEach((delay, index) => {
    setTimeout(() => {
      const feedback = index === 0 || index === TYPEWRITER_FALLBACK_STEPS_MS.length - 1
        ? ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Soft)
        : ExpoHaptics.selectionAsync();
      void feedback.catch(() => undefined);
    }, delay);
  });

  void playAHAP(TYPEWRITER_WAVE_PATH).catch(() => {
    void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Soft).catch(() => undefined);
  });
};

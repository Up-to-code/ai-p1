"use client";

import { useCallback, useEffect, useRef } from "react";

function createAudioContext() {
  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  return AudioContextCtor ? new AudioContextCtor() : null;
}

function playTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  gainNode: GainNode,
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(0.11, startTime + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(envelope);
  envelope.connect(gainNode);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export function useInboxMessageSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  const ensureContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  const unlock = useCallback(() => {
    const context = ensureContext();
    if (!context) return;

    void context.resume().then(() => {
      unlockedRef.current = true;
    });
  }, [ensureContext]);

  useEffect(() => {
    const unlockOnce = () => unlock();

    window.addEventListener("pointerdown", unlockOnce, { once: true });
    window.addEventListener("keydown", unlockOnce, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockOnce);
      window.removeEventListener("keydown", unlockOnce);
    };
  }, [unlock]);

  return useCallback(() => {
    const context = ensureContext();
    if (!context || !unlockedRef.current) return;

    const output = context.createGain();
    output.gain.value = 0.42;
    output.connect(context.destination);

    const now = context.currentTime;
    playTone(context, 523.25, now, 0.085, output);
    playTone(context, 659.25, now + 0.085, 0.11, output);

    window.setTimeout(() => output.disconnect(), 320);
  }, [ensureContext]);
}

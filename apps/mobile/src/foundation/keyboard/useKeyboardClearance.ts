import { useCallback, useMemo, useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, useWindowDimensions } from "react-native";

type FocusSlot = "fullName" | "email" | "password" | "verification";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function useKeyboardClearance() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { height } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const extraClearance = useMemo(() => Math.round(clamp(height * 0.032, 20, 30)), [height]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    setKeyboardVisible(false);
  }, []);

  const handleInputFocus = useCallback((slot: FocusSlot) => {
    setKeyboardVisible(true);

    const baseOffset = slot === "password" ? 0.22 : slot === "verification" ? 0.18 : 0.12;
    const y = Math.max(0, Math.round(height * baseOffset - extraClearance));
    const delay = Platform.OS === "ios" ? 90 : 140;

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }, delay);
  }, [extraClearance, height]);

  return {
    dismissKeyboard,
    extraClearance,
    handleInputFocus,
    keyboardVisible,
    scrollViewRef,
  };
}

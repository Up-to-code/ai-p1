import type { StyleProp, TextStyle, ViewStyle } from "react-native";

export function mirrorIcon(isRTL: boolean): StyleProp<ViewStyle> {
  return isRTL ? { transform: [{ scaleX: -1 }] } : null;
}

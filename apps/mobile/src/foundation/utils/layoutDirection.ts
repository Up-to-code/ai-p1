import type { StyleProp, TextStyle, ViewStyle } from "react-native";

export function directionalRow(isRTL: boolean): StyleProp<ViewStyle> {
  return { flexDirection: isRTL ? "row-reverse" : "row" };
}

export function directionalAlign(isRTL: boolean): StyleProp<TextStyle> {
  return {
    textAlign: isRTL ? "right" : "left",
    writingDirection: isRTL ? "rtl" : "ltr",
  };
}

export function directionalAbsolute(isRTL: boolean, start: number) {
  return isRTL ? { right: start } : { left: start };
}

export function mirrorIcon(isRTL: boolean): StyleProp<ViewStyle> {
  return isRTL ? { transform: [{ scaleX: -1 }] } : null;
}

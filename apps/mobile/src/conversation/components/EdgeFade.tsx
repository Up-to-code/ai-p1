import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type EdgeFadeProps = {
  color: string;
  placement: "top" | "bottom";
  style?: StyleProp<ViewStyle>;
  startOpacity?: number;
  midOpacity?: number;
};

export function EdgeFade({
  color,
  placement,
  style,
  startOpacity = 0.96,
  midOpacity = 0.42,
}: EdgeFadeProps) {
  const y1 = placement === "top" ? "0" : "1";
  const y2 = placement === "top" ? "1" : "0";
  const gradientId = `edgeFade-${placement}`;

  return (
    <Svg pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1={y1} x2="0" y2={y2}>
          <Stop offset="0" stopColor={color} stopOpacity={String(startOpacity)} />
          <Stop offset="0.58" stopColor={color} stopOpacity={String(midOpacity)} />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
}

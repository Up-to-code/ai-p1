import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type EdgeFadeProps = {
  color: string;
  placement: "top" | "bottom" | "left" | "right";
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
  const isHorizontal = placement === "left" || placement === "right";
  const x1 = placement === "left" ? "0" : placement === "right" ? "1" : "0";
  const x2 = placement === "left" ? "1" : placement === "right" ? "0" : "0";
  const y1 = isHorizontal ? "0" : placement === "top" ? "0" : "1";
  const y2 = isHorizontal ? "0" : placement === "top" ? "1" : "0";
  const gradientId = `edgeFade-${placement}`;

  return (
    <Svg pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Defs>
        <LinearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
          <Stop offset="0" stopColor={color} stopOpacity={String(startOpacity)} />
          <Stop offset="0.58" stopColor={color} stopOpacity={String(midOpacity)} />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
}

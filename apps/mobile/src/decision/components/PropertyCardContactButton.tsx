import { Pressable, StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { Text } from "@/foundation/primitives/Text";

type PropertyCardContactButtonProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  isRTL?: boolean;
};

export function PropertyCardContactButton({
  icon,
  label,
  onPress,
  style,
  labelStyle,
  isRTL,
}: PropertyCardContactButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={[styles.button, isRTL && styles.buttonRtl, style]}
    >
      {icon}
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "transparent",
  },
  buttonRtl: {
    flexDirection: "row-reverse",
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
});

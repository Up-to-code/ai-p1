import { View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { Text } from "@/foundation/primitives/Text";

export type PropertyCardSpec = {
  key: string;
  icon: ReactNode;
  label: string;
};

type PropertyCardSpecsProps = {
  specs: PropertyCardSpec[];
  styles: {
    specRow: StyleProp<ViewStyle>;
    specPill: StyleProp<ViewStyle>;
    specText: StyleProp<TextStyle>;
  };
};

export function PropertyCardSpecs({ specs, styles }: PropertyCardSpecsProps) {
  return (
    <View style={styles.specRow}>
      {specs.map((spec) => (
        <View key={spec.key} style={styles.specPill}>
          {spec.icon}
          <Text style={styles.specText}>{spec.label}</Text>
        </View>
      ))}
    </View>
  );
}

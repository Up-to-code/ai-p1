import { View } from "react-native";
import { Image } from "expo-image";

import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { emptyPropertiesStateStyles as styles } from "./EmptyPropertiesState.styles";

type EmptyPropertiesStateProps = {
  title?: string;
  body?: string;
};

export function EmptyPropertiesState({
  title = "No properties yet",
  body = "New properties will appear here once they are ready.",
}: EmptyPropertiesStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.artWrap, { backgroundColor: `${colors.accent}0D` }]}>
        <Image
          source={require("../../../assets/icons/empty-properties.svg")}
          style={styles.art}
          contentFit="contain"
        />
      </View>
      <Text variant="title" style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text variant="body" style={[styles.body, { color: colors.textMuted }]}>
        {body}
      </Text>
    </View>
  );
}

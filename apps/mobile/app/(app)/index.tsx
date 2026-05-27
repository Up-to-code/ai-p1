import { StyleSheet, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Menu, UserCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConversationViewport } from "@/conversation/components/ConversationViewport";
import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useAppLocalization();
  const insets = useSafeAreaInsets();

  return (
    <Screen safe={false}>
      <View style={styles.flex}>
        <ConversationViewport />
      </View>

      <View
        style={[
          styles.floatingHeader,
          {
            paddingTop: insets.top + 4,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          testID="app.open_menu"
          style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}
          onPress={() => router.navigate("/(app)/menu")}
          accessibilityLabel={t.menu.title}
        >
          <Menu size={18} color={colors.textPrimary} />
        </Pressable>

        <Pressable
          style={[styles.brandPill, { backgroundColor: colors.background, borderColor: colors.divider }]}
          onPress={() => router.navigate("/(app)")}
          accessibilityLabel="Qentrah AI"
        >
          <Text style={[styles.brandPillText, { color: colors.textPrimary }]}>QENTRAH AI</Text>
          <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
        </Pressable>

        <View style={styles.rightActions}>
          <Pressable
            style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}
            onPress={() => router.navigate("/(app)/profile")}
            accessibilityLabel={t.common.profile}
          >
            <UserCircle size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    zIndex: 1000,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  rightActions: {
    flexDirection: "row",
    gap: 8,
  },
  brandPill: {
    flexDirection: "row",
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

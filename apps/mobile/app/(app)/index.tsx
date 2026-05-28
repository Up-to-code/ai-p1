import { Image, StyleSheet, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Menu } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

import { ConversationViewport } from "@/conversation/components/ConversationViewport";
import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAuthSession } from "@/auth/useAuthSession";
import { EdgeFade } from "@/conversation/components/EdgeFade";
import { ChatDrawer } from "@/shell/components/ChatDrawer";
import { userAvatarPresentation } from "@/auth/userPresentation";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const { user } = useAuthSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { avatarUrl, initials } = userAvatarPresentation(user);

  return (
    <Screen safe={false}>
      <View style={styles.flex}>
        <ConversationViewport />
      </View>

      <View
        style={[
          styles.floatingHeader,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View pointerEvents="none" style={[styles.headerBackdrop, { height: insets.top + 96 }]}>
          <EdgeFade color={colors.background} placement="top" startOpacity={1} midOpacity={0.22} />
        </View>

        <Pressable
          style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}
          onPress={() => router.navigate("/(app)/profile")}
          accessibilityLabel={t.common.profile}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: colors.textPrimary }]}>{initials || "Q"}</Text>
          )}
        </Pressable>

        <Pressable
          testID="app.open_menu"
          style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}
          onPress={() => setIsDrawerOpen(true)}
          accessibilityLabel={t.menu.title}
        >
          <Menu size={16} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ChatDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateProfile={() => {
          setIsDrawerOpen(false);
          router.navigate("/(app)/profile");
        }}
        onOpenFullHistory={() => {
          setIsDrawerOpen(false);
          router.navigate("/(app)/threads" as never);
        }}
      />
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
    paddingHorizontal: 8,
    paddingBottom: 8,
    zIndex: 1000,
  },
  headerBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "800",
  },
});

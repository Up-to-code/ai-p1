import { Image, Platform, Pressable, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Menu } from "lucide-react-native";
import { DrawerLayout } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useRef } from "react";

import { ConversationViewport } from "@/conversation/components/ConversationViewport";
import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAuthSession } from "@/auth/useAuthSession";
import { EdgeFade } from "@/conversation/components/EdgeFade";
import { ChatDrawerContent } from "@/shell/components/ChatDrawer";
import { userAvatarPresentation } from "@/auth/userPresentation";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, resolvedColorScheme } = useTheme();
  const { t } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuthSession();
  const drawerRef = useRef<DrawerLayout>(null);
  const { avatarUrl, initials } = userAvatarPresentation(user);
  const drawerWidth = width;
  const openDrawer = useCallback(() => drawerRef.current?.openDrawer(), []);
  const closeDrawer = useCallback(() => drawerRef.current?.closeDrawer(), []);

  return (
    <Screen safe={false}>
      <DrawerLayout
        ref={drawerRef}
        drawerPosition="left"
        drawerType="back"
        drawerWidth={drawerWidth}
        drawerBackgroundColor={colors.background}
        overlayColor="rgba(0,0,0,0.48)"
        edgeWidth={52}
        minSwipeDistance={8}
        keyboardDismissMode="on-drag"
        renderNavigationView={() => (
          <View
            style={[
              styles.drawerPanel,
              {
                width: drawerWidth,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                backgroundColor: colors.background,
                borderRightColor: colors.divider,
              },
            ]}
          >
            <ChatDrawerContent
              onClose={closeDrawer}
              onNavigateProfile={() => {
                closeDrawer();
                router.navigate("/(app)/profile");
              }}
              onOpenFullHistory={() => {
                closeDrawer();
                router.navigate("/(app)/threads" as never);
              }}
              topInset={0}
              bottomInset={0}
              showClose={false}
            />
          </View>
        )}
      >
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
            testID="app.open_menu"
            style={styles.menuBtn}
            onPress={openDrawer}
            accessibilityLabel={t.menu.title}
          >
            <HomeMenuAction
              colorScheme={resolvedColorScheme}
              fallbackIconColor={colors.textPrimary}
              label={t.menu.title}
              onPress={openDrawer}
              style={styles.nativeMenuAction}
              tintColor={colors.textPrimary}
            />
          </Pressable>

          <Pressable
            style={[styles.avatarBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}
            onPress={() => router.navigate("/(app)/profile")}
            accessibilityLabel={t.common.profile}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.textPrimary }]}>{initials || "Q"}</Text>
            )}
          </Pressable>
        </View>
      </DrawerLayout>
    </Screen>
  );
}

type ExpoSwiftUI = {
  Button: typeof import("@expo/ui/swift-ui").Button;
  Host: typeof import("@expo/ui/swift-ui").Host;
  modifiers: typeof import("@expo/ui/swift-ui/modifiers");
};

type HomeMenuActionProps = {
  colorScheme: "light" | "dark";
  fallbackIconColor: string;
  label: string;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  tintColor: string;
};

function HomeMenuAction({ colorScheme, fallbackIconColor, label, onPress, style, tintColor }: HomeMenuActionProps) {
  const swiftUI = getAvailableExpoSwiftUI();
  if (swiftUI) {
    const { Button: SwiftUIButton, Host: SwiftUIHost, modifiers } = swiftUI;
    return (
      <SwiftUIHost colorScheme={colorScheme} matchContents style={style}>
        <SwiftUIButton
          label={label}
          onPress={onPress}
          systemImage="line.3.horizontal"
          modifiers={[
            modifiers.buttonStyle("plain"),
            modifiers.controlSize("regular"),
            modifiers.labelStyle("iconOnly"),
            modifiers.tint(tintColor),
            modifiers.frame({ width: 36, height: 36 }),
            modifiers.scaleEffect(1.18),
            modifiers.accessibilityLabel(label),
          ]}
        />
      </SwiftUIHost>
    );
  }

  return <Menu size={19} color={fallbackIconColor} />;
}

function getAvailableExpoSwiftUI(): ExpoSwiftUI | null {
  if (Platform.OS !== "ios") {
    return null;
  }

  try {
    const swiftUI = require("@expo/ui/swift-ui") as Pick<ExpoSwiftUI, "Button" | "Host">;
    const modifiers = require("@expo/ui/swift-ui/modifiers") as ExpoSwiftUI["modifiers"];
    if (!swiftUI.Button || !swiftUI.Host) {
      return null;
    }
    return {
      Button: swiftUI.Button,
      Host: swiftUI.Host,
      modifiers,
    };
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  drawerPanel: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
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
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  menuBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  nativeMenuAction: {
    width: 36,
    height: 36,
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

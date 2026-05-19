import { StyleSheet, View, Pressable } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Menu, Heart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  interpolateColor 
} from "react-native-reanimated";

import { ConversationViewport } from "@/conversation/components/ConversationViewport";
import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAuthSession } from "@/auth/useAuthSession";
import { Text } from "@/foundation/primitives/Text";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { uppercaseLatin } from "@/foundation/utils/textDisplay";
import { useAppStore } from "@/store";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, resolvedColorScheme } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const { isGuest, user } = useAuthSession();
  
  const operativeMode = useAppStore((state) => state.operativeMode);
  const setOperativeMode = useAppStore((state) => state.setOperativeMode);
  const isAiMode = operativeMode === "ai";

  const displayName = isGuest ? "G" : user?.name?.[0] ?? user?.email?.[0] ?? "U";

  const handleModeChange = (mode: "ai" | "normal") => {
    if (mode === operativeMode) return;
    setOperativeMode(mode);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Screen safe={false}>
      <View style={styles.flex}>
        <ConversationViewport />
      </View>

      {/* Floating Institutional Header */}
      <View style={[
        styles.floatingHeader, 
        { 
          paddingTop: insets.top + 4,
          backgroundColor: isAiMode ? colors.background : "transparent",
          borderBottomWidth: isAiMode ? 1 : 0,
          borderBottomColor: colors.border,
        }
      ]}>
        <Pressable 
          style={[
            styles.navBtn, 
            { 
              backgroundColor: isAiMode 
                ? colors.surfaceRaised
                : colors.surface
            }
          ]} 
          onPress={() => router.navigate(isAiMode ? "/(app)/menu" : "/(app)/saved")}
          accessibilityLabel={isAiMode ? t.menu.title : t.saved.title}
        >
          {isAiMode ? (
            <Menu size={18} color={colors.textPrimary} />
          ) : (
            <Heart size={18} color="#DA3F45" fill={resolvedColorScheme === 'dark' ? '#DA3F45' : 'transparent'} />
          )}
        </Pressable>

        {/* Segmented Control / Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceRaised }]}>
          <ModeTab 
            label="AI" 
            active={isAiMode} 
            onPress={() => handleModeChange("ai")} 
            colors={colors}
            resolvedColorScheme={resolvedColorScheme}
          />
          <ModeTab 
            label={uppercaseLatin(t.common.search)} 
            active={!isAiMode} 
            onPress={() => handleModeChange("normal")} 
            colors={colors}
            resolvedColorScheme={resolvedColorScheme}
          />
          {/* Sliding Indicator */}
          <SlidingIndicator
            activeIndex={isAiMode ? 0 : 1}
            resolvedColorScheme={resolvedColorScheme}
            colors={colors}
            isRTL={isRTL}
          />
        </View>

        <Pressable 
          style={styles.navBtn} 
          onPress={() => router.navigate("/(app)/profile")}
          accessibilityLabel={t.common.profile}
        >
          <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarLabel}>{uppercaseLatin(displayName)}</Text>
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

function ModeTab({ label, active, onPress, colors, resolvedColorScheme }: { label: string; active: boolean; onPress: () => void; colors: any; resolvedColorScheme: string }) {
  const activeTextColor = colors.background;
  
  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <View style={styles.tabContent}>
            <Text style={[
          styles.tabText, 
          { color: active ? activeTextColor : colors.textSecondary }
        ]}>
          {label}
        </Text>
        {active && <View style={[styles.brandDot, { backgroundColor: '#DA3F45' }]} />}
      </View>
    </Pressable>
  );
}

function SlidingIndicator({ activeIndex, resolvedColorScheme, colors, isRTL }: { activeIndex: number; resolvedColorScheme: string; colors: any; isRTL: boolean }) {
  const offset = useSharedValue(activeIndex);
  
  useEffect(() => {
    offset.value = withSpring(activeIndex, { damping: 25, stiffness: 220, mass: 0.5 });
  }, [activeIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * 64 * (isRTL ? -1 : 1) }],
  }));

  const indicatorColor = colors.textPrimary;

  return (
      <Animated.View style={[styles.indicator, animatedStyle, { backgroundColor: indicatorColor }]} />
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
    zIndex: 1000,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    height: 36,
    borderRadius: 18,
    padding: 3,
    position: "relative",
    width: 134, // 64 * 2 + padding
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  tabText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  indicator: {
    position: "absolute",
    left: 3,
    top: 3,
    width: 64,
    height: 30,
    borderRadius: 15,
    zIndex: 1,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  brandDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    position: "absolute",
    bottom: -6,
  },
});

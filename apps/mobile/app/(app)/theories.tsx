import { StyleSheet, View, Pressable, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useThreads } from "@/persistence/convex/useConversationData";
import { useAppStore } from "@/store";

export default function TheoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, formatDate, isRTL } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const threads = useThreads();
  const setActiveThreadId = useAppStore((state) => state.setActiveThreadId);

  const filteredTheories = threads.filter((thread: any) =>
    (thread.title ?? t.theories.untitled).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable accessibilityLabel={t.common.back} style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
          </Pressable>
          <Text variant="title" style={styles.headerTitle}>{t.theories.title}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.searchBlock}>
          <View style={styles.searchSurface}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              placeholder={t.theories.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              textAlign={isRTL ? "right" : "left"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 120, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.theoryGroup}>
          <View style={styles.groupCard}>
            {filteredTheories.map((thread: any, index: number) => (
              <View key={thread._id}>
                <Pressable
                  testID={`history.thread.${thread._id}`}
                  style={styles.theoryItem}
                  onPress={() => {
                    setActiveThreadId(thread._id);
                    router.replace("/(app)");
                  }}
                >
                  <View style={styles.theoryMain}>
                    <View style={styles.theoryContent}>
                      <Text variant="body" style={styles.theoryTitle}>{thread.title ?? t.theories.untitled}</Text>
                      <Text variant="caption" style={styles.theoryPreview} numberOfLines={1}>
                        {thread.summary ?? t.theories.openThreadBody}
                      </Text>
                    </View>
                    <View style={styles.theoryMeta}>
                      <Text variant="caption" style={styles.theoryTime}>
                        {formatDate(thread._creationTime)}
                      </Text>
                      <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                    </View>
                  </View>
                </Pressable>
                {index < filteredTheories.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {filteredTheories.length === 0 && (
            <View style={styles.emptyState}>
              <Text variant="body" tone="muted">
                {t.theories.emptyPrefix} &quot;{searchQuery}&quot;
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: `${colors.background}FA`,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerTop: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.6,
    textAlign: "center",
    flex: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  searchBlock: {
    paddingVertical: 4,
  },
  searchSurface: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  theoryGroup: {
    marginTop: 20,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  theoryItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  theoryMain: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  theoryContent: {
    flex: 1,
    marginHorizontal: 12,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  theoryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
    textAlign: isRTL ? "right" : "left",
  },
  theoryPreview: {
    fontSize: 13,
    color: colors.textSecondary,
    opacity: 0.7,
    textAlign: isRTL ? "right" : "left",
  },
  theoryMeta: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 10,
  },
  theoryTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: "Manrope_700Bold",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
});

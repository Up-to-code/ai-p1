import { ScrollView, StyleSheet, View, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Search, ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { EmptyPropertiesState } from "@/decision/components/EmptyPropertiesState";
import { PropertyCard } from "@/decision/components/PropertyCard";
import { PropertySkeletonList } from "@/decision/components/PropertySkeleton";
import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useSavedPropertiesState } from "@/persistence/convex/usePropertyData";
import type { PropertyCardVM } from "@/types/domain";

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const [searchQuery, setSearchQuery] = useState("");

  const { items: savedRows, isLoading } = useSavedPropertiesState();
  const savedListings = savedRows
    .map((item: { property: PropertyCardVM | null }) => item.property)
    .filter((property: PropertyCardVM | null): property is PropertyCardVM => property !== null);

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return savedListings;
    return savedListings.filter((property: PropertyCardVM) =>
      `${property.title} ${property.locationLabel}`.toLowerCase().includes(query),
    );
  }, [savedListings, searchQuery]);

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable accessibilityLabel={t.common.back} style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
          </Pressable>
          <Text variant="title" style={styles.headerTitle}>{t.saved.title}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.search}>
          <View style={styles.searchInner}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              placeholder={t.saved.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
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
        {isLoading ? (
          <PropertySkeletonList count={3} compact />
        ) : filteredProperties.length === 0 ? (
          <EmptyPropertiesState
            title={searchQuery.trim().length > 0 ? t.saved.noMatchesTitle : t.saved.emptyTitle}
            body={searchQuery.trim().length > 0 ? t.saved.noMatchesBody : t.saved.emptyBody}
          />
        ) : (
          <View style={styles.list}>
            {filteredProperties.map((p: PropertyCardVM, i: number) => (
              <Animated.View
                key={p.id}
                entering={FadeInDown.delay(i * 100).springify()}
                style={styles.cardItem}
              >
                <PropertyCard property={p} style={styles.propertyCard} />
              </Animated.View>
            ))}
          </View>
        )}
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
  search: {
    marginTop: 4,
  },
  searchInner: {
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
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  list: {
    gap: 24,
    marginTop: 20,
  },
  cardItem: {
    width: "100%",
  },
  propertyCard: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
});

import { ScrollView, StyleSheet, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Image } from "expo-image";
import { Scale, Bookmark, MapPin, ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { PropertySkeletonList } from "@/decision/components/PropertySkeleton";
import { PropertyStateCard } from "@/decision/components/PropertyStateCard";
import { toggleE2ESavedProperty } from "@/e2e/store";
import { track } from "@/persistence/analytics/track";
import { api } from "@/persistence/convex/api";
import { useAppStore } from "@/store";
import { usePropertiesByIds, useSavedPropertiesState } from "@/persistence/convex/usePropertyData";
import { useMutation } from "convex/react";
import type { PropertyCardVM } from "@/types/domain";
import { useAuthSession } from "@/auth/useAuthSession";
import { useAppLocalization } from "@/foundation/localization";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

export default function CompareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, formatNumber, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const { isAuthenticated, isGuest } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);

  const comparePropertyIds = useAppStore((state) => state.comparePropertyIds);
  const toggleCompareProperty = useAppStore((state) => state.toggleCompareProperty);
  const toggleGuestMirrorSavedProperty = useAppStore((state) => state.toggleGuestMirrorSavedProperty);
  const { items: savedListings, isLoading: isSavedLoading } = useSavedPropertiesState();
  const toggleSavedListing = useMutation(api.listings.toggleSavedListing);
  const compareProperties = usePropertiesByIds(comparePropertyIds);
  const savedPropertyIds = useMemo(
    () => savedListings.map((item: { listingId: string }) => item.listingId),
    [savedListings],
  );

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable accessibilityLabel={t.common.back} style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
          </Pressable>
          <Text variant="title" style={styles.headerTitle}>{t.compare.title}</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text variant="caption" tone="muted" style={styles.subtitle}>
          {t.compare.subtitle}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 110, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {comparePropertyIds.length > 0 && compareProperties.length === 0 ? (
          <PropertySkeletonList count={Math.min(comparePropertyIds.length, 2)} compact />
        ) : compareProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Scale size={48} color={colors.accent} strokeWidth={1} />
            </View>
            <Text variant="title" style={styles.emptyTitle}>{t.compare.emptyTitle}</Text>
            <Text variant="body" tone="muted" style={styles.emptySubtitle}>
              {t.compare.emptyBody}
            </Text>
          </View>
        ) : (
          <>
            {compareProperties.length === 2 && (
              <Animated.View entering={FadeInUp.springify()} style={styles.comparisonSheet}>
                <View testID="compare.table" style={styles.compareTable}>
                  {[
                    { label: t.compare.price, values: compareProperties.map((p: PropertyCardVM) => p.priceLabel) },
                    { label: t.compare.location, values: compareProperties.map((p: PropertyCardVM) => p.locationLabel) },
                    { label: t.compare.beds, values: compareProperties.map((p: PropertyCardVM) => `${p.beds}`) },
                    { label: t.compare.area, values: compareProperties.map((p: PropertyCardVM) => `${formatNumber(p.area)} sqft`) },
                  ].map(({ label, values }, index) => (
                    <View key={label} style={[styles.tableRow, index === 0 && { borderTopWidth: 0 }]}>
                      <Text variant="caption" tone="muted" style={styles.tableLabel}>{label}</Text>
                      {values.map((val: string, i: number) => (
                        <Text key={i} variant="label" style={styles.tableValue}>{val}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            <View style={styles.propertyList}>
              {compareProperties.map((property: PropertyCardVM) => {
                const isSaved = savedPropertyIds.includes(property.id);
                return (
                  <Pressable
                    key={property.id}
                    style={styles.card}
                    onPress={() => {
                      track("property_click", { propertyId: property.id });
                      router.push(`/(app)/property/${property.id}`);
                    }}
                  >
                    <Image source={property.heroUrl} style={styles.cardImage} contentFit="cover" />
                    <View style={styles.cardBody}>
                      <View style={styles.cardInfo}>
                        <Text variant="title" style={{ color: colors.textPrimary }}>{property.priceLabel}</Text>
                        <Text tone="secondary" variant="body">{property.title}</Text>
                        <View style={styles.locationRow}>
                          <MapPin size={12} color={colors.accent} />
                          <Text variant="caption" tone="muted">{property.locationLabel}</Text>
                        </View>
                      </View>

                      <View style={styles.cardActions}>
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => toggleCompareProperty(property.id)}
                        >
                          <Scale size={16} color={colors.textMuted} />
                          <Text variant="caption" tone="muted">{t.common.remove}</Text>
                        </Pressable>
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => {
                            if (!isAuthenticated && !isGuest && !e2eQaMode) {
                              Alert.alert(t.compare.signInRequiredTitle, t.compare.signInRequiredBody);
                              return;
                            }
                            if (e2eQaMode) {
                              toggleE2ESavedProperty(property.id);
                            } else if (isAuthenticated) {
                              void toggleSavedListing({ listingId: property.id });
                            } else {
                              toggleGuestMirrorSavedProperty(property.id);
                            }
                          }}
                        >
                          <Bookmark
                            size={16}
                            color={isSaved ? colors.accent : colors.textMuted}
                            fill={isSaved ? colors.accent : "transparent"}
                          />
                          <Text variant="caption" tone={isSaved ? "accent" : "muted"}>
                            {isSaved ? t.common.saved : t.common.save}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
        {isSavedLoading && compareProperties.length > 0 ? (
          <PropertyStateCard
            title={t.compare.syncingTitle}
            body={t.compare.syncingBody}
          />
        ) : null}
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
    paddingBottom: 16,
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
  subtitle: {
    textAlign: "center",
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 16,
    gap: 24,
  },
  emptyState: {
    marginTop: 80,
    alignItems: "center",
    gap: 16,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: { textAlign: "center" },
  emptySubtitle: { textAlign: "center", lineHeight: 22, maxWidth: 260 },
  comparisonSheet: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  compareTable: {},
  tableRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  tableLabel: {
    width: 80,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  tableValue: {
    flex: 1,
    textAlign: "center",
  },
  propertyList: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardImage: {
    width: "100%",
    height: 220,
  },
  cardBody: {
    padding: 18,
    gap: 16,
  },
  cardInfo: {
    gap: 6,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  locationRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
  },
  cardActions: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 8,
  },
});

import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Map, Search, SlidersHorizontal } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { EmptyPropertiesState } from "@/decision/components/EmptyPropertiesState";
import {
  buildListingFilterParams,
  countActiveListingFilters,
  readListingFilters,
} from "@/decision/listingFilters";
import { FILTER_KEYS, MIN_RESULTS_BEFORE_REMOTE_EXPANSION, type FilterKey } from "@/decision/listingBrowse";
import { PropertyCard } from "@/decision/components/PropertyCard";
import { PropertySkeletonList } from "@/decision/components/PropertySkeleton";
import { PropertyStateCard } from "@/decision/components/PropertyStateCard";
import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useCandidatePropertySearchState } from "@/persistence/convex/usePropertyData";

export default function ListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    filter?: string;
    minPrice?: string;
    maxPrice?: string;
    locations?: string;
    minBeds?: string;
    minBaths?: string;
    propertyTypes?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL, formatNumber } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const advancedFilters = useMemo(() => readListingFilters(params), [params]);
  const activeAdvancedFilterCount = useMemo(
    () => countActiveListingFilters(advancedFilters),
    [advancedFilters],
  );
  const filterResetKey = useMemo(
    () => JSON.stringify({
      minPrice: advancedFilters.minPrice,
      maxPrice: advancedFilters.maxPrice,
      locations: advancedFilters.locations,
      minBeds: advancedFilters.minBeds,
      minBaths: advancedFilters.minBaths,
      propertyTypes: advancedFilters.propertyTypes,
    }),
    [advancedFilters],
  );

  const filterLabels = useMemo<Record<FilterKey, string>>(() => ({
    all: t.listing.filters.all,
    forSale: t.listing.filters.forSale,
    forRent: t.listing.filters.forRent,
    villas: t.listing.filters.villas,
    apartments: t.listing.filters.apartments,
    studios: t.listing.filters.studios,
  }), [t]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [remoteExpansionEnabled, setRemoteExpansionEnabled] = useState(false);

  useEffect(() => {
    const next = FILTER_KEYS.find((key) => key === params.filter || filterLabels[key] === params.filter);
    if (next) {
      setActiveFilter(next);
    }
  }, [filterLabels, params.filter]);

  useEffect(() => {
    setRemoteExpansionEnabled(false);
  }, [activeFilter, filterResetKey, searchQuery]);

  const {
    items: properties,
    isLoading,
    hasLoaded,
    isLoadingMore,
    canLoadMore,
    hasSearchIntent,
    loadMore,
  } = useCandidatePropertySearchState({
    searchQuery,
    activeFilter,
    advancedFilters,
    remoteExpansionEnabled,
  });

  function buildListingHref(pathname: string, nextFilter: typeof advancedFilters = advancedFilters) {
    const nextParams = new URLSearchParams();
    if (activeFilter !== "all") {
      nextParams.set("filter", activeFilter);
    }

    const detailedParams = buildListingFilterParams(nextFilter);
    Object.entries(detailedParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      }
    });

    const query = nextParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  useEffect(() => {
    if (
      !remoteExpansionEnabled
      || !hasSearchIntent
      || properties.length > MIN_RESULTS_BEFORE_REMOTE_EXPANSION
      || isLoadingMore
      || !canLoadMore
    ) {
      return;
    }

    loadMore();
  }, [canLoadMore, hasSearchIntent, isLoadingMore, loadMore, properties.length, remoteExpansionEnabled]);

  function handleEndReached() {
    if (
      !hasSearchIntent
      || isLoading
      || isLoadingMore
      || properties.length > MIN_RESULTS_BEFORE_REMOTE_EXPANSION
    ) {
      return;
    }

    if (!remoteExpansionEnabled) {
      setRemoteExpansionEnabled(true);
      return;
    }

    if (canLoadMore) {
      loadMore();
    }
  }

  function renderFooter() {
    if (!remoteExpansionEnabled || !isLoadingMore || properties.length === 0) {
      return <View style={styles.listFooterSpacer} />;
    }

    return (
      <View style={styles.listFooterLoader}>
        <ActivityIndicator size="small" color={colors.textPrimary} />
        <Text variant="caption" tone="muted">
          {t.listing.stillConnectingTitle}
        </Text>
      </View>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={[styles.crystalHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Pressable accessibilityLabel={t.common.back} style={styles.circleBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
          </Pressable>

          <View style={styles.searchBox}>
            <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={t.listing.searchPlaceholder}
              textAlign={isRTL ? "right" : "left"}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.actionsGroup}>
            <Pressable
              accessibilityLabel={t.listing.mapButton}
              style={styles.circleBtn}
              onPress={() => router.push(buildListingHref("/(app)/listing-map") as never)}
            >
              <Map size={18} color={colors.textPrimary} />
            </Pressable>

            <Pressable
              accessibilityLabel={t.listing.filterButton}
              style={[styles.circleBtn, activeAdvancedFilterCount > 0 && styles.circleBtnActive]}
              onPress={() => router.push(buildListingHref("/(app)/listing-filters") as never)}
            >
              <SlidersHorizontal size={18} color={colors.textPrimary} />
              {activeAdvancedFilterCount > 0 ? (
                <View style={styles.filterCountBadge}>
                  <Text style={styles.filterCountText}>{formatNumber(activeAdvancedFilterCount)}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterWrapper}
        >
          {FILTER_KEYS.map((key) => {
            const label = filterLabels[key];
            return (
              <Pressable
                key={key}
                style={[
                  styles.filterChip,
                  activeFilter === key && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => setActiveFilter(key)}
              >
                <Text
                  variant="caption"
                  style={[
                    styles.filterText,
                    activeFilter === key && { color: colors.background },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(property) => property.id}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40, paddingTop: insets.top + 120 }]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.stateWrap}>
              <PropertySkeletonList count={4} compact />
            </View>
          ) : !hasLoaded ? (
            <View style={styles.stateWrap}>
              <PropertyStateCard
                title={t.listing.stillConnectingTitle}
                body={t.listing.stillConnectingBody}
              />
            </View>
          ) : (
            <EmptyPropertiesState
              title={searchQuery || activeFilter !== "all" || activeAdvancedFilterCount > 0 ? t.listing.noResultsTitle : t.listing.emptyTitle}
              body={searchQuery || activeFilter !== "all" || activeAdvancedFilterCount > 0 ? t.listing.noResultsBody : t.listing.emptyBody}
            />
          )
        }
        ListFooterComponent={renderFooter}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
            <PropertyCard property={item} style={styles.propertyCard} />
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  crystalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: `${colors.background}E6`,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerContent: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    height: 60,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "visible",
  },
  circleBtnActive: {
    borderColor: colors.accent,
  },
  actionsGroup: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: theme.spacing.sm,
  },
  scrollContent: {
    paddingTop: 180,
    paddingHorizontal: 0,
  },
  propertyCard: {
    marginHorizontal: theme.spacing.lg,
  },
  stateWrap: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  listFooterLoader: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  listFooterSpacer: {
    height: theme.spacing.xl,
  },
  searchBox: {
    flex: 1,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  searchIcon: {
    marginHorizontal: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
  },
  filterCountBadge: {
    position: "absolute",
    top: -4,
    [isRTL ? "left" : "right"]: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterCountText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "800",
  },
  filterWrapper: {
    paddingBottom: theme.spacing.md,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    flexDirection: isRTL ? "row-reverse" : "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  filterText: {
    color: colors.textPrimary,
  },
});

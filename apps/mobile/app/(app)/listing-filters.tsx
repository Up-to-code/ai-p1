import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  buildListingFilterParams,
  EMPTY_LISTING_FILTERS,
  getAvailableListingLocations,
  PROPERTY_TYPE_FILTERS,
  readListingFilters,
  type ListingFilters,
  type PropertyTypeFilter,
} from "@/decision/listingFilters";
import { Button } from "@/foundation/primitives/Button";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useAppLocalization } from "@/foundation/localization";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useCandidatePropertiesState } from "@/persistence/convex/usePropertyData";

const COUNT_OPTIONS = [1, 2, 3, 4] as const;

type ListingFilterParams = {
  filter?: string;
  minPrice?: string;
  maxPrice?: string;
  locations?: string;
  minBeds?: string;
  minBaths?: string;
  propertyTypes?: string;
};

export default function ListingFiltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ListingFilterParams>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const { items: properties } = useCandidatePropertiesState();
  const availableLocations = useMemo(() => getAvailableListingLocations(properties), [properties]);
  const paramsKey = [
    params.filter,
    params.minPrice,
    params.maxPrice,
    params.locations,
    params.minBeds,
    params.minBaths,
    params.propertyTypes,
  ].join("|");
  const initialFilters = useMemo(() => readListingFilters(params), [
    params.filter,
    params.minPrice,
    params.maxPrice,
    params.locations,
    params.minBeds,
    params.minBaths,
    params.propertyTypes,
  ]);
  const [filters, setFilters] = useState<ListingFilters>(() => initialFilters);
  const lastParamsKeyRef = useRef(paramsKey);

  useEffect(() => {
    if (lastParamsKeyRef.current === paramsKey) {
      return;
    }

    lastParamsKeyRef.current = paramsKey;
    setFilters(initialFilters);
  }, [initialFilters, paramsKey]);

  const propertyTypeLabels = useMemo<Record<PropertyTypeFilter, string>>(() => ({
    apartment: t.listing.filters.apartments,
    villa: t.listing.filters.villas,
    studio: t.listing.filters.studios,
  }), [t]);

  function applyFilters() {
    const nextParams = new URLSearchParams();
    if (params.filter) {
      nextParams.set("filter", String(params.filter));
    }

    const detailedParams = buildListingFilterParams(filters);
    Object.entries(detailedParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      }
    });

    const query = nextParams.toString();
    router.replace((query ? `/(app)/listing?${query}` : "/(app)/listing") as never);
  }

  function resetFilters() {
    setFilters(EMPTY_LISTING_FILTERS);
  }

  function toggleLocation(location: string) {
    setFilters((current) => ({
      ...current,
      locations: current.locations.includes(location)
        ? current.locations.filter((item) => item !== location)
        : [...current.locations, location],
    }));
  }

  function togglePropertyType(type: PropertyTypeFilter) {
    setFilters((current) => ({
      ...current,
      propertyTypes: current.propertyTypes.includes(type)
        ? current.propertyTypes.filter((item) => item !== type)
        : [...current.propertyTypes, type],
    }));
  }

  function setCountFilter(key: "minBeds" | "minBaths", value: number | null) {
    setFilters((current) => ({
      ...current,
      [key]: current[key] === value ? null : value,
    }));
  }

  return (
    <Screen style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.headerBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
        </Pressable>
        <View style={styles.headerText}>
          <Text variant="title" style={styles.headerTitle}>{t.listing.filterTitle}</Text>
          <Text variant="caption" tone="muted">{t.listing.filterSubtitle}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>{t.listing.filterButton}</Text>
          <Text style={styles.heroBody}>{t.listing.resultsSummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.listing.priceTitle}</Text>
          <View style={styles.priceRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{t.listing.minPricePlaceholder}</Text>
              <TextInput
                keyboardType="numeric"
                placeholder={t.listing.minPricePlaceholder}
                placeholderTextColor={colors.textMuted}
                value={filters.minPrice}
                onChangeText={(value) => setFilters((current) => ({ ...current, minPrice: value }))}
                style={styles.input}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{t.listing.maxPricePlaceholder}</Text>
              <TextInput
                keyboardType="numeric"
                placeholder={t.listing.maxPricePlaceholder}
                placeholderTextColor={colors.textMuted}
                value={filters.maxPrice}
                onChangeText={(value) => setFilters((current) => ({ ...current, maxPrice: value }))}
                style={styles.input}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.listing.locationTitle}</Text>
          <View style={styles.chipGrid}>
            {availableLocations.map((location) => {
              const selected = filters.locations.includes(location);
              return (
                <Pressable
                  key={location}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleLocation(location)}
                >
                  {selected ? <Check size={14} color={colors.textPrimary} /> : null}
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{location}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.listing.propertyTypeTitle}</Text>
          <View style={styles.chipGrid}>
            {PROPERTY_TYPE_FILTERS.map((type) => {
              const selected = filters.propertyTypes.includes(type);
              return (
                <Pressable
                  key={type}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => togglePropertyType(type)}
                >
                  {selected ? <Check size={14} color={colors.textPrimary} /> : null}
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {propertyTypeLabels[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.listing.bedroomsTitle}</Text>
          <View style={styles.chipGrid}>
            <Pressable
              style={[styles.chip, filters.minBeds === null && styles.chipSelected]}
              onPress={() => setCountFilter("minBeds", null)}
            >
              <Text style={[styles.chipText, filters.minBeds === null && styles.chipTextSelected]}>
                {t.listing.anyOption}
              </Text>
            </Pressable>
            {COUNT_OPTIONS.map((count) => {
              const selected = filters.minBeds === count;
              return (
                <Pressable
                  key={count}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setCountFilter("minBeds", count)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {count === 4 ? "4+" : String(count)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.listing.bathroomsTitle}</Text>
          <View style={styles.chipGrid}>
            <Pressable
              style={[styles.chip, filters.minBaths === null && styles.chipSelected]}
              onPress={() => setCountFilter("minBaths", null)}
            >
              <Text style={[styles.chipText, filters.minBaths === null && styles.chipTextSelected]}>
                {t.listing.anyOption}
              </Text>
            </Pressable>
            {COUNT_OPTIONS.map((count) => {
              const selected = filters.minBaths === count;
              return (
                <Pressable
                  key={count}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setCountFilter("minBaths", count)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {count === 4 ? "4+" : String(count)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <Button
          label={t.listing.resetFilters}
          variant="secondary"
          style={styles.footerButton}
          onPress={resetFilters}
        />
        <Button
          label={t.listing.applyFilters}
          style={styles.footerButton}
          onPress={applyFilters}
        />
      </View>
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  headerText: {
    flex: 1,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  heroCard: {
    borderRadius: theme.radii.lg,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  heroEyebrow: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textAlign: isRTL ? "right" : "left",
    color: colors.textMuted,
  },
  heroBody: {
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: isRTL ? "right" : "left",
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    textAlign: isRTL ? "right" : "left",
  },
  priceRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: theme.spacing.md,
  },
  inputWrap: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  inputLabel: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  input: {
    minHeight: 48,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.md,
    color: colors.textPrimary,
    fontFamily: "Manrope_600SemiBold",
    fontSize: 14,
  },
  chipGrid: {
    flexDirection: isRTL ? "row-reverse" : "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chip: {
    minHeight: 40,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.md,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  chipSelected: {
    backgroundColor: "transparent",
    borderColor: colors.textPrimary,
    borderWidth: 2,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
  },
  chipTextSelected: {
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  footerButton: {
    flex: 1,
  },
});

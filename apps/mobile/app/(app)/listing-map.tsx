import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { Platform, Pressable, StyleSheet, View, Dimensions, FlatList, Modal, Switch } from "react-native";
import { ArrowLeft, List, MapPin, SlidersHorizontal, Layers, X, GraduationCap, Activity, ShoppingBag, Map as MapIcon, Globe } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyPropertiesState } from "@/decision/components/EmptyPropertiesState";
import { PropertyStateCard } from "@/decision/components/PropertyStateCard";
import { FILTER_KEYS, filterListingProperties, type FilterKey } from "@/decision/listingBrowse";
import {
  buildPropertyMapPoints,
  getMapCameraPosition,
  toMapboxPosition,
} from "@/decision/listingMap";
import {
  getMapboxStyleURL,
  initializeMapboxAccessToken,
  MapboxCamera,
  mapboxAccessToken,
  MapboxMapView,
  MapboxMarkerView,
  type MapStyleType,
} from "@/decision/mapboxRuntime";
import { buildListingFilterParams, countActiveListingFilters, readListingFilters } from "@/decision/listingFilters";
import { useAppLocalization } from "@/foundation/localization";
import { Button } from "@/foundation/primitives/Button";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useCandidatePropertiesState } from "@/persistence/convex/usePropertyData";

type ListingMapParams = {
  filter?: string;
  minPrice?: string;
  maxPrice?: string;
  locations?: string;
  minBeds?: string;
  minBaths?: string;
  propertyTypes?: string;
};

function getMarkerLabel(priceLabel: string) {
  return priceLabel
    .replace(/\s+/g, " ")
    .replace(/^([A-Z]{3})\s+/i, "$1 ")
    .trim();
}

export default function ListingMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ListingMapParams>();
  const insets = useSafeAreaInsets();
  const { colors, resolvedColorScheme } = useTheme();
  const { t, isRTL, locale, formatNumber } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const advancedFilters = useMemo(() => readListingFilters(params), [
    params.minPrice,
    params.maxPrice,
    params.locations,
    params.minBeds,
    params.minBaths,
    params.propertyTypes,
  ]);
  const activeAdvancedFilterCount = useMemo(
    () => countActiveListingFilters(advancedFilters),
    [advancedFilters],
  );
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  const [mapStyleType, setMapStyleType] = useState<MapStyleType>("standard");
  const [isMapSettingsVisible, setIsMapSettingsVisible] = useState(false);
  const [showSchools, setShowSchools] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [showRetail, setShowRetail] = useState(false);

  const { items: rawProperties, isLoading, hasLoaded } = useCandidatePropertiesState();
  const flatListRef = useRef<FlatList>(null);
  const isMapInteraction = useRef(false);
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewabilityConfigCallbackPairs = useRef([{
    viewabilityConfig: { itemVisiblePercentThreshold: 50 },
    onViewableItemsChanged: ({ viewableItems }: any) => {
      if (viewableItems.length > 0 && !isMapInteraction.current) {
        setSelectedPropertyId(viewableItems[0].item.property.id);
      }
    }
  }]);

  useEffect(() => {
    initializeMapboxAccessToken();
  }, []);

  useEffect(() => {
    const nextFilter = FILTER_KEYS.find((key) => key === params.filter);
    setActiveFilter(nextFilter ?? "all");
  }, [params.filter]);

  const properties = useMemo(() => filterListingProperties(rawProperties, {
    activeFilter,
    advancedFilters,
  }), [activeFilter, advancedFilters, rawProperties]);
  const mapPoints = useMemo(() => buildPropertyMapPoints(properties), [properties]);
  const selectedPoint = useMemo(
    () => mapPoints.find((point) => point.property.id === selectedPropertyId) ?? mapPoints[0] ?? null,
    [mapPoints, selectedPropertyId],
  );
  const cameraPosition = useMemo(
    () => getMapCameraPosition(mapPoints, selectedPoint?.property.id ?? null),
    [mapPoints, selectedPoint?.property.id],
  );

  useEffect(() => {
    if (!mapPoints.length) {
      setSelectedPropertyId(null);
      return;
    }

    const currentIsValid = selectedPropertyId && mapPoints.some((point) => point.property.id === selectedPropertyId);
    if (!currentIsValid) {
      setSelectedPropertyId(mapPoints[0].property.id);
    }
  }, [mapPoints]);

  useEffect(() => {
    if (selectedPropertyId && flatListRef.current && mapPoints.length > 0) {
      if (isMapInteraction.current) {
        const index = mapPoints.findIndex(p => p.property.id === selectedPropertyId);
        if (index >= 0) {
          flatListRef.current.scrollToIndex({ index, animated: true });
        }
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        interactionTimeout.current = setTimeout(() => {
          isMapInteraction.current = false;
        }, 500);
      }
    }
  }, [selectedPropertyId, mapPoints]);

  function buildListingHref(pathname: string) {
    const nextParams = new URLSearchParams();
    if (activeFilter !== "all") {
      nextParams.set("filter", activeFilter);
    }

    const detailedParams = buildListingFilterParams(advancedFilters);
    Object.entries(detailedParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      }
    });

    const query = nextParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function buildAreaHref(pathname: string, locationLabel: string) {
    const nextParams = new URLSearchParams();
    if (activeFilter !== "all") {
      nextParams.set("filter", activeFilter);
    }

    const detailedParams = buildListingFilterParams({
      ...advancedFilters,
      locations: [locationLabel],
    });
    Object.entries(detailedParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      }
    });

    const query = nextParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const hasNativeMapView = Boolean(MapboxMapView && MapboxCamera && MapboxMarkerView);
  const hasMapboxToken = mapboxAccessToken.length > 0;
  const isMapSupported = hasNativeMapView && hasMapboxToken;
  const hasFiltersApplied = activeFilter !== "all" || activeAdvancedFilterCount > 0;
  const styleURL = getMapboxStyleURL(resolvedColorScheme, mapStyleType);
  const MapViewComponent = MapboxMapView as NonNullable<typeof MapboxMapView>;
  const CameraComponent = MapboxCamera as NonNullable<typeof MapboxCamera>;
  const MarkerViewComponent = MapboxMarkerView as NonNullable<typeof MapboxMarkerView>;

  return (
    <Screen style={styles.screen}>
      <View style={styles.mapCanvas}>
        {isMapSupported ? (
          <MapViewComponent
            style={[StyleSheet.absoluteFill, { width: Dimensions.get("window").width, height: Dimensions.get("window").height }]}
            styleURL={styleURL}
            compassEnabled
            scaleBarEnabled
            logoEnabled
            attributionEnabled
            rotateEnabled
            pitchEnabled
            scrollEnabled
            zoomEnabled
            localizeLabels={{ locale }}
          >
            <CameraComponent
              animationDuration={550}
              animationMode="easeTo"
              centerCoordinate={toMapboxPosition(cameraPosition.coordinates)}
              zoomLevel={cameraPosition.zoom}
              padding={{
                paddingTop: insets.top + 164,
                paddingBottom: insets.bottom + 220,
                paddingLeft: 22,
                paddingRight: 22,
              }}
            />

            {mapPoints.map((point) => {
              const selected = point.property.id === selectedPoint?.property.id;
              return (
                <MarkerViewComponent
                  key={point.property.id}
                  coordinate={toMapboxPosition(point.coordinates)}
                  anchor={{ x: 0.5, y: 1 }}
                  allowOverlap
                  isSelected={selected}
                >
                    <Pressable
                      onPress={() => {
                        isMapInteraction.current = true;
                        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
                        setSelectedPropertyId(point.property.id);
                      }}
                      style={[
                        styles.markerCard,
                        selected && styles.markerCardSelected,
                      ]}
                    >
                      <View style={styles.markerImageFrame}>
                        <Image source={{ uri: point.property.heroUrl }} style={styles.markerMiniImage} contentFit="cover" />
                        <View style={[styles.markerPriceTag, selected && styles.markerPriceTagSelected]}>
                          <Text
                            variant="caption"
                            style={[styles.markerText, selected && styles.markerTextSelected]}
                            numberOfLines={1}
                          >
                            {getMarkerLabel(point.property.priceLabel)}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                </MarkerViewComponent>
              );
            })}
          </MapViewComponent>
        ) : (
          <View style={styles.mapFallbackSurface} />
        )}


        {!hasNativeMapView ? (
          <View style={styles.centerOverlay}>
            <PropertyStateCard
              title={t.listing.mapUnavailableTitle}
              body={t.listing.mapUnavailableBody}
            />
          </View>
        ) : !hasMapboxToken ? (
          <View style={styles.centerOverlay}>
            <PropertyStateCard
              title={t.listing.mapTokenMissingTitle}
              body={t.listing.mapTokenMissingBody}
            />
          </View>
        ) : isLoading || !hasLoaded ? (
          <View style={styles.centerOverlay}>
            <PropertyStateCard
              title={t.listing.stillConnectingTitle}
              body={t.listing.stillConnectingBody}
            />
          </View>
        ) : mapPoints.length === 0 ? (
          <View style={styles.centerOverlay}>
            <EmptyPropertiesState
              title={hasFiltersApplied ? t.listing.noResultsTitle : t.listing.emptyTitle}
              body={hasFiltersApplied ? t.listing.noResultsBody : t.listing.emptyBody}
            />
          </View>
        ) : null}

        <View style={[styles.topOverlay, { paddingTop: insets.top + theme.spacing.sm }]}>
          <View style={styles.headerRow}>
            <Pressable accessibilityLabel={t.common.back} style={styles.circleBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
            </Pressable>

            <View style={styles.actionsColumn}>
              <Pressable
                accessibilityLabel={t.listing.listButton}
                style={styles.listBtn}
                onPress={() => router.replace(buildListingHref("/(app)/listing") as never)}
              >
                <List size={18} color={colors.textPrimary} />
                <Text variant="caption" style={styles.listBtnText}>{t.listing.listButton}</Text>
              </Pressable>

              <Pressable
                accessibilityLabel={t.listing.mapSettingsTitle}
                style={styles.iconPill}
                onPress={() => setIsMapSettingsVisible(true)}
              >
                <Layers size={18} color={colors.textPrimary} />
              </Pressable>

              <Pressable
                accessibilityLabel={t.listing.filterButton}
                style={styles.iconPill}
                onPress={() => router.push(buildListingHref("/(app)/listing-filters") as never)}
              >
                <SlidersHorizontal size={18} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>
        </View>

        {isMapSupported && hasLoaded && !isLoading && mapPoints.length > 0 ? (
          <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
            <FlatList
              ref={flatListRef}
              data={mapPoints}
              keyExtractor={(item) => item.property.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={Dimensions.get("window").width - 48} // card width + gap
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/(app)/property/${item.property.id}` as never)}
                  style={styles.selectedCard}
                >
                  <View style={styles.selectedContent}>
                    <Text style={styles.selectedPrice} numberOfLines={1}>
                      {item.property.priceLabel}
                    </Text>
                    <Text style={styles.selectedTitle} numberOfLines={1}>
                      {item.property.title}
                    </Text>
                    <Text style={styles.selectedLocation} numberOfLines={1}>
                      {item.property.locationLabel}
                    </Text>
                  </View>
                  <Image source={{ uri: item.property.heroUrl }} style={styles.selectedImage} contentFit="cover" />
                </Pressable>
              )}
            />
          </View>
        ) : null}

        {/* Map Settings Modal */}
        <Modal
          visible={isMapSettingsVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsMapSettingsVisible(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setIsMapSettingsVisible(false)}
          >
            <Pressable style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              
              <View style={styles.modalHeader}>
                <Text variant="title">{t.listing.mapSettingsTitle}</Text>
                <Pressable onPress={() => setIsMapSettingsVisible(false)} style={styles.closeBtn}>
                  <X size={20} color={colors.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.settingsSection}>
                <Text variant="caption" tone="muted" style={styles.sectionEyebrow}>{t.listing.mapTypeTitle}</Text>
                <View style={styles.mapTypeGrid}>
                  <Pressable 
                    style={[styles.mapTypeCard, mapStyleType === "standard" && styles.mapTypeCardActive]}
                    onPress={() => setMapStyleType("standard")}
                  >
                    <MapIcon size={24} color={colors.textPrimary} />
                    <Text variant="caption" style={[styles.mapTypeLabel, mapStyleType === "standard" && styles.mapTypeLabelActive]}>{t.listing.mapStandard}</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.mapTypeCard, mapStyleType === "satellite" && styles.mapTypeCardActive]}
                    onPress={() => setMapStyleType("satellite")}
                  >
                    <Globe size={24} color={colors.textPrimary} />
                    <Text variant="caption" style={[styles.mapTypeLabel, mapStyleType === "satellite" && styles.mapTypeLabelActive]}>{t.listing.mapSatellite}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.settingsDivider} />

              <View style={styles.settingsSection}>
                <Text variant="caption" tone="muted" style={styles.sectionEyebrow}>{t.listing.pointsOfInterestTitle}</Text>
                
                <View style={styles.poiRow}>
                  <View style={styles.poiRowLeft}>
                    <View style={styles.poiIconBox}>
                      <GraduationCap size={18} color={colors.textPrimary} />
                    </View>
                    <View>
                      <Text variant="body" style={styles.poiLabel}>{t.listing.schoolsTitle}</Text>
                      <Text variant="caption" tone="muted">{t.listing.schoolsBody}</Text>
                    </View>
                  </View>
                  <Switch 
                    value={showSchools} 
                    onValueChange={setShowSchools} 
                    trackColor={{ true: colors.textPrimary, false: colors.divider }}
                    thumbColor={colors.background}
                  />
                </View>

                <View style={styles.poiRow}>
                  <View style={styles.poiRowLeft}>
                    <View style={styles.poiIconBox}>
                      <Activity size={18} color={colors.textPrimary} />
                    </View>
                    <View>
                      <Text variant="body" style={styles.poiLabel}>{t.listing.hospitalsTitle}</Text>
                      <Text variant="caption" tone="muted">{t.listing.hospitalsBody}</Text>
                    </View>
                  </View>
                  <Switch 
                    value={showHospitals} 
                    onValueChange={setShowHospitals} 
                    trackColor={{ true: colors.textPrimary, false: colors.divider }}
                    thumbColor={colors.background}
                  />
                </View>

                <View style={styles.poiRow}>
                  <View style={styles.poiRowLeft}>
                    <View style={styles.poiIconBox}>
                      <ShoppingBag size={18} color={colors.textPrimary} />
                    </View>
                    <View>
                      <Text variant="body" style={styles.poiLabel}>{t.listing.retailTitle}</Text>
                      <Text variant="caption" tone="muted">{t.listing.retailBody}</Text>
                    </View>
                  </View>
                  <Switch 
                    value={showRetail} 
                    onValueChange={setShowRetail} 
                    trackColor={{ true: colors.textPrimary, false: colors.divider }}
                    thumbColor={colors.background}
                  />
                </View>
              </View>

            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: colors.surface,
  },
  mapFallbackSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  listBtn: {
    minWidth: 74,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
  },
  listBtnText: {
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
  },
  actionsColumn: {
    gap: theme.spacing.sm,
    alignItems: isRTL ? "flex-start" : "flex-end",
  },
  iconPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectedCard: {
    flexDirection: isRTL ? "row" : "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    width: Dimensions.get("window").width - 48,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  selectedImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
  },
  selectedContent: {
    flex: 1,
    gap: 4,
  },
  selectedPrice: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: "#DA3F45",
    textAlign: isRTL ? "right" : "left",
  },
  selectedTitle: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: colors.textPrimary,
    textAlign: isRTL ? "right" : "left",
  },
  selectedLocation: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: colors.textSecondary,
    textAlign: isRTL ? "right" : "left",
  },

  markerCard: {
    width: 64,
    height: 64,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  markerCardSelected: {
    borderColor: "#DA3F45",
    transform: [{ scale: 1.12 }],
    zIndex: 10,
  },
  markerImageFrame: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  markerMiniImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceRaised,
  },
  markerPriceTag: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 2,
    alignItems: "center",
  },
  markerPriceTagSelected: {
    backgroundColor: "#DA3F45",
  },
  markerText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Manrope_800ExtraBold",
  },
  markerTextSelected: {
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsSection: {
    gap: 16,
  },
  sectionEyebrow: {
    letterSpacing: 1.6,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 10,
  },
  mapTypeGrid: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 12,
  },
  mapTypeCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  mapTypeCardActive: {
    borderColor: colors.textPrimary,
    borderWidth: 2,
  },
  mapTypeLabel: {
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
  },
  mapTypeLabelActive: {
    color: colors.textPrimary,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 24,
  },
  poiRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  poiRowLeft: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  poiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  poiLabel: {
    fontFamily: "Manrope_800ExtraBold",
  },
});

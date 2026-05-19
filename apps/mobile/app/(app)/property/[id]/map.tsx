import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, Modal, Switch } from "react-native";
import { ArrowLeft, MapPin, Layers, X, GraduationCap, Activity, ShoppingBag, Map as MapIcon, Globe } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PropertyStateCard } from "@/decision/components/PropertyStateCard";
import {
  getMapboxStyleURL,
  initializeMapboxAccessToken,
  MapboxCamera,
  mapboxAccessToken,
  MapboxMapView,
  MapboxMarkerView,
  type MapStyleType,
} from "@/decision/mapboxRuntime";
import { resolvePropertyCoordinates, toMapboxPosition } from "@/decision/listingMap";
import { useTranslation } from "@/foundation/localization";
import { Button } from "@/foundation/primitives/Button";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { usePropertyByIdState } from "@/persistence/convex/usePropertyData";

export default function PropertyMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, resolvedColorScheme } = useTheme();
  const { t, isRTL } = useTranslation();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const [mapStyleType, setMapStyleType] = useState<MapStyleType>("standard");
  const [isMapSettingsVisible, setIsMapSettingsVisible] = useState(false);
  const [showSchools, setShowSchools] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [showRetail, setShowRetail] = useState(false);

  const { item: property, isLoading, isMissing } = usePropertyByIdState(id);

  useEffect(() => {
    initializeMapboxAccessToken();
  }, []);

  const hasNativeMapView = Boolean(MapboxMapView && MapboxCamera && MapboxMarkerView);
  const hasMapboxToken = mapboxAccessToken.length > 0;
  const isMapSupported = hasNativeMapView && hasMapboxToken;
  const styleURL = getMapboxStyleURL(resolvedColorScheme, mapStyleType);
  const point = useMemo(() => (property ? resolvePropertyCoordinates(property) : null), [property]);
  const MapViewComponent = MapboxMapView as NonNullable<typeof MapboxMapView>;
  const CameraComponent = MapboxCamera as NonNullable<typeof MapboxCamera>;
  const MarkerViewComponent = MapboxMarkerView as NonNullable<typeof MapboxMarkerView>;

  function buildAreaHref(locationLabel: string) {
    const nextParams = new URLSearchParams();
    nextParams.set("locations", encodeURIComponent(locationLabel));
    return `/(app)/listing-map?${nextParams.toString()}`;
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.mapCanvas}>
        {isMapSupported && property && point ? (
          <MapViewComponent
            style={StyleSheet.absoluteFill}
            styleURL={styleURL}
            compassEnabled
            scaleBarEnabled
            logoEnabled
            attributionEnabled
            localizeLabels={{ locale: "current" }}
          >
            <CameraComponent
              centerCoordinate={toMapboxPosition(point.coordinates)}
              zoomLevel={13.4}
              animationDuration={550}
              animationMode="easeTo"
              padding={{
                paddingTop: insets.top + 160,
                paddingBottom: insets.bottom + 210,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            />

            <MarkerViewComponent
              coordinate={toMapboxPosition(point.coordinates)}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
              isSelected
            >
              <View style={styles.marker}>
                <Text variant="caption" style={styles.markerText} numberOfLines={1}>
                  {property.priceLabel}
                </Text>
              </View>
            </MarkerViewComponent>
          </MapViewComponent>
        ) : (
          <View style={styles.mapFallbackSurface} />
        )}


        <View style={[styles.topOverlay, { paddingTop: insets.top + theme.spacing.sm }]}>
          <View style={styles.headerRow}>
            <Pressable accessibilityLabel={t.common.back} style={styles.circleBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
            </Pressable>

            <View style={styles.titleCard}>
              <Text variant="title" style={styles.titleText}>{t.property.mapScreenTitle}</Text>
              <Text variant="caption" tone="muted" style={styles.subtitleText}>
                {property?.locationLabel ?? ""}
              </Text>
              {property ? (
                <View style={styles.locationPill}>
                  <MapPin size={12} color={colors.accent} />
                  <Text variant="caption" style={styles.locationPillText} numberOfLines={1}>
                    {property.locationLabel}
                  </Text>
                </View>
              ) : null}
            </View>

            <Pressable
              accessibilityLabel={t.listing.mapSettingsTitle}
              style={styles.circleBtn}
              onPress={() => setIsMapSettingsVisible(true)}
            >
              <Layers size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

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
        ) : isLoading ? (
          <View style={styles.centerOverlay}>
            <PropertyStateCard
              title={t.common.loading}
              body={t.property.mapScreenBody}
            />
          </View>
        ) : isMissing || !property ? (
          <View style={styles.centerOverlay}>
            <PropertyStateCard
              title={t.common.propertyUnavailableTitle}
              body={t.common.propertyUnavailableBody}
              actionLabel={t.common.back}
              onPressAction={() => router.back()}
            />
          </View>
        ) : null}

        {property ? (
          <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
            <View style={styles.selectedCard}>
              <Image source={{ uri: property.heroUrl }} style={styles.selectedImage} contentFit="cover" />
              <View style={styles.selectedBody}>
                <Text variant="caption" tone="muted">{t.property.locationMap}</Text>
                <Text variant="title" numberOfLines={1}>{property.priceLabel}</Text>
                <Text variant="body" numberOfLines={1}>{property.title}</Text>
                <Text variant="caption" tone="muted" numberOfLines={2}>
                  {point?.usesFallbackCoordinates ? t.property.mapScreenBody : property.locationLabel}
                </Text>
                <View style={styles.cardActionsRow}>
                  <Button
                    label={t.property.viewDetails}
                    variant="primary"
                    style={styles.flexButton}
                    onPress={() => router.replace(`/(app)/property/${property.id}` as never)}
                    textStyle={styles.primaryButtonText}
                  />
                  <Button
                    label={t.property.browseArea}
                    variant="secondary"
                    style={styles.flexButton}
                    onPress={() => router.push(buildAreaHref(property.locationLabel) as never)}
                    textStyle={styles.secondaryButtonText}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : null}

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
                    <MapIcon size={24} color={mapStyleType === "standard" ? colors.accent : colors.textPrimary} />
                    <Text variant="caption" style={[styles.mapTypeLabel, mapStyleType === "standard" && styles.mapTypeLabelActive]}>{t.listing.mapStandard}</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.mapTypeCard, mapStyleType === "satellite" && styles.mapTypeCardActive]}
                    onPress={() => setMapStyleType("satellite")}
                  >
                    <Globe size={24} color={mapStyleType === "satellite" ? colors.accent : colors.textPrimary} />
                    <Text variant="caption" style={[styles.mapTypeLabel, mapStyleType === "satellite" && styles.mapTypeLabelActive]}>{t.listing.mapSatellite}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.settingsDivider} />

              <View style={styles.settingsSection}>
                <Text variant="caption" tone="muted" style={styles.sectionEyebrow}>{t.listing.pointsOfInterestTitle}</Text>
                
                <View style={styles.poiRow}>
                  <View style={styles.poiRowLeft}>
                    <View style={[styles.poiIconBox, { backgroundColor: `${colors.accent}1A` }]}>
                      <GraduationCap size={18} color={colors.accent} />
                    </View>
                    <View>
                      <Text variant="body">{t.listing.schoolsTitle}</Text>
                      <Text variant="caption" tone="muted">{t.listing.schoolsBody}</Text>
                    </View>
                  </View>
                  <Switch 
                    value={showSchools} 
                    onValueChange={setShowSchools} 
                    trackColor={{ true: colors.accent, false: colors.border }}
                    thumbColor={colors.background}
                  />
                </View>

                <View style={styles.poiRow}>
                  <View style={styles.poiRowLeft}>
                    <View style={[styles.poiIconBox, { backgroundColor: `${colors.accent}1A` }]}>
                      <Activity size={18} color={colors.accent} />
                    </View>
                    <View>
                      <Text variant="body">{t.listing.hospitalsTitle}</Text>
                      <Text variant="caption" tone="muted">{t.listing.hospitalsBody}</Text>
                    </View>
                  </View>
                  <Switch 
                    value={showHospitals} 
                    onValueChange={setShowHospitals} 
                    trackColor={{ true: colors.accent, false: colors.border }}
                    thumbColor={colors.background}
                  />
                </View>

                <View style={styles.poiRow}>
                  <View style={styles.poiRowLeft}>
                    <View style={[styles.poiIconBox, { backgroundColor: `${colors.accent}1A` }]}>
                      <ShoppingBag size={18} color={colors.accent} />
                    </View>
                    <View>
                      <Text variant="body">{t.listing.retailTitle}</Text>
                      <Text variant="caption" tone="muted">{t.listing.retailBody}</Text>
                    </View>
                  </View>
                  <Switch 
                    value={showRetail} 
                    onValueChange={setShowRetail} 
                    trackColor={{ true: colors.accent, false: colors.border }}
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
    flex: 1,
    backgroundColor: colors.surface,
  },
  mapFallbackSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceRaised,
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
    gap: theme.spacing.sm,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${colors.background}EA`,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  titleCard: {
    flex: 1,
    backgroundColor: `${colors.background}F0`,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: 2,
  },
  titleText: {
    color: colors.textPrimary,
  },
  subtitleText: {
    lineHeight: 18,
  },
  locationPill: {
    alignSelf: "flex-start",
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: `${colors.accent}16`,
    borderWidth: 1,
    borderColor: `${colors.accent}38`,
    maxWidth: "100%",
  },
  locationPillText: {
    color: colors.textPrimary,
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
    paddingHorizontal: theme.spacing.lg,
  },
  selectedCard: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    backgroundColor: `${colors.background}F4`,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  selectedImage: {
    width: 82,
    height: 82,
    borderRadius: theme.radii.md,
    backgroundColor: colors.surfaceRaised,
  },
  selectedBody: {
    flex: 1,
    gap: 2,
  },
  cardActionsRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  flexButton: {
    flex: 1,
    minHeight: 44,
  },
  primaryButtonText: {
    color: colors.background,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
  },
  marker: {
    minWidth: 76,
    maxWidth: 132,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    color: colors.background,
    fontSize: 11,
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
    backgroundColor: colors.border,
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
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsSection: {
    gap: 16,
  },
  sectionEyebrow: {
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  mapTypeGrid: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 12,
  },
  mapTypeCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
  },
  mapTypeCardActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}0A`,
  },
  mapTypeLabel: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  mapTypeLabelActive: {
    color: colors.accent,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: colors.border,
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
  },
});

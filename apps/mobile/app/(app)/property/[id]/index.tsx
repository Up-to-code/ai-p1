import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Sparkles,
  CheckCircle2,
  Calendar,
  Wallet,
  ShieldCheck,
  Building2,
  ArrowRight,
  Info,
  ChevronRight,
  Car,
  Wind,
  Waves,
  Map,
  Flame,
  Droplets,
  Zap,
  Phone,
  ChefHat,
  Tv,
  Wifi,
  Dumbbell,
  MessageCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme } from "@/foundation/theme/tokens";
import { PropertySkeletonList } from "@/decision/components/PropertySkeleton";
import { PropertyStateCard } from "@/decision/components/PropertyStateCard";
import { useCandidatePropertiesState, usePropertyByIdState } from "@/persistence/convex/usePropertyData";
import { PropertyCard } from "@/decision/components/PropertyCard";
import { Text } from "@/foundation/primitives/Text";
import { useTranslation, formatWebCopy } from "@/foundation/localization";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { uppercaseLatin } from "@/foundation/utils/textDisplay";
import {
  MapboxCamera,
  MapboxMapView,
  MapboxMarkerView,
  getMapboxStyleURL,
  initializeMapboxAccessToken,
} from "@/decision/mapboxRuntime";
import { toMapboxPosition } from "@/decision/listingMap";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL: systemIsRTL, locale } = useTranslation();
  
  const { item: property, isLoading, isMissing } = usePropertyByIdState(id);
  const { items: candidateProperties, isLoading: isRecommendationsLoading } = useCandidatePropertiesState();
  const recommendations = candidateProperties.filter(p => p.id !== id).slice(0, 5);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [isAmenitiesModalVisible, setIsAmenitiesModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isArabicContent = /[\u0600-\u06FF]/.test(property?.title || "");
  const isRTL = systemIsRTL || locale === "ar" || isArabicContent;

  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);

  useEffect(() => {
    initializeMapboxAccessToken();
  }, []);

  const mapStyleURL = getMapboxStyleURL(colors.background === "#000000" ? "dark" : "light", "standard");
  const propertyCoordinates = property?.coordinates ? toMapboxPosition(property.coordinates) : null;

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingHorizontal: 16 }]}>
        <PropertySkeletonList count={1} />
      </View>
    );
  }

  if (isMissing || !property) {
    return (
      <View style={[styles.screen, styles.centered, { paddingHorizontal: 20 }]}>
        <PropertyStateCard
          title={t.common.propertyUnavailableTitle}
          body={t.common.propertyUnavailableBody}
          actionLabel={t.common.back}
          onPressAction={() => router.back()}
        />
      </View>
    );
  }

  const renderImageItem = ({ item }: { item: string }) => (
    <Image
      source={{ uri: item }}
      style={styles.heroImage}
      contentFit="cover"
      transition={200}
    />
  );

  const getAmenityIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("gas")) return <Flame size={16} color={colors.accent} />;
    if (l.includes("water")) return <Droplets size={16} color={colors.accent} />;
    if (l.includes("electri") || l.includes("meter")) return <Zap size={16} color={colors.accent} />;
    if (l.includes("landline") || l.includes("phone")) return <Phone size={16} color={colors.accent} />;
    if (l.includes("kitchen")) return <ChefHat size={16} color={colors.accent} />;
    if (l.includes("parking") || l.includes("garage")) return <Car size={16} color={colors.accent} />;
    if (l.includes("view") || l.includes("sea")) return <Waves size={16} color={colors.accent} />;
    if (l.includes("construction") || l.includes("year")) return <Calendar size={16} color={colors.accent} />;
    if (l.includes("tv") || l.includes("satellite")) return <Tv size={16} color={colors.accent} />;
    if (l.includes("wifi") || l.includes("internet")) return <Wifi size={16} color={colors.accent} />;
    if (l.includes("security") || l.includes("guard")) return <ShieldCheck size={16} color={colors.accent} />;
    if (l.includes("pool")) return <Waves size={16} color={colors.accent} />;
    if (l.includes("gym")) return <Dumbbell size={16} color={colors.accent} />;
    return <Info size={16} color={colors.accent} />;
  };

  const RecommendationCard = ({ property }: { property: any }) => (
    <Pressable 
      style={styles.recCard}
      onPress={() => router.push(`/(app)/property/${property.id}`)}
    >
      <View style={styles.recImageContainer}>
        <Image source={{ uri: property.heroUrl }} style={styles.recImage} />
        <View style={styles.recHeart}>
          <Heart size={14} color="#FFFFFF" fill="rgba(0,0,0,0.1)" />
        </View>
      </View>
      <View style={styles.recContent}>
        <Text style={styles.recPrice}>{property.priceLabel}</Text>
        <View style={styles.recMetaRow}>
          <Text style={styles.recMetaText}>{property.area}m²</Text>
          <View style={styles.recMetaDot} />
          <Text style={styles.recMetaText}>{property.beds} {t.propertyCard.bed}</Text>
        </View>
        <Text style={styles.recLocation} numberOfLines={1}>
          {uppercaseLatin(property.locationLabel.split(",")[0])}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      {/* Overlay Header */}
      <View style={[styles.overlayHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={20} color="#FFFFFF" style={mirrorIcon(isRTL)} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={() => setIsSaved(!isSaved)}>
            <Heart size={20} color={isSaved ? colors.accent : "#FFFFFF"} fill={isSaved ? colors.accent : "transparent"} />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <Share2 size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Image Swiper */}
        <View style={styles.heroContainer}>
          <FlatList
            data={property.imageUrls || [property.heroUrl]}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            keyExtractor={(_, index) => index.toString()}
          />
          <View style={styles.pagination}>
            {(property.imageUrls || [property.heroUrl]).map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  activeImageIndex === index && styles.paginationDotActive
                ]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Title & Location */}
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>{uppercaseLatin(property.title)}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textMuted} />
              <Text style={styles.locationText}>{uppercaseLatin(property.locationLabel)}</Text>
            </View>
          </View>

          {/* Quick Specs Row */}
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <BedDouble size={18} color={colors.textPrimary} />
              <View style={styles.specContent}>
                <Text style={styles.specValue}>{property.beds}</Text>
                <Text style={styles.specLabel}>{t.projects.rooms}</Text>
              </View>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Bath size={18} color={colors.textPrimary} />
              <View style={styles.specContent}>
                <Text style={styles.specValue}>{property.baths}</Text>
                <Text style={styles.specLabel}>{t.projects.baths}</Text>
              </View>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Ruler size={18} color={colors.textPrimary} />
              <View style={styles.specContent}>
                <Text style={styles.specValue}>{property.area}</Text>
                <Text style={styles.specLabel}>{t.projects.area}</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Wallet size={18} color={colors.accent} />
            <Text style={styles.priceText} numberOfLines={1} adjustsFontSizeToFit>{property.priceLabel}</Text>
          </View>

          <View style={styles.divider} />

          {/* Compound & Developer */}
          {(property.compoundName || property.developerName) && (
            <View style={styles.contextSection}>
              {property.compoundName && (
                <View style={styles.compoundBlock}>
                  <MapPin size={14} color={colors.accent} />
                  <Text style={styles.compoundText}>
                    {formatWebCopy(t.property.inCompound, { compound: uppercaseLatin(property.compoundName) })}
                  </Text>
                </View>
              )}
              {property.developerName && (
                <View style={styles.developerBadge}>
                  <Building2 size={12} color={colors.textMuted} />
                  <Text style={styles.developerLabel}>
                    {formatWebCopy(t.property.byDeveloper, { developer: uppercaseLatin(property.developerName) })}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.property.description}</Text>
            <Text style={styles.descriptionText} numberOfLines={4}>
              {property.description}
            </Text>
            <Pressable 
              onPress={() => setIsDescriptionModalVisible(true)}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMoreText}>{t.property.readMore}</Text>
              <ArrowRight size={14} color={colors.accent} />
            </Pressable>
          </View>

          {/* AI Market Insight */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Zap size={18} color={colors.accent} />
              <Text style={styles.aiTitle}>{t.property.marketInsight}</Text>
            </View>
            <Text style={styles.aiBody}>{property.aiSummary}</Text>
          </View>

          {/* Amenities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.property.amenities}</Text>
              {property.amenities.length > 8 && (
                <Pressable 
                  onPress={() => setIsAmenitiesModalVisible(true)}
                  style={styles.readMoreButton}
                >
                  <Text style={styles.readMoreText}>{t.property.viewAll} ({property.amenities.length})</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.amenitiesGrid}>
              {property.amenities.slice(0, 8).map((amenity) => (
                <View key={amenity.id} style={styles.amenityItem}>
                  <View style={styles.amenityIconContainer}>
                    {getAmenityIcon(amenity.label)}
                  </View>
                  <Text style={styles.amenityText} numberOfLines={1}>{uppercaseLatin(amenity.label)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Location / Map Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.property.locationMap}</Text>
            {propertyCoordinates && MapboxMapView && MapboxCamera && MapboxMarkerView ? (
              <View style={styles.mapWrapper}>
                <MapboxMapView
                  style={styles.mapPreview}
                  styleURL={mapStyleURL}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <MapboxCamera
                    centerCoordinate={propertyCoordinates}
                    zoomLevel={14}
                  />
                  <MapboxMarkerView coordinate={propertyCoordinates}>
                    <View style={styles.mapMarker}>
                      <View style={styles.mapMarkerDot} />
                    </View>
                  </MapboxMarkerView>
                </MapboxMapView>
                
                {/* Premium Map Actions */}
                <View style={styles.mapActionOverlay}>
                  <Pressable 
                    style={styles.mapPill}
                    onPress={() => router.push({
                      pathname: "/(app)/listing-map",
                      params: { 
                        centerLat: propertyCoordinates[1],
                        centerLng: propertyCoordinates[0],
                        selectedId: id
                      }
                    })}
                  >
                    <Map size={16} color={colors.textPrimary} />
                    <Text style={styles.mapPillText}>{t.property.openMapView}</Text>
                  </Pressable>
                </View>

                <View style={styles.mapLocationOverlay}>
                  <Text style={styles.mapLocationText}>{uppercaseLatin(property.locationLabel)}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <MapPin size={24} color={colors.textMuted} />
                <Text style={styles.mapPlaceholderText}>{t.property.locationUnavailable}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Broker & Agency Hierarchy Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.property.listingExpert}</Text>
            <View style={styles.agencyBrokerCard}>
              <View style={styles.agencyHeader}>
                <View style={styles.agencyLogoContainer}>
                  <Building2 size={24} color={colors.accent} />
                </View>
                <View style={styles.agencyInfo}>
                  <Text style={styles.agencyNameLarge}>{uppercaseLatin(property.broker.agency)}</Text>
                  <Text style={styles.legalLabel}>{t.property.legalAgency}</Text>
                </View>
              </View>
              
              <View style={styles.agencyDivider} />
              
              <Pressable 
                style={styles.brokerSubCard}
                onPress={() => router.push(`/(app)/broker/${property.broker.id}`)}
              >
                <Image 
                  source={{ uri: property.broker.avatarUrl }} 
                  style={styles.brokerAvatarSmall}
                />
                <View style={styles.brokerInfo}>
                  <Text style={styles.brokerNameSmall}>{uppercaseLatin(property.broker.name)}</Text>
                  <Text style={styles.brokerRole}>{t.property.certifiedAdvisor}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Recommendations Section - Minimal Horizontal Cards */}
          {isRecommendationsLoading ? (
            <View style={styles.recSection}>
              <Text style={styles.recSectionTitle}>{t.property.recommendations}</Text>
              <PropertySkeletonList count={2} compact />
            </View>
          ) : recommendations.length > 0 && (
            <View style={styles.recSection}>
              <Text style={styles.recSectionTitle}>{t.property.recommendations}</Text>
              <View style={styles.recListWrapper}>
                <FlatList
                  data={recommendations}
                  renderItem={({ item }) => <RecommendationCard property={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                />
                
                {/* Simulated Left Fade */}
                <View style={[styles.edgeFade, { left: 0, width: 8, opacity: 1, backgroundColor: colors.background }]} pointerEvents="none" />
                <View style={[styles.edgeFade, { left: 8, width: 8, opacity: 0.7, backgroundColor: colors.background }]} pointerEvents="none" />
                <View style={[styles.edgeFade, { left: 16, width: 8, opacity: 0.4, backgroundColor: colors.background }]} pointerEvents="none" />
                <View style={[styles.edgeFade, { left: 24, width: 8, opacity: 0.1, backgroundColor: colors.background }]} pointerEvents="none" />
                
                {/* Simulated Right Fade */}
                <View style={[styles.edgeFade, { right: 0, width: 8, opacity: 1, backgroundColor: colors.background }]} pointerEvents="none" />
                <View style={[styles.edgeFade, { right: 8, width: 8, opacity: 0.7, backgroundColor: colors.background }]} pointerEvents="none" />
                <View style={[styles.edgeFade, { right: 16, width: 8, opacity: 0.4, backgroundColor: colors.background }]} pointerEvents="none" />
                <View style={[styles.edgeFade, { right: 24, width: 8, opacity: 0.1, backgroundColor: colors.background }]} pointerEvents="none" />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.ctaRow}>
          <Pressable 
            style={[styles.ctaButton, styles.callPill]}
            onPress={() => Alert.alert(t.property.call, t.property.contactExpert)}
          >
            <Phone size={20} color={colors.background} />
            <Text style={styles.callPillText}>{t.property.call}</Text>
          </Pressable>
          <Pressable 
            style={[styles.ctaButton, styles.whatsappPill]}
            onPress={() => Alert.alert(t.property.whatsapp, t.property.contactExpert)}
          >
            <MessageCircle size={20} color={colors.textPrimary} />
            <Text style={styles.whatsappPillText}>{t.property.whatsapp}</Text>
          </Pressable>
        </View>
      </View>

      {/* Amenities Modal (Sheet) */}
      <Modal
        visible={isAmenitiesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAmenitiesModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsAmenitiesModalVisible(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.property.amenities}</Text>
              <Pressable 
                style={styles.readMoreButton}
                onPress={() => setIsAmenitiesModalVisible(false)}
              >
                <Text style={styles.readMoreText}>{t.property.close}</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity) => (
                  <View key={amenity.id} style={[styles.amenityItem, { width: "100%", marginBottom: 8 }]}>
                    <View style={styles.amenityIconContainer}>
                      {getAmenityIcon(amenity.label)}
                    </View>
                    <Text style={styles.amenityText}>{uppercaseLatin(amenity.label)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Description Modal (Sheet) */}
      <Modal
        visible={isDescriptionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDescriptionModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsDescriptionModalVisible(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.property.description}</Text>
              <Pressable 
                style={styles.readMoreButton}
                onPress={() => setIsDescriptionModalVisible(false)}
              >
                <Text style={styles.readMoreText}>{t.property.close}</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fullDescriptionText}>{property.description}</Text>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  scroll: {
    flex: 1,
  },
  overlayHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: colors.surfaceRaised,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 20,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  pricingSection: {
    gap: 16,
  },
  priceHeader: {
    gap: 4,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textMuted,
    letterSpacing: 1.5,
    textAlign: isRTL ? "right" : "left",
  },
  priceRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
    minHeight: 44,
  },
  priceText: {
    fontSize: 26,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: -0.6,
    flex: 1,
    textAlign: isRTL ? "right" : "left",
    lineHeight: 36,
    paddingBottom: 6,
  },
  badgeRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "stretch",
  },
  matchBadge: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.success,
  },
  matchBadgeText: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.success,
    letterSpacing: 0.5,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tagBadgeText: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.accent,
    letterSpacing: 0.5,
  },
  contextSection: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    alignSelf: "stretch",
    paddingHorizontal: 4,
  },
  compoundBlock: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
  },
  compoundText: {
    fontSize: 13,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.accent,
    letterSpacing: 0.5,
  },
  developerBadge: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.divider,
    alignSelf: isRTL ? "flex-end" : "flex-start",
  },
  developerLabel: {
    fontSize: 9,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textMuted,
    letterSpacing: 1,
    textAlign: isRTL ? "right" : "left",
  },
  titleSection: {
    gap: 6,
    alignSelf: "stretch",
  },
  titleText: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.3,
    textAlign: isRTL ? "right" : "left",
  },
  locationRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textAlign: isRTL ? "right" : "left",
  },
  referenceRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  referenceLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: colors.textMuted,
    textAlign: isRTL ? "right" : "left",
  },
  referenceValue: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: 1,
    textAlign: isRTL ? "right" : "left",
  },
  mapPreviewCard: {
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
  },
  mapPreviewRow: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  mapPreviewBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPreviewContent: {
    flex: 1,
    gap: 4,
  },
  mapPreviewEyebrow: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  mapPreviewTitle: {
    fontSize: 16,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  mapPreviewBody: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  specsGrid: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  specItem: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  specContent: {
    alignItems: isRTL ? "flex-end" : "flex-start",
    gap: 0,
  },
  specDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
  specValue: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    lineHeight: 22,
  },
  specLabel: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginTop: -4,
  },
  section: {
    gap: 16,
    alignSelf: "stretch",
  },
  sectionHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapWrapper: {
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.divider,
    position: "relative",
  },
  mapPreview: {
    flex: 1,
  },
  mapMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(218,63,69,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(218,63,69,0.4)",
  },
  mapMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DA3F45",
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: 24,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mapPlaceholderText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: colors.textSecondary,
  },
  mapActionOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  mapPill: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mapPillText: {
    fontSize: 11,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  mapLocationOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  mapLocationText: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: 2,
    textAlign: isRTL ? "right" : "left",
    alignSelf: "stretch",
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: "Manrope_500Medium",
    color: colors.textSecondary,
    lineHeight: 26,
    textAlign: isRTL ? "right" : "left",
  },
  readMoreButton: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
  },
  readMoreText: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.accent,
  },
  aiCard: {
    padding: 20,
    backgroundColor: "transparent",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: 12,
    alignSelf: "stretch",
  },
  aiHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 10,
  },
  aiTitle: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.accent,
    letterSpacing: 1.5,
    textAlign: isRTL ? "right" : "left",
  },
  aiBody: {
    fontSize: 15,
    fontFamily: "Manrope_600SemiBold",
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: isRTL ? "right" : "left",
  },
  techGrid: {
    flexDirection: isRTL ? "row-reverse" : "row",
    flexWrap: "wrap",
    gap: 16,
  },
  techItem: {
    width: (SCREEN_WIDTH - 64) / 2,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techLabel: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: colors.textMuted,
    letterSpacing: 1,
    textAlign: isRTL ? "right" : "left",
  },
  techValue: {
    fontSize: 13,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    textAlign: isRTL ? "right" : "left",
  },
  amenitiesGrid: {
    flexDirection: isRTL ? "row-reverse" : "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    width: (SCREEN_WIDTH - 44) / 2,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  amenityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: colors.textPrimary,
    flex: 1,
    textAlign: isRTL ? "right" : "left",
  },
  agencyBrokerCard: {
    backgroundColor: "transparent",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  agencyHeader: {
    padding: 20,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.surfaceRaised,
  },
  agencyLogoContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    flexShrink: 0,
  },
  agencyInfo: {
    flex: 1,
    gap: 2,
  },
  agencyNameLarge: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: isRTL ? "right" : "left",
  },
  legalLabel: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: colors.textMuted,
    letterSpacing: 1,
    textAlign: isRTL ? "right" : "left",
  },
  agencyDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 20,
  },
  brokerSubCard: {
    padding: 20,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 14,
  },
  brokerAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
  },
  brokerInfo: {
    flex: 1,
    gap: 4,
  },
  brokerNameSmall: {
    fontSize: 15,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    textAlign: isRTL ? "right" : "left",
  },
  brokerRole: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: colors.accent,
    letterSpacing: 0.5,
    textAlign: isRTL ? "right" : "left",
  },
  recSection: {
    paddingVertical: 16,
  },
  recSectionTitle: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: 2,
    paddingHorizontal: 8,
    marginBottom: 16,
    textAlign: isRTL ? "right" : "left",
  },
  recListWrapper: {
    position: "relative",
  },
  recCard: {
    width: 180,
    marginRight: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  recImageContainer: {
    width: "100%",
    height: 140,
  },
  recImage: {
    width: "100%",
    height: "100%",
  },
  recHeart: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  recContent: {
    padding: 12,
    gap: 6,
  },
  recPrice: {
    fontSize: 16,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    textAlign: isRTL ? "right" : "left",
  },
  recMetaRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
  },
  recMetaText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: colors.textSecondary,
    textAlign: isRTL ? "right" : "left",
  },
  recMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
  },
  recLocation: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textMuted,
    marginTop: 2,
    textAlign: isRTL ? "right" : "left",
  },
  edgeFade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 32,
    zIndex: 2,
  },
  edgeFadeLeft: {
    left: 0,
  },
  edgeFadeRight: {
    right: 0,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomPriceInfo: {
    gap: 2,
  },
  bottomPriceLabel: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textMuted,
    letterSpacing: 0.5,
    textAlign: isRTL ? "right" : "left",
  },
  bottomPriceValue: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    textAlign: isRTL ? "right" : "left",
  },
  ctaRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 12,
    flex: 1,
  },
  ctaButton: {
    flex: 1,
    height: 48,
    borderRadius: theme.radii.pill,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  whatsappPill: {
    backgroundColor: colors.background,
    borderColor: colors.divider,
  },
  whatsappPillText: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: colors.textPrimary,
  },
  callPill: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  callPillText: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "80%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  modalCloseText: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.accent,
  },
  fullDescriptionText: {
    fontSize: 16,
    fontFamily: "Manrope_500Medium",
    color: colors.textSecondary,
    lineHeight: 28,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  contactOptions: {
    gap: 12,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
  },
  contactSubLabel: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});

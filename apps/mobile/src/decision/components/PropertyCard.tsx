import { memo, useMemo, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { Image } from "expo-image";
import {
  Bath,
  BedDouble,
  CheckCircle2,
  Heart,
  MessageCircle,
  Phone,
  Ruler,
} from "lucide-react-native";

import { useAuthSession } from "@/auth/useAuthSession";
import { useTranslation } from "@/foundation/localization";
import { toggleE2ESavedProperty } from "@/e2e/store";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import type { AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useDetectionHeightAndWidthOfTheScreen } from "@/lib/detectionHeightAndWidthOfTheScreen";
import { track } from "@/persistence/analytics/track";
import { api } from "@/persistence/convex/api";
import { useSavedProperties } from "@/persistence/convex/usePropertyData";
import { useAppStore } from "@/store";
import type { PropertyCardVM } from "@/types/domain";

import {
  formatPropertySpecLabel,
  getPropertyListingBadge,
  localizePropertyTag,
} from "./propertyCardCopy";
import { PropertyCardContactButton } from "./PropertyCardContactButton";
import { PropertyCardMediaGallery } from "./PropertyCardMediaGallery";
import { PropertyCardSpecs, type PropertyCardSpec } from "./PropertyCardSpecs";

type PropertyCardProps = {
  property: PropertyCardVM;
  compact?: boolean;
  variant?: "default" | "chat" | "compact-list";
  style?: StyleProp<ViewStyle>;
};

export const PropertyCard = memo(function PropertyCard({
  property,
  compact = false,
  variant = "default",
  style,
}: PropertyCardProps) {
  const { colors } = useTheme();
  const { t, locale, isRTL } = useTranslation();
  const { propertyCard: cardMetrics } = useDetectionHeightAndWidthOfTheScreen();
  const styles = useMemo(() => createStyles(colors, cardMetrics, isRTL), [cardMetrics, colors, isRTL]);
  const palette = styles.palette;
  const mediaScrollRef = useRef<ScrollView>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mediaWidth, setMediaWidth] = useState(cardMetrics.mediaWidth);
  const router = useRouter();
  const { isAuthenticated } = useAuthSession();
  const setSelectedPropertyId = useAppStore((state) => state.setSelectedPropertyId);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eSavedPropertyIds = useAppStore((state) => state.e2eSavedPropertyIds);
  const savedPropertyIds = useAppStore((state) => state.guestMirrorSavedPropertyIds);
  const toggleSavedProperty = useAppStore((state) => state.toggleGuestMirrorSavedProperty);
  const savedListings = useSavedProperties();
  const toggleSavedListing = useMutation(api.listings.toggleSavedListing);
  const isSaved = e2eQaMode
    ? e2eSavedPropertyIds.includes(property.id)
    : isAuthenticated
      ? savedListings.some((item: { listingId: string }) => item.listingId === property.id)
      : savedPropertyIds.includes(property.id);

  const openProperty = () => {
    setSelectedPropertyId(property.id);
    track("property_click", { propertyId: property.id });
    router.push(`/(app)/property/${property.id}`);
  };

  const toggleSave = () => {
    if (e2eQaMode) {
      toggleE2ESavedProperty(property.id);
    } else if (isAuthenticated) {
      void toggleSavedListing({ listingId: property.id });
    } else {
      toggleSavedProperty(property.id);
    }

    track("property_save", { propertyId: property.id, saved: !isSaved });
  };

  const contactBroker = (mode: "phone" | "whatsapp") => {
    track("contact_agent", { propertyId: property.id, mode });

    const phone = property.broker.phone.replace(/[^\d+]/g, "");
    if (!phone) return;

    if (mode === "whatsapp") {
      Linking.openURL(`https://wa.me/${phone.replace(/^\+/, "")}`);
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const listingBadge = getPropertyListingBadge(t, property.matchScore);
  const galleryImages = useMemo(() => {
    const urls = property.imageUrls?.length ? property.imageUrls : [property.heroUrl];
    return urls.filter((url, index) => Boolean(url) && urls.indexOf(url) === index);
  }, [property.heroUrl, property.imageUrls]);
  const safeImageIndex = Math.min(activeImageIndex, Math.max(galleryImages.length - 1, 0));
  const hasGalleryControls = galleryImages.length > 1;
  const listingSpecs = [
    property.beds > 0
      ? {
        key: "beds",
        icon: <BedDouble size={cardMetrics.iconSize} color={colors.textSecondary} />,
        label: formatPropertySpecLabel(locale, t, "beds", property.beds),
      }
      : null,
    property.baths > 0
      ? {
        key: "baths",
        icon: <Bath size={cardMetrics.iconSize} color={colors.textSecondary} />,
        label: formatPropertySpecLabel(locale, t, "baths", property.baths),
      }
      : null,
    property.area > 0
      ? {
        key: "area",
        icon: <Ruler size={cardMetrics.iconSize} color={colors.textSecondary} />,
        label: formatPropertySpecLabel(locale, t, "area", property.area),
      }
      : null,
  ].filter(Boolean) as PropertyCardSpec[];

  const scrollToImage = (nextIndex: number) => {
    setActiveImageIndex(nextIndex);
    mediaScrollRef.current?.scrollTo({ x: nextIndex * mediaWidth, animated: true });
  };

  const setPreviousImage = () => {
    const nextIndex = (safeImageIndex - 1 + galleryImages.length) % galleryImages.length;
    scrollToImage(nextIndex);
  };

  const setNextImage = () => {
    const nextIndex = (safeImageIndex + 1) % galleryImages.length;
    scrollToImage(nextIndex);
  };

  const handleMediaLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && Math.abs(nextWidth - mediaWidth) > 1) {
      setMediaWidth(nextWidth);
    }
  };

  const handleMediaMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / Math.max(mediaWidth, 1));
    setActiveImageIndex(Math.max(0, Math.min(nextIndex, galleryImages.length - 1)));
  };

  if (variant === "chat") {
    const isTopMatch = property.tags.includes("top_match") || property.tags.includes("verified");
    
    return (
      <Pressable
        testID={`property.card.chat.${property.id}`}
        onPress={openProperty}
        style={[styles.chatCard, style]}
      >
        <View style={styles.chatTopRow}>
          <View style={styles.chatContent}>


            <View style={styles.chatInfo}>
              <Text style={styles.chatPrice} numberOfLines={1}>
                {property.priceLabel}
              </Text>

              <View style={styles.chatSpecsRow}>
                {property.beds > 0 && (
                  <View style={styles.chatSpecItem}>
                    <Text style={styles.chatSpecValue}>
                      {property.beds} {t.propertyCard.bed}
                    </Text>
                    <BedDouble size={14} color={colors.textSecondary} />
                  </View>
                )}
                {property.beds > 0 && property.baths > 0 && <View style={styles.chatSpecDivider} />}
                {property.baths > 0 && (
                  <View style={styles.chatSpecItem}>
                    <Text style={styles.chatSpecValue}>
                      {property.baths} {t.propertyCard.bath}
                    </Text>
                    <Bath size={14} color={colors.textSecondary} />
                  </View>
                )}
                {(property.beds > 0 || property.baths > 0) && property.area > 0 && <View style={styles.chatSpecDivider} />}
                {property.area > 0 && (
                  <View style={styles.chatSpecItem}>
                    <Text style={styles.chatSpecValue}>
                      {Math.round(property.area)} {t.propertyCard.sqft}
                    </Text>
                    <Ruler size={14} color={colors.textSecondary} />
                  </View>
                )}
              </View>

              <Text style={styles.chatTitle} numberOfLines={1}>
                {property.title}
              </Text>
            </View>
          </View>

          <View style={styles.chatMediaFrame}>
            <Image source={property.heroUrl} style={styles.chatImage} contentFit="cover" />
            <Pressable
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                toggleSave();
              }}
              style={styles.chatImageHeartBtn}
            >
              <Heart
                size={16}
                color={isSaved ? "#DA3F45" : "#FFFFFF"}
                fill={isSaved ? "#DA3F45" : "transparent"}
              />
            </Pressable>
            {isTopMatch && (
              <View style={styles.chatImageBadge}>
                <View style={styles.chatBadgeDot} />
                <Text style={styles.chatBadgePillText}>{t.propertyCard.topMatch}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.chatActionsRow}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              contactBroker("phone");
            }}
            style={[styles.chatActionBtn, styles.chatActionCall]}
          >
            <Text style={[styles.chatActionText, styles.chatActionCallText]}>{t.propertyCard.call}</Text>
            <Phone size={18} color="#DA3F45" />
          </Pressable>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              contactBroker("whatsapp");
            }}
            style={[styles.chatActionBtn, styles.chatActionWhatsapp]}
          >
            <Text style={[styles.chatActionText, styles.chatActionWhatsappText]}>{t.propertyCard.whatsapp}</Text>
            <MessageCircle size={18} color="#25D366" />
          </Pressable>
        </View>
      </Pressable>
    );
  }

  if (variant === "compact-list") {
    return (
      <Pressable
        testID={`property.card.compact.${property.id}`}
        onPress={openProperty}
        style={[styles.compactListCard, style]}
      >
        <Image source={property.heroUrl} style={styles.compactListImage} contentFit="cover" />
        <View style={styles.compactListContent}>
          <View style={styles.compactListTopRow}>
            <View style={styles.compactListStatus}>
              <View style={styles.compactListStatusDot} />
              <Text style={styles.compactListStatusText}>{listingBadge}</Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                toggleSave();
              }}
              style={styles.compactListHeartBtn}
            >
              <Heart
                size={16}
                color={isSaved ? colors.accent : colors.textSecondary}
                fill={isSaved ? colors.accent : "transparent"}
              />
            </Pressable>
          </View>

          <Text style={styles.compactListPrice} numberOfLines={1}>{property.priceLabel}</Text>

          <View style={styles.compactListSpecsRow}>
            {property.beds > 0 && (
              <View style={styles.compactListSpecItem}>
                <BedDouble size={14} color={colors.textPrimary} />
                <Text style={styles.compactListSpecText}>{formatPropertySpecLabel(locale, t, "beds", property.beds)}</Text>
              </View>
            )}
            {property.baths > 0 && (
              <>
                {property.beds > 0 && <View style={styles.compactListSpecDivider} />}
                <View style={styles.compactListSpecItem}>
                  <Bath size={14} color={colors.textPrimary} />
                  <Text style={styles.compactListSpecText}>{formatPropertySpecLabel(locale, t, "baths", property.baths)}</Text>
                </View>
              </>
            )}
            {property.area > 0 && (
              <>
                {(property.beds > 0 || property.baths > 0) && <View style={styles.compactListSpecDivider} />}
                <View style={styles.compactListSpecItem}>
                  <Ruler size={14} color={colors.textPrimary} />
                  <Text style={styles.compactListSpecText}>{formatPropertySpecLabel(locale, t, "area", property.area)}</Text>
                </View>
              </>
            )}
          </View>

          <Text style={styles.compactListAddress} numberOfLines={1}>{property.title}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={`property.card.${property.id}`}
      onPress={openProperty}
      style={[styles.card, compact && styles.compactCard, style]}
    >
      <PropertyCardMediaGallery
        galleryImages={galleryImages}
        mediaScrollRef={mediaScrollRef}
        mediaWidth={mediaWidth}
        safeImageIndex={safeImageIndex}
        hasGalleryControls={hasGalleryControls}
        isSaved={isSaved}
        compact={compact}
        styles={styles}
        palette={palette}
        colors={colors}
        labels={{
          previousImage: t.propertyCard.previousImage,
          nextImage: t.propertyCard.nextImage,
          saveProperty: t.propertyCard.saveProperty,
          removeSavedProperty: t.propertyCard.removeSavedProperty,
        }}
        onLayout={handleMediaLayout}
        onMomentumEnd={handleMediaMomentumEnd}
        onPreviousImage={setPreviousImage}
        onNextImage={setNextImage}
        onToggleSave={toggleSave}
      />

      <View style={[styles.content, compact && styles.compactContent]}>
        <View style={styles.priceRow}>
          <Text variant="title" style={[styles.price, compact && styles.compactPrice]} numberOfLines={2}>
            {property.priceLabel}
          </Text>
        </View>

        <PropertyCardSpecs specs={listingSpecs} styles={styles} />

        <Text variant="title" style={[styles.titleText, compact && styles.compactTitle]} numberOfLines={2}>
          {property.title}
        </Text>
        {property.description || property.aiSummary ? (
          <Text variant="body" style={styles.descriptionText} numberOfLines={2}>
            {property.description || property.aiSummary}
          </Text>
        ) : null}
        {property.locationLabel ? (
          <Text variant="body" style={styles.locationText} numberOfLines={1}>
            {property.locationLabel}
          </Text>
        ) : null}

        {!compact ? (
          <View style={styles.actionRow}>
            <PropertyCardContactButton
              icon={<MessageCircle size={cardMetrics.actionIconSize} color={palette.action} />}
              label={t.propertyCard.whatsapp}
              onPress={() => contactBroker("whatsapp")}
              style={styles.whatsappAction}
              labelStyle={styles.whatsappActionLabel}
              isRTL={isRTL}
            />
            <PropertyCardContactButton
              icon={<Phone size={cardMetrics.actionIconSize} color={palette.signal} fill={palette.signal} />}
              label={t.propertyCard.call}
              onPress={() => contactBroker("phone")}
              style={styles.callAction}
              labelStyle={styles.callActionLabel}
              isRTL={isRTL}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

const createStyles = (
  colors: AppColors,
  metrics: ReturnType<typeof useDetectionHeightAndWidthOfTheScreen>["propertyCard"],
  isRTL: boolean,
) => {
  const isDark = colors.background === "#000000";
  const palette = {
    primary: colors.textPrimary,
    primaryStrong: colors.textPrimary,
    primarySoft: isDark ? "rgba(255,255,255,0.1)" : "#F4F4F5",
    navy: isDark ? colors.textPrimary : "#0A1428",
    signal: colors.accent,
    signalSoft: "transparent",
    action: colors.textPrimary,
    actionSoft: "transparent",
  };

  const stylesheet = StyleSheet.create({
    card: {
      backgroundColor: "transparent",
      borderRadius: metrics.radius,
      overflow: "hidden",
      marginHorizontal: 8,
      marginBottom: 24,
    },
    compactCard: {
      marginHorizontal: 0,
      marginBottom: theme.spacing.md,
      borderRadius: 18,
    },
    chatCard: {
      backgroundColor: "transparent",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      overflow: "hidden",
      marginBottom: 8,
      marginHorizontal: 0,
    },
    chatTopRow: {
      flexDirection: isRTL ? "row" : "row-reverse",
      minHeight: 124,
      alignItems: "center",
      paddingHorizontal: 12,
      gap: 12,
    },
    chatContent: {
      flex: 1,
      paddingVertical: 12,
      justifyContent: "center",
    },
    chatHeaderRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    chatBadgePill: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 6,
    },
    chatBadgePillText: {
      fontSize: 10,
      fontFamily: "Manrope_800ExtraBold",
      color: "#DA3F45",
    },
    chatImageBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      flexDirection: isRTL ? "row" : "row-reverse",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255,255,255,0.9)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    chatBadgeDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#DA3F45",
    },
    chatImageHeartBtn: {
      position: "absolute",
      top: 8,
      left: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.25)",
    },

    chatInfo: {
      flex: 1,
      justifyContent: "center",
      gap: 4,
    },
    chatPrice: {
      fontSize: 20,
      fontFamily: "Manrope_800ExtraBold",
      color: colors.textPrimary,
      textAlign: isRTL ? "right" : "left",
    },
    chatTitle: {
      fontSize: 14,
      fontFamily: "Manrope_700Bold",
      color: colors.textPrimary,
      textAlign: isRTL ? "right" : "left",
    },
    chatLocation: {
      fontSize: 12,
      fontFamily: "Manrope_500Medium",
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
    },
    chatSpecsRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
      flexWrap: "wrap",
    },
    chatSpecItem: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 4,
    },
    chatSpecValue: {
      fontSize: 12,
      fontFamily: "Manrope_700Bold",
      color: colors.textPrimary,
    },
    chatSpecDivider: {
      width: 1,
      height: 12,
      backgroundColor: colors.divider,
    },
    chatMediaFrame: {
      width: 100,
      height: 100,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: colors.surfaceRaised,
    },
    chatImage: {
      width: "100%",
      height: "100%",
    },
    chatPagination: {
      position: "absolute",
      bottom: 12,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      gap: 4,
    },
    chatDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "rgba(255,255,255,0.4)",
    },
    chatDotActive: {
      width: 12,
      backgroundColor: "#FFFFFF",
    },
    chatActionsRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    chatActionBtn: {
      flex: 1,
      height: 48,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    chatActionCall: {
      borderRightWidth: isRTL ? 0 : 1,
      borderLeftWidth: isRTL ? 1 : 0,
      borderRightColor: colors.divider,
      borderLeftColor: colors.divider,
      backgroundColor: isDark ? "rgba(107, 70, 193, 0.05)" : "rgba(107, 70, 193, 0.02)",
    },
    chatActionWhatsapp: {
      backgroundColor: isDark ? "rgba(37, 211, 102, 0.05)" : "rgba(37, 211, 102, 0.02)",
    },
    chatActionText: {
      fontSize: 14,
      fontFamily: "Manrope_800ExtraBold",
    },
    chatActionCallText: {
      color: "#DA3F45",
    },
    chatActionWhatsappText: {
      color: "#25D366",
    },
    mediaFrame: {
      width: "100%",
      aspectRatio: metrics.imageAspectRatio,
      borderRadius: metrics.radius,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    compactMediaFrame: {
      borderRadius: 18,
      aspectRatio: 1.25,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    mediaSlide: {
      height: "100%",
    },
    mediaScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.02)",
    },
    chatBadge: {
      position: "absolute",
      top: 10,
      ...(isRTL ? { right: 10 } : { left: 10 }),
      minHeight: 24,
      borderRadius: 999,
      paddingHorizontal: 10,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: isDark ? "rgba(0,0,0,0.68)" : "rgba(255,255,255,0.92)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.04)",
    },
    chatBadgeText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: -0.1,
    },
    topBadgeRow: {
      position: "absolute",
      top: metrics.horizontalInset,
      right: metrics.horizontalInset,
      left: metrics.horizontalInset,
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    featureBadge: {
      minHeight: metrics.badgeHeight,
      borderRadius: 999,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "42%",
      backgroundColor: isDark ? "rgba(10,20,40,0.72)" : "rgba(255,255,255,0.88)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(10,20,40,0.08)",
    },
    featureBadgeText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: -0.1,
    },
    listingBadge: {
      minHeight: metrics.badgeHeight,
      borderRadius: 999,
      paddingHorizontal: 11,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 6,
      maxWidth: "48%",
      backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.92)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)",
    },
    listingBadgeText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: -0.1,
    },
    listingBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.textPrimary,
    },
    favoriteButton: {
      position: "absolute",
      top: metrics.horizontalInset,
      ...(isRTL ? { left: metrics.horizontalInset } : { right: metrics.horizontalInset }),
      width: metrics.favoriteButtonSize,
      height: metrics.favoriteButtonSize,
      borderRadius: metrics.favoriteButtonSize / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.92)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)",
    },
    galleryButton: {
      position: "absolute",
      top: "47%",
      width: 40,
      height: 40,
      marginTop: -20,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.9)",
    },
    galleryButtonLeft: {
      ...(isRTL ? { right: metrics.horizontalInset } : { left: metrics.horizontalInset }),
    },
    galleryButtonRight: {
      ...(isRTL ? { left: metrics.horizontalInset } : { right: metrics.horizontalInset }),
    },
    pagination: {
      position: "absolute",
      bottom: 12,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.45)",
    },
    paginationDotActive: {
      width: 14,
      backgroundColor: "#FFFFFF",
    },
    content: {
      paddingHorizontal: metrics.contentPadding,
      paddingTop: metrics.contentPadding,
      paddingBottom: 0,
      gap: metrics.contentGap,
    },
    compactContent: {
      paddingTop: 14,
      gap: 10,
    },

    listingHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    listingTitleBlock: {
      flex: 1,
      gap: 5,
    },
    priceRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    price: {
      maxWidth: "100%",
      flexShrink: 0,
      fontSize: metrics.priceFontSize + 5,
      lineHeight: metrics.priceLineHeight + 6,
      fontWeight: "900",
      color: colors.textPrimary,
      letterSpacing: -0.25,
      textAlign: isRTL ? "right" : "left",
    },
    compactPrice: {
      fontSize: 22,
    },
    specRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 10,
      flexWrap: "wrap",
    },
    specPill: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "transparent",
    },
    specText: {
      color: colors.textSecondary,
      fontSize: metrics.metaFontSize + 1,
      fontWeight: "800",
      letterSpacing: -0.1,
    },
    titleText: {
      fontSize: metrics.titleFontSize + 1,
      lineHeight: metrics.titleLineHeight + 2,
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: -0.25,
      textAlign: isRTL ? "right" : "left",
    },
    descriptionText: {
      fontSize: metrics.titleFontSize - 1,
      lineHeight: metrics.titleLineHeight + 1,
      color: colors.textPrimary,
      fontWeight: "700",
      letterSpacing: -0.18,
      textAlign: isRTL ? "right" : "left",
    },
    locationText: {
      fontSize: metrics.metaFontSize,
      lineHeight: metrics.metaLineHeight + 1,
      color: colors.textSecondary,
      fontWeight: "700",
      letterSpacing: -0.1,
      textAlign: isRTL ? "right" : "left",
    },
    compactTitle: {
      fontSize: 16,
      lineHeight: 22,
    },

    actionRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
      marginTop: 0,
    },
    whatsappAction: {
      minHeight: metrics.actionHeight,
      borderRadius: metrics.actionRadius,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    whatsappActionLabel: {
      color: colors.textPrimary,
      fontSize: metrics.actionFontSize,
    },
    callAction: {
      minHeight: metrics.actionHeight,
      borderRadius: metrics.actionRadius,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    callActionLabel: {
      color: colors.textPrimary,
      fontSize: metrics.actionFontSize,
    },
    compactListCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 12,
      borderRadius: 20,
      backgroundColor: isDark ? colors.surfaceRaised : colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12, // ensure they don't stick together if parent list has 0 gap
    },
    compactListImage: {
      width: 106,
      height: 106,
      borderRadius: 14,
      backgroundColor: colors.surfaceRaised,
    },
    compactListContent: {
      flex: 1,
      gap: 4,
      justifyContent: "center",
    },
    compactListTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    compactListStatus: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    compactListStatusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    compactListStatusText: {
      fontSize: 12,
      color: colors.accent,
      fontFamily: "Manrope_700Bold",
    },
    compactListHeartBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    compactListPrice: {
      fontSize: 20,
      lineHeight: 24,
      color: colors.textPrimary,
      fontFamily: "Manrope_800ExtraBold",
      textAlign: isRTL ? "right" : "left",
      marginTop: 2,
    },
    compactListSpecsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
    },
    compactListSpecItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    compactListSpecText: {
      fontSize: 12,
      color: colors.textPrimary,
      fontFamily: "Manrope_700Bold",
    },
    compactListSpecDivider: {
      width: 1,
      height: 10,
      backgroundColor: colors.divider,
    },
    compactListAddress: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
      textAlign: isRTL ? "right" : "left",
      marginTop: 4,
    },
  });

  return Object.assign(stylesheet, { palette });
};

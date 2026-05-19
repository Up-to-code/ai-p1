import { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, TextInput, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyPropertiesState } from "@/decision/components/EmptyPropertiesState";
import { PropertyCard } from "@/decision/components/PropertyCard";
import { PropertySkeletonList } from "@/decision/components/PropertySkeleton";
import { PropertyStateCard } from "@/decision/components/PropertyStateCard";
import { EdgeFade } from "@/conversation/components/EdgeFade";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { Text } from "@/foundation/primitives/Text";
import { useTranslation } from "@/foundation/localization";
import { useScrollPositionMotion } from "@/lib/useScrollPositionMotion";
import { useCandidatePropertiesState, useSavedPropertiesState } from "@/persistence/convex/usePropertyData";
import type { PropertyCardVM } from "@/types/domain";

const BANNER_HEIGHT = 320;
const BRAND_DOT_COLOR = "#DA3F45";
const SCROLL_HEADER_THRESHOLD = 44;

/**
 * SlidingIndicator for segmented controls
 */
function SlidingIndicator({
  activeIndex,
  itemsCount,
  containerWidth,
  resolvedColorScheme,
  colors,
  isRTL
}: {
  activeIndex: number;
  itemsCount: number;
  containerWidth: number;
  resolvedColorScheme: string;
  colors: any;
  isRTL: boolean;
}) {
  const itemWidth = (containerWidth - 8) / itemsCount; // 8 is total horizontal padding (4 on each side)
  const offset = useSharedValue(activeIndex);

  useEffect(() => {
    offset.value = withSpring(activeIndex, { damping: 25, stiffness: 220, mass: 0.5 });
  }, [activeIndex, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: itemWidth,
    transform: [{ translateX: offset.value * itemWidth * (isRTL ? -1 : 1) }],
  }));

  const indicatorColor = colors.textPrimary;

  return (
    <Animated.View style={[styles.indicator, animatedStyle, { backgroundColor: indicatorColor }]} />
  );
}

type PropertyRailSectionProps = {
  title: string;
  ctaLabel: string;
  properties: PropertyCardVM[];
  cardWidth: number;
  delay: number;
  emptyTitle?: string;
  emptyBody?: string;
  viewStyles: ReturnType<typeof createStyles>;
  onViewAll: () => void;
};

function PropertyRailSection({
  title,
  ctaLabel,
  properties,
  cardWidth,
  delay,
  emptyTitle,
  emptyBody,
  viewStyles,
  onViewAll,
}: PropertyRailSectionProps) {
  if (properties.length === 0 && !emptyTitle) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={[viewStyles.railSection, { width: cardWidth }]}>
      <View style={viewStyles.railHeader}>
        <View style={viewStyles.railTitleBlock}>
          <Text style={viewStyles.sectionTitle}>{title}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onViewAll} style={viewStyles.sectionCta}>
          <Text style={viewStyles.viewAllText}>{ctaLabel}</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 10}
        decelerationRate="fast"
        contentContainerStyle={viewStyles.railContent}
      >
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <Animated.View
              key={property.id}
              entering={FadeInDown.delay(delay + 60 + index * 50).duration(350)}
              style={{ width: cardWidth }}
            >
              <PropertyCard property={property} style={viewStyles.propertyCard} />
            </Animated.View>
          ))
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onViewAll}
            style={[viewStyles.emptyRailCard, { width: cardWidth }]}
          >
            <Text style={viewStyles.emptyRailTitle}>{emptyTitle}</Text>
            {emptyBody ? <Text style={viewStyles.emptyRailBody}>{emptyBody}</Text> : null}
            <Text style={viewStyles.emptyRailCta}>{ctaLabel}</Text>
          </Pressable>
        )}
      </ScrollView>
    </Animated.View>
  );
}

export function NormalModeView() {
  const router = useRouter();
  const { colors, resolvedColorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { t, isRTL } = useTranslation();
  const scrollMotion = useScrollPositionMotion({
    threshold: SCROLL_HEADER_THRESHOLD,
    backgroundColor: `${colors.background}E6`,
    borderColor: colors.divider,
  });

  const [transaction, setTransaction] = useState<"buy" | "rent">("buy");
  const { items: properties, isLoading: isPropertiesLoading } = useCandidatePropertiesState();
  const { items: savedListings, isLoading: isSavedLoading } = useSavedPropertiesState();

  const containerPadding = 24 * 2;
  const contentWidth = windowWidth - containerPadding;
  const railCardWidth = Math.min(windowWidth - 16, 440);
  const topMatchProperties = useMemo(
    () => [...properties].sort((a, b) => b.matchScore - a.matchScore).slice(0, 8),
    [properties],
  );
  const searchProperties = useMemo(
    () => properties.slice(0, 8),
    [properties],
  );
  const savedProperties = useMemo(
    () => savedListings.map((row) => row.property).filter((property): property is PropertyCardVM => Boolean(property)),
    [savedListings],
  );

  const viewStyles = createStyles(colors, insets, isRTL, resolvedColorScheme);
  const openListing = (filter?: string) => {
    const href = filter
      ? `/(app)/listing?filter=${encodeURIComponent(filter)}`
      : "/(app)/listing";
    router.navigate(href as never);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={viewStyles.container}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          viewStyles.motionHeader,
          { height: insets.top + 54 },
          scrollMotion.headerAnimatedStyle,
        ]}
      >
        <Animated.View style={[viewStyles.motionHeaderEdge, scrollMotion.edgeAnimatedStyle]}>
          <EdgeFade
            color={colors.background}
            placement="top"
            startOpacity={0.58}
            midOpacity={0.18}
          />
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={viewStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollMotion.onScroll}
        scrollEventThrottle={16}
      >
        {/* Banner Section */}
        <View style={viewStyles.bannerWrapper}>
          <Image
            source={require("../../../assets/banner_search.png")}
            style={viewStyles.bannerImage}
            contentFit="cover"
            transition={1000}
          />
          <View style={viewStyles.bannerOverlay} />
        </View>

        {/* Search Interaction Layer */}
        <View style={viewStyles.contentBlock}>

          {/* Main Search Component (Composer Style) */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            layout={Layout.springify()}
            style={viewStyles.composerContainer}
          >
            {/* Unified Search Bar (Matches AI Composer Dock) */}
            <View style={viewStyles.unifiedBar}>
              <Pressable
                style={[viewStyles.actionButton, { backgroundColor: "#DA3F45" }]}
                onPress={() => openListing()}
              >
                <Search size={20} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>

              <View style={viewStyles.inputField}>
                <TextInput
                  placeholder={t.homeSearch.placeholder}
                  placeholderTextColor={colors.textMuted}
                  style={viewStyles.input}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </View>

            {/* Inner Transaction Toggle (Buy vs Rent) - Now UNDER Search */}
            <View style={viewStyles.transactionRow}>
              <SlidingIndicator
                activeIndex={transaction === "rent" ? 0 : 1}
                itemsCount={2}
                containerWidth={contentWidth} // No padding needed as it's separate
                resolvedColorScheme={resolvedColorScheme}
                colors={colors}
                isRTL={isRTL}
              />
              <Pressable
                onPress={() => setTransaction("rent")}
                style={viewStyles.transactionBtn}
              >
                <View style={viewStyles.btnContent}>
                  <Text style={[viewStyles.transactionText, transaction === "rent" && viewStyles.transactionTextActive]}>
                    {t.homeSearch.rent}
                  </Text>
                  {transaction === "rent" && <View style={viewStyles.brandDot} />}
                </View>
              </Pressable>
              <Pressable
                onPress={() => setTransaction("buy")}
                style={viewStyles.transactionBtn}
              >
                <View style={viewStyles.btnContent}>
                  <Text style={[viewStyles.transactionText, transaction === "buy" && viewStyles.transactionTextActive]}>
                    {t.homeSearch.buy}
                  </Text>
                  {transaction === "buy" && <View style={viewStyles.brandDot} />}
                </View>
              </Pressable>
            </View>
          </Animated.View>

          {/* Spacer between search pill and projects */}
          <View style={{ height: 36 }} />

          {isPropertiesLoading ? (
            <View style={viewStyles.skeletonWrap}>
              <PropertySkeletonList count={2} compact />
            </View>
          ) : properties.length === 0 ? (
            <EmptyPropertiesState
              title={t.listing.emptyTitle}
              body={t.listing.emptyBody}
            />
          ) : (
            <>
              <PropertyRailSection
                title={t.homeSearch.topMatchesTitle}
                ctaLabel={t.homeSearch.viewAll}
                properties={topMatchProperties}
                cardWidth={railCardWidth}
                delay={300}
                viewStyles={viewStyles}
                onViewAll={() => openListing()}
              />
              <PropertyRailSection
                title={t.homeSearch.searchTitle}
                ctaLabel={t.homeSearch.viewAll}
                properties={searchProperties}
                cardWidth={railCardWidth}
                delay={380}
                viewStyles={viewStyles}
                onViewAll={() => openListing("all")}
              />
              <PropertyRailSection
                title={t.homeSearch.savedTitle}
                ctaLabel={t.homeSearch.viewAll}
                properties={savedProperties}
                cardWidth={railCardWidth}
                delay={460}
                emptyTitle={t.homeSearch.emptySavedTitle}
                emptyBody={t.homeSearch.emptySavedBody}
                viewStyles={viewStyles}
                onViewAll={() => router.navigate("/(app)/saved")}
              />
              {isSavedLoading ? (
                <View style={viewStyles.savedLoadingWrap}>
                  <PropertyStateCard
                    title={t.homeSearch.syncingSavedTitle}
                    body={t.homeSearch.syncingSavedBody}
                  />
                </View>
              ) : null}
            </>
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
}

const createStyles = (colors: any, insets: any, isRTL: boolean, colorScheme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  motionHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000000",
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },
  motionHeaderEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -18,
    height: 18,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerWrapper: {
    height: BANNER_HEIGHT,
    width: "100%",
    position: "relative",
    backgroundColor: colors.background,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  contentBlock: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: -84, // Centers the 40px transaction selector exactly on the banner's baseline (Search bar is 52px + 12px gap + 20px half-toggle = 84px)
  },
  skeletonWrap: {
    width: "100%",
    gap: 16,
  },
  savedLoadingWrap: {
    width: "100%",
    marginTop: 8,
  },
  categoryPillContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 32,
    padding: 3,
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    position: "relative",
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  btnContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  brandDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: BRAND_DOT_COLOR,
    position: "absolute",
    bottom: -6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#52525B",
    fontFamily: isRTL ? "Cairo_700Bold" : "Manrope_800ExtraBold",
  },
  categoryTextActive: {
    color: colors.background,
  },
  composerContainer: {
    width: "100%",
    gap: 12,
  },
  transactionRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 2,
    width: "100%",
    height: 40, // Slimmer, more professional profile
    borderWidth: 1,
    borderColor: colors.divider,
    position: "relative",
    alignItems: "center",
  },
  transactionBtn: {
    flex: 1,
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  transactionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#52525B",
    fontFamily: isRTL ? "Cairo_700Bold" : "Manrope_800ExtraBold",
  },
  transactionTextActive: {
    color: colors.background,
  },
  unifiedBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52, // Slightly more compact
    borderRadius: 26,
    backgroundColor: colors.surfaceRaised,
    paddingLeft: 6,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  inputField: {
    flex: 1,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    height: "100%",
    paddingLeft: 8,
  },
  searchIcon: {
    [isRTL ? "marginLeft" : "marginRight"]: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: isRTL ? "Cairo_600SemiBold" : "Manrope_600SemiBold",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 12, // Matches transactionBtn radius
    zIndex: 1,
  },
  projectsSection: {
    width: "100%",
    marginTop: 0, // Handled by spacer View above
  },
  sectionHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 1.5,
    fontFamily: "Manrope_800ExtraBold",
  },
  viewAllText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.accent,
    letterSpacing: 0.9,
    fontFamily: "Manrope_800ExtraBold",
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Manrope_600SemiBold",
    marginTop: 4,
  },
  sectionCta: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  railSection: {
    width: "100%",
    marginBottom: 20,
  },
  railHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  railTitleBlock: {
    flex: 1,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  railContent: {
    gap: 10,
    paddingHorizontal: 0,
    paddingBottom: 4,
  },
  emptyRailCard: {
    minHeight: 168,
    borderRadius: 24,
    padding: 18,
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyRailTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.2,
  },
  emptyRailBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Manrope_600SemiBold",
    maxWidth: 280,
  },
  emptyRailCta: {
    color: colors.accent,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.8,
  },
  projectsList: {
    gap: 20,
    alignItems: "center",
  },
  propertyCard: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
});

const styles = StyleSheet.create({
  indicator: {
    position: "absolute",
    left: 3,
    top: 3,
    bottom: 3,
    borderRadius: 28,
    zIndex: 1,
  },
});

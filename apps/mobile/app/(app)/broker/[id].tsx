import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Phone, Mail, Star, MapPin, Building2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { PropertyCard } from "@/decision/components/PropertyCard";
import { useCandidateProperties } from "@/persistence/convex/usePropertyData";
import type { PropertyCardVM } from "@/types/domain";

export default function BrokerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"about" | "properties">("properties");

  const rawProperties = useCandidateProperties();
  
  const { broker, brokerListings } = useMemo(() => {
    const brokerProperty = rawProperties.find((p: PropertyCardVM) => p.broker && p.broker.id === params.id);
    const listings = rawProperties.filter((p: PropertyCardVM) => p.broker && p.broker.id === params.id);
    return { broker: brokerProperty?.broker, brokerListings: listings };
  }, [rawProperties, params.id]);

  if (!broker) return null;

  return (
    <Screen style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.circleBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.profileCard}>
           <Image source={broker.avatarUrl} style={styles.avatar} contentFit="cover" />
           <Text style={styles.brokerName}>{broker.name}</Text>
           <Text style={styles.agencyName}>{broker.agency}</Text>
           
           <View style={styles.metaRow}>
             <View style={[styles.metaBadge, { borderColor: "#FBBF24" }]}>
               <Star size={14} color="#FBBF24" fill="#FBBF24" />
               <Text style={[styles.badgeText, { color: "#FBBF24" }]}>{broker.rating}</Text>
             </View>
             <View style={[styles.metaBadge, { borderColor: colors.accent }]}>
               <Building2 size={14} color={colors.accent} />
               <Text style={[styles.badgeText, { color: colors.accent }]}>{broker.activeListingsCount} Listings</Text>
             </View>
           </View>

           <View style={styles.actionRow}>
             <Pressable style={[styles.actionBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
               <Phone size={18} color={colors.background} />
               <Text style={styles.actionTextPrimary}>Call Agent</Text>
             </Pressable>
             <Pressable style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.divider }]}>
               <Mail size={18} color={colors.textPrimary} />
             </Pressable>
           </View>
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <Pressable 
            style={[styles.tab, activeTab === "about" && styles.activeTab]} 
            onPress={() => setActiveTab("about")}
          >
            <Text style={[styles.tabText, activeTab === "about" && styles.activeTabText]}>About</Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === "properties" && styles.activeTab]} 
            onPress={() => setActiveTab("properties")}
          >
            <Text style={[styles.tabText, activeTab === "properties" && styles.activeTabText]}>Active Listings</Text>
          </Pressable>
        </View>

        {activeTab === "about" ? (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.aboutSection}>
             <Text style={styles.bio}>{broker.description}</Text>
          </Animated.View>
        ) : (
          <View style={styles.listingsSection}>
             {brokerListings.map((property: PropertyCardVM, idx: number) => (
               <Animated.View key={property.id} entering={FadeInDown.delay(100 + (idx * 50))}>
                 <PropertyCard property={property} compact={false} style={{ marginBottom: theme.spacing.md }} />
               </Animated.View>
             ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    height: 100,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  brokerName: {
    marginTop: 16,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  agencyName: {
    marginTop: 4,
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: 16,
    marginBottom: 20,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: theme.radii.pill,
  },
  badgeText: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 12,
  },
  bio: {
    textAlign: "center",
    fontFamily: "Manrope_500Medium",
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: "row",
    width: "100%",
    gap: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
  },
  actionTextPrimary: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 14,
    color: colors.background,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  tabText: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.background,
  },
  aboutSection: {
    paddingBottom: theme.spacing.xl,
  },
  listingsSection: {
    paddingBottom: theme.spacing.xl,
  },
});

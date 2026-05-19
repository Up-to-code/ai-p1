import {
  Pressable,
  ScrollView,
  View,
  type ImageStyle,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react-native";
import type { RefObject } from "react";

type MediaGalleryStyles = {
  mediaFrame: StyleProp<ViewStyle>;
  compactMediaFrame: StyleProp<ViewStyle>;
  mediaSlide: StyleProp<ViewStyle>;
  image: StyleProp<ImageStyle>;
  mediaScrim: StyleProp<ViewStyle>;
  galleryButton: StyleProp<ViewStyle>;
  galleryButtonLeft: StyleProp<ViewStyle>;
  galleryButtonRight: StyleProp<ViewStyle>;
  favoriteButton: StyleProp<ViewStyle>;
  pagination: StyleProp<ViewStyle>;
  paginationDot: StyleProp<ViewStyle>;
  paginationDotActive: StyleProp<ViewStyle>;
};

type MediaGalleryPalette = {
  navy: string;
  signal: string;
};

type MediaGalleryColors = {
  textPrimary: string;
  textSecondary: string;
};

type PropertyCardMediaGalleryProps = {
  galleryImages: string[];
  mediaScrollRef: RefObject<ScrollView | null>;
  mediaWidth: number;
  safeImageIndex: number;
  hasGalleryControls: boolean;
  isSaved: boolean;
  compact: boolean;
  styles: MediaGalleryStyles;
  palette: MediaGalleryPalette;
  colors: MediaGalleryColors;
  labels: {
    previousImage: string;
    nextImage: string;
    saveProperty: string;
    removeSavedProperty: string;
  };
  onLayout: (event: LayoutChangeEvent) => void;
  onMomentumEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onPreviousImage: () => void;
  onNextImage: () => void;
  onToggleSave: () => void;
};

export function PropertyCardMediaGallery({
  galleryImages,
  mediaScrollRef,
  mediaWidth,
  safeImageIndex,
  hasGalleryControls,
  isSaved,
  compact,
  styles,
  palette,
  colors,
  labels,
  onLayout,
  onMomentumEnd,
  onPreviousImage,
  onNextImage,
  onToggleSave,
}: PropertyCardMediaGalleryProps) {
  return (
    <View style={[styles.mediaFrame, compact && styles.compactMediaFrame]} onLayout={onLayout}>
      <ScrollView
        ref={mediaScrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEnabled={hasGalleryControls}
      >
        {galleryImages.map((imageUrl) => (
          <View key={imageUrl} style={[styles.mediaSlide, { width: mediaWidth }]}>
            <Image source={imageUrl} style={styles.image} contentFit="cover" />
          </View>
        ))}
      </ScrollView>
      <View style={styles.mediaScrim} />

      {hasGalleryControls ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={labels.previousImage}
            onPress={(event) => {
              event.stopPropagation();
              onPreviousImage();
            }}
            style={[styles.galleryButton, styles.galleryButtonLeft]}
          >
            <ChevronLeft size={24} color={palette.navy} strokeWidth={2.8} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={labels.nextImage}
            onPress={(event) => {
              event.stopPropagation();
              onNextImage();
            }}
            style={[styles.galleryButton, styles.galleryButtonRight]}
          >
            <ChevronRight size={24} color={palette.navy} strokeWidth={2.8} />
          </Pressable>
        </>
      ) : null}

      <Pressable
        accessibilityLabel={isSaved ? labels.removeSavedProperty : labels.saveProperty}
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          onToggleSave();
        }}
        style={styles.favoriteButton}
      >
        <Heart
          size={20}
          color={isSaved ? palette.signal : colors.textSecondary}
          fill={isSaved ? palette.signal : "transparent"}
          strokeWidth={2.4}
        />
      </Pressable>

      <View style={styles.pagination}>
        {galleryImages.map((imageUrl, item) => (
          <View
            key={`${imageUrl}-${item}`}
            style={[styles.paginationDot, item === safeImageIndex && styles.paginationDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export type MobileDrawerMetrics = {
  contentTop: number;
  contentBottom: number;
  brandFont: number;
  brandLine: number;
  topBarBottom: number;
  topActionGap: number;
  headerIconButton: number;
  headerIcon: number;
  avatar: number;
  avatarText: number;
  identityBottom: number;
  identityNameFont: number;
  identityNameLine: number;
  identityWorkspaceFont: number;
  businessGap: number;
  businessBottom: number;
  navIcon: number;
  navGap: number;
  navFont: number;
  navLine: number;
  seriesTitleFont: number;
  seriesTitleLine: number;
  seriesIcon: number;
  seriesFont: number;
  seriesLine: number;
  seriesRowMin: number;
  seriesGap: number;
  starButton: number;
  starIcon: number;
  floatingBottom: number;
  floatingMinHeight: number;
  floatingPaddingX: number;
  floatingRadius: number;
  floatingGap: number;
  floatingIcon: number;
  floatingFont: number;
  floatingLine: number;
};

export type MobileSystemUi = {
  drawer: MobileDrawerMetrics;
};

export function useMobileSystemUi(): MobileSystemUi {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const scale = Math.min(1, Math.max(0.82, Math.min(width / 430, height / 900)));
    const short = height < 820;
    const size = (value: number) => Math.round(value * scale);

    return {
      drawer: {
        contentTop: short ? 18 : 22,
        contentBottom: short ? 104 : 120,
        brandFont: size(short ? 31 : 34),
        brandLine: size(short ? 38 : 42),
        topBarBottom: short ? 28 : 34,
        topActionGap: size(14),
        headerIconButton: size(38),
        headerIcon: size(24),
        avatar: size(38),
        avatarText: size(14),
        identityBottom: short ? 26 : 30,
        identityNameFont: size(20),
        identityNameLine: size(26),
        identityWorkspaceFont: size(14),
        businessGap: short ? 18 : 22,
        businessBottom: short ? 34 : 42,
        navIcon: size(24),
        navGap: size(20),
        navFont: size(21),
        navLine: size(28),
        seriesTitleFont: size(22),
        seriesTitleLine: size(29),
        seriesIcon: size(21),
        seriesFont: size(20),
        seriesLine: size(27),
        seriesRowMin: short ? 56 : 62,
        seriesGap: size(14),
        starButton: size(42),
        starIcon: size(20),
        floatingBottom: short ? 18 : 24,
        floatingMinHeight: size(56),
        floatingPaddingX: size(22),
        floatingRadius: size(28),
        floatingGap: size(12),
        floatingIcon: size(22),
        floatingFont: size(19),
        floatingLine: size(26),
      },
    };
  }, [height, width]);
}

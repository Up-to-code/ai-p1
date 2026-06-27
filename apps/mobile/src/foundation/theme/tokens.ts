export const darkColors = {
  background: "#000000",
  backgroundSoft: "#111111",
  card: "#111111",
  surface: "#1C1C1C",
  surfaceRaised: "#222222",
  divider: "#222222",
  textPrimary: "#F5F2EC",
  textSecondary: "#BFB8AE",
  textMuted: "#8A857E",
  accent: "#F5F2EC",
  accentForeground: "#080808",
  success: "#7F9987",
  danger: "#C5776D",
  border: "#222222",
};

export const lightColors = {
  background: "#FAF8F4",
  backgroundSoft: "#F5F2EC",
  card: "#FFFFFF",
  surface: "#F5F2EC",
  surfaceRaised: "#FFFFFF",
  divider: "#D5CEC4",
  textPrimary: "#111111",
  textSecondary: "#4D4D4D",
  textMuted: "#787878",
  accent: "#111111",
  accentForeground: "#FFFFFF",
  success: "#5F7768",
  danger: "#A55B52",
  border: "#DED8CF",
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 10,
  md: 12,
  lg: 16,
  pill: 999,
};

const shadows = {
  calm: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 4,
  },
};

const typography = {
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "Manrope_700Bold",
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: "Manrope_600SemiBold",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Manrope_500Medium",
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_600SemiBold",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Manrope_500Medium",
  },
};

export const theme = {
  colors: darkColors,
  spacing,
  radii,
  shadows,
  typography,
};

export type AppTheme = typeof theme;
export type AppColors = typeof darkColors;

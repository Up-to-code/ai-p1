import { Image } from "react-native";

type SplashLoadingLogoProps = {
  baseColor?: string;
  size?: number;
  waveColor?: string;
};

/** The same supplied app mark is used during boot, authentication, and in-app empty states. */
export function SplashLoadingLogo({ size = 28 }: SplashLoadingLogoProps) {
  return (
    <Image
      accessibilityLabel="Qentrah"
      source={require("../../../assets/brand/qentrah-splash-icon.png")}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.22) }}
    />
  );
}

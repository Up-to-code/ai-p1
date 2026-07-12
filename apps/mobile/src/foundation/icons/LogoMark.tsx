import { Image, View } from "react-native";

type LogoMarkProps = {
  size?: number;
  color?: string;
};

export function LogoMark({ size = 28, color }: LogoMarkProps) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Image
        accessibilityLabel="Qentrah"
        source={require("../../../assets/brand/qentrah-logo.png")}
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), opacity: color ? 0.92 : 1 }}
      />
    </View>
  );
}

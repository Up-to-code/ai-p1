import "lucide-react-native";

declare module "lucide-react-native" {
  interface LucideProps {
    color?: string;
    fill?: string;
    strokeWidth?: string | number;
    style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
  }
}
